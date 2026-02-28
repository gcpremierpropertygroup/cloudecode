import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getEmailLog } from "@/lib/email/logging";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500);
    const logs = await getEmailLog(limit);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Failed to load email log:", error);
    return NextResponse.json({ error: "Failed to load email log" }, { status: 500 });
  }
}
