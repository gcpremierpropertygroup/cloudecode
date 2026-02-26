"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

interface DateRange {
  start: string;
  end: string;
}

interface AllDates {
  [propertyId: string]: { blocks: DateRange[]; unblocks: DateRange[] };
}

export default function DatesSection({ token }: { token: string }) {
  const [dates, setDates] = useState<AllDates>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [propertyId, setPropertyId] = useState(PROPERTY_OPTIONS[0].value);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState<"block" | "unblock">("block");
  const [adding, setAdding] = useState(false);

  const fetchDates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.dates) setDates(data.dates);
    } catch {
      setError("Failed to load date overrides");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleAdd = async () => {
    if (!start || !end) return;
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/dates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId, start, end, type }),
      });
      if (res.ok) {
        setSuccess(`${type === "block" ? "Blocked" : "Unblocked"} ${start} to ${end}`);
        setStart("");
        setEnd("");
        fetchDates();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add override");
      }
    } catch {
      setError("Failed to add override");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (pid: string, s: string, e: string, t: "block" | "unblock") => {
    if (!confirm(`Remove ${t} for ${s} to ${e}?`)) return;
    try {
      const res = await fetch("/api/admin/dates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: pid, start: s, end: e, type: t }),
      });
      if (res.ok) fetchDates();
    } catch {
      setError("Failed to delete override");
    }
  };

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  return (
    <div className="space-y-8">
      {/* Add override */}
      <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg">Add Date Override</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              {PROPERTY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "block" | "unblock")}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              <option value="block">Block Dates</option>
              <option value="unblock">Unblock Dates</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Start Date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">End Date</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!start || !end || adding}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {adding ? "Adding..." : type === "block" ? "Block Dates" : "Unblock Dates"}
        </button>

        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Current overrides */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Current Overrides</h2>
          <button onClick={fetchDates} className="text-white/30 text-xs hover:text-white/60 transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : (
          <div className="space-y-6">
            {PROPERTY_OPTIONS.map((prop) => {
              const propDates = dates[prop.value];
              const blocks = propDates?.blocks || [];
              const unblocks = propDates?.unblocks || [];
              if (blocks.length === 0 && unblocks.length === 0) return null;

              return (
                <div key={prop.value}>
                  <h3 className="text-white/60 text-sm font-bold tracking-wider uppercase mb-3">{prop.label}</h3>
                  <div className="space-y-2">
                    {unblocks.map((r, i) => (
                      <div key={`u-${i}`} className="flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Unblock</span>
                          <span className="text-white text-sm">{r.start} to {r.end}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(prop.value, r.start, r.end, "unblock")}
                          className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {blocks.map((r, i) => (
                      <div key={`b-${i}`} className="flex items-center justify-between bg-red-500/10 border border-red-500/20 px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Block</span>
                          <span className="text-white text-sm">{r.start} to {r.end}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(prop.value, r.start, r.end, "block")}
                          className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.values(dates).every((d) => (d?.blocks?.length || 0) === 0 && (d?.unblocks?.length || 0) === 0) && (
              <p className="text-white/40 text-sm">No date overrides configured. Hardcoded defaults are still active.</p>
            )}
          </div>
        )}
      </div>

      {/* iCal Export Feeds */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">iCal Export Feeds</h2>
        <p className="text-white/40 text-sm mb-5">
          Copy these URLs into Airbnb&apos;s &quot;Import calendar&quot; to automatically block dates when someone books on your website.
        </p>

        <div className="space-y-3">
          {PROPERTY_OPTIONS.map((prop) => {
            const feedUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/properties/${prop.value}/ical-export`;
            return (
              <div
                key={prop.value}
                className="flex items-center gap-3 bg-[#374151]/50 border border-white/5 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{prop.label}</p>
                  <p className="text-white/30 text-xs mt-1 truncate font-mono">{feedUrl}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(feedUrl);
                    setSuccess(`Copied ${prop.label} iCal URL`);
                    setTimeout(() => setSuccess(""), 3000);
                  }}
                  className="bg-gold text-white px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors shrink-0"
                >
                  Copy
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Note: Hardcoded date overrides in the codebase still apply. Redis overrides are merged on top of them. iCal feeds include both bookings and admin-blocked dates.
        </p>
      </div>
    </div>
  );
}
