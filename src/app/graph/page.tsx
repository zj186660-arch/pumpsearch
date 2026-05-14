import { COMPANIES, GRAPH_EDGES } from "@/lib/data";
import { GraphCanvas } from "@/components/GraphCanvas";
import Link from "next/link";

export default function GraphPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">全球关系图谱（演示）</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            生产环境建议使用 Neo4j / TigerGraph 等存边属性（置信度、证据 URL、时间衰减），前端用 WebGL
            力导布局；此处为 SVG 静态布局以便快速对齐产品设计。
          </p>
        </div>
        <Link
          href="/search?q=pump"
          className="text-sm font-medium text-ocean-300 hover:text-ocean-200"
        >
          ← 回到搜索结果
        </Link>
      </div>
      <GraphCanvas companies={COMPANIES} edges={GRAPH_EDGES} />
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        <h2 className="text-base font-semibold text-white">图数据建模建议（延伸）</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>节点类型：Company、Person、Tender、HSCode、Event、Domain、Shipment（脱敏）。</li>
          <li>边属性：relation_type、confidence、source、valid_from、valid_to、weight_decay。</li>
          <li>「闹崩 / 换供」仅输出 hypothesis 节点，强制附带反证搜索任务与人工复核队列。</li>
        </ul>
      </section>
    </div>
  );
}
