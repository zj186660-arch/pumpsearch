"use client";

import { useCallback } from "react";
import type { LeadRow } from "@/lib/leads";
import { toCsv } from "@/lib/csv";
import { Download } from "lucide-react";

type Props = {
  leads: LeadRow[];
  query: string;
};

export function CrmExportToolbar({ leads, query }: Props) {
  const download = useCallback(() => {
    const exportedAt = new Date().toISOString();
    const header = [
      "id",
      "source",
      "name",
      "country",
      "city",
      "role",
      "website",
      "phone",
      "maps_url",
      "description",
      "signals",
      "search_session_query",
      "exported_at",
    ];
    const rows: string[][] = [header];
    for (const l of leads) {
      rows.push([
        l.id,
        l.source,
        l.name,
        l.country,
        l.city,
        l.role,
        l.website,
        l.phone ?? "",
        l.mapsUrl ?? "",
        l.description,
        (l.signals ?? []).join(" | "),
        query,
        exportedAt,
      ]);
    }
    const csv = toCsv(rows, true);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pumpmind-crm-${exportedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [leads, query]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={download}
        disabled={leads.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-abyss-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        导出 CRM CSV
      </button>
      <span className="text-sm text-slate-500">当前列表 {leads.length} 条 · UTF-8 BOM 便于 Excel</span>
    </div>
  );
}
