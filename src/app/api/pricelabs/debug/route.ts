import { NextResponse } from "next/server";

const PROPERTY_TO_AIRBNB: Record<string, string> = {
  "prop-eastover-001": "1080584437881428956",
  "prop-spacious-002": "1536893356839380254",
  "prop-pinelane-003": "1532602068184368578",
};

export async function GET() {
  const apiKey = process.env.PRICELABS_API_KEY;
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!apiKey,
    apiKeyPrefix: apiKey ? `${apiKey.slice(0, 6)}...` : null,
    propertyMappings: PROPERTY_TO_AIRBNB,
  };

  if (!apiKey) {
    return NextResponse.json({
      ...results,
      error: "PRICELABS_API_KEY is not set in environment variables",
    }, { status: 500 });
  }

  // Direct API call (bypasses cache)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const startTime = Date.now();
    const res = await fetch("https://api.pricelabs.co/v1/listings", {
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;
    results.apiResponseTimeMs = responseTimeMs;
    results.apiStatus = res.status;
    results.apiStatusText = res.statusText;

    if (!res.ok) {
      const body = await res.text().catch(() => "(could not read body)");
      return NextResponse.json({
        ...results,
        error: `API returned ${res.status}`,
        responseBody: body,
      }, { status: 502 });
    }

    const data = await res.json();
    const listings = data.listings || [];

    results.totalListings = listings.length;
    results.listings = listings.map((l: Record<string, unknown>) => ({
      id: l.id,
      name: l.name,
      base: l.base,
      min: l.min,
      max: l.max,
      push_enabled: l.push_enabled,
      last_date_pushed: l.last_date_pushed,
      last_refreshed_at: l.last_refreshed_at,
      channel_listing_details: l.channel_listing_details,
    }));

    // Check which of our properties match
    const matchResults: Record<string, unknown> = {};
    for (const [propId, airbnbId] of Object.entries(PROPERTY_TO_AIRBNB)) {
      const match = listings.find((l: { channel_listing_details: { channel_listing_id: string }[] }) =>
        l.channel_listing_details?.some(
          (c: { channel_listing_id: string }) => c.channel_listing_id === airbnbId
        )
      );
      matchResults[propId] = match
        ? { matched: true, listingName: (match as Record<string, unknown>).name, base: (match as Record<string, unknown>).base }
        : { matched: false, airbnbIdSearched: airbnbId };
    }
    results.propertyMatches = matchResults;

    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "API request timed out after 15s"
        : String(error);

    return NextResponse.json({
      ...results,
      error: message,
    }, { status: 502 });
  }
}
