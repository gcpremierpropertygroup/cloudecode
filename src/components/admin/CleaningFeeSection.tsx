"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House", defaultFee: 150 },
  { value: "prop-spacious-002", label: "Modern Retreat", defaultFee: 100 },
  { value: "prop-pinelane-003", label: "Pine Lane", defaultFee: 85 },
];

export default function CleaningFeeSection({ token }: { token: string }) {
  const [cleaningFees, setCleaningFees] = useState<Record<string, number>>({});
  const [editFees, setEditFees] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cleaning-fees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.cleaningFees) {
        setCleaningFees(data.cleaningFees);
        const edits: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.cleaningFees)) {
          edits[k] = String(v);
        }
        setEditFees(edits);
      }
    } catch {
      setError("Failed to load cleaning fees");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveFee = async (propertyId: string) => {
    const fee = Number(editFees[propertyId]);
    if (isNaN(fee) || fee < 0) return;

    setSaving(propertyId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/cleaning-fees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId, fee }),
      });
      if (res.ok) {
        const data = await res.json();
        setCleaningFees(data.cleaningFees);
        setSuccess(
          `Updated ${PROPERTY_OPTIONS.find((p) => p.value === propertyId)?.label} cleaning fee to $${fee}`
        );
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

  const removeFee = async (propertyId: string) => {
    setSaving(propertyId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/cleaning-fees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCleaningFees(data.cleaningFees);
        const edits = { ...editFees };
        delete edits[propertyId];
        setEditFees(edits);
        setSuccess(
          `Removed override for ${PROPERTY_OPTIONS.find((p) => p.value === propertyId)?.label} — using default`
        );
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to remove");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <p className="text-white/40 text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">
          Cleaning Fee Overrides
        </h2>
        <p className="text-white/40 text-sm mb-6">
          Set a custom cleaning fee for each property. When set, this fee is
          shown in the pricing breakdown and charged at checkout. If no override
          is set, the property default is used.
        </p>

        <div className="space-y-3">
          {PROPERTY_OPTIONS.map((prop) => {
            const hasOverride = cleaningFees[prop.value] != null;
            const currentFee = hasOverride
              ? cleaningFees[prop.value]
              : prop.defaultFee;

            return (
              <div
                key={prop.value}
                className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{prop.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {hasOverride
                      ? `Override: $${currentFee}`
                      : `Default: $${prop.defaultFee}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    value={editFees[prop.value] || ""}
                    onChange={(e) =>
                      setEditFees((prev) => ({
                        ...prev,
                        [prop.value]: e.target.value,
                      }))
                    }
                    placeholder={String(prop.defaultFee)}
                    className="w-24 px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    onClick={() => saveFee(prop.value)}
                    disabled={saving === prop.value || !editFees[prop.value]}
                    className="bg-gold text-white px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    {saving === prop.value ? "..." : "Save"}
                  </button>
                  {hasOverride && (
                    <button
                      onClick={() => removeFee(prop.value)}
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

      {success && <p className="text-green-400 text-sm">{success}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Cleaning fee overrides apply to both the pricing breakdown shown to
          guests and the Stripe checkout amount. Changes take effect immediately
          — no redeploy needed.
        </p>
      </div>
    </div>
  );
}
