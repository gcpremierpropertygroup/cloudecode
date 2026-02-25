import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { CustomDiscount } from "@/lib/constants";

const REDIS_KEY = "config:custom-discounts";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const discounts = await getConfig<CustomDiscount[]>(REDIS_KEY, []);
    return NextResponse.json({ discounts });
  } catch (error) {
    console.error("Failed to load custom discounts:", error);
    return NextResponse.json({ error: "Failed to load custom discounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, start, end, type, value, label } = body;

    if (!propertyId || !type || !value || !label) {
      return NextResponse.json(
        { error: "propertyId, type, value, and label are required" },
        { status: 400 }
      );
    }

    if (!["percentage", "flat"].includes(type)) {
      return NextResponse.json(
        { error: "type must be 'percentage' or 'flat'" },
        { status: 400 }
      );
    }

    const discount: CustomDiscount = {
      propertyId,
      type,
      value: Number(value),
      label,
      ...(start && { start }),
      ...(end && { end }),
    };

    const existing = await getConfig<CustomDiscount[]>(REDIS_KEY, []);
    existing.push(discount);
    await setConfig(REDIS_KEY, existing);

    return NextResponse.json({ success: true, discount }, { status: 201 });
  } catch (error) {
    console.error("Failed to create custom discount:", error);
    return NextResponse.json({ error: "Failed to create custom discount" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { index } = body;

    if (typeof index !== "number") {
      return NextResponse.json({ error: "index is required" }, { status: 400 });
    }

    const existing = await getConfig<CustomDiscount[]>(REDIS_KEY, []);
    if (index < 0 || index >= existing.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }

    existing.splice(index, 1);
    await setConfig(REDIS_KEY, existing);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete custom discount:", error);
    return NextResponse.json({ error: "Failed to delete custom discount" }, { status: 500 });
  }
}
