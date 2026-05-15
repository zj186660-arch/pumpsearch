import { AlertTriangle, Bot, CheckCircle2, Database, Globe2, Search } from "lucide-react";

export function LiveSearchStatusBanner({
  bingEnabled,
  serpapiEnabled,
  googleEnabled,
  googleProxyConfigured,
  openAiConfigured,
  cacheHit,
  demoAppended,
  warnings,
}: {
  bingEnabled: boolean;
  serpapiEnabled: boolean;
  googleEnabled: boolean;
  googleProxyConfigured: boolean;
  openAiConfigured: boolean;
  cacheHit: boolean;
  demoAppended: boolean;
  warnings: string[];
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={
            bingEnabled
              ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200"
              : "inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200"
          }
        >
          {bingEnabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          Bing Web Search API
        </span>
        <span
          className={
            serpapiEnabled
              ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200"
              : "inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-1 text-slate-400"
          }
        >
          {serpapiEnabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          SerpAPI（默认 Bing 引擎）
        </span>
        <span
          className={
            googleEnabled
              ? "inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200"
              : "inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-1 text-slate-400"
          }
        >
          {googleEnabled ? <Globe2 className="h-3.5 w-3.5" /> : <Search className="h-3.5 w-3.5" />}
          Google CSE
        </span>
        <span
          className={
            googleProxyConfigured
              ? "inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-200"
              : "inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-1 text-slate-400"
          }
        >
          Node 代理（Google 请求）
        </span>
        <span
          className={
            openAiConfigured
              ? "inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-violet-200"
              : "inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-1 text-slate-400"
          }
        >
          <Bot className="h-3.5 w-3.5" />
          OpenAI 清洗
        </span>
        <span
          className={
            cacheHit
              ? "inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-sky-200"
              : "inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-1 text-slate-400"
          }
        >
          <Database className="h-3.5 w-3.5" />
          本地缓存
        </span>
        {demoAppended ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
            已附加演示样本（PUMPSEARCH_APPEND_DEMO=false 可关）
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
            未附加演示样本
          </span>
        )}
      </div>
      {warnings.length > 0 ? (
        <ul className="space-y-2 text-xs leading-relaxed text-amber-100/95">
          {warnings.map((w) => (
            <li key={w} className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              {w}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">检索链路正常；以下为合并去重后的结果。</p>
      )}
    </div>
  );
}
