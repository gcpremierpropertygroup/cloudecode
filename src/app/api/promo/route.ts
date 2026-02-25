import { NextRequest, NextResponse } from "next/server";
import { createPromoCode, listPromoCodes, deletePromoCode } from "@/lib/promo/service";
import { isAuthorized } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const codes = await listPromoCodes();
    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Failed to list promo codes:", error);
    return NextResponse.json(
      { error: "Failed to list promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { discountType, discountValue, propertyId, expiresAt, maxUses } = body;

    if (!discountType || !discountValue) {
      return NextResponse.json(
        { error: "discountType and discountValue are required" },
        { status: 400 }
      );
    }

    if (!["percentage", "flat"].includes(discountType)) {
      return NextResponse.json(
        { error: "discountType must be 'percentage' or 'flat'" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 1 and 100" },
        { status: 400 }
      );
    }

    const promo = await createPromoCode({
      discountType,
      discountValue: Number(discountValue),
      propertyId: propertyId || "*",
      expiresAt: expiresAt || null,
      maxUses: maxUses ? Number(maxUses) : null,
    });

    return NextResponse.json({ code: promo }, { status: 201 });
  } catch (error) {
    console.error("Failed to create promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "code is required" },
        { status: 400 }
      );
    }

    const deleted = await deletePromoCode(code);
    if (!deleted) {
      return NextResponse.json(
        { error: "Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
