import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

export interface PricingRules {
  // Day-of-week adjustments: dayIndex (0=Sun..6=Sat) -> multiplier
  // e.g. { "5": 1.15, "6": 1.15 } means Fri/Sat +15%
  dayOfWeek: Record<string, { multiplier: number; label: string }>;
  // Seasonal adjustments: array of { months: number[], multiplier, label }
  seasonal: { months: number[]; multiplier: number; label: string }[];
  // Holiday premium multiplier (applied on top of other adjustments)
  holidayMultiplier: number;
}

/** Default rules matching the current hardcoded logic */
export const DEFAULT_PRICING_RULES: PricingRules = {
  dayOfWeek: {
    "5": { multiplier: 1.15, label: "weekend" },
    "6": { multiplier: 1.15, label: "weekend" },
    "1": { multiplier: 0.8, label: "20% off" },
  },
  seasonal: [
    { months: [5, 6, 7], multiplier: 1.10, label: "Summer premium" },
    { months: [10, 11], multiplier: 1.10, label: "Holiday season" },
    { months: [0, 1], multiplier: 0.90, label: "Slow season" },
  ],
  holidayMultiplier: 1.25,
};

const REDIS_KEY = "config:pricing-rules";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await getConfig<PricingRules>(REDIS_KEY, DEFAULT_PRICING_RULES);
  return NextResponse.json({ rules, defaults: DEFAULT_PRICING_RULES });
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rules: PricingRules = body.rules;

    if (!rules || !rules.dayOfWeek || !rules.seasonal || rules.holidayMultiplier == null) {
      return NextResponse.json({ error: "Invalid rules format" }, { status: 400 });
    }

    await setConfig(REDIS_KEY, rules);
    return NextResponse.json({ success: true, rules });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/** Reset to defaults */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deleteConfig } = await import("@/lib/admin/config");
  await deleteConfig(REDIS_KEY);
  return NextResponse.json({ success: true, rules: DEFAULT_PRICING_RULES });
}
