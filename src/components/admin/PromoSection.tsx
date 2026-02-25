"use client";

import { useState, useEffect, useCallback } from "react";
import type { PromoCode } from "@/types/promo";

const PROPERTY_OPTIONS = [
  { value: "*", label: "All Properties" },
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

export default function PromoSection({ token }: { token: string }) {
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [propertyId, setPropertyId] = useState("*");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/promo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.codes) setCodes(data.codes);
    } catch {
      setError("Failed to load codes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleCreate = async () => {
    if (!discountValue) return;
    setCreating(true);
    setCreateSuccess(null);
    setError("");
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          discountType,
          discountValue: Number(discountValue),
          propertyId,
          expiresAt: expiresAt || null,
          maxUses: maxUses ? Number(maxUses) : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.code) {
        setCreateSuccess(data.code.code);
        setDiscountValue("");
        setExpiresAt("");
        setMaxUses("");
        fetchCodes();
      } else {
        setError(data.error || "Failed to create code");
      }
    } catch {
      setError("Failed to create code");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Delete code ${code}?`)) return;
    try {
      const res = await fetch("/api/promo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      if (res.ok) fetchCodes();
    } catch {
      setError("Failed to delete code");
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  return (
    <div className="space-y-8">
      {/* Create section */}
      <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg">Create New Code</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

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
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Expires (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">Max Uses (optional)</label>
            <input
              type="number"
              min="1"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!discountValue || creating}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Code"}
        </button>

        {createSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 p-4 mt-4">
            <p className="text-green-400 text-sm">Code created successfully!</p>
            <p className="text-green-300 text-2xl font-mono font-bold mt-1 tracking-widest">{createSuccess}</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Active codes */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Active Codes</h2>
          <button onClick={fetchCodes} className="text-white/30 text-xs hover:text-white/60 transition-colors">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : codes.length === 0 ? (
          <p className="text-white/40 text-sm">No discount codes yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Code</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Discount</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Property</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Expires</th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Uses</th>
                  <th className="text-right text-white/40 font-bold text-xs tracking-wider uppercase py-3" />
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const propLabel = PROPERTY_OPTIONS.find((p) => p.value === c.propertyId)?.label || c.propertyId;
                  const isExpired = c.expiresAt && new Date() > new Date(c.expiresAt + "T23:59:59");
                  const isMaxed = c.maxUses !== null && c.currentUses >= c.maxUses;

                  return (
                    <tr key={c.code} className="border-b border-white/5">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-gold font-bold tracking-wider">{c.code}</span>
                        {(isExpired || isMaxed) && (
                          <span className="ml-2 text-red-400/70 text-xs">{isExpired ? "expired" : "maxed"}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-white">
                        {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}
                      </td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">{propLabel}</td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">{c.expiresAt || "Never"}</td>
                      <td className="py-3 pr-4 text-white/60">
                        {c.currentUses}{c.maxUses !== null ? `/${c.maxUses}` : ""}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.code)}
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
