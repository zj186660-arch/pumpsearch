import { Suspense } from "react";
import { CompanyCard } from "@/components/CompanyCard";
import { KeywordEnginePanel } from "@/components/KeywordEnginePanel";
import { searchCompanies } from "@/lib/data";
import Link from "next/link";
import { Filter, Network } from "lucide-react";

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
  const results = searchCompanies(query);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">全球企业搜索</h1>
          <p className="mt-1 text-sm text-slate-500">
            查询词：<span className="text-ocean-200">{query || "（空则展示全部演示数据）"}</span>
            {" · "}
            命中 {results.length} 家（演示）
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/graph"
            className="inline-flex items-center gap-2 rounded-xl border border-ocean-500/30 bg-ocean-500/10 px-4 py-2 text-sm font-medium text-ocean-100"
          >
            <Network className="h-4 w-4" />
            打开关系图谱
          </Link>
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400">
            <Filter className="h-4 w-4" />
            筛选器（下一阶段：国家 / 角色 / 评分）
          </span>
        </div>
      </div>

      <KeywordEnginePanel query={query} />

      <div className="space-y-4">
        {results.map((c) => (
          <CompanyCard key={c.id} company={c} />
        ))}
        {results.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            没有匹配演示数据。请尝试首页推荐词或更短关键词。
          </p>
        ) : null}
      </div>
    </div>
  );
}
