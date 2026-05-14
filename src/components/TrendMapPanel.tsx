import { TREND_REGIONS } from "@/lib/data";

export function TrendMapPanel() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">需求热度（演示）</h2>
          <p className="mt-1 text-xs text-slate-500">高级版可接宏观指标、招标文本与新闻 NLP</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-ocean-500/10 to-transparent">
          {/* abstract map */}
          <svg viewBox="0 0 400 240" className="h-full w-full text-ocean-400/40">
            <defs>
              <radialGradient id="g1" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="400" height="240" fill="url(#g1)" />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              d="M20 120 Q100 40 200 120 T380 120"
            />
            <circle cx="280" cy="100" r="6" fill="rgb(34,211,238)" className="animate-pulse-slow" />
            <circle cx="140" cy="150" r="5" fill="rgb(52,211,153)" />
            <circle cx="220" cy="170" r="4" fill="rgb(250,204,21)" />
            <circle cx="90" cy="90" r="4" fill="rgb(52,211,153)" />
          </svg>
          <p className="absolute bottom-3 left-3 text-xs text-slate-400">
            可替换为 MapLibre / 矢量瓦片 + 热力图层
          </p>
        </div>
        <ul className="space-y-2">
          {TREND_REGIONS.map((r) => (
            <li
              key={r.country}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">{r.country}</p>
                <p className="text-xs text-slate-500">{r.note}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-ocean-500/15 px-2 py-1 text-xs font-semibold text-ocean-200">
                {r.heat}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
