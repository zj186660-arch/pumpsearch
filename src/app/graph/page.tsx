import { COMPANIES, GRAPH_EDGES } from "@/lib/data";
import { GraphCanvas } from "@/components/GraphCanvas";
import { buildLiveGraphFromCorpus, corpusNodesAsCompanies } from "@/lib/graph/liveGraph";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const live = await buildLiveGraphFromCorpus({ maxNodes: 140, maxEdges: 280 });
  const useLive = live.nodes.length >= 8;
  const companies = useLive ? corpusNodesAsCompanies(live.nodes) : COMPANIES;
  const edges = useLive ? live.edges : GRAPH_EDGES;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">全球关系图谱</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {useLive ? (
              <>
                当前展示来自本地累积语料 <code className="text-ocean-300">data/search-corpus.jsonl</code>{" "}
                的去重域名与共现边（同次检索批次、弱父域关联），随搜索次数增加会逐渐充实。语料行数约{" "}
                <span className="text-slate-300">{live.stats.lines}</span>，独立主机约{" "}
                <span className="text-slate-300">{live.stats.uniqueHosts}</span>。
              </>
            ) : (
              <>
                尚未积累足够检索语料（需联网搜索且未设置 PUMPSEARCH_SKIP_CORPUS），以下为产品设计用演示图。
                多跑几次不同关键词的搜索后刷新本页，可切换为基于真实检索写入的图谱。
              </>
            )}
          </p>
        </div>
        <Link href="/search?q=pump" className="text-sm font-medium text-ocean-300 hover:text-ocean-200">
          ← 回到搜索结果
        </Link>
      </div>
      <GraphCanvas companies={companies} edges={edges} />
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        <h2 className="text-base font-semibold text-white">图数据说明</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-slate-300">同次检索共现</span>
            ：同一批写入语料库的域名，表示它们在同一次（或同一轮）搜索会话中被一起发现，并非工商或股权关系。
          </li>
          <li>
            <span className="font-medium text-slate-300">父域相近</span>
            ：二级域名推断的弱关联，可能为同集团子站或托管平台，仅供参考。
          </li>
          <li>生产环境可接 Neo4j / TigerGraph 等，为边增加证据 URL、时间衰减与人工复核队列。</li>
        </ul>
      </section>
    </div>
  );
}
