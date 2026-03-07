import { NextRequest, NextResponse } from "next/server";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { Contract } from "@/types/booking";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await getConfig<Contract | null>(`contract:${id}`, null);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "signed") {
      return NextResponse.json({ error: "Contract is already signed" }, { status: 400 });
    }

    if (contract.status === "voided") {
      return NextResponse.json({ error: "Contract has been voided" }, { status: 400 });
    }

    const { signatureDataUrl } = await request.json();

    if (!signatureDataUrl) {
      return NextResponse.json({ error: "Signature is required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;

    contract.status = "signed";
    contract.signedAt = new Date().toISOString();
    contract.signature = {
      signedAt: contract.signedAt,
      signerIp: ip,
      signatureDataUrl,
    };

    await setConfig(`contract:${id}`, contract);

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error("Failed to sign contract:", error);
    return NextResponse.json({ error: "Failed to sign contract" }, { status: 500 });
  }
}
