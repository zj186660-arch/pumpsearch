"use client";

import { useMemo } from "react";
import type { Company, GraphEdge } from "@/lib/types";

const POS: Record<string, { x: number; y: number }> = {
  c1: { x: 320, y: 70 },
  c2: { x: 480, y: 180 },
  c3: { x: 400, y: 320 },
  c4: { x: 200, y: 320 },
  c5: { x: 80, y: 200 },
  c6: { x: 160, y: 80 },
};

const edgeColor: Record<string, string> = {
  长期采购: "#34d399",
  展会合作: "#22d3ee",
  竞争: "#f87171",
  供应链: "#a78bfa",
  疑似换供: "#fbbf24",
  海关往来: "#94a3b8",
};

export function GraphCanvas({ companies, edges }: { companies: Company[]; edges: GraphEdge[] }) {
  const lines = useMemo(() => {
    return edges.flatMap((e) => {
      const a = POS[e.from];
      const b = POS[e.to];
      if (!a || !b) return [];
      return [{ e, a, b }];
    });
  }, [edges]);

  return (
    <div className="w-full overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4">
      <svg viewBox="0 0 560 380" className="mx-auto h-auto w-full max-w-3xl">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {lines.map((item) => {
          const { e, a, b } = item;
          const stroke = edgeColor[e.type] ?? "#64748b";
          return (
            <g key={`${e.from}-${e.to}-${e.type}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeOpacity={0.45}
                strokeWidth={2 + e.confidence * 3}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 6}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
              >
                {e.type} · {(e.confidence * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {companies.map((c) => {
          const p = POS[c.id];
          if (!p) return null;
          return (
            <g key={c.id} filter="url(#glow)">
              <circle cx={p.x} cy={p.y} r="36" fill="rgba(6,182,212,0.15)" stroke="rgba(34,211,238,0.5)" />
              <text
                x={p.x}
                y={p.y - 4}
                fill="#f8fafc"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {c.name.length > 18 ? `${c.name.slice(0, 16)}…` : c.name}
              </text>
              <text x={p.x} y={p.y + 12} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {c.country} · {c.role}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap gap-3 text-xs text-slate-400">
        {Object.entries(edgeColor).map(([k, v]) => (
          <li key={k} className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full" style={{ backgroundColor: v }} />
            {k}
          </li>
        ))}
      </ul>
    </div>
  );
}
