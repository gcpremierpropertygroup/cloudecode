import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";
import { InvoicePDF } from "@/lib/pdf/InvoicePDF";

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

    const buffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);
    const uint8 = new Uint8Array(buffer);

    const filename = `GC-Premier-Invoice-${id}.pdf`;

    return new NextResponse(uint8, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
