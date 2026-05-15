import Link from "next/link";
import { ArrowRight, Building2, ExternalLink, Globe2, MapPin } from "lucide-react";
import type { LeadRow } from "@/lib/leads";
import { ScoreBadge } from "./ScoreBadge";

export function LeadCard({ lead }: { lead: LeadRow }) {
  const avg = lead.score
    ? Math.round(
        (lead.score.activity +
          lead.score.procurement +
          lead.score.replyLikelihood +
          lead.score.marketSize +
          lead.score.dealProbability) /
          5
      )
    : null;

  const webHref =
    lead.website && /^https?:\/\//i.test(lead.website)
      ? lead.website
      : lead.website
        ? `https://${lead.website}`
        : "";

  const sourceLabel =
    lead.source === "demo"
      ? "演示样本"
      : lead.source === "bing"
        ? "Bing Web Search"
        : lead.source === "google"
          ? "Google CSE"
          : lead.source === "serpapi"
            ? lead.serpEngine
              ? `SerpAPI · ${lead.serpEngine}`
              : "SerpAPI"
            : "多源";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-ocean-500/40 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-ocean-500/10 blur-2xl transition group-hover:bg-ocean-400/20" />
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
              <Building2 className="h-3.5 w-3.5" />
              {lead.role}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
              {sourceLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {lead.country} · {lead.city}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{lead.name}</h2>
            <p className="mt-1 font-mono text-xs text-slate-500">id: {lead.id}</p>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">{lead.description || "—"}</p>
          {(lead.products ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(lead.products ?? []).slice(0, 6).map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-ocean-500/20 bg-ocean-500/5 px-2 py-0.5 text-xs text-ocean-200"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {webHref ? (
              <a
                href={webHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-ocean-300 hover:text-ocean-200"
              >
                <Globe2 className="h-3.5 w-3.5" />
                {(lead.website ?? "").replace(/^https?:\/\//, "").slice(0, 60)}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            ) : (
              <span className="text-slate-600">无官网字段</span>
            )}
            {lead.mapsUrl ? (
              <a
                href={lead.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
              >
                地图
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
            {avg !== null ? <span>综合评分 {avg}/10</span> : <span className="text-amber-200/90">待 CRM / AI 打分</span>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {lead.score ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
              <ScoreBadge value={lead.score.activity} label="活跃度" />
              <ScoreBadge value={lead.score.procurement} label="采购力" />
              <ScoreBadge value={lead.score.replyLikelihood} label="回复" />
              <ScoreBadge value={lead.score.marketSize} label="市场" />
              <ScoreBadge value={lead.score.dealProbability} label="成交" />
            </div>
          ) : (
            <p className="max-w-xs rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-slate-400">
              来自公开网页索引，未自动打分。请导入 CRM 后补充联系人验证与评分模型。
            </p>
          )}
          {lead.detailPath ? (
            <Link
              href={lead.detailPath}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-ocean-400/50 hover:bg-ocean-500/10"
            >
              演示档案与关系
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/email?company=${encodeURIComponent(lead.id)}&name=${encodeURIComponent(lead.name)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ocean-500/30 bg-ocean-500/10 px-4 py-2.5 text-sm font-medium text-ocean-100 transition hover:bg-ocean-500/20"
            >
              邮件工作台（外部线索）
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
