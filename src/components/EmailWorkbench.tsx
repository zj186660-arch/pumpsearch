"use client";

import { useMemo, useState } from "react";
import { COMPANIES, getCompany } from "@/lib/data";
import { Bot, Send, Sparkles } from "lucide-react";
import clsx from "clsx";

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

export function EmailWorkbench({ initialCompanyId }: { initialCompanyId?: string }) {
  const [selectedId, setSelectedId] = useState(initialCompanyId ?? COMPANIES[0].id);
  const [styleIdx, setStyleIdx] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const company = useMemo(() => getCompany(selectedId), [selectedId]);

  const generate = () => {
    if (!company) return;
    const style = STYLES[styleIdx % STYLES.length];
    setSubject(
      `[PumpMind] ${company.products[0] ?? "Pump"} proposal for ${company.name.split(" ")[0]}`
    );
    setBody(
      `${style.body}\n\n---\n内部备注（不发送）：语气=${style.tone}；目标国家=${company.country}；官网公开邮箱优先。`
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold text-white">客户列表（演示）</h2>
        <ul className="max-h-[480px] space-y-1 overflow-auto pr-1">
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
            {company ? (
              <p className="text-xs text-slate-500">
                当前：{company.name} · {company.country}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-slate-400">
            <Sparkles className="h-3 w-3 text-ocean-300" />
            演示文案 · 接 GPT / Claude API 替换
          </span>
        </div>

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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-500 py-2.5 text-sm font-semibold text-abyss-950"
            >
              <Bot className="h-4 w-4" />
              生成草稿（本地规则）
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
            title="演示环境未连接真实发信"
          >
            <Send className="h-4 w-4" />
            一键发送（需配置 ESP 与同意记录）
          </button>
          <button
            type="button"
            className="rounded-xl border border-dashed border-ocean-500/40 px-4 py-2 text-sm text-ocean-200"
          >
            防垃圾优化 / 跟进序列（占位）
          </button>
        </div>
      </div>
    </div>
  );
}
