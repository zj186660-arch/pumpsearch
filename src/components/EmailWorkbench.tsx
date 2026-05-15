"use client";

import { useCallback, useMemo, useState } from "react";
import { COMPANIES, getCompany } from "@/lib/data";
import { Bot, Download, Send, ShieldCheck, Sparkles } from "lucide-react";
import clsx from "clsx";
import { toCsv } from "@/lib/csv";
import type { LegalBasis } from "@/lib/consent";
import { CONSENT_POLICY_VERSION, LEGAL_BASIS_LABELS } from "@/lib/consent";

const STYLES: { region: string; tone: string; body: string }[] = [
  {
    region: "德国",
    tone: "严谨、数据导向、参数表驱动",
    body:
      "Sehr geehrte Damen und Herren,\n\nwir freuen uns, Ihnen unsere Serie elektrischer Tauchmotorpumpen für kommunales Abwasser vorzustellen. Im Anhang finden Sie die Kennlinien Q–H für die Varianten DN80–DN200 sowie Wirkungsgradkennfelder nach IE3.\n\nFür Ihr aktuelles Klärwerksprojekt in Düsseldorf schlagen wir eine 30-tägige Lieferzeit ab Auftragseingang vor. Bitte bestätigen Sie die geforderte Norm (EN 12050) und die gewünschte Materialkombination für Laufrad und Gehäuse.\n\nMit freundlichen Grüßen,\n[Ihr Name]",
  },
  {
    region: "中东",
    tone: "关系导向、礼貌、强调长期合作与现场服务",
    body:
      "Dear Team,\n\nGreetings from [Company]. We trust this message finds you well.\n\nWe would be honored to explore a long-term partnership for wastewater and dewatering pump packages across your Gulf projects. Beyond competitive pricing, we emphasize on-site commissioning support and spare-parts readiness in Jebel Ali.\n\nKindly advise a convenient time for a short introductory call.\n\nWarm regards,\n[Your Name]",
  },
  {
    region: "俄罗斯",
    tone: "直接、强调价格、交期与质保条款",
    body:
      "Здравствуйте,\n\nМы производитель погружных насосов для сточных вод. Готовы предложить серию 22–110 кВт с сроком поставки 25–35 дней и гарантией 24 месяца.\n\nПросим прислать объём, напор и требуемый материал рабочего колеса. После этого направим коммерческое предложение в течение 24 часов.\n\nС уважением,\n[Ваше имя]",
  },
  {
    region: "日本",
    tone: "极度礼貌、风险与品控、强调稳定性与认证",
    body:
      "拝啓\n\n平素より大変お世話になっております。[会社名]の[氏名]でございます。\n\n貴社の水処理プロジェクト向けに、IEC準拠の水中ポンプおよび試運転手順書・品質記録（トレーサビリティ）をご用意できます。納期・検査基準について、貴社仕様書に沿ったご提案が可能です。\n\nご多忙の折とは存じますが、一度オンラインにてご挨拶のお時間を頂戴できますと幸いです。\n\n敬具",
  },
];

export type ExternalLead = { id: string; name: string };

export function EmailWorkbench({
  initialCompanyId,
  externalLead,
}: {
  initialCompanyId?: string;
  externalLead?: ExternalLead;
}) {
  const resolvedInitialId = useMemo(() => {
    if (initialCompanyId && getCompany(initialCompanyId)) return initialCompanyId;
    return COMPANIES[0].id;
  }, [initialCompanyId]);

  const [selectedId, setSelectedId] = useState(resolvedInitialId);
  const [styleIdx, setStyleIdx] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [legalBasis, setLegalBasis] = useState<LegalBasis>("public_business_contact");
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentLog, setConsentLog] = useState<
    { at: string; targetId: string; targetName: string; legalBasis: LegalBasis; policy: string }[]
  >([]);

  const company = useMemo(() => getCompany(selectedId), [selectedId]);
  const targetName = externalLead?.name ?? company?.name ?? "";
  const targetCountry = company?.country ?? "（外部线索：请核实国家/地区）";

  const generate = () => {
    if (!consentChecked) return;
    const style = STYLES[styleIdx % STYLES.length];
    const tid = externalLead?.id ?? company?.id ?? selectedId;
    setSubject(
      `[PumpMind] ${company?.products?.[0] ?? "Pump"} proposal for ${targetName.split(" ")[0]}`
    );
    setBody(
      `${style.body.replace(/\[Company\]/g, targetName).replace(/\[会社名\]/g, targetName)}\n\n---\n内部备注（不发送）：语气=${style.tone}；目标=${targetName}；国家/地区=${targetCountry}；法律依据=${LEGAL_BASIS_LABELS[legalBasis]}；策略版本=${CONSENT_POLICY_VERSION}`
    );
    setConsentLog((prev) => [
      ...prev,
      {
        at: new Date().toISOString(),
        targetId: tid,
        targetName,
        legalBasis,
        policy: CONSENT_POLICY_VERSION,
      },
    ]);
  };

  const exportConsentCsv = useCallback(() => {
    const header = ["recorded_at", "target_id", "target_name", "legal_basis", "policy_version", "operator_note"];
    const rows: string[][] = [header];
    for (const r of consentLog) {
      rows.push([
        r.at,
        r.targetId,
        r.targetName,
        LEGAL_BASIS_LABELS[r.legalBasis],
        r.policy,
        "本机浏览器会话记录，生产环境应写入审计数据库",
      ]);
    }
    const csv = toCsv(rows, true);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pumpmind-consent-${CONSENT_POLICY_VERSION}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [consentLog]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold text-white">客户列表</h2>
        {externalLead ? (
          <div className="rounded-xl border border-ocean-500/30 bg-ocean-500/10 px-3 py-2 text-xs text-ocean-100">
            已从搜索打开外部线索：<strong className="text-white">{externalLead.name}</strong>
            <p className="mt-1 text-[11px] text-ocean-200/80">生成邮件将以该名称为准；仍可从下列演示客户切换模板语气参考。</p>
          </div>
        ) : null}
        <ul className="max-h-[400px] space-y-1 overflow-auto pr-1">
          {COMPANIES.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={clsx(
                  "flex w-full flex-col rounded-xl border px-3 py-2 text-left text-sm transition",
                  c.id === selectedId
                    ? "border-ocean-500/50 bg-ocean-500/10 text-white"
                    : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-slate-500">
                  {c.country} · {c.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">AI 邮件工作台</h2>
            <p className="text-xs text-slate-500">
              当前目标：<span className="text-slate-200">{targetName}</span>
              {company && !externalLead ? (
                <>
                  {" · "}
                  {company.country}
                </>
              ) : null}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-slate-400">
            <Sparkles className="h-3 w-3 text-ocean-300" />
            草稿层可接 LLM API
          </span>
        </div>

        <section className="space-y-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div className="space-y-2 text-xs text-emerald-100/90">
              <p className="font-semibold text-emerald-50">联系同意与法律依据（生成前必选）</p>
              <label className="block text-[11px] text-slate-400">
                法律依据类别
                <select
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value as LegalBasis)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-white"
                >
                  {(Object.keys(LEGAL_BASIS_LABELS) as LegalBasis[]).map((k) => (
                    <option key={k} value={k}>
                      {LEGAL_BASIS_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  本人确认：对「{targetName}」的本次联系已具备合法依据（如官网公开商业联系方式、展会互换名片、合同相对方等），并已按公司政策评估跨境营销与退订要求。
                </span>
              </label>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-500">
            文化 / 语气模板
            <select
              value={styleIdx}
              onChange={(e) => setStyleIdx(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-ocean-500/50"
            >
              {STYLES.map((s, i) => (
                <option key={s.region} value={i}>
                  {s.region} — {s.tone}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={generate}
              disabled={!consentChecked}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-500 py-2.5 text-sm font-semibold text-abyss-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Bot className="h-4 w-4" />
              生成草稿
            </button>
          </div>
        </div>

        <label className="block text-xs text-slate-500">
          主题
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-ocean-500/50"
          />
        </label>
        <label className="block text-xs text-slate-500">
          正文
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-ocean-500/50 md:text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-500"
            title="需接入 ESP、退订链接与发送审计"
          >
            <Send className="h-4 w-4" />
            一键发送（待 ESP）
          </button>
          <button
            type="button"
            onClick={exportConsentCsv}
            disabled={consentLog.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            导出同意记录 CSV（{consentLog.length}）
          </button>
        </div>
      </div>
    </div>
  );
}
