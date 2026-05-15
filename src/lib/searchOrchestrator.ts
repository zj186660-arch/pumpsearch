import { searchCompanies } from "./data";
import type { LeadRow } from "./leads";
import { companyToLead, ensureAllLeads, ensureLeadRowShape } from "./leads";
import { readSearchCacheEntry, searchCacheKey, tagLeadsCacheHit, writeSearchCacheEntry } from "./cache/localSearchCache";
import { refineLeadsWithOpenAI } from "./ai/leadRefineOpenAI";
import { bingWebSearch } from "./searchProviders/bing";
import { serpApiSearchAllEngines } from "./searchProviders/serpapi";
import { googleCustomSearch, cseItemsToRawHits } from "./searchProviders/googleCse";
import { shouldUseGoogleProxy, isGoogleProxyUrlDeclared } from "./net/googleProxyAgent";
import type { RawWebHit } from "./searchProviders/rawHit";
import { rawHitsToLeads } from "./searchProviders/normalize";
import { fetchFailureHints, formatFetchError } from "./net/fetchErrors";

function hostKey(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export interface GlobalSearchOutcome {
  leads: LeadRow[];
  warnings: string[];
  config: {
    bingEnabled: boolean;
    serpapiEnabled: boolean;
    googleEnabled: boolean;
    googleProxyConfigured: boolean;
    openAiConfigured: boolean;
    cacheHit: boolean;
    demoAppended: boolean;
  };
}

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function buildPumpQuery(userQuery: string): string {
  const base = userQuery.trim() || "submersible pump";
  const suffix =
    process.env.PUMPSEARCH_QUERY_SUFFIX?.trim() ||
    "(pump OR water OR sewage OR slurry OR centrifugal OR submersible) (manufacturer OR supplier OR distributor OR factory)";
  return `${base} ${suffix}`.slice(0, 480);
}

function serpEnginesTag(): string {
  return (process.env.SERPAPI_ENGINES || process.env.SERPAPI_ENGINE || "bing,google")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 96);
}

function providerFingerprint(order: string[], bing: boolean, serp: boolean, google: boolean): string {
  return `v5|${order.join(">")}|bing=${bing ? 1 : 0}|serp=${serp ? 1 : 0}|g=${google ? 1 : 0}|se=${serpEnginesTag()}|gpx=${shouldUseGoogleProxy() ? 1 : 0}`;
}

function parseOrder(): string[] {
  const raw = process.env.SEARCH_FALLBACK_ORDER?.trim() || "serpapi,google,bing,demo";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => ["bing", "serpapi", "google", "demo"].includes(s));
}

function mergeUniqueRaw(hits: RawWebHit[], into: RawWebHit[], seen: Set<string>) {
  for (const h of hits) {
    const hk = hostKey(h.url);
    if (seen.has(hk)) continue;
    seen.add(hk);
    into.push(h);
  }
}

function appendDemoLeads(apiLeads: LeadRow[], q: string, appendDemo: boolean): LeadRow[] {
  const demo = searchCompanies(q).map((c) => companyToLead(c, q));
  if (!appendDemo) {
    return apiLeads.length > 0 ? apiLeads : demo;
  }
  const seen = new Set(apiLeads.map((l) => hostKey(l.website)));
  const out = [...apiLeads];
  for (const d of demo) {
    const hk = hostKey(d.website);
    if (seen.has(hk)) continue;
    seen.add(hk);
    out.push(d);
  }
  return out;
}

/**
 * 多源搜索：SerpAPI 多引擎（默认 bing+google）分页 → Google CSE（可选代理）→ Azure Bing → 合并去重 → OpenAI 清洗 → 本地缓存 → 演示数据。
 */
export async function runGlobalSearch(userQuery: string): Promise<GlobalSearchOutcome> {
  try {
    return await runGlobalSearchImpl(userQuery);
  } catch (err) {
    const q = userQuery.trim();
    const msg = formatFetchError(err);
    const demo = ensureAllLeads(searchCompanies(q).map((c) => companyToLead(c, q)));
    return {
      leads: demo,
      warnings: [
        "搜索流水线发生意外错误，已回退为演示数据。",
        msg,
        ...fetchFailureHints(msg),
      ],
      config: {
        bingEnabled: Boolean(process.env.BING_SEARCH_KEY?.trim() || process.env.AZURE_BING_SEARCH_KEY?.trim()),
        serpapiEnabled: Boolean(process.env.SERPAPI_KEY?.trim()),
        googleEnabled: Boolean(process.env.GOOGLE_API_KEY?.trim() && process.env.GOOGLE_CSE_ID?.trim()),
        googleProxyConfigured: shouldUseGoogleProxy(),
        openAiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
        cacheHit: false,
        demoAppended: true,
      },
    };
  }
}

async function runGlobalSearchImpl(userQuery: string): Promise<GlobalSearchOutcome> {
  const warnings: string[] = [];
  const q = userQuery.trim();
  const appendDemo =
    process.env.PUMPSEARCH_APPEND_DEMO !== "0" && process.env.PUMPSEARCH_APPEND_DEMO !== "false";
  const skipNetwork =
    process.env.PUMPSEARCH_SKIP_NETWORK === "1" || process.env.PUMPSEARCH_SKIP_NETWORK === "true";

  const bingKey = process.env.BING_SEARCH_KEY?.trim() || process.env.AZURE_BING_SEARCH_KEY?.trim();
  const serpKey = process.env.SERPAPI_KEY?.trim();
  const googleKey = process.env.GOOGLE_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_CSE_ID?.trim();
  const order = parseOrder();
  const bingConfigured = Boolean(bingKey);
  const serpConfigured = Boolean(serpKey);
  const googleConfigured = Boolean(googleKey && googleCx);
  const googleProxyActive = shouldUseGoogleProxy();
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  const ttl = envInt("PUMPSEARCH_CACHE_TTL_MS", 3_600_000);
  const fp = providerFingerprint(order, bingConfigured, serpConfigured, googleConfigured);
  const ck = searchCacheKey(q || "__default__", fp);

  if (!skipNetwork) {
    const cached = await readSearchCacheEntry(ck);
    if (cached && Date.now() - cached.ts < ttl) {
      const normalized = Array.isArray(cached.leads)
        ? cached.leads.map((x) => ensureLeadRowShape(x as Partial<LeadRow>))
        : [];
      const tagged = tagLeadsCacheHit(normalized);
      const leads = ensureAllLeads(appendDemoLeads(tagged, q, appendDemo));
      return {
        leads,
        warnings: [
          "已命中本地缓存 data/search-cache.json（可在环境变量 PUMPSEARCH_CACHE_TTL_MS 调整 TTL）。",
          ...warnings,
        ],
        config: {
          bingEnabled: bingConfigured,
          serpapiEnabled: serpConfigured,
          googleEnabled: googleConfigured,
          googleProxyConfigured: googleProxyActive,
          openAiConfigured,
          cacheHit: true,
          demoAppended: appendDemo,
        },
      };
    }
  }

  if (!bingConfigured) {
    warnings.push("未配置 Bing Web Search：请在 .env.local 设置 BING_SEARCH_KEY（Azure 「Bing Search v7」资源密钥）。");
  }
  if (!serpConfigured) {
    warnings.push(
      "未配置 SerpAPI：请设置 SERPAPI_KEY。多引擎由 SERPAPI_ENGINES 控制（默认 bing,google，每引擎分页 SERPAPI_PAGES_PER_ENGINE）。"
    );
  }
  if (!googleConfigured) {
    warnings.push(
      "未配置 Google 可编程搜索：设置 GOOGLE_API_KEY 与 GOOGLE_CSE_ID 后，SEARCH_FALLBACK_ORDER 中的 google 步骤会请求 CSE。"
    );
  } else {
    if (googleProxyActive) {
      warnings.push("Google CSE：已通过 HTTP 代理访问 www.googleapis.com。");
    } else if (isGoogleProxyUrlDeclared()) {
      warnings.push(
        "Google CSE：检测到代理 URL，但 GOOGLE_USE_PROXY=false，当前对 Google 使用直连。若需走代理请设为 true 并保证端口可用；若代理常拒绝连接可保持 false 并直连。"
      );
    } else {
      warnings.push("Google CSE：当前为直连 Google API（未启用代理）。SerpAPI 的 google 引擎不经过此代理。");
    }
  }
  if (skipNetwork) {
    warnings.push("已设置 PUMPSEARCH_SKIP_NETWORK=true：跳过 Bing/SerpAPI/Google 与缓存写入，仅使用演示数据合并逻辑。");
  }

  const pumpQ = buildPumpQuery(q);
  const raw: RawWebHit[] = [];
  const seenHosts = new Set<string>();

  if (!skipNetwork) {
    for (const step of order) {
      if (step === "demo") break;
      if (step === "bing" && bingKey) {
        const r = await bingWebSearch(pumpQ, bingKey);
        if (r.errorMessage) warnings.push(`Bing：${r.errorMessage}`);
        mergeUniqueRaw(r.hits, raw, seenHosts);
      }
      if (step === "serpapi" && serpKey) {
        const r2 = await serpApiSearchAllEngines(pumpQ, serpKey);
        for (const w of r2.warnings) warnings.push(w);
        mergeUniqueRaw(r2.hits, raw, seenHosts);
      }
      if (step === "google" && googleKey && googleCx) {
        const maxPages = Math.min(10, Math.max(1, envInt("PUMPSEARCH_CSE_PAGES", 5)));
        const cse = await googleCustomSearch(pumpQ, googleKey, googleCx, { maxPages });
        if (cse.errorMessage) warnings.push(`Google CSE：${cse.errorMessage}`);
        mergeUniqueRaw(cseItemsToRawHits(cse.items), raw, seenHosts);
      }
    }
  }

  let apiLeads = rawHitsToLeads(raw, pumpQ);
  if (!skipNetwork) {
    apiLeads = await refineLeadsWithOpenAI(apiLeads);
  }

  if (!skipNetwork && apiLeads.length > 0) {
    try {
      await writeSearchCacheEntry(ck, ensureAllLeads(apiLeads));
    } catch (e) {
      warnings.push(`本地缓存写入失败（仍返回结果）：${formatFetchError(e)}`);
    }
  }

  if (!skipNetwork && apiLeads.length === 0) {
    warnings.push(
      "当前未从 Bing/SerpAPI/Google 拉到网页结果：请检查密钥、代理与网络；或暂时使用演示数据继续体验界面。"
    );
  }

  const leads = ensureAllLeads(appendDemoLeads(apiLeads, q, appendDemo));

  return {
    leads,
    warnings,
    config: {
      bingEnabled: bingConfigured,
      serpapiEnabled: serpConfigured,
      googleEnabled: googleConfigured,
      googleProxyConfigured: googleProxyActive,
      openAiConfigured,
      cacheHit: false,
      demoAppended: appendDemo,
    },
  };
}
