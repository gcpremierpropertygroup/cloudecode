import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig } from "@/lib/admin/config";
import { sendInvoicePaymentConfirmation } from "@/lib/email";
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

    if (invoice.status !== "paid" && invoice.status !== "partially_paid") {
      return NextResponse.json(
        { error: "Only paid or partially paid invoices can resend a confirmation" },
        { status: 400 }
      );
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com"
    )
      .trim()
      .replace(/\/+$/, "");
    const invoiceUrl = `${baseUrl}/invoice/${invoice.id}`;

    // Determine payment type and amount to show in the email
    const paymentType =
      invoice.status === "partially_paid" ? "deposit" : "full";

    // Use the last recorded payment amount if available, otherwise total
    const lastPayment = invoice.payments?.at(-1);
    const amount = lastPayment ? lastPayment.amount : invoice.total;

    await sendInvoicePaymentConfirmation({
      recipientName: invoice.recipientName,
      recipientEmail: invoice.recipientEmail,
      description: invoice.description,
      amount,
      paymentType,
      invoiceUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resend payment confirmation:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
