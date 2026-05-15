import { abortSignalAfter } from "../net/abortSignalAfter";
import { formatFetchError } from "../net/fetchErrors";
import { getGoogleProxyFetchInit, shouldUseGoogleProxy } from "../net/googleProxyAgent";
import type { RawWebHit } from "./rawHit";

function timeoutMs(): number {
  const v = process.env.PUMPSEARCH_FETCH_TIMEOUT_MS;
  const n = v ? parseInt(v, 10) : 25_000;
  return Number.isFinite(n) && n >= 3000 ? Math.min(n, 120_000) : 25_000;
}

export interface CseItem {
  title?: string;
  link?: string;
  snippet?: string;
  displayLink?: string;
}

export interface CseResult {
  items: CseItem[];
  errorMessage?: string;
}

type NodeFetchInit = RequestInit & { dispatcher?: import("undici").Dispatcher };

/** Google Programmable Search（Custom Search JSON API）。代理由 shouldUseGoogleProxy() 控制。 */
export async function googleCustomSearch(
  query: string,
  apiKey: string,
  cx: string,
  opts?: { maxPages?: number }
): Promise<CseResult> {
  const maxPagesCap = Math.min(10, Math.max(1, opts?.maxPages ?? 5));
  const items: CseItem[] = [];
  const proxyInit = getGoogleProxyFetchInit();
  const via = shouldUseGoogleProxy() ? "代理" : "直连";

  for (let page = 0; page < maxPagesCap; page++) {
    const start = page * 10 + 1;
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cx);
    url.searchParams.set("q", query);
    url.searchParams.set("num", "10");
    url.searchParams.set("start", String(start));

    try {
      const res = await fetch(url.toString(), {
        cache: "no-store",
        signal: abortSignalAfter(timeoutMs()),
        ...proxyInit,
      } as NodeFetchInit);

      let json: { items?: CseItem[]; error?: { message?: string; code?: number } };
      try {
        json = (await res.json()) as typeof json;
      } catch {
        return {
          items,
          errorMessage: `Google CSE 返回非 JSON（HTTP ${res.status}）·${via}`,
        };
      }

      if (!res.ok || json.error) {
        return {
          items,
          errorMessage: `${json.error?.message ?? `Google CSE HTTP ${res.status}`} · ${via}`,
        };
      }
      const batch = json.items ?? [];
      if (batch.length === 0) break;
      items.push(...batch);
    } catch (err) {
      return {
        items,
        errorMessage: `Google CSE 网络请求失败：${formatFetchError(err)} · ${via}`,
      };
    }
  }

  return { items };
}

export function cseItemsToRawHits(items: CseItem[]): RawWebHit[] {
  const hits: RawWebHit[] = [];
  for (const item of items) {
    const link = item.link?.trim();
    if (!link || !/^https?:\/\//i.test(link)) continue;
    hits.push({
      provider: "google",
      title: (item.title ?? item.displayLink ?? "Result").replace(/<[^>]+>/g, ""),
      url: link,
      snippet: item.snippet,
    });
  }
  return hits;
}
