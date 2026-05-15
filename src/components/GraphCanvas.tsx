"use client";

import { useMemo } from "react";
import type { Company, GraphEdge } from "@/lib/types";

const EDGE_PALETTE: Record<string, string> = {
  长期采购: "#34d399",
  展会合作: "#22d3ee",
  竞争: "#f87171",
  供应链: "#a78bfa",
  疑似换供: "#fbbf24",
  海关往来: "#94a3b8",
  同次检索共现: "#38bdf8",
  父域相近: "#a855f7",
};

function layoutCircle(ids: string[], size: number): Record<string, { x: number; y: number }> {
  const n = ids.length;
  if (n === 0) return {};
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(size * 0.38, Math.max(100, 26 * Math.sqrt(n)));
  const pos: Record<string, { x: number; y: number }> = {};
  ids.forEach((id, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    pos[id] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  });
  return pos;
}

function edgeTypesInUse(edges: GraphEdge[]): string[] {
  const s = new Set<string>();
  for (const e of edges) s.add(e.type);
  return [...s].sort();
}

export function GraphCanvas({ companies, edges }: { companies: Company[]; edges: GraphEdge[] }) {
  const size = useMemo(() => {
    const n = companies.length;
    if (n <= 8) return 560;
    if (n <= 24) return 680;
    return Math.min(920, 520 + Math.sqrt(n) * 28);
  }, [companies.length]);

  const positions = useMemo(() => {
    return layoutCircle(
      companies.map((c) => c.id),
      size
    );
  }, [companies, size]);

  const lines = useMemo(() => {
    return edges.flatMap((e) => {
      const a = positions[e.from];
      const b = positions[e.to];
      if (!a || !b) return [];
      return [{ e, a, b }];
    });
  }, [edges, positions]);

  const showEdgeLabels = edges.length <= 48;
  const legendKeys = useMemo(() => {
    const fromEdges = edgeTypesInUse(edges);
    if (fromEdges.length > 0) return fromEdges;
    return Object.keys(EDGE_PALETTE);
  }, [edges]);

  return (
    <div className="w-full overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-5xl">
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
          const stroke = EDGE_PALETTE[e.type] ?? "#64748b";
          return (
            <g key={`${e.from}-${e.to}-${e.type}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeOpacity={0.42}
                strokeWidth={1.5 + e.confidence * 3}
              />
              {showEdgeLabels ? (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 5}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {e.type} · {(e.confidence * 100).toFixed(0)}%
                </text>
              ) : null}
            </g>
          );
        })}
        {companies.map((c) => {
          const p = positions[c.id];
          if (!p) return null;
          const r = companies.length > 40 ? 22 : 32;
          return (
            <g key={c.id} filter="url(#glow)">
              <circle cx={p.x} cy={p.y} r={r} fill="rgba(6,182,212,0.15)" stroke="rgba(34,211,238,0.5)" />
              <text
                x={p.x}
                y={p.y - 3}
                fill="#f8fafc"
                fontSize={companies.length > 50 ? 8 : 10}
                fontWeight="600"
                textAnchor="middle"
              >
                {c.name.length > 16 ? `${c.name.slice(0, 14)}…` : c.name}
              </text>
              <text
                x={p.x}
                y={p.y + (companies.length > 50 ? 9 : 11)}
                fill="#94a3b8"
                fontSize={companies.length > 50 ? 7 : 8}
                textAnchor="middle"
              >
                {c.country} · {c.role}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="mx-auto mt-4 flex max-w-5xl flex-wrap gap-3 text-xs text-slate-400">
        {legendKeys.map((k) => (
          <li key={k} className="inline-flex items-center gap-2">
            <span className="h-2 w-6 rounded-full" style={{ backgroundColor: EDGE_PALETTE[k] ?? "#64748b" }} />
            {k}
          </li>
        ))}
      </ul>
      {edges.length > 48 ? (
        <p className="mx-auto mt-2 max-w-5xl text-center text-[11px] text-slate-500">
          边较多时已隐藏边上的文字标签，避免重叠；数据仍完整渲染。
        </p>
      ) : null}
    </div>
  );
}
