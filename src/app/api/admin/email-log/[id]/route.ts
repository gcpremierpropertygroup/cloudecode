import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getEmailHtml } from "@/lib/email/logging";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const html = await getEmailHtml(id);

    if (!html) {
      return NextResponse.json(
        { error: "Email content not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Failed to load email HTML:", error);
    return NextResponse.json(
      { error: "Failed to load email content" },
      { status: 500 }
    );
  }
}
