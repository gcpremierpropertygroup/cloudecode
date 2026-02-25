"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

interface FlatRate {
  start: string;
  end: string;
  rate: number;
}

export default function BasePricesSection({ token }: { token: string }) {
  const [basePrices, setBasePrices] = useState<Record<string, number>>({});
  const [flatRates, setFlatRates] = useState<Record<string, FlatRate[]>>({});
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New flat rate form
  const [newPropId, setNewPropId] = useState(PROPERTY_OPTIONS[0].value);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newRate, setNewRate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/base-prices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.basePrices) {
        setBasePrices(data.basePrices);
        const edits: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.basePrices)) {
          edits[k] = String(v);
        }
        setEditPrices(edits);
      }
      if (data.flatRates) setFlatRates(data.flatRates);
    } catch {
      setError("Failed to load base prices");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveBasePrice = async (propertyId: string) => {
    const price = Number(editPrices[propertyId]);
    if (isNaN(price) || price <= 0) return;

    setSaving(propertyId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/base-prices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "base-price", propertyId, price }),
      });
      if (res.ok) {
        const data = await res.json();
        setBasePrices(data.basePrices);
        setSuccess(`Updated ${PROPERTY_OPTIONS.find((p) => p.value === propertyId)?.label} base price to $${price}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const removeBasePrice = async (propertyId: string) => {
    setSaving(propertyId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/base-prices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "base-price", propertyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBasePrices(data.basePrices);
        const edits = { ...editPrices };
        delete edits[propertyId];
        setEditPrices(edits);
        setSuccess(`Removed override for ${PROPERTY_OPTIONS.find((p) => p.value === propertyId)?.label}`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to remove");
    } finally {
      setSaving(null);
    }
  };

  const addFlatRate = async () => {
    if (!newStart || !newEnd || !newRate || Number(newRate) <= 0) return;

    setSaving("flat-rate");
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/base-prices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "flat-rate",
          propertyId: newPropId,
          start: newStart,
          end: newEnd,
          rate: Number(newRate),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFlatRates(data.flatRates);
        setNewStart("");
        setNewEnd("");
        setNewRate("");
        setSuccess("Flat rate override added");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add flat rate");
      }
    } catch {
      setError("Failed to add flat rate");
    } finally {
      setSaving(null);
    }
  };

  const removeFlatRate = async (propertyId: string, index: number) => {
    setSaving(`flat-${propertyId}-${index}`);
    setError("");
    try {
      const res = await fetch("/api/admin/base-prices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "flat-rate", propertyId, index }),
      });
      if (res.ok) {
        const data = await res.json();
        setFlatRates(data.flatRates);
        setSuccess("Flat rate removed");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to remove flat rate");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <p className="text-white/40 text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Base Price Overrides */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">Base Price Overrides</h2>
        <p className="text-white/40 text-sm mb-6">
          Override the PriceLabs base price for each property. When set, this is used as the starting rate for all day-of-week and seasonal calculations.
          If no override is set, the PriceLabs base price is used.
        </p>

        <div className="space-y-3">
          {PROPERTY_OPTIONS.map((prop) => {
            const hasOverride = basePrices[prop.value] != null;
            return (
              <div key={prop.value} className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{prop.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {hasOverride
                      ? `Override: $${basePrices[prop.value]}/night`
                      : "Using PriceLabs base price"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    value={editPrices[prop.value] || ""}
                    onChange={(e) =>
                      setEditPrices((prev) => ({ ...prev, [prop.value]: e.target.value }))
                    }
                    placeholder="—"
                    className="w-24 px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    onClick={() => saveBasePrice(prop.value)}
                    disabled={saving === prop.value || !editPrices[prop.value]}
                    className="bg-gold text-white px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    {saving === prop.value ? "..." : "Save"}
                  </button>
                  {hasOverride && (
                    <button
                      onClick={() => removeBasePrice(prop.value)}
                      disabled={saving === prop.value}
                      className="text-red-400/60 text-xs hover:text-red-400 transition-colors px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flat Rate Overrides */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">Flat Rate Overrides</h2>
        <p className="text-white/40 text-sm mb-6">
          Set a flat nightly rate for specific date ranges. When active, day-of-week and seasonal adjustments are skipped for those dates.
        </p>

        {/* Existing flat rates */}
        {Object.entries(flatRates).map(([propId, rates]) =>
          rates.map((rate, idx) => (
            <div key={`${propId}-${idx}`} className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-3 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">
                  {PROPERTY_OPTIONS.find((p) => p.value === propId)?.label || propId}
                </p>
                <p className="text-white/30 text-xs mt-0.5">
                  {rate.start} to {rate.end} — ${rate.rate}/night
                </p>
              </div>
              <button
                onClick={() => removeFlatRate(propId, idx)}
                disabled={saving === `flat-${propId}-${idx}`}
                className="text-red-400/60 text-xs hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          ))
        )}

        {Object.keys(flatRates).length === 0 && (
          <p className="text-white/20 text-sm mb-4">No flat rate overrides active.</p>
        )}

        {/* Add flat rate */}
        <div className="bg-[#374151]/30 border border-white/5 p-4 mt-4 space-y-3">
          <p className="text-white/50 text-xs font-semibold tracking-wide uppercase">Add Flat Rate</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={newPropId}
              onChange={(e) => setNewPropId(e.target.value)}
              className="px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            >
              {PROPERTY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <input
              type="date"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
            />
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm">$</span>
              <input
                type="number"
                min="1"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Rate"
                className="flex-1 px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <button
            onClick={addFlatRate}
            disabled={saving === "flat-rate" || !newStart || !newEnd || !newRate}
            className="bg-gold text-white px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving === "flat-rate" ? "Adding..." : "Add Flat Rate"}
          </button>
        </div>
      </div>

      {success && <p className="text-green-400 text-sm">{success}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Base price overrides affect all rate calculations. Flat rate overrides bypass day-of-week and seasonal adjustments for the specified date range. Changes take effect on next pricing calculation — no redeploy needed.
        </p>
      </div>
    </div>
  );
}
