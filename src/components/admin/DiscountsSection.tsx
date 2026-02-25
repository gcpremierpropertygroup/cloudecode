"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "*", label: "All Properties" },
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

interface CustomDiscount {
  propertyId: string;
  start?: string;
  end?: string;
  type: "percentage" | "flat";
  value: number;
  label: string;
}

export default function DiscountsSection({ token }: { token: string }) {
  const [discounts, setDiscounts] = useState<CustomDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [propertyId, setPropertyId] = useState("*");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/discounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.discounts) setDiscounts(data.discounts);
    } catch {
      setError("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCreate = async () => {
    if (!value || !label) return;
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          type: discountType,
          value: Number(value),
          label,
          start: start || undefined,
          end: end || undefined,
        }),
      });
      if (res.ok) {
        setSuccess("Discount created!");
        setValue("");
        setLabel("");
        setStart("");
        setEnd("");
        fetchDiscounts();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create discount");
      }
    } catch {
      setError("Failed to create discount");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Delete this discount?")) return;
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ index }),
      });
      if (res.ok) fetchDiscounts();
    } catch {
      setError("Failed to delete discount");
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  return (
    <div className="space-y-8">
      {/* Create */}
      <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg">Create Custom Discount</h2>
        <p className="text-white/40 text-sm">
          Automatic discounts applied to bookings. Unlike promo codes, guests don&apos;t need to enter anything.
        </p>

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
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percentage" | "flat")}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              {discountType === "percentage" ? "Discount %" : "Amount ($)"}
            </label>
            <input
              type="number"
              min="1"
              max={discountType === "percentage" ? "100" : undefined}
              placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 50"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Label (guest-facing)</label>
            <input
              type="text"
              placeholder="e.g. Spring Special (15% off)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Start Date (optional)</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">End Date (optional)</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!value || !label || creating}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Discount"}
        </button>

        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Active Discounts</h2>
          <button onClick={fetchDiscounts} className="text-white/30 text-xs hover:text-white/60 transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : discounts.length === 0 ? (
          <p className="text-white/40 text-sm">No custom discounts configured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Label</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Discount</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Property</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Dates</th>
                  <th className="text-right text-white/40 font-bold text-xs tracking-wider uppercase py-3" />
                </tr>
              </thead>
              <tbody>
                {discounts.map((d, i) => {
                  const propLabel = PROPERTY_OPTIONS.find((p) => p.value === d.propertyId)?.label || d.propertyId;
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 text-white">{d.label}</td>
                      <td className="py-3 pr-4 text-gold font-semibold">
                        {d.type === "percentage" ? `${d.value}%` : `$${d.value}`}
                      </td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">{propLabel}</td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">
                        {d.start && d.end ? `${d.start} — ${d.end}` : "Always"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(i)}
                          className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
