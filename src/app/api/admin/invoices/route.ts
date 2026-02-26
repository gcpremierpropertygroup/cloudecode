import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import { getRedisClient } from "@/lib/kv/client";
import { sendInvoiceEmail } from "@/lib/email";
import type { Invoice } from "@/types/booking";

function generateInvoiceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "inv_";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { recipientName, recipientEmail, description, lineItems, propertyId, notes, sendEmail } = body;

    if (!recipientName || !recipientEmail || !description || !lineItems?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const total = lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const id = generateInvoiceId();

    const invoice: Invoice = {
      id,
      status: "pending",
      recipientName,
      recipientEmail,
      description,
      lineItems,
      total,
      currency: "usd",
      propertyId: propertyId || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    await setConfig(`invoice:${id}`, invoice);
    const redis = getRedisClient();
    await redis.zadd("invoices:index", {
      score: Date.now(),
      member: id,
    });

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const invoiceUrl = `${baseUrl}/invoice/${id}`;

    if (sendEmail) {
      try {
        await sendInvoiceEmail({
          recipientName,
          recipientEmail,
          description,
          lineItems,
          total,
          invoiceUrl,
        });
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
      }
    }

    return NextResponse.json({ invoice, invoiceUrl });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedisClient();
    const invoiceIds = await redis.zrange("invoices:index", 0, -1, { rev: true });

    const invoices: Invoice[] = [];
    await Promise.all(
      invoiceIds.map(async (id) => {
        const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);
        if (invoice) invoices.push(invoice);
      })
    );

    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to load invoices:", error);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
