/**
 * 生成多组检索式，用于在同一搜索会话中扩大「独立域名」覆盖（受 API 配额与 PUMPSEARCH_MAX_RAW_RESULTS 约束）。
 * 说明：单次请求不可能返回「全球全部企业」；数万量级需长期累积或购买企业库。
 */
const REGION_HINTS = [
  "USA",
  "Germany",
  "UK",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Poland",
  "Turkey",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "UAE",
  "Saudi Arabia",
  "Australia",
  "Canada",
  "South Africa",
  "Indonesia",
  "Vietnam",
  "Thailand",
  "Malaysia",
  "Argentina",
  "Chile",
  "Colombia",
  "Nigeria",
  "Egypt",
  "Sweden",
  "Norway",
  "Czech Republic",
];

const ROLE_HINTS = [
  "manufacturer",
  "supplier",
  "distributor",
  "factory",
  "OEM",
  "wholesaler",
  "exporter",
  "EPC",
];

export function expandQueryVariants(userQuery: string, maxVariants: number): string[] {
  const base = userQuery.trim() || "submersible pump";
  const out = new Set<string>();
  out.add(base);

  for (const r of REGION_HINTS) {
    if (out.size >= maxVariants) break;
    out.add(`${base} ${r} pump company`.slice(0, 480));
    out.add(`${base} ${r} water pump industrial`.slice(0, 480));
  }
  for (const role of ROLE_HINTS) {
    if (out.size >= maxVariants) break;
    out.add(`${base} ${role}`.slice(0, 480));
  }

  return [...out].slice(0, maxVariants);
}
