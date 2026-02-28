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
    const { recipientName, recipientEmail, description, lineItems, propertyId, notes, sendEmail, taxRate } = body;

    if (!recipientName || !recipientEmail || !description || !lineItems?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Normalize line items with quantity/unitPrice
    const normalizedItems = lineItems.map((item: { description: string; quantity?: number; unitPrice?: number; amount: number }) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.amount,
      amount: item.amount,
    }));

    const subtotal = normalizedItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const taxPct = typeof taxRate === "number" && taxRate > 0 ? taxRate : 0;
    const taxAmount = subtotal * (taxPct / 100);
    const total = subtotal + taxAmount;
    const id = generateInvoiceId();

    const invoice: Invoice = {
      id,
      status: "pending",
      recipientName,
      recipientEmail,
      description,
      lineItems: normalizedItems,
      subtotal,
      taxRate: taxPct > 0 ? taxPct : undefined,
      taxAmount: taxPct > 0 ? taxAmount : undefined,
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
          lineItems: normalizedItems,
          subtotal,
          taxRate: taxPct > 0 ? taxPct : undefined,
          taxAmount: taxPct > 0 ? taxAmount : undefined,
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

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, recipientName, recipientEmail, description, lineItems, notes, taxRate } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const existing = await getConfig<Invoice | null>(`invoice:${id}`, null);
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json({ error: "Only pending invoices can be edited" }, { status: 400 });
    }

    if (!recipientName || !recipientEmail || !description || !lineItems?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedItems = lineItems.map((item: { description: string; quantity?: number; unitPrice?: number; amount: number }) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.amount,
      amount: item.amount,
    }));

    const subtotal = normalizedItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const taxPct = typeof taxRate === "number" && taxRate > 0 ? taxRate : 0;
    const taxAmount = subtotal * (taxPct / 100);
    const total = subtotal + taxAmount;

    const updated: Invoice = {
      ...existing,
      recipientName,
      recipientEmail,
      description,
      lineItems: normalizedItems,
      subtotal,
      taxRate: taxPct > 0 ? taxPct : undefined,
      taxAmount: taxPct > 0 ? taxAmount : undefined,
      total,
      notes: notes || undefined,
    };

    await setConfig(`invoice:${id}`, updated);

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
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
