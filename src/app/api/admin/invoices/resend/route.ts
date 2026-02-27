import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig } from "@/lib/admin/config";
import { sendInvoiceEmail } from "@/lib/email";
import type { Invoice } from "@/types/booking";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { invoiceId } = await request.json();
    const invoice = await getConfig<Invoice | null>(`invoice:${invoiceId}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const invoiceUrl = `${baseUrl}/invoice/${invoice.id}`;

    await sendInvoiceEmail({
      recipientName: invoice.recipientName,
      recipientEmail: invoice.recipientEmail,
      description: invoice.description,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal ?? invoice.total,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      invoiceUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resend invoice email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
