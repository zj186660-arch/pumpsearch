import clsx from "clsx";
import Link from "next/link";
import { Activity, Droplets, Network, Sparkles } from "lucide-react";

const nav = [
  { href: "/", label: "首页" },
  { href: "/search?q=submersible+pump", label: "全球搜索" },
  { href: "/email", label: "邮件工作台" },
  { href: "/graph", label: "关系图谱" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-abyss-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-400 to-cyan-600 shadow-lg shadow-ocean-500/25">
            <Droplets className="h-5 w-5 text-abyss-950" aria-hidden />
          </span>
          <span className="text-lg text-white">
            PumpMind <span className="text-ocean-300">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "hidden items-center gap-1.5 rounded-full border border-ocean-500/30",
              "bg-ocean-500/10 px-3 py-1 text-xs font-medium text-ocean-200 sm:flex"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            演示数据 · MVP
          </span>
          <Link
            href="/search?q=pump"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-abyss-950 shadow-lg shadow-ocean-500/20 transition hover:brightness-110"
          >
            <Activity className="h-4 w-4" />
            开始情报检索
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/graph"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-ocean-500/30 bg-ocean-500/10 px-3 py-1.5 text-xs text-ocean-200"
        >
          <Network className="h-3.5 w-3.5" />
          图谱
        </Link>
      </div>
    </header>
  );
}
