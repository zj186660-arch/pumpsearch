import Link from "next/link";
import { ArrowRight, Building2, Globe2, MapPin } from "lucide-react";
import type { Company } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

export function CompanyCard({ company }: { company: Company }) {
  const avg = Math.round(
    (company.score.activity +
      company.score.procurement +
      company.score.replyLikelihood +
      company.score.marketSize +
      company.score.dealProbability) /
      5
  );
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-ocean-500/40 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ocean-500/10 blur-2xl transition group-hover:bg-ocean-400/20" />
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
              <Building2 className="h-3.5 w-3.5" />
              {company.role}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {company.country} · {company.city}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{company.name}</h2>
            {company.nameLocal ? (
              <p className="text-sm text-slate-400">{company.nameLocal}</p>
            ) : null}
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">{company.description}</p>
          <div className="flex flex-wrap gap-2">
            {company.products.slice(0, 4).map((p) => (
              <span
                key={p}
                className="rounded-md border border-ocean-500/20 bg-ocean-500/5 px-2 py-0.5 text-xs text-ocean-200"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              {company.website.replace("https://", "")}
            </span>
            <span>综合评分 {avg}/10</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            <ScoreBadge value={company.score.activity} label="活跃度" />
            <ScoreBadge value={company.score.procurement} label="采购力" />
            <ScoreBadge value={company.score.replyLikelihood} label="回复" />
            <ScoreBadge value={company.score.marketSize} label="市场" />
            <ScoreBadge value={company.score.dealProbability} label="成交" />
          </div>
          <Link
            href={`/company/${company.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-ocean-400/50 hover:bg-ocean-500/10"
          >
            AI 档案与关系
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
