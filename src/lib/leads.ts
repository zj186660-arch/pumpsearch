import { createHash } from "crypto";
import type { Company, CompanyRole, CompanyScore } from "./types";

/** 线索来源（默认：Bing API + SerpAPI，多源合并）。 */
export type LeadSource = "demo" | "bing" | "serpapi" | "google";

/** Unified row for search UI + CRM export. */
export interface LeadRow {
  id: string;
  source: LeadSource;
  name: string;
  country: string;
  city: string;
  role: CompanyRole | "待分类";
  website: string;
  description: string;
  products: string[];
  exportMarkets: string[];
  score?: CompanyScore;
  contacts: { label: string; value: string; verified: "public" | "unverified" }[];
  signals: string[];
  queryUsed: string;
  mapsUrl?: string;
  phone?: string;
  detailPath?: string;
  /** SerpAPI 多引擎时记录，如 google / bing */
  serpEngine?: string;
}

export function neutralScore(): CompanyScore {
  return {
    activity: 5,
    procurement: 5,
    replyLikelihood: 5,
    marketSize: 5,
    dealProbability: 5,
  };
}

export function companyToLead(c: Company, queryUsed: string): LeadRow {
  return {
    id: `demo:${c.id}`,
    source: "demo",
    name: c.name,
    country: c.country,
    city: c.city,
    role: c.role,
    website: c.website,
    description: c.description,
    products: c.products,
    exportMarkets: c.exportMarkets,
    score: c.score,
    contacts: c.contacts,
    signals: c.signals,
    queryUsed,
    detailPath: `/company/${c.id}`,
  };
}

const KNOWN_SOURCES: LeadSource[] = ["demo", "bing", "serpapi", "google"];

/**
 * 防止旧缓存 / 异常 JSON 缺少字段导致渲染崩溃（搜索页白屏）。
 */
export function ensureLeadRowShape(input: Partial<LeadRow>): LeadRow {
  const website = typeof input.website === "string" ? input.website.trim() : "";
  const id =
    typeof input.id === "string" && input.id.length > 0
      ? input.id
      : `row:${createHash("sha256").update(website || "empty").digest("hex").slice(0, 16)}`;
  const src = input.source;
  const source = src && KNOWN_SOURCES.includes(src) ? src : "serpapi";

  return {
    id,
    source,
    name: typeof input.name === "string" && input.name.trim() ? input.name.trim() : website || "未命名",
    country: typeof input.country === "string" ? input.country : "—",
    city: typeof input.city === "string" ? input.city : "—",
    role: (input.role ?? "待分类") as LeadRow["role"],
    website,
    description: typeof input.description === "string" ? input.description : "",
    products: Array.isArray(input.products) ? input.products.map(String) : [],
    exportMarkets: Array.isArray(input.exportMarkets) ? input.exportMarkets.map(String) : [],
    score: input.score,
    contacts: Array.isArray(input.contacts) ? input.contacts : [],
    signals: Array.isArray(input.signals) ? [...input.signals] : [],
    queryUsed: typeof input.queryUsed === "string" ? input.queryUsed : "",
    mapsUrl: typeof input.mapsUrl === "string" ? input.mapsUrl : undefined,
    phone: typeof input.phone === "string" ? input.phone : undefined,
    detailPath: typeof input.detailPath === "string" ? input.detailPath : undefined,
    serpEngine: typeof input.serpEngine === "string" ? input.serpEngine : undefined,
  };
}

export function ensureAllLeads(leads: LeadRow[]): LeadRow[] {
  return leads.map((l) => ensureLeadRowShape(l));
}
