import { Suspense } from "react";
import { KeywordEnginePanel } from "@/components/KeywordEnginePanel";
import { runGlobalSearch } from "@/lib/searchOrchestrator";
import Link from "next/link";
import { Filter, Network } from "lucide-react";
import { LeadCard } from "@/components/LeadCard";
import { CrmExportToolbar } from "@/components/CrmExportToolbar";
import { LiveSearchStatusBanner } from "@/components/LiveSearchStatusBanner";

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchInner searchParams={searchParams} />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">加载搜索结果…</div>
  );
}

async function SearchInner({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q ?? "";
  const { leads, warnings, config } = await runGlobalSearch(query);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">全球企业搜索</h1>
          <p className="mt-1 text-sm text-slate-500">
            会话查询词：<span className="text-ocean-200">{query || "（空：展示演示 + 若已配密钥则仍尝试宽泛检索）"}</span>
            {" · "}
            列表共 <span className="text-slate-200">{leads.length}</span> 条
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CrmExportToolbar leads={leads} query={query} />
          <Link
            href="/graph"
            className="inline-flex items-center gap-2 rounded-xl border border-ocean-500/30 bg-ocean-500/10 px-4 py-2 text-sm font-medium text-ocean-100"
          >
            <Network className="h-4 w-4" />
            关系图谱
          </Link>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
            <Filter className="h-4 w-4" />
            国家 / 角色筛选（下一步）
          </span>
        </div>
      </div>

      <LiveSearchStatusBanner
        bingEnabled={config.bingEnabled}
        serpapiEnabled={config.serpapiEnabled}
        googleEnabled={config.googleEnabled}
        googleProxyConfigured={config.googleProxyConfigured}
        openAiConfigured={config.openAiConfigured}
        cacheHit={config.cacheHit}
        demoAppended={config.demoAppended}
        warnings={warnings}
      />

      <KeywordEnginePanel query={query} />

      <div className="space-y-4">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            无结果。请配置 Bing 与/或 SerpAPI 密钥，或暂时使用演示词；也可检查网络与代理。
          </p>
        ) : null}
      </div>
    </div>
  );
}
