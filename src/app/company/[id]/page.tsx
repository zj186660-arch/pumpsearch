import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Network, Sparkles } from "lucide-react";
import { GRAPH_EDGES, getCompany } from "@/lib/data";
import { ScoreBadge } from "@/components/ScoreBadge";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = getCompany(id);
  if (!company) notFound();

  const relatedEdges = GRAPH_EDGES.filter((e) => e.from === id || e.to === id);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Link
        href="/search?q=pump"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        返回搜索
      </Link>

      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-200">
                {company.role}
              </span>
              <span>
                {company.country} · {company.city}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{company.name}</h1>
            {company.nameLocal ? <p className="text-slate-400">{company.nameLocal}</p> : null}
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">{company.description}</p>
            <div className="flex flex-wrap gap-2">
              {company.products.map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-ocean-500/25 bg-ocean-500/10 px-2 py-0.5 text-xs text-ocean-100"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 lg:w-80">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">AI 客户评分</p>
            <div className="grid grid-cols-5 gap-2">
              <ScoreBadge value={company.score.activity} label="活跃" />
              <ScoreBadge value={company.score.procurement} label="采购" />
              <ScoreBadge value={company.score.replyLikelihood} label="回复" />
              <ScoreBadge value={company.score.marketSize} label="市场" />
              <ScoreBadge value={company.score.dealProbability} label="成交" />
            </div>
            <Link
              href={`/email?company=${company.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-500 py-3 text-sm font-semibold text-abyss-950"
            >
              <Mail className="h-4 w-4" />
              在此客户上打开邮件工作台
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 py-3 text-sm text-white hover:bg-white/5"
            >
              <Network className="h-4 w-4" />
              在图谱中定位
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles className="h-5 w-5 text-ocean-300" />
            联系方式与验证状态
          </h2>
          <ul className="mt-4 space-y-3">
            {company.contacts.map((c) => (
              <li
                key={c.value}
                className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs uppercase text-slate-500">{c.label}</p>
                  <p className="font-mono text-sm text-ocean-100">{c.value}</p>
                </div>
                <span
                  className={
                    c.verified === "public"
                      ? "text-xs font-medium text-emerald-300"
                      : "text-xs text-amber-200"
                  }
                >
                  {c.verified === "public" ? "官网公开" : "未验证"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            生产环境应展示证据链（抓取 URL、时间戳、哈希存档），并区分「推测联系人」与「公开联系人」。
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-semibold text-white">情报信号</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {company.signals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {company.chinaSourcingHint ? (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100/90">
              <strong className="text-amber-200">中国采购线索（演示）：</strong>
              {company.chinaSourcingHint}
            </div>
          ) : null}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <dt className="text-xs text-slate-500">成立</dt>
              <dd className="text-slate-200">{company.founded ?? "—"}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <dt className="text-xs text-slate-500">规模</dt>
              <dd className="text-slate-200">{company.employees ?? "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold text-white">关系边（含置信度）</h2>
        <p className="mt-1 text-xs text-slate-500">
          Neo4j / 图数据库中应存储边的类型、置信度、证据与更新时间；此处为静态演示。
        </p>
        <ul className="mt-4 divide-y divide-white/10">
          {relatedEdges.map((e) => {
            const other = e.from === id ? e.to : e.from;
            const otherName = getCompany(other)?.name ?? other;
            return (
              <li key={`${e.from}-${e.to}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-sm text-white">
                    <span className="text-ocean-300">{e.type}</span>
                    {" → 关联企业 "}
                    <Link className="underline decoration-ocean-500/50 hover:text-ocean-200" href={`/company/${other}`}>
                      {otherName}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500">{e.note}</p>
                </div>
                <span className="text-xs font-mono text-slate-400">{(e.confidence * 100).toFixed(0)}% 置信</span>
              </li>
            );
          })}
        </ul>
        {relatedEdges.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">暂无关系边（演示数据未连接此节点）。</p>
        ) : null}
      </section>
    </div>
  );
}
