import Link from "next/link";
import { ArrowRight, Radar, Search } from "lucide-react";
import { IntelligencePipeline } from "@/components/IntelligencePipeline";
import { PROCUREMENT_LEADS } from "@/lib/data";
import { TrendMapPanel } from "@/components/TrendMapPanel";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-ocean-500/30 bg-ocean-500/10 px-3 py-1 text-xs font-medium text-ocean-200">
            <Radar className="h-3.5 w-3.5" />
            全球水泵行业 · AI 情报与客户开发
          </p>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            一个关键词，
            <span className="bg-gradient-to-r from-ocean-200 to-cyan-300 bg-clip-text text-transparent">
              跑通全球情报闭环
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-400">
            PumpMind AI 将「语义扩展、多语言检索、企业画像、关系图谱、评分排序、邮件生成与触达编排」放在同一工作流。当前仓库为
            <strong className="text-slate-200">可交互前端 MVP</strong>
            ，便于你与工程团队对齐信息架构与页面流。
          </p>
          <form action="/search" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                name="q"
                defaultValue="submersible pump"
                placeholder="输入关键词，例如：submersible pump / 潜水排污泵"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none ring-ocean-500/40 placeholder:text-slate-600 focus:border-ocean-500/50 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ocean-500 to-cyan-500 px-8 text-sm font-semibold text-abyss-950 shadow-lg shadow-ocean-500/25 transition hover:brightness-110"
            >
              搜索全球水泵客户
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>试试：</span>
            {["slurry pump", "wastewater", "irrigation", "EPC 污水"].map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 transition hover:border-ocean-500/40 hover:text-white"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <IntelligencePipeline />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <TrendMapPanel />
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-base font-semibold text-white">采购与项目情报（演示）</h2>
          <p className="mt-1 text-xs text-slate-500">可接展会日历、招标 RSS、海关变更订阅与站内提醒</p>
          <ul className="mt-4 space-y-3">
            {PROCUREMENT_LEADS.map((l) => (
              <li
                key={l.id}
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{l.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {l.region} · {l.pumpType}
                    </p>
                  </div>
                  <span
                    className={
                      l.urgency === "高"
                        ? "shrink-0 rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-300"
                        : "shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-300"
                    }
                  >
                    {l.urgency}优先级
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/graph"
            className="mt-4 inline-flex text-sm font-medium text-ocean-300 hover:text-ocean-200"
          >
            在关系图谱中查看关联企业 →
          </Link>
        </div>
      </section>
    </div>
  );
}
