import type { PipelineStep } from "@/lib/types";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import clsx from "clsx";

const steps: PipelineStep[] = [
  { id: "1", title: "意图理解", detail: "抽取工况、介质、标准认证偏好", status: "done" },
  { id: "2", title: "多语言扩展", detail: "生成检索词根 + 否定词 + 同义词", status: "done" },
  { id: "3", title: "全球源聚合", detail: "官网 / 目录站 / 展会 / 招投标（演示）", status: "running" },
  { id: "4", title: "实体解析", detail: "去重、角色分类、风险信号", status: "queued" },
  { id: "5", title: "关系推断", detail: "图数据库写入 + 置信度边", status: "queued" },
  { id: "6", title: "触达编排", detail: "模板 + 变量 + 节奏策略", status: "queued" },
];

function StatusIcon({ status }: { status: PipelineStep["status"] }) {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-ocean-300" />;
  return <Circle className="h-4 w-4 text-slate-600" />;
}

export function IntelligencePipeline() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="text-base font-semibold text-white">情报流水线（产品化扩展位）</h2>
      <p className="mt-1 text-xs text-slate-500">
        后端可拆分为队列任务：每个阶段独立重试、观测与成本核算（Token / 抓取配额）。
      </p>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className={clsx(
              "flex gap-3 rounded-xl border px-3 py-2.5",
              s.status === "running" && "border-ocean-500/40 bg-ocean-500/5",
              s.status === "done" && "border-white/10 bg-white/[0.02]",
              s.status === "queued" && "border-white/5 bg-black/20 opacity-70"
            )}
          >
            <div className="flex w-6 shrink-0 flex-col items-center pt-0.5">
              <StatusIcon status={s.status} />
              {i < steps.length - 1 ? (
                <span className="mt-1 h-full w-px grow bg-white/10" aria-hidden />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{s.title}</p>
              <p className="text-xs text-slate-500">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
