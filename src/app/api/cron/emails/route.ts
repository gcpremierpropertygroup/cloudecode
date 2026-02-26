import { NextRequest, NextResponse } from "next/server";
import { processDueEmails } from "@/lib/email/scheduling";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueEmails();
    return NextResponse.json({
      success: true,
      ...result,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Email processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
