import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

/** Hardcoded fallback base price overrides */
const FALLBACK_BASE_PRICES: Record<string, number> = {
  "prop-eastover-001": 165,
};

/** Hardcoded fallback flat rate overrides */
const FALLBACK_FLAT_RATES: Record<string, { start: string; end: string; rate: number }[]> = {};

const BASE_PRICES_KEY = "config:base-price-overrides";
const FLAT_RATES_KEY = "config:flat-rate-overrides";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redisPrices = await getConfig<Record<string, number>>(BASE_PRICES_KEY, {});
  const redisFlatRates = await getConfig<Record<string, { start: string; end: string; rate: number }[]>>(FLAT_RATES_KEY, {});

  // Merge: Redis takes priority over fallback
  const basePrices = { ...FALLBACK_BASE_PRICES, ...redisPrices };
  const flatRates = { ...FALLBACK_FLAT_RATES, ...redisFlatRates };

  return NextResponse.json({
    basePrices,
    flatRates,
    fallbackBasePrices: FALLBACK_BASE_PRICES,
    fallbackFlatRates: FALLBACK_FLAT_RATES,
  });
}

/** Update base price override for a property */
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.type === "base-price") {
      const { propertyId, price } = body;
      if (!propertyId || price == null || price <= 0) {
        return NextResponse.json({ error: "propertyId and positive price required" }, { status: 400 });
      }
      const current = await getConfig<Record<string, number>>(BASE_PRICES_KEY, {});
      current[propertyId] = price;
      await setConfig(BASE_PRICES_KEY, current);
      return NextResponse.json({ success: true, basePrices: { ...FALLBACK_BASE_PRICES, ...current } });
    }

    if (body.type === "flat-rate") {
      const { propertyId, start, end, rate } = body;
      if (!propertyId || !start || !end || !rate || rate <= 0) {
        return NextResponse.json({ error: "propertyId, start, end, and positive rate required" }, { status: 400 });
      }
      const current = await getConfig<Record<string, { start: string; end: string; rate: number }[]>>(FLAT_RATES_KEY, {});
      if (!current[propertyId]) current[propertyId] = [];
      current[propertyId].push({ start, end, rate });
      await setConfig(FLAT_RATES_KEY, current);
      return NextResponse.json({ success: true, flatRates: { ...FALLBACK_FLAT_RATES, ...current } });
    }

    return NextResponse.json({ error: "Invalid type — use 'base-price' or 'flat-rate'" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/** Delete a base price override or flat rate */
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.type === "base-price") {
      const { propertyId } = body;
      const current = await getConfig<Record<string, number>>(BASE_PRICES_KEY, {});
      delete current[propertyId];
      await setConfig(BASE_PRICES_KEY, current);
      return NextResponse.json({ success: true, basePrices: { ...FALLBACK_BASE_PRICES, ...current } });
    }

    if (body.type === "flat-rate") {
      const { propertyId, index } = body;
      const current = await getConfig<Record<string, { start: string; end: string; rate: number }[]>>(FLAT_RATES_KEY, {});
      if (current[propertyId]) {
        current[propertyId].splice(index, 1);
        if (current[propertyId].length === 0) delete current[propertyId];
      }
      await setConfig(FLAT_RATES_KEY, current);
      return NextResponse.json({ success: true, flatRates: { ...FALLBACK_FLAT_RATES, ...current } });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
