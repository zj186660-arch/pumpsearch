import { NextResponse } from "next/server";
import { sendViaResend } from "@/lib/email/resend";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      to?: string | string[];
      subject?: string;
      text?: string;
      html?: string;
      from?: string;
    };
    const result = await sendViaResend({
      to: body.to ?? "",
      subject: body.subject ?? "",
      text: body.text,
      html: body.html,
      from: body.from,
    });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
