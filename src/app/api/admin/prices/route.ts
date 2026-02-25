import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import { DISPLAY_PRICES } from "@/lib/constants";

const REDIS_KEY = "config:display-prices";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redisPrices = await getConfig<Record<string, number>>(REDIS_KEY, {});
    const merged = { ...DISPLAY_PRICES, ...redisPrices };
    return NextResponse.json({ prices: merged });
  } catch (error) {
    console.error("Failed to load display prices:", error);
    return NextResponse.json({ error: "Failed to load display prices" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, price } = body;

    if (!propertyId || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "propertyId and a valid price are required" },
        { status: 400 }
      );
    }

    const existing = await getConfig<Record<string, number>>(REDIS_KEY, {});
    existing[propertyId] = price;
    await setConfig(REDIS_KEY, existing);

    return NextResponse.json({ success: true, prices: { ...DISPLAY_PRICES, ...existing } });
  } catch (error) {
    console.error("Failed to update display price:", error);
    return NextResponse.json({ error: "Failed to update display price" }, { status: 500 });
  }
}
