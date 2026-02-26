import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

const REDIS_KEY = "config:cleaning-fees";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cleaningFees = await getConfig<Record<string, number>>(REDIS_KEY, {});
    return NextResponse.json({ cleaningFees });
  } catch (error) {
    console.error("Failed to load cleaning fees:", error);
    return NextResponse.json({ error: "Failed to load cleaning fees" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, fee } = body;

    if (!propertyId || typeof fee !== "number" || fee < 0) {
      return NextResponse.json(
        { error: "propertyId and a non-negative fee are required" },
        { status: 400 }
      );
    }

    const cleaningFees = await getConfig<Record<string, number>>(REDIS_KEY, {});
    cleaningFees[propertyId] = fee;
    await setConfig(REDIS_KEY, cleaningFees);

    return NextResponse.json({ cleaningFees });
  } catch (error) {
    console.error("Failed to save cleaning fee:", error);
    return NextResponse.json({ error: "Failed to save cleaning fee" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    const cleaningFees = await getConfig<Record<string, number>>(REDIS_KEY, {});
    delete cleaningFees[propertyId];
    await setConfig(REDIS_KEY, cleaningFees);

    return NextResponse.json({ cleaningFees });
  } catch (error) {
    console.error("Failed to delete cleaning fee:", error);
    return NextResponse.json({ error: "Failed to delete cleaning fee" }, { status: 500 });
  }
}
