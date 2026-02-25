/**
 * Lightweight analytics tracking backed by Upstash Redis.
 *
 * Events are stored as:
 *   analytics:events:<YYYY-MM-DD>  →  sorted set  (score = unix‑ms, member = JSON)
 *   analytics:counters:<event>      →  hash  (field = YYYY-MM-DD, value = count)
 *   analytics:totals               →  hash  (field = event name, value = all‑time count)
 *
 * This keeps things simple and cost‑effective — no external analytics service needed.
 */
import { getRedisClient } from "@/lib/kv/client";

export type AnalyticsEvent =
  | "page_view"
  | "checkout_started"
  | "booking_completed"
  | "contact_submitted"
  | "assessment_submitted"
  | "promo_used";

interface EventPayload {
  event: AnalyticsEvent;
  propertyId?: string;
  propertyTitle?: string;
  amount?: number;
  guestEmail?: string;
  promoCode?: string;
  metadata?: Record<string, string>;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Track an analytics event. Fire-and-forget — never throws.
 */
export async function trackEvent(payload: EventPayload): Promise<void> {
  try {
    const redis = getRedisClient();
    const day = todayKey();
    const now = Date.now();

    const record = JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
    });

    // Store event in daily sorted set (auto-ordered by time)
    await redis.zadd(`analytics:events:${day}`, { score: now, member: record });

    // Increment daily counter
    await redis.hincrby(`analytics:counters:${payload.event}`, day, 1);

    // Increment all-time total
    await redis.hincrby("analytics:totals", payload.event, 1);

    // Set 90-day TTL on the daily events set (auto-cleanup)
    await redis.expire(`analytics:events:${day}`, 90 * 86400);
  } catch (error) {
    // Never fail the parent request — analytics is best-effort
    console.error("[Analytics] Failed to track event:", error);
  }
}

/**
 * Get daily counts for an event over the last N days.
 */
export async function getDailyCounts(
  event: AnalyticsEvent,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  try {
    const redis = getRedisClient();
    const results: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = await redis.hget<number>(`analytics:counters:${event}`, dateStr);
      results.push({ date: dateStr, count: count || 0 });
    }

    return results;
  } catch (error) {
    console.error("[Analytics] Failed to get daily counts:", error);
    return [];
  }
}

/**
 * Get all-time totals for all events.
 */
export async function getAllTimeTotals(): Promise<Record<string, number>> {
  try {
    const redis = getRedisClient();
    const totals = await redis.hgetall<Record<string, number>>("analytics:totals");
    return totals || {};
  } catch (error) {
    console.error("[Analytics] Failed to get totals:", error);
    return {};
  }
}

/**
 * Get recent events (most recent N from today or a specific date).
 */
export async function getRecentEvents(
  date?: string,
  limit: number = 50
): Promise<EventPayload[]> {
  try {
    const redis = getRedisClient();
    const day = date || todayKey();
    const raw = await redis.zrange(`analytics:events:${day}`, 0, limit - 1, { rev: true });

    return (raw || []).map((item) => {
      if (typeof item === "string") return JSON.parse(item);
      return item;
    });
  } catch (error) {
    console.error("[Analytics] Failed to get recent events:", error);
    return [];
  }
}
