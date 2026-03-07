import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/admin/config";
import type { Contract } from "@/types/booking";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await getConfig<Contract | null>(`contract:${id}`, null);

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("Failed to fetch contract:", error);
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 });
  }
}
