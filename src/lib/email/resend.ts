export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  /** 覆盖环境变量 EMAIL_FROM；须为 Resend 已验证域名下的地址 */
  from?: string;
};

/**
 * 通过 Resend REST API 发送邮件（服务端调用）。
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
export async function sendViaResend(input: SendEmailInput): Promise<{ id?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("未配置 RESEND_API_KEY");
  }
  const from = input.from?.trim() || process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("发件人缺失：请在环境变量设置 EMAIL_FROM，或在请求 JSON 中传 from（须为 Resend 已验证域名）");
  }
  const toList = Array.isArray(input.to) ? input.to : [input.to];
  const trimmed = toList.map((t) => String(t).trim()).filter(Boolean);
  if (trimmed.length === 0) throw new Error("收件人为空");
  if (!input.subject?.trim()) throw new Error("主题为空");
  if (!input.text?.trim() && !input.html?.trim()) throw new Error("正文需至少提供 text 或 html 其一");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: trimmed.length === 1 ? trimmed[0] : trimmed,
      subject: input.subject.trim(),
      text: input.text?.trim() || undefined,
      html: input.html?.trim() || undefined,
    }),
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    const msg = json.message || res.statusText || "Resend API 错误";
    throw new Error(msg);
  }
  return { id: json.id };
}
