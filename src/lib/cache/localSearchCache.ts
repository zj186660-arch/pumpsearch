/**
 * 本地 JSON 缓存（开发机 / 自建 Node 服务器可用）。
 * 若部署在无持久磁盘的 Serverless（如 Vercel），请改为 Turso / Postgres / Redis / 对象存储。
 */
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { LeadRow } from "../leads";

const CACHE_VERSION = 5 as const;

export type SearchCacheFile = {
  version: typeof CACHE_VERSION;
  entries: Record<string, { ts: number; leads: LeadRow[] }>;
};

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "search-cache.json");

export function searchCacheKey(query: string, providerFingerprint: string): string {
  const norm = `${query.trim().toLowerCase()}|${providerFingerprint}`;
  return createHash("sha256").update(norm).digest("hex").slice(0, 40);
}

async function readAll(): Promise<SearchCacheFile> {
  try {
    const raw = await readFile(CACHE_FILE, "utf-8");
    const j = JSON.parse(raw) as SearchCacheFile;
    if (!j || j.version !== CACHE_VERSION || typeof j.entries !== "object") {
      return { version: CACHE_VERSION, entries: {} };
    }
    return j;
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
}

export async function readSearchCacheEntry(key: string): Promise<{ ts: number; leads: LeadRow[] } | null> {
  const db = await readAll();
  const e = db.entries[key];
  if (!e) return null;
  return e;
}

export async function writeSearchCacheEntry(key: string, leads: LeadRow[]): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const db = await readAll();
  db.entries[key] = { ts: Date.now(), leads };
  const keys = Object.keys(db.entries);
  if (keys.length > 400) {
    keys
      .map((k) => ({ k, ts: db.entries[k].ts }))
      .sort((a, b) => a.ts - b.ts)
      .slice(0, keys.length - 300)
      .forEach(({ k }) => {
        delete db.entries[k];
      });
  }
  await writeFile(CACHE_FILE, JSON.stringify(db), "utf-8");
}

/** 在 UI 上标记缓存命中（不改变原 source，便于 CRM 溯源）。 */
export function tagLeadsCacheHit(leads: LeadRow[]): LeadRow[] {
  return leads.map((l) => ({
    ...l,
    signals: [...(l.signals ?? []), "命中本地 JSON 缓存（TTL 内）"],
  }));
}
