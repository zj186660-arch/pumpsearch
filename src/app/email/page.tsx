import { Suspense } from "react";
import { EmailWorkbench, type ExternalLead } from "@/components/EmailWorkbench";
import { getCompany } from "@/lib/data";

export default function EmailPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; name?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">加载邮件工作台…</div>}>
      <EmailPageInner searchParams={searchParams} />
    </Suspense>
  );
}

async function EmailPageInner({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; name?: string }>;
}) {
  const { company, name } = await searchParams;
  const demo = company && getCompany(company);
  const external: ExternalLead | undefined =
    company && !demo
      ? {
          id: company,
          name: name ? decodeURIComponent(name) : company,
        }
      : undefined;
  const initialCompanyId = demo ? company : undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">AI 邮件工作台</h1>
        <p className="mt-1 text-sm text-slate-500">
          生成前需勾选法律依据与同意声明；记录可导出为 CSV，生产环境应写入不可篡改审计库与 ESP 日志。
        </p>
      </div>
      <EmailWorkbench initialCompanyId={initialCompanyId} externalLead={external} />
    </div>
  );
}
