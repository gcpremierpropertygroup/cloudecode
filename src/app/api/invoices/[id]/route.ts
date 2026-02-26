import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Failed to get invoice:", error);
    return NextResponse.json({ error: "Failed to get invoice" }, { status: 500 });
  }
}
