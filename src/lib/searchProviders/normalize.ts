import { createHash } from "crypto";
import type { LeadRow } from "../leads";
import { neutralScore } from "../leads";
import type { RawWebHit } from "./rawHit";

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

/** Strip common HTML entities / tags from titles/snippets. */
export function heuristicCleanText(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function serpSignal(h: RawWebHit): string {
  if (h.provider !== "serpapi") return "";
  const eng = h.serpEngine?.trim();
  return eng ? `SerpAPI · 引擎 ${eng}` : "SerpAPI";
}

export function rawHitsToLeads(hits: RawWebHit[], queryUsed: string): LeadRow[] {
  const out: LeadRow[] = [];
  for (const h of hits) {
    const url = h.url.trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const title = heuristicCleanText(h.title || "Result").slice(0, 220);
    const snippet = heuristicCleanText(h.snippet ?? "").slice(0, 500);
    const source =
      h.provider === "bing" ? "bing" : h.provider === "google" ? "google" : "serpapi";
    const serp = serpSignal(h);
    out.push({
      id: `${source}:${hash(url)}`,
      source,
      name: title || url,
      country: "—",
      city: "—",
      role: "待分类",
      website: url,
      description: snippet,
      products: [],
      exportMarkets: [],
      score: neutralScore(),
      contacts: [],
      signals: [
        h.provider === "bing"
          ? "Bing Web Search API"
          : h.provider === "google"
            ? "Google 可编程搜索（Custom Search JSON API）"
            : serp || "SerpAPI",
        "规则清洗：标题/摘要已去 HTML；国家/角色需在 CRM 中人工或 AI 二次确认",
      ],
      queryUsed,
      serpEngine: h.provider === "serpapi" ? h.serpEngine : undefined,
    });
  }
  return out;
}
