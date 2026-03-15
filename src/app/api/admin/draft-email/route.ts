import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { isAuthorized } from "@/lib/admin/auth";
import { logEmail } from "@/lib/email/logging";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const to = formData.get("to") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    const cc = formData.get("cc") as string | null;
    const bcc = formData.get("bcc") as string | null;

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    // Process attachments
    const attachmentFiles = formData.getAll("attachments") as File[];
    const attachments = await Promise.all(
      attachmentFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );

    // Build branded HTML from plain text
    const htmlBody = buildEmailHtml(subject, body);

    if (!process.env.RESEND_API_KEY) {
      // Log only — no Resend key configured
      await logEmail({
        type: "draft",
        to,
        subject,
        html: htmlBody,
        status: "logged",
      });
      return NextResponse.json({ success: true, mode: "logged" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from: FROM_EMAIL,
      to: to.split(",").map((e) => e.trim()),
      subject,
      html: htmlBody,
    };

    if (cc) emailPayload.cc = cc.split(",").map((e) => e.trim());
    if (bcc) emailPayload.bcc = bcc.split(",").map((e) => e.trim());
    if (attachments.length > 0) emailPayload.attachments = attachments;

    const { error } = await resend.emails.send(emailPayload);

    if (error) {
      await logEmail({
        type: "draft",
        to,
        subject,
        html: htmlBody,
        status: "failed",
        error: error.message,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logEmail({
      type: "draft",
      to,
      subject,
      html: htmlBody,
      status: "sent",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Draft email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

function buildEmailHtml(subject: string, plainText: string): string {
  const GOLD = "#D4A853";
  const BG = "#0B0F1A";
  const CARD = "#111827";

  const bodyHtml = plainText
    .split("\n")
    .map(
      (line) =>
        `<p style="margin:0 0 12px;color:rgba(255,255,255,0.8);font-size:15px;line-height:1.7">${
          line || "&nbsp;"
        }</p>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:20px;background:${BG};font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">
  <tr><td style="padding:32px 40px 0">
    <div style="display:flex;align-items:center;gap:6px">
      <span style="font-size:24px;font-weight:bold;color:#fff">G</span>
      <span style="font-size:20px;color:${GOLD}">|</span>
      <span style="font-size:24px;font-weight:bold;color:#fff">C</span>
    </div>
  </td></tr>
  <tr><td style="padding:24px 40px 0">
    <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff">${subject}</h1>
    <div style="width:40px;height:2px;background:${GOLD};margin-top:12px;border-radius:2px"></div>
  </td></tr>
  <tr><td style="padding:24px 40px;background:${CARD};border:1px solid rgba(255,255,255,0.06);margin:20px 0">
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:24px 40px 32px;text-align:center">
    <p style="margin:0;color:rgba(255,255,255,0.25);font-size:12px">GC Premier Properties</p>
  </td></tr>
</table>
</body></html>`;
}
