import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getAllTimeTotals, getDailyCounts, getRecentEvents } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics";

const ALL_EVENTS: AnalyticsEvent[] = [
  "page_view",
  "checkout_started",
  "booking_completed",
  "contact_submitted",
  "assessment_submitted",
  "promo_used",
];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days")) || 30;
  const eventsDate = searchParams.get("eventsDate") || undefined;

  try {
    // Fetch totals and daily breakdowns in parallel
    const [totals, ...dailyResults] = await Promise.all([
      getAllTimeTotals(),
      ...ALL_EVENTS.map((event) => getDailyCounts(event, days)),
    ]);

    // Build daily data keyed by event
    const daily: Record<string, { date: string; count: number }[]> = {};
    ALL_EVENTS.forEach((event, idx) => {
      daily[event] = dailyResults[idx];
    });

    // Fetch recent events for the specified date (or today)
    const recentEvents = await getRecentEvents(eventsDate, 50);

    return NextResponse.json({
      totals,
      daily,
      recentEvents,
      days,
      eventTypes: ALL_EVENTS,
    });
  } catch (error) {
    console.error("[Admin Analytics] Error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
