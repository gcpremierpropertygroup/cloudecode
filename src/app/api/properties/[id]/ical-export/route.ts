import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/kv/client";
import { getConfig } from "@/lib/admin/config";
import type { StoredBooking } from "@/types/booking";
import { format, addDays, eachDayOfInterval, parseISO } from "date-fns";

/**
 * Public iCal export feed for a property.
 * Returns all bookings + admin-blocked dates as VEVENT entries.
 * Paste this URL into Airbnb's "Import calendar" to sync blocked dates.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propertyId } = await params;

  const PROPERTY_NAMES: Record<string, string> = {
    "prop-eastover-001": "The Eastover House",
    "prop-spacious-002": "The Modern Retreat",
    "prop-pinelane-003": "The Pine Lane Greenhouse",
  };

  if (!PROPERTY_NAMES[propertyId]) {
    return NextResponse.json({ error: "Unknown property" }, { status: 404 });
  }

  const events: string[] = [];

  // 1. Load bookings from Redis
  try {
    const redis = getRedisClient();
    const bookingIds = await redis.zrange("bookings:index", 0, -1);

    for (const bookingId of bookingIds) {
      const booking = await getConfig<StoredBooking | null>(
        `bookings:${bookingId}`,
        null
      );
      if (
        booking &&
        booking.propertyId === propertyId &&
        booking.status === "confirmed" &&
        booking.checkIn &&
        booking.checkOut
      ) {
        const uid = `booking-${booking.id}@gcpremierproperties.com`;
        const dtStart = booking.checkIn.replace(/-/g, "");
        const dtEnd = booking.checkOut.replace(/-/g, "");
        const created = booking.bookedAt
          ? formatICalTimestamp(booking.bookedAt)
          : formatICalTimestamp(new Date().toISOString());

        events.push(
          [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTART;VALUE=DATE:${dtStart}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            `DTSTAMP:${created}`,
            `SUMMARY:Booked - ${booking.guestName || "Guest"}`,
            `DESCRIPTION:Direct booking via gcpremierproperties.com`,
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT",
          ].join("\r\n")
        );
      }
    }
  } catch (err) {
    console.error("[iCal Export] Failed to load bookings:", err);
    // Continue — still export admin blocks even if bookings fail
  }

  // 2. Load admin-blocked date ranges
  try {
    interface DateRange {
      start: string;
      end: string;
    }
    const blocks = await getConfig<DateRange[]>(
      `config:blocks:${propertyId}`,
      []
    );

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const uid = `block-${propertyId}-${i}-${block.start}@gcpremierproperties.com`;
      const dtStart = block.start.replace(/-/g, "");
      // iCal DTEND is exclusive, so add one day
      const endDate = addDays(parseISO(block.end), 1);
      const dtEnd = format(endDate, "yyyyMMdd");

      events.push(
        [
          "BEGIN:VEVENT",
          `UID:${uid}`,
          `DTSTART;VALUE=DATE:${dtStart}`,
          `DTEND;VALUE=DATE:${dtEnd}`,
          `DTSTAMP:${formatICalTimestamp(new Date().toISOString())}`,
          `SUMMARY:Blocked`,
          `DESCRIPTION:Blocked via admin panel`,
          "STATUS:CONFIRMED",
          "TRANSP:OPAQUE",
          "END:VEVENT",
        ].join("\r\n")
      );
    }
  } catch (err) {
    console.error("[iCal Export] Failed to load admin blocks:", err);
  }

  // 3. Build the iCal file
  const calName = `${PROPERTY_NAMES[propertyId]} - G|C Premier`;
  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//G|C Premier Property Group//Booking Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calName}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${propertyId}.ics"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function formatICalTimestamp(iso: string): string {
  const d = new Date(iso);
  return format(d, "yyyyMMdd'T'HHmmss'Z'");
}
