import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { Contract } from "@/types/booking";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contractId } = await request.json();
    const contract = await getConfig<Contract | null>(`contract:${contractId}`, null);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "signed") {
      return NextResponse.json({ error: "Cannot void a signed contract" }, { status: 400 });
    }

    if (contract.status === "voided") {
      return NextResponse.json({ error: "Contract is already voided" }, { status: 400 });
    }

    contract.status = "voided";
    contract.voidedAt = new Date().toISOString();
    await setConfig(`contract:${contractId}`, contract);

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error("Failed to void contract:", error);
    return NextResponse.json({ error: "Failed to void contract" }, { status: 500 });
  }
}
