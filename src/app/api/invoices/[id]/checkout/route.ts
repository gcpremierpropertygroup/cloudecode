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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: invoice.recipientEmail,
      line_items: invoice.lineItems.map((item) => ({
        price_data: {
          currency: invoice.currency,
          product_data: { name: item.description },
          unit_amount: Math.round(item.amount * 100),
        },
        quantity: 1,
      })),
      metadata: {
        type: "invoice",
        invoiceId: invoice.id,
        recipientName: invoice.recipientName,
        recipientEmail: invoice.recipientEmail,
        description: invoice.description,
        total: String(invoice.total),
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
