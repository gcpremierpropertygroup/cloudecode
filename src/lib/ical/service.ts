import { format, eachDayOfInterval, parseISO, isBefore, startOfDay } from "date-fns";

interface ICalEvent {
  type: string;
  start: Date;
  end: Date;
  summary?: string;
}

// Cache iCal data for 5 minutes to avoid hammering Airbnb
const cache: Record<string, { data: string[]; fetchedAt: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch and parse an iCal feed to extract blocked/booked dates
 */
export async function getBlockedDatesFromICal(
  icalUrl: string
): Promise<string[]> {
  // Check cache
  const cached = cache[icalUrl];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(icalUrl, {
      next: { revalidate: 300 }, // 5 min ISR cache
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Failed to fetch iCal: ${res.status}`);
      return cached?.data || [];
    }

    const text = await res.text();
    const blockedDates = parseICalText(text);

    // Update cache
    cache[icalUrl] = { data: blockedDates, fetchedAt: Date.now() };

    return blockedDates;
  } catch (error) {
    console.error("iCal fetch error:", error);
    return cached?.data || [];
  }
}

/**
 * Parse raw iCal text and extract all blocked date ranges
 */
function parseICalText(text: string): string[] {
  const blockedDates: Set<string> = new Set();
  const today = startOfDay(new Date());

  // Simple iCal parser - extract VEVENT blocks
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(text)) !== null) {
    const eventBlock = match[1];

    const dtstart = extractICalDate(eventBlock, "DTSTART");
    const dtend = extractICalDate(eventBlock, "DTEND");

    if (dtstart && dtend) {
      // Skip past dates
      if (isBefore(dtend, today)) continue;

      try {
        // Get all dates in the range (check-in to day before check-out)
        const endDate = new Date(dtend);
        endDate.setDate(endDate.getDate() - 1); // iCal DTEND is exclusive

        if (isBefore(endDate, dtstart)) continue;

        const days = eachDayOfInterval({ start: dtstart, end: endDate });
        days.forEach((day) => {
          blockedDates.add(format(day, "yyyy-MM-dd"));
        });
      } catch {
        // Skip malformed events
      }
    }
  }

  return Array.from(blockedDates).sort();
}

/**
 * Extract a date from an iCal property line
 * Handles formats: DTSTART;VALUE=DATE:20250301 and DTSTART:20250301T120000Z
 */
function extractICalDate(block: string, prop: string): Date | null {
  // Match both DTSTART;VALUE=DATE:20250301 and DTSTART:20250301T120000Z
  const regex = new RegExp(`${prop}[^:]*:(\\d{4})(\\d{2})(\\d{2})`);
  const match = block.match(regex);

  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * iCal URL mapping for properties
 */
const ICAL_URLS: Record<string, string> = {};

// Load iCal URLs from environment variables
function loadICalUrls() {
  const eastoverUrl = process.env.ICAL_URL_EASTOVER;
  const modernRetreatUrl = process.env.ICAL_URL_MODERN_RETREAT;
  const pineLaneUrl = process.env.ICAL_URL_PINE_LANE;

  if (eastoverUrl) ICAL_URLS["prop-eastover-001"] = eastoverUrl;
  if (modernRetreatUrl) ICAL_URLS["prop-spacious-002"] = modernRetreatUrl;
  if (pineLaneUrl) ICAL_URLS["prop-pinelane-003"] = pineLaneUrl;
}

/**
 * Manual overrides to force-unblock specific date ranges per property.
 * Dates within these ranges will be removed from the blocked list
 * even if the iCal feed marks them as unavailable.
 */
const UNBLOCK_OVERRIDES: Record<string, { start: string; end: string }[]> = {
  // Open up March 2026 for The Modern Retreat
  "prop-spacious-002": [
    { start: "2026-03-01", end: "2026-03-31" },
  ],
};

/**
 * Get blocked dates for a specific property
 */
export async function getBlockedDatesForProperty(
  propertyId: string
): Promise<string[]> {
  loadICalUrls();

  const url = ICAL_URLS[propertyId];
  if (!url) {
    return []; // No iCal configured, return empty (all dates available)
  }

  const blockedDates = await getBlockedDatesFromICal(url);

  // Apply unblock overrides
  const overrides = UNBLOCK_OVERRIDES[propertyId];
  if (!overrides || overrides.length === 0) {
    return blockedDates;
  }

  return blockedDates.filter((dateStr) => {
    return !overrides.some((range) => dateStr >= range.start && dateStr <= range.end);
  });
}
