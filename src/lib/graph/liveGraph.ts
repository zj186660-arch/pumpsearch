import type { Company, GraphEdge } from "../types";
import { readCorpusTail, type CorpusLine } from "./corpus";

export type LiveGraphNode = {
  id: string;
  name: string;
  subtitle: string;
};

/**
 * 从累积的 search-corpus.jsonl 构建「真实检索」图谱：节点为去重域名；边为同 batch 共现（稀疏星型）及弱父域关联。
 */
export async function buildLiveGraphFromCorpus(opts?: {
  maxNodes?: number;
  maxEdges?: number;
}): Promise<{ nodes: LiveGraphNode[]; edges: GraphEdge[]; stats: { lines: number; uniqueHosts: number } }> {
  const maxNodes = Math.min(200, Math.max(20, opts?.maxNodes ?? 100));
  const maxEdges = Math.min(500, Math.max(50, opts?.maxEdges ?? 220));

  const rows = await readCorpusTail(12000);
  const byHost = new Map<string, CorpusLine>();
  for (const r of rows) {
    if (!r.host) continue;
    byHost.set(r.host, r);
  }

  const nodes: LiveGraphNode[] = [];
  for (const [, r] of byHost) {
    nodes.push({
      id: `h:${r.host}`,
      name: r.name.slice(0, 42) + (r.name.length > 42 ? "…" : ""),
      subtitle: `${r.host} · ${r.source}`,
    });
    if (nodes.length >= maxNodes) break;
  }

  const hostSet = new Set(nodes.map((n) => n.id.replace(/^h:/, "")));
  const edges: GraphEdge[] = [];

  function parentKey(host: string): string {
    const p = host.split(".");
    if (p.length >= 2) return p.slice(-2).join(".");
    return host;
  }

  const byBatch = new Map<string, CorpusLine[]>();
  for (const r of rows) {
    if (!hostSet.has(r.host)) continue;
    const arr = byBatch.get(r.batchId) ?? [];
    arr.push(r);
    byBatch.set(r.batchId, arr);
  }

  for (const [, batch] of byBatch) {
    if (batch.length < 2) continue;
    const hub = batch[0];
    const limit = Math.min(batch.length, 18);
    for (let i = 1; i < limit; i++) {
      if (edges.length >= maxEdges) break;
      const a = `h:${hub.host}`;
      const b = `h:${batch[i].host}`;
      if (a === b) continue;
      edges.push({
        from: a,
        to: b,
        type: "同次检索共现",
        confidence: 0.35,
        note: "来自同一搜索批次写入的线索，非工商登记关系",
      });
    }
  }

  const hosts = [...hostSet];
  for (let i = 0; i < hosts.length && edges.length < maxEdges; i++) {
    for (let j = i + 1; j < hosts.length && edges.length < maxEdges; j++) {
      if (parentKey(hosts[i]) === parentKey(hosts[j]) && hosts[i] !== hosts[j]) {
        edges.push({
          from: `h:${hosts[i]}`,
          to: `h:${hosts[j]}`,
          type: "父域相近",
          confidence: 0.22,
          note: "二级域推断，仅供参考",
        });
      }
    }
  }

  return {
    nodes,
    edges: edges.slice(0, maxEdges),
    stats: { lines: rows.length, uniqueHosts: byHost.size },
  };
}

/** 无累积数据时回退演示公司（保持类型兼容 Company[] 仅 id/name/country/role 用于展示） */
export function corpusNodesAsCompanies(nodes: LiveGraphNode[]): Company[] {
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    country: "—",
    city: "—",
    role: "贸易商",
    website: `https://${n.id.replace(/^h:/, "")}`,
    description: n.subtitle,
    products: [],
    exportMarkets: [],
    score: {
      activity: 5,
      procurement: 5,
      replyLikelihood: 5,
      marketSize: 5,
      dealProbability: 5,
    },
    contacts: [],
    signals: ["来自检索累积库"],
  }));
}
