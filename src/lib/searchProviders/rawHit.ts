export type WebProviderId = "bing" | "serpapi" | "google";

export interface RawWebHit {
  provider: WebProviderId;
  title: string;
  url: string;
  snippet?: string;
  /** SerpAPI 多引擎时标记，如 google / bing */
  serpEngine?: string;
}
