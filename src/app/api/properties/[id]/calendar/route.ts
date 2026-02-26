import { NextRequest, NextResponse } from "next/server";
import { getBlockedDatesForProperty } from "@/lib/ical/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get blocked dates from iCal feed (Airbnb calendar sync)
    const blockedDates = await getBlockedDatesForProperty(id);

    return NextResponse.json(
      {
        calendar: {
          blockedDates,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
