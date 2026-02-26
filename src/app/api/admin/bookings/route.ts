import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig } from "@/lib/admin/config";
import { getRedisClient } from "@/lib/kv/client";
import type { StoredBooking } from "@/types/booking";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedisClient();
    const filter = request.nextUrl.searchParams.get("filter") || "upcoming";

    const todayMs = new Date(new Date().toISOString().split("T")[0]).getTime();

    let bookingIds: string[];

    if (filter === "upcoming") {
      bookingIds = await redis.zrange("bookings:index", todayMs, "+inf", {
        byScore: true,
      });
    } else if (filter === "past") {
      bookingIds = await redis.zrange("bookings:index", "-inf", todayMs - 1, {
        byScore: true,
        rev: true,
      });
      bookingIds = bookingIds.slice(0, 50);
    } else {
      bookingIds = await redis.zrange("bookings:index", 0, -1);
    }

    const bookings: StoredBooking[] = [];
    await Promise.all(
      bookingIds.map(async (id) => {
        const booking = await getConfig<StoredBooking | null>(
          `bookings:${id}`,
          null
        );
        if (booking) bookings.push(booking);
      })
    );

    // Sort by check-in date
    bookings.sort(
      (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
    );

    // For past bookings, reverse to show most recent first
    if (filter === "past") bookings.reverse();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to load bookings:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }
}
