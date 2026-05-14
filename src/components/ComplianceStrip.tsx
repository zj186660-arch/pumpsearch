import { ShieldAlert } from "lucide-react";

export function ComplianceStrip() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5">
      <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-xs text-amber-100/90 md:items-center">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <p>
          <strong className="font-semibold text-amber-200">合规与边界：</strong>
          本演示使用虚构企业与合成数据。生产环境应接入授权数据源、邮件可撤回与同意机制，并对关系推断标注置信度与证据链。
        </p>
      </div>
    </div>
  );
}
