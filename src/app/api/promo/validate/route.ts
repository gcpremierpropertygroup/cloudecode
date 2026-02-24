import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo/service";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);

  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { valid: false, reason: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { code, propertyId } = body;

    if (!code || !propertyId) {
      return NextResponse.json(
        { valid: false, reason: "Code and property are required" },
        { status: 400 }
      );
    }

    const result = await validatePromoCode(code, propertyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to validate promo code:", error);
    return NextResponse.json(
      { valid: false, reason: "Failed to validate code" },
      { status: 500 }
    );
  }
}
