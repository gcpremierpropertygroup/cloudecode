import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import {
  getEmailSettings,
  setEmailSettings,
  getPendingEmails,
  getSentEmails,
  cancelScheduledEmail,
} from "@/lib/email/scheduling";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [settings, pendingEmails, sentEmails] = await Promise.all([
      getEmailSettings(),
      getPendingEmails(),
      getSentEmails(50),
    ]);

    return NextResponse.json({ settings, pendingEmails, sentEmails });
  } catch (error) {
    console.error("Failed to load email data:", error);
    return NextResponse.json({ error: "Failed to load email data" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: "settings object is required" }, { status: 400 });
    }

    await setEmailSettings(settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Failed to update email settings:", error);
    return NextResponse.json({ error: "Failed to update email settings" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json({ error: "emailId is required" }, { status: 400 });
    }

    const removed = await cancelScheduledEmail(emailId);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error("Failed to cancel email:", error);
    return NextResponse.json({ error: "Failed to cancel email" }, { status: 500 });
  }
}
