/** Escape a single CSV field (RFC-style, Excel-friendly). */
export function csvEscape(value: string): string {
  const s = String(value ?? "").replace(/\r?\n/g, " ");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: string[][], bom = true): string {
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  return bom ? `\ufeff${body}` : body;
}
