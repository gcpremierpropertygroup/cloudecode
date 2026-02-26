"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Calendar, Users, DollarSign } from "lucide-react";
import type { StoredBooking } from "@/types/booking";

type Filter = "upcoming" | "past" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingsSection({ token }: { token: string }) {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const monthFromNow = new Date(today);
  monthFromNow.setMonth(monthFromNow.getMonth() + 1);

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.checkIn) >= today && b.status === "confirmed"
  );
  const thisWeek = upcomingBookings.filter(
    (b) => new Date(b.checkIn) < weekFromNow
  );
  const thisMonth = upcomingBookings.filter(
    (b) => new Date(b.checkIn) < monthFromNow
  );

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="text-white/30 hover:text-white/60 transition-colors p-2"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats cards */}
      {filter === "upcoming" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1F2937] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Calendar size={16} className="text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{upcomingBookings.length}</p>
                <p className="text-white/40 text-xs">Total Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F2937] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{thisWeek.length}</p>
                <p className="text-white/40 text-xs">This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1F2937] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{thisMonth.length}</p>
                <p className="text-white/40 text-xs">This Month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Bookings table */}
      <div className="bg-[#1F2937] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Guest</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Property</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Guests</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Total</th>
                <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                    No {filter === "all" ? "" : filter} bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{booking.guestName}</p>
                      <p className="text-white/30 text-xs">{booking.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">{booking.propertyTitle}</td>
                    <td className="px-4 py-3 text-white/70">{formatDate(booking.checkIn)}</td>
                    <td className="px-4 py-3 text-white/70">{formatDate(booking.checkOut)}</td>
                    <td className="px-4 py-3 text-white/70 text-center">{booking.guests}</td>
                    <td className="px-4 py-3 text-white font-medium">${booking.total}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
