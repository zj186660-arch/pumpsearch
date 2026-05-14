"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Languages, Wand2 } from "lucide-react";
import { EXPANDED_KEYWORDS, LANG_SAMPLES } from "@/lib/data";

export function KeywordEnginePanel({ query }: { query: string }) {
  const [open, setOpen] = useState(true);
  const displayQuery = useMemo(() => query || "submersible pump", [query]);

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-500/20 text-ocean-200">
            <Wand2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">AI 全球关键词引擎</h2>
            <p className="text-xs text-slate-500">
              基于「{displayQuery}」的扩展词与多语言翻译（演示流程）
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
      </button>
      {open ? (
        <div className="mt-5 space-y-6 border-t border-white/10 pt-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              <Languages className="h-3.5 w-3.5" />
              语义扩展
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPANDED_KEYWORDS.map((k) => (
                <span
                  key={k}
                  className="rounded-lg border border-white/10 bg-abyss-900/80 px-2.5 py-1 text-xs text-slate-300"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">多语言检索向量（节选）</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {LANG_SAMPLES.map((row) => (
                <div
                  key={row.lang}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="text-xs text-ocean-300">{row.lang}</span>
                  <p className="mt-1 text-slate-200">{row.term}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
