"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

export default function PricesSection({ token }: { token: string }) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/prices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.prices) {
        setPrices(data.prices);
        const edits: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.prices)) {
          edits[k] = String(v);
        }
        setEditValues(edits);
      }
    } catch {
      setError("Failed to load prices");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSave = async (propertyId: string) => {
    const price = Number(editValues[propertyId]);
    if (isNaN(price) || price < 0) return;

    setSaving(propertyId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId, price }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.prices) {
          setPrices(data.prices);
        }
        setSuccess(`Updated ${PROPERTY_OPTIONS.find((p) => p.value === propertyId)?.label} to $${price}/night`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save price");
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return (
    <div className="space-y-8">
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-6">Display Prices</h2>
        <p className="text-white/40 text-sm mb-6">
          These are the &quot;From $X/night&quot; prices shown on property cards and booking panels. They are independent of PriceLabs dynamic pricing.
        </p>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : (
          <div className="space-y-4">
            {PROPERTY_OPTIONS.map((prop) => (
              <div
                key={prop.value}
                className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{prop.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    Current: ${prices[prop.value] ?? "—"}/night
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    value={editValues[prop.value] || ""}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, [prop.value]: e.target.value }))
                    }
                    className="w-24 px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    onClick={() => handleSave(prop.value)}
                    disabled={
                      saving === prop.value ||
                      Number(editValues[prop.value]) === prices[prop.value]
                    }
                    className="bg-gold text-white px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    {saving === prop.value ? "..." : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {success && <p className="text-green-400 text-sm mt-4">{success}</p>}
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Changes take effect on the next page load. No redeploy needed.
        </p>
      </div>
    </div>
  );
}
