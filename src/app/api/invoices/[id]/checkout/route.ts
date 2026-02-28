import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/admin/config";
import { getStripeClient } from "@/lib/stripe/client";
import type { Invoice } from "@/types/booking";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");

    // Determine what to charge
    const isSplit = invoice.splitPayment && (invoice.depositAmount ?? 0) > 0;
    const depositPaid = (invoice.payments ?? []).some((p) => p.type === "deposit");
    let chargeAmount: number;
    let paymentType: "full" | "deposit" | "balance";
    let chargeLabel: string;

    if (isSplit && !depositPaid) {
      // First payment: charge deposit
      chargeAmount = invoice.depositAmount!;
      paymentType = "deposit";
      chargeLabel = `Deposit (${invoice.depositPercentage}%) — ${invoice.description}`;
    } else if (isSplit && depositPaid) {
      // Second payment: charge balance
      chargeAmount = invoice.balanceAmount!;
      paymentType = "balance";
      chargeLabel = `Balance Due — ${invoice.description}`;
    } else {
      // Full payment (no split)
      chargeAmount = invoice.total;
      paymentType = "full";
      chargeLabel = "";
    }

    let stripeLineItems;

    if (paymentType === "full") {
      // Build Stripe line items with proper quantities
      stripeLineItems = invoice.lineItems.map((item) => ({
        price_data: {
          currency: invoice.currency,
          product_data: { name: item.description },
          unit_amount: Math.round((item.unitPrice || item.amount) * 100),
        },
        quantity: item.quantity || 1,
      }));

      // Add tax as a separate line item if applicable
      if ((invoice.taxRate ?? 0) > 0 && (invoice.taxAmount ?? 0) > 0) {
        stripeLineItems.push({
          price_data: {
            currency: invoice.currency,
            product_data: { name: `Tax (${invoice.taxRate}%)` },
            unit_amount: Math.round((invoice.taxAmount ?? 0) * 100),
          },
          quantity: 1,
        });
      }

      // Add processing fee if applicable
      if ((invoice.processingFeeRate ?? 0) > 0 && (invoice.processingFeeAmount ?? 0) > 0) {
        stripeLineItems.push({
          price_data: {
            currency: invoice.currency,
            product_data: { name: `Processing Fee (${invoice.processingFeeRate}%)` },
            unit_amount: Math.round((invoice.processingFeeAmount ?? 0) * 100),
          },
          quantity: 1,
        });
      }
    } else {
      // Split payment: single line item for the partial amount
      stripeLineItems = [
        {
          price_data: {
            currency: invoice.currency,
            product_data: { name: chargeLabel },
            unit_amount: Math.round(chargeAmount * 100),
          },
          quantity: 1,
        },
      ];
    }

    // Only pass customer_email if it looks like a valid email
    const isValidEmail = invoice.recipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.recipientEmail);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      ...(isValidEmail ? { customer_email: invoice.recipientEmail } : {}),
      line_items: stripeLineItems,
      metadata: {
        type: "invoice",
        invoiceId: invoice.id,
        paymentType,
        recipientName: invoice.recipientName,
        recipientEmail: invoice.recipientEmail,
        description: invoice.description,
        total: String(invoice.total),
        chargeAmount: String(chargeAmount),
      },
      success_url: `${baseUrl}/invoice/${id}?paid=true`,
      cancel_url: `${baseUrl}/invoice/${id}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Invoice checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
