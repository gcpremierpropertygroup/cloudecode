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
  const GOLD_BORDER = "rgba(212,168,83,0.25)";
  const BG = "#0B0F1A";
  const CARD = "#111827";
  const WHITE = "#FFFFFF";
  const SUB = "rgba(255,255,255,0.5)";
  const DIM = "rgba(255,255,255,0.3)";
  const RULE = "rgba(255,255,255,0.08)";
  const LOGO_URL = "https://gcpremierproperties.com/images/gc-logo-white.png";

  const bodyHtml = plainText
    .split("\n")
    .map(
      (line) =>
        `<p style="margin:0 0 12px;color:${SUB};font-size:15px;line-height:1.7">${
          line || "&nbsp;"
        }</p>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>
@media only screen and (max-width:620px){
  .email-wrap{padding:0!important}
  .email-inner{border-radius:0!important}
  .email-pad{padding-left:20px!important;padding-right:20px!important}
  .email-margin{margin-left:20px!important;margin-right:20px!important}
  .email-logo{padding:32px 24px 0!important}
  .email-heading{padding-left:24px!important;padding-right:24px!important}
}
</style></head>
<body style="margin:0;padding:20px;background:${BG};-webkit-text-size-adjust:none" class="email-wrap">
<div style="width:100%;max-width:600px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${BG};color:${WHITE}">
  <!-- Gold accent bar -->
  <div style="height:3px;background:linear-gradient(90deg,${GOLD},rgba(212,168,83,0.4))"></div>

  <!-- Header with logo -->
  <div style="padding:44px 48px 0;text-align:center" class="email-logo">
    <img src="${LOGO_URL}" alt="G|C Premier Property Group" width="150" style="display:inline-block" />
  </div>

  <!-- Subject heading -->
  <div style="text-align:center;padding:24px 48px 28px" class="email-heading">
    <h1 style="margin:0 0 10px;font-size:28px;font-weight:300;color:${WHITE};letter-spacing:1px;font-family:Georgia,'Times New Roman',serif">${subject}</h1>
    <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
  </div>

  <!-- Message body -->
  <div class="email-margin" style="margin:0 40px 32px;background:${CARD};border:1px solid ${RULE};border-radius:10px;overflow:hidden">
    <div style="padding:20px 24px 14px;border-bottom:1px solid ${RULE}">
      <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:${GOLD}">Message</p>
    </div>
    <div style="padding:18px 24px">
      ${bodyHtml}
    </div>
  </div>

  <!-- Divider -->
  <div class="email-margin" style="margin:0 40px;text-align:center">
    <div style="display:inline-block;width:50px;height:1px;background:${GOLD_BORDER}"></div>
  </div>

  <!-- Footer -->
  <div class="email-pad" style="padding:28px 40px 20px;text-align:center">
    <p style="margin:0 0 8px;font-size:13px;color:${DIM}">Need to reach us?</p>
    <p style="margin:0 0 20px;font-size:13px">
      <a href="mailto:contactus@gcpremierproperties.com" style="color:${GOLD};text-decoration:none">contactus@gcpremierproperties.com</a>
      <span style="color:rgba(255,255,255,0.1);margin:0 8px">|</span>
      <a href="tel:+16019668308" style="color:${GOLD};text-decoration:none">(601) 966-8308</a>
    </p>
  </div>
  <div style="padding:16px 36px;background:rgba(0,0,0,0.2);text-align:center">
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">&copy; ${new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
  </div>
</div>
</body></html>`;
}
