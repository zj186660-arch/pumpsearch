import { randomUUID } from "crypto";
import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";
import type { LeadRow } from "../leads";

const DATA_DIR = path.join(process.cwd(), "data");
const CORPUS_FILE = path.join(DATA_DIR, "search-corpus.jsonl");

export type CorpusLine = {
  batchId: string;
  ts: number;
  q: string;
  host: string;
  name: string;
  website: string;
  source: string;
  serpEngine?: string;
};

export async function appendCorpusFromLeads(leads: LeadRow[], sessionQuery: string): Promise<void> {
  const batchId = randomUUID();
  const ts = Date.now();
  await mkdir(DATA_DIR, { recursive: true });
  const lines: string[] = [];
  for (const l of leads) {
    if (l.source === "demo") continue;
    let host = "";
    try {
      host = new URL(l.website.startsWith("http") ? l.website : `https://${l.website}`).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (!host) continue;
    const row: CorpusLine = {
      batchId,
      ts,
      q: sessionQuery,
      host,
      name: l.name,
      website: l.website,
      source: l.source,
      serpEngine: l.serpEngine,
    };
    lines.push(JSON.stringify(row));
  }
  if (lines.length === 0) return;
  await appendFile(CORPUS_FILE, lines.join("\n") + "\n", "utf-8");
}

export async function readCorpusTail(maxLines = 8000): Promise<CorpusLine[]> {
  try {
    const raw = await readFile(CORPUS_FILE, "utf-8");
    const all = raw.split("\n").filter(Boolean);
    const tail = all.slice(-maxLines);
    const rows: CorpusLine[] = [];
    for (const line of tail) {
      try {
        rows.push(JSON.parse(line) as CorpusLine);
      } catch {
        /* skip */
      }
    }
    return rows;
  } catch {
    return [];
  }
}
