import { Suspense } from "react";
import { EmailWorkbench } from "@/components/EmailWorkbench";

export default function EmailPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">加载邮件工作台…</div>}>
      <EmailPageInner searchParams={searchParams} />
    </Suspense>
  );
}

async function EmailPageInner({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const { company } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-white">AI 邮件工作台</h1>
        <p className="mt-1 text-sm text-slate-500">
          左侧客户、右侧多语言 / 多文化模板与变量；发送与打开追踪需后端与合规流程。
        </p>
      </div>
      <EmailWorkbench initialCompanyId={company} />
    </div>
  );
}
