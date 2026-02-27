import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getRedisClient } from "@/lib/kv/client";
import { getConfig } from "@/lib/admin/config";
import type { Invoice, StoredBooking } from "@/types/booking";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedisClient();

    // ─── Bookings ───────────────────────────────────────────
    const bookingIds = await redis.zrange("bookings:index", 0, -1);
    const bookings: StoredBooking[] = [];
    for (const id of bookingIds) {
      const booking = await getConfig<StoredBooking | null>(`bookings:${id}`, null);
      if (booking) bookings.push(booking);
    }

    // ─── Invoices ───────────────────────────────────────────
    const invoiceIds = await redis.zrange("invoices:index", 0, -1);
    const invoices: Invoice[] = [];
    for (const id of invoiceIds) {
      const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);
      if (invoice) invoices.push(invoice);
    }

    // ─── Config keys ────────────────────────────────────────
    const configKeys = [
      "config:email-settings",
      "config:pricing-rules",
      "config:base-price-overrides",
      "config:flat-rate-overrides",
      "config:display-prices",
      "config:checkin-instructions:prop-eastover-001",
      "config:checkin-instructions:prop-spacious-002",
      "config:checkin-instructions:prop-pinelane-003",
      "config:blocks:prop-eastover-001",
      "config:blocks:prop-spacious-002",
      "config:blocks:prop-pinelane-003",
      "config:unblocks:prop-eastover-001",
      "config:unblocks:prop-spacious-002",
      "config:unblocks:prop-pinelane-003",
      "blog:posts",
      "blog:hidden",
    ];

    const config: Record<string, unknown> = {};
    for (const key of configKeys) {
      const value = await getConfig<unknown>(key, null);
      if (value !== null) config[key] = value;
    }

    const backup = {
      exportedAt: new Date().toISOString(),
      counts: {
        bookings: bookings.length,
        invoices: invoices.length,
        configKeys: Object.keys(config).length,
      },
      bookings,
      invoices,
      config,
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="gc-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup export failed:", error);
    return NextResponse.json({ error: "Backup export failed" }, { status: 500 });
  }
}
