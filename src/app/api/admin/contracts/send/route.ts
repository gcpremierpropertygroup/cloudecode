import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import { sendContractEmail } from "@/lib/email";
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
      return NextResponse.json({ error: "Contract is already signed" }, { status: 400 });
    }

    if (contract.status === "voided") {
      return NextResponse.json({ error: "Contract is voided" }, { status: 400 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const contractUrl = `${baseUrl}/contract/${contractId}`;
    const isResend = contract.status === "sent" || contract.status === "viewed";

    await sendContractEmail({
      recipientName: contract.recipientName,
      recipientEmail: contract.recipientEmail,
      title: contract.title,
      contractUrl,
      isResend,
    });

    if (contract.status === "draft") {
      contract.status = "sent";
      contract.sentAt = new Date().toISOString();
      await setConfig(`contract:${contractId}`, contract);
    }

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error("Failed to send contract email:", error);
    return NextResponse.json({ error: "Failed to send contract email" }, { status: 500 });
  }
}
