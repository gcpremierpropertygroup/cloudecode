import { NextRequest, NextResponse } from "next/server";
import { processDueEmails } from "@/lib/email/scheduling";
import { getRedisClient } from "@/lib/kv/client";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";

const INVOICE_EXPIRY_DAYS = 30;

async function expireOldInvoices() {
  const redis = getRedisClient();
  const invoiceIds = await redis.zrange("invoices:index", 0, -1);
  const cutoff = Date.now() - INVOICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  let expired = 0;

  for (const id of invoiceIds) {
    try {
      const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);
      if (!invoice || invoice.status !== "pending") continue;

      const createdAt = new Date(invoice.createdAt).getTime();
      if (isNaN(createdAt) || createdAt >= cutoff) continue;

      invoice.status = "expired";
      await setConfig(`invoice:${id}`, invoice);
      expired++;
      console.log(`[Cron] Invoice ${id} expired (created ${invoice.createdAt})`);
    } catch (err) {
      console.error(`[Cron] Failed to check invoice ${id}:`, err);
    }
  }

  return expired;
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [emailResult, expiredCount] = await Promise.all([
      processDueEmails(),
      expireOldInvoices(),
    ]);
    return NextResponse.json({
      success: true,
      ...emailResult,
      invoicesExpired: expiredCount,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
