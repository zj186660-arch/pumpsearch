import { abortSignalAfter } from "../net/abortSignalAfter";
import { formatFetchError } from "../net/fetchErrors";
import type { RawWebHit } from "./rawHit";

function timeoutMs(): number {
  const v = process.env.PUMPSEARCH_FETCH_TIMEOUT_MS;
  const n = v ? parseInt(v, 10) : 25_000;
  return Number.isFinite(n) && n >= 3000 ? Math.min(n, 120_000) : 25_000;
}

/** Azure Bing Web Search v7 — 环境变量 BING_SEARCH_KEY（或 AZURE_BING_SEARCH_KEY）。 */
export async function bingWebSearch(query: string, subscriptionKey: string): Promise<{
  hits: RawWebHit[];
  errorMessage?: string;
}> {
  const url = new URL("https://api.bing.microsoft.com/v7.0/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "20");
  url.searchParams.set("mkt", process.env.BING_MARKET?.trim() || "en-US");

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: abortSignalAfter(timeoutMs()),
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    });

    let json: {
      webPages?: { value?: Array<{ name?: string; url?: string; snippet?: string }> };
      errors?: Array<{ message?: string }>;
    };
    try {
      json = (await res.json()) as typeof json;
    } catch {
      return { hits: [], errorMessage: `Bing 返回非 JSON（HTTP ${res.status}）` };
    }

    if (!res.ok) {
      const msg = json.errors?.[0]?.message ?? `Bing HTTP ${res.status}`;
      return { hits: [], errorMessage: msg };
    }

    const hits: RawWebHit[] = [];
    for (const v of json.webPages?.value ?? []) {
      const link = v.url?.trim();
      if (!link) continue;
      hits.push({
        provider: "bing",
        title: v.name ?? "",
        url: link,
        snippet: v.snippet,
      });
    }
    return { hits };
  } catch (e) {
    return { hits: [], errorMessage: `Bing 网络请求失败：${formatFetchError(e)}` };
  }
}
