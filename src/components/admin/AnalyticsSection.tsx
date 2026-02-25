"use client";

import { useState, useEffect, useCallback } from "react";

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  page_view: { label: "Page Views", color: "text-blue-400" },
  checkout_started: { label: "Checkouts Started", color: "text-yellow-400" },
  booking_completed: { label: "Bookings Completed", color: "text-green-400" },
  contact_submitted: { label: "Contact Forms", color: "text-purple-400" },
  assessment_submitted: { label: "Assessments", color: "text-pink-400" },
  promo_used: { label: "Promo Codes Used", color: "text-orange-400" },
};

interface DailyCount {
  date: string;
  count: number;
}

interface RecentEvent {
  event: string;
  propertyId?: string;
  propertyTitle?: string;
  amount?: number;
  guestEmail?: string;
  promoCode?: string;
  timestamp?: string;
}

interface AnalyticsData {
  totals: Record<string, number>;
  daily: Record<string, DailyCount[]>;
  recentEvents: RecentEvent[];
  eventTypes: string[];
}

export default function AnalyticsSection({ token }: { token: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const [selectedEvent, setSelectedEvent] = useState("booking_completed");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.totals) setData(result);
      else setError(result.error || "Failed to load");
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return <p className="text-white/40 text-sm">Loading analytics...</p>;
  }

  if (error && !data) {
    return (
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={fetchAnalytics} className="text-gold text-sm mt-2 hover:text-gold-light transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Calculate conversion rate
  const totalCheckouts = data.totals["checkout_started"] || 0;
  const totalBookings = data.totals["booking_completed"] || 0;
  const conversionRate = totalCheckouts > 0 ? ((totalBookings / totalCheckouts) * 100).toFixed(1) : "—";

  // Get daily data for the chart
  const chartData = data.daily[selectedEvent] || [];
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(EVENT_LABELS).map(([key, { label, color }]) => (
          <div key={key} className="bg-[#1F2937] border border-white/10 p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {(data.totals[key] || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Conversion Rate */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Checkout → Booking Conversion</p>
            <p className="text-3xl font-bold text-gold">{conversionRate}%</p>
            <p className="text-white/30 text-xs mt-1">
              {totalBookings} bookings from {totalCheckouts} checkouts
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">
              ${((data.totals["booking_completed"] || 0) > 0
                ? "—"
                : "0"
              )}
            </p>
            <p className="text-white/30 text-xs mt-1">From completed bookings</p>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Daily Trends</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3 py-1.5 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            >
              {Object.entries(EVENT_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1.5 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-[2px] h-40">
          {chartData.map((d) => {
            const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
            const eventInfo = EVENT_LABELS[selectedEvent];
            return (
              <div
                key={d.date}
                className="flex-1 group relative"
                title={`${d.date}: ${d.count}`}
              >
                <div
                  className={`w-full transition-all ${
                    d.count > 0
                      ? selectedEvent === "booking_completed"
                        ? "bg-green-500/60 hover:bg-green-500"
                        : selectedEvent === "checkout_started"
                        ? "bg-yellow-500/60 hover:bg-yellow-500"
                        : selectedEvent === "contact_submitted"
                        ? "bg-purple-500/60 hover:bg-purple-500"
                        : "bg-blue-500/60 hover:bg-blue-500"
                      : "bg-white/5"
                  }`}
                  style={{ height: `${Math.max(height, d.count > 0 ? 4 : 1)}%` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {d.date}: {d.count} {eventInfo?.label.toLowerCase() || "events"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/20 text-xs">
            {chartData[0]?.date || ""}
          </span>
          <span className="text-white/20 text-xs">
            {chartData[chartData.length - 1]?.date || ""}
          </span>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
          <button
            onClick={fetchAnalytics}
            className="text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            Refresh
          </button>
        </div>

        {data.recentEvents.length === 0 ? (
          <p className="text-white/20 text-sm">No events recorded yet. Activity will appear here as guests interact with the site.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.recentEvents.map((ev, idx) => {
              const info = EVENT_LABELS[ev.event] || { label: ev.event, color: "text-white/40" };
              return (
                <div key={idx} className="flex items-center gap-3 bg-[#374151]/30 border border-white/5 px-3 py-2">
                  <span className={`text-xs font-medium ${info.color} w-36 shrink-0`}>
                    {info.label}
                  </span>
                  <div className="flex-1 min-w-0 text-white/40 text-xs truncate">
                    {ev.propertyTitle && <span>{ev.propertyTitle}</span>}
                    {ev.guestEmail && <span> — {ev.guestEmail}</span>}
                    {ev.promoCode && <span> — Code: {ev.promoCode}</span>}
                    {ev.amount && <span> — ${ev.amount}</span>}
                  </div>
                  <span className="text-white/20 text-xs shrink-0">
                    {ev.timestamp
                      ? new Date(ev.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Analytics data is stored in Redis with 90-day retention. Events are tracked on API calls — page views are recorded when a guest selects dates on a property page.
        </p>
      </div>
    </div>
  );
}
