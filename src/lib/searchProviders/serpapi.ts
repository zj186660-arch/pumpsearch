import { abortSignalAfter } from "../net/abortSignalAfter";
import { formatFetchError } from "../net/fetchErrors";
import type { RawWebHit } from "./rawHit";

function timeoutMs(): number {
  const v = process.env.PUMPSEARCH_FETCH_TIMEOUT_MS;
  const n = v ? parseInt(v, 10) : 25_000;
  return Number.isFinite(n) && n >= 3000 ? Math.min(n, 120_000) : 25_000;
}

function envInt(name: string, fallback: number, max: number, min: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** SerpAPI 常见引擎（可按账户权限删减）。 */
const KNOWN_ENGINES = new Set(["bing", "google", "yahoo", "duckduckgo", "yandex", "baidu"]);

/**
 * 单次 SerpAPI 请求。
 * @see https://serpapi.com/search-api （Google）
 * @see https://serpapi.com/bing-search-api （Bing 分页用 first）
 */
export async function serpApiSearchOne(
  query: string,
  apiKey: string,
  engine: string,
  opts?: { num?: number; pageIndex?: number }
): Promise<{ hits: RawWebHit[]; errorMessage?: string }> {
  const num = envInt("SERPAPI_NUM", 20, 100, 1);
  const pageIndex = Math.max(0, opts?.pageIndex ?? 0);
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("engine", engine);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(num));

  if (engine === "bing") {
    const first = 1 + pageIndex * num;
    url.searchParams.set("first", String(first));
  } else {
    const start = pageIndex * num;
    url.searchParams.set("start", String(start));
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: abortSignalAfter(timeoutMs()),
    });

    let json: {
      organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
      error?: string;
    };
    try {
      json = (await res.json()) as typeof json;
    } catch {
      return { hits: [], errorMessage: `SerpAPI(${engine}) 非 JSON（HTTP ${res.status}）` };
    }

    if (!res.ok || json.error) {
      return { hits: [], errorMessage: json.error ?? `SerpAPI(${engine}) HTTP ${res.status}` };
    }

    const hits: RawWebHit[] = [];
    for (const o of json.organic_results ?? []) {
      const link = o.link?.trim();
      if (!link) continue;
      hits.push({
        provider: "serpapi",
        title: o.title ?? "",
        url: link,
        snippet: o.snippet,
        serpEngine: engine,
      });
    }
    return { hits };
  } catch (e) {
    return { hits: [], errorMessage: `SerpAPI(${engine}) 网络：${formatFetchError(e)}` };
  }
}

/**
 * 多引擎 + 分页：环境变量 SERPAPI_ENGINES=bing,google（默认）
 * SERPAPI_PAGES_PER_ENGINE：每个引擎最多请求几页（默认 3）
 */
export async function serpApiSearchAllEngines(
  query: string,
  apiKey: string
): Promise<{ hits: RawWebHit[]; warnings: string[] }> {
  const warnings: string[] = [];
  const enginesRaw =
    process.env.SERPAPI_ENGINES?.trim() ||
    process.env.SERPAPI_ENGINE?.trim() ||
    "bing,google";
  const engines = enginesRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const pages = envInt("SERPAPI_PAGES_PER_ENGINE", 3, 8, 1);
  const merged: RawWebHit[] = [];
  const enginesUsed: string[] = [];

  for (const engine of engines) {
    if (!KNOWN_ENGINES.has(engine)) {
      warnings.push(`SerpAPI：跳过未知引擎 “${engine}”（支持: ${[...KNOWN_ENGINES].join(", ")}）`);
      continue;
    }
    let engineTotal = 0;
    for (let p = 0; p < pages; p++) {
      const r = await serpApiSearchOne(query, apiKey, engine, { pageIndex: p });
      if (r.errorMessage) {
        warnings.push(r.errorMessage + (p === 0 ? "" : `（${engine} 第 ${p + 1} 页）`));
        break;
      }
      if (r.hits.length === 0) break;
      engineTotal += r.hits.length;
      merged.push(...r.hits);
    }
    if (engineTotal > 0) enginesUsed.push(engine);
  }

  if (enginesUsed.length > 0) {
    warnings.unshift(
      `SerpAPI：已对引擎 [${enginesUsed.join(", ")}] 分页拉取，合并前共 ${merged.length} 条（与 Bing/Google CSE 在编排层按域名去重）。`
    );
  }

  return { hits: merged, warnings };
}
