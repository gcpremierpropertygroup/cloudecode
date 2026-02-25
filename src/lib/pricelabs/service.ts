import { getConfig } from "@/lib/admin/config";
import type { PricingRules } from "@/app/api/admin/pricing-rules/route";
import { DEFAULT_PRICING_RULES } from "@/app/api/admin/pricing-rules/route";

interface PriceLabsListing {
  id: string;
  pms: string;
  name: string;
  no_of_bedrooms: number;
  channel_listing_details: {
    channel_name: string;
    channel_listing_id: string;
  }[];
  min: number;
  base: number;
  max: number;
  recommended_base_price: number;
  push_enabled: boolean;
  last_date_pushed: string;
  last_refreshed_at: string;
  occupancy_next_7: string;
  market_occupancy_next_7: string;
  occupancy_next_30: string;
  market_occupancy_next_30: string;
}

interface PriceLabsResponse {
  listings: PriceLabsListing[];
}

// Cache PriceLabs data for 1 hour
let cache: { data: PriceLabsListing[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Mapping from our property IDs to Airbnb listing IDs
 * (PriceLabs identifies listings by their Airbnb channel ID)
 */
const PROPERTY_TO_AIRBNB: Record<string, string> = {
  "prop-eastover-001": "1080584437881428956",
  "prop-spacious-002": "1536893356839380254",
  "prop-pinelane-003": "1532602068184368578",
};

/**
 * Fallback base price overrides (used when Redis is empty).
 */
const FALLBACK_BASE_PRICE_OVERRIDES: Record<string, number> = {
  "prop-eastover-001": 165,
};

/**
 * Fallback flat rate overrides (used when Redis is empty).
 */
const FALLBACK_FLAT_RATE_OVERRIDES: Record<string, { start: string; end: string; rate: number }[]> = {
  // No active flat rate overrides
};

/** Load base price overrides: Redis first, fallback to hardcoded */
async function getBasePriceOverrides(): Promise<Record<string, number>> {
  const redis = await getConfig<Record<string, number>>("config:base-price-overrides", {});
  return { ...FALLBACK_BASE_PRICE_OVERRIDES, ...redis };
}

/** Load flat rate overrides: Redis first, fallback to hardcoded */
async function getFlatRateOverrides(): Promise<Record<string, { start: string; end: string; rate: number }[]>> {
  const redis = await getConfig<Record<string, { start: string; end: string; rate: number }[]>>("config:flat-rate-overrides", {});
  return { ...FALLBACK_FLAT_RATE_OVERRIDES, ...redis };
}

/** Load pricing rules from Redis, fallback to defaults */
async function getPricingRules(): Promise<PricingRules> {
  return getConfig<PricingRules>("config:pricing-rules", DEFAULT_PRICING_RULES);
}

async function fetchPriceLabsListings(): Promise<PriceLabsListing[]> {
  // Check cache
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    const ageMinutes = Math.round((Date.now() - cache.fetchedAt) / 60000);
    console.log(`[PriceLabs] Using cached data (${cache.data.length} listings, ${ageMinutes}m old)`);
    return cache.data;
  }

  const apiKey = process.env.PRICELABS_API_KEY;
  if (!apiKey) {
    console.error("[PriceLabs] PRICELABS_API_KEY is NOT set — all pricing will use fallback rates");
    return [];
  }

  console.log("[PriceLabs] Fetching fresh data from API...");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch("https://api.pricelabs.co/v1/listings", {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // 1 hour ISR cache
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => "(could not read body)");
      console.error(`[PriceLabs] API returned ${res.status} ${res.statusText} — body: ${body}`);
      if (cache?.data) {
        console.warn(`[PriceLabs] Falling back to stale cache (${cache.data.length} listings)`);
      }
      return cache?.data || [];
    }

    const data: PriceLabsResponse = await res.json();
    console.log(`[PriceLabs] Success — received ${data.listings?.length ?? 0} listings`);

    if (!data.listings || data.listings.length === 0) {
      console.warn("[PriceLabs] API returned 200 but 0 listings — check your PriceLabs account");
    }

    cache = { data: data.listings || [], fetchedAt: Date.now() };
    return cache.data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("[PriceLabs] API request timed out after 10s");
    } else {
      console.error("[PriceLabs] Fetch error:", error);
    }
    if (cache?.data) {
      console.warn(`[PriceLabs] Falling back to stale cache (${cache.data.length} listings)`);
    } else {
      console.warn("[PriceLabs] No cached data available — pricing will use fallback rates");
    }
    return cache?.data || [];
  }
}

/**
 * Get PriceLabs pricing data for a specific property.
 *
 * Always checks Redis base-price overrides. When PriceLabs is unavailable
 * but an override exists, returns the override with sensible min/max
 * defaults so pricing still works.
 */
export async function getPriceLabsDataForProperty(
  propertyId: string
): Promise<{
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  recommendedBasePrice: number;
} | null> {
  // Always load overrides first — they should work even without PriceLabs
  const basePriceOverrides = await getBasePriceOverrides();
  const overrideBase = basePriceOverrides[propertyId];

  const airbnbId = PROPERTY_TO_AIRBNB[propertyId];
  if (!airbnbId) {
    console.warn(`[PriceLabs] No Airbnb ID mapping for property "${propertyId}" — known properties: ${Object.keys(PROPERTY_TO_AIRBNB).join(", ")}`);
    // Even without an Airbnb mapping, return override if available
    if (overrideBase) {
      console.log(`[PriceLabs] Using base price override ($${overrideBase}) for "${propertyId}" (no Airbnb mapping)`);
      return {
        basePrice: overrideBase,
        minPrice: Math.round(overrideBase * 0.5),
        maxPrice: Math.round(overrideBase * 3),
        recommendedBasePrice: overrideBase,
      };
    }
    return null;
  }

  const listings = await fetchPriceLabsListings();
  const listing = listings.find((l) =>
    l.channel_listing_details.some(
      (c) => c.channel_listing_id === airbnbId
    )
  );

  if (!listing) {
    const availableIds = listings.flatMap((l) => l.channel_listing_details.map((c) => c.channel_listing_id));
    console.warn(`[PriceLabs] No listing matched Airbnb ID "${airbnbId}" for property "${propertyId}" — available IDs from API: ${availableIds.join(", ") || "(none)"}`);
    // Return override with sensible defaults when PriceLabs is unavailable
    if (overrideBase) {
      console.log(`[PriceLabs] Using base price override ($${overrideBase}) for "${propertyId}" (PriceLabs listing not found)`);
      return {
        basePrice: overrideBase,
        minPrice: Math.round(overrideBase * 0.5),
        maxPrice: Math.round(overrideBase * 3),
        recommendedBasePrice: overrideBase,
      };
    }
    return null;
  }

  // When an override is set, also expand min/max to ensure it isn't clamped
  const effectiveBase = overrideBase ?? listing.base;
  const minPrice = overrideBase
    ? Math.min(listing.min, Math.round(overrideBase * 0.5))
    : listing.min;
  const maxPrice = overrideBase
    ? Math.max(listing.max, Math.round(overrideBase * 3))
    : listing.max;

  return {
    basePrice: effectiveBase,
    minPrice,
    maxPrice,
    recommendedBasePrice: listing.recommended_base_price,
  };
}

/**
 * Get daily pricing for a specific date range.
 * Uses PriceLabs base/min/max with weekend, holiday, and seasonal adjustments.
 * When PriceLabs daily calendar API becomes available, swap this out.
 */
export async function getDailyPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string
): Promise<{ date: string; rate: number; label?: string }[] | null> {
  const priceData = await getPriceLabsDataForProperty(propertyId);
  if (!priceData) return null;

  const { basePrice, minPrice, maxPrice } = priceData;
  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  const dailyRates: { date: string; rate: number; label?: string }[] = [];

  // Load overrides and rules from Redis (with hardcoded fallbacks)
  const allFlatOverrides = await getFlatRateOverrides();
  const flatOverrides = allFlatOverrides[propertyId] || [];
  const rules = await getPricingRules();

  const current = new Date(start);
  while (current < end) {
    const dateStr = current.toISOString().slice(0, 10);

    // Check if this date has a flat rate override
    const flatOverride = flatOverrides.find(
      (o) => dateStr >= o.start && dateStr <= o.end
    );

    if (flatOverride) {
      dailyRates.push({ date: dateStr, rate: flatOverride.rate });
      current.setDate(current.getDate() + 1);
      continue;
    }

    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
    const month = current.getMonth(); // 0=Jan, 11=Dec

    let rate = basePrice;
    let label: string | undefined;

    // Check if this date is a holiday/important date
    const mmdd = `${String(month + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    const isHoliday = isHolidayPeriod(mmdd, current);

    // Day-of-week adjustments (from Redis-backed rules)
    const dayKey = String(dayOfWeek);
    const dayRule = rules.dayOfWeek[dayKey];
    if (dayRule) {
      // Skip discount days during holidays (multiplier < 1 = discount)
      if (dayRule.multiplier < 1 && isHoliday) {
        // No day-of-week discount on holidays
      } else {
        rate = Math.round(basePrice * dayRule.multiplier);
        label = dayRule.label;
      }
    }

    // Seasonal adjustments (from Redis-backed rules)
    const seasonalRule = rules.seasonal.find((s) => s.months.includes(month));
    if (seasonalRule) {
      rate = Math.round(rate * seasonalRule.multiplier);
    }

    // Major holiday premium (overrides other labels)
    if (isHoliday) {
      rate = Math.round(rate * rules.holidayMultiplier);
      label = getHolidayName(mmdd, current);
    }

    // Clamp to PriceLabs min/max
    rate = Math.max(minPrice, Math.min(maxPrice, rate));

    dailyRates.push({ date: dateStr, rate, ...(label && { label }) });
    current.setDate(current.getDate() + 1);
  }

  return dailyRates;
}

/**
 * Check if a date falls within a major holiday period
 */
function isHolidayPeriod(mmdd: string, date: Date): boolean {
  // New Year's (Dec 29 - Jan 2)
  if (mmdd >= "12-29" || mmdd <= "01-02") return true;

  // MLK Weekend (3rd Monday of January - check if within Fri-Mon)
  if (mmdd >= "01-14" && mmdd <= "01-21" && isLongWeekend(date)) return true;

  // Valentine's Day
  if (mmdd === "02-14") return true;

  // Presidents' Day Weekend (3rd Monday of Feb)
  if (mmdd >= "02-14" && mmdd <= "02-21" && isLongWeekend(date)) return true;

  // Memorial Day Weekend (last Monday of May - roughly May 24-31)
  if (mmdd >= "05-24" && mmdd <= "05-31" && isLongWeekend(date)) return true;

  // 4th of July (Jul 2-5)
  if (mmdd >= "07-02" && mmdd <= "07-05") return true;

  // Labor Day Weekend (first Monday of Sep - roughly Sep 1-7)
  if (mmdd >= "09-01" && mmdd <= "09-07" && isLongWeekend(date)) return true;

  // Halloween
  if (mmdd >= "10-30" && mmdd <= "11-01") return true;

  // Thanksgiving (4th Thursday of Nov - roughly Nov 22-30)
  if (mmdd >= "11-22" && mmdd <= "11-30") return true;

  // Christmas (Dec 20-28)
  if (mmdd >= "12-20" && mmdd <= "12-28") return true;

  return false;
}

/**
 * Check if a date is part of a long weekend (Fri-Mon)
 */
function isLongWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0 || day === 1; // Fri-Mon
}

/**
 * Get a human-readable holiday name for a date
 */
function getHolidayName(mmdd: string, date: Date): string {
  if (mmdd >= "12-29" || mmdd <= "01-02") return "New Year's";
  if (mmdd >= "12-20" && mmdd <= "12-28") return "Christmas";
  if (mmdd >= "11-22" && mmdd <= "11-30") return "Thanksgiving";
  if (mmdd >= "10-30" && mmdd <= "11-01") return "Halloween";
  if (mmdd >= "07-02" && mmdd <= "07-05") return "4th of July";
  if (mmdd >= "05-24" && mmdd <= "05-31" && isLongWeekend(date)) return "Memorial Day";
  if (mmdd >= "09-01" && mmdd <= "09-07" && isLongWeekend(date)) return "Labor Day";
  if (mmdd >= "02-14" && mmdd <= "02-21" && isLongWeekend(date)) return "Presidents' Day";
  if (mmdd === "02-14") return "Valentine's Day";
  if (mmdd >= "01-14" && mmdd <= "01-21" && isLongWeekend(date)) return "MLK Weekend";
  return "holiday";
}

/**
 * Check if PriceLabs is configured
 */
export function isPriceLabsConfigured(): boolean {
  return !!process.env.PRICELABS_API_KEY;
}
