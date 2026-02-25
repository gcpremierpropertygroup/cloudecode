import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    await sendContactEmail({ name, email, subject: subject || "", message });

    // Track analytics (fire-and-forget)
    trackEvent({ event: "contact_submitted", guestEmail: email });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
