import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
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

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Cannot cancel a paid invoice" }, { status: 400 });
    }

    if (invoice.status === "cancelled") {
      return NextResponse.json({ error: "Invoice is already cancelled" }, { status: 400 });
    }

    invoice.status = "cancelled";
    invoice.cancelledAt = new Date().toISOString();
    await setConfig(`invoice:${invoiceId}`, invoice);

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Failed to cancel invoice:", error);
    return NextResponse.json({ error: "Failed to cancel invoice" }, { status: 500 });
  }
}
