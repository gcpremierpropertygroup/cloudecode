"use client";

import { useState, useEffect, useCallback } from "react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface DayRule {
  multiplier: number;
  label: string;
}

interface SeasonalRule {
  months: number[];
  multiplier: number;
  label: string;
}

interface PricingRules {
  dayOfWeek: Record<string, DayRule>;
  seasonal: SeasonalRule[];
  holidayMultiplier: number;
}

export default function PricingRulesSection({ token }: { token: string }) {
  const [rules, setRules] = useState<PricingRules | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New seasonal rule form
  const [newMonths, setNewMonths] = useState<number[]>([]);
  const [newMultiplier, setNewMultiplier] = useState("1.10");
  const [newLabel, setNewLabel] = useState("");

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.rules) setRules(data.rules);
    } catch {
      setError("Failed to load pricing rules");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const saveRules = async (updated: PricingRules) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules: updated }),
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        setSuccess("Pricing rules saved");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save pricing rules");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules);
        setSuccess("Reset to defaults");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  // Day-of-week handlers
  const updateDayRule = (dayIndex: string, field: "multiplier" | "label", value: string) => {
    if (!rules) return;
    const updated = { ...rules, dayOfWeek: { ...rules.dayOfWeek } };
    if (!updated.dayOfWeek[dayIndex]) {
      updated.dayOfWeek[dayIndex] = { multiplier: 1.0, label: "" };
    }
    if (field === "multiplier") {
      updated.dayOfWeek[dayIndex] = { ...updated.dayOfWeek[dayIndex], multiplier: parseFloat(value) || 1.0 };
    } else {
      updated.dayOfWeek[dayIndex] = { ...updated.dayOfWeek[dayIndex], label: value };
    }
    setRules(updated);
  };

  const removeDayRule = (dayIndex: string) => {
    if (!rules) return;
    const updated = { ...rules, dayOfWeek: { ...rules.dayOfWeek } };
    delete updated.dayOfWeek[dayIndex];
    setRules(updated);
  };

  const addDayRule = (dayIndex: string) => {
    if (!rules) return;
    const updated = { ...rules, dayOfWeek: { ...rules.dayOfWeek } };
    updated.dayOfWeek[dayIndex] = { multiplier: 1.0, label: DAY_NAMES[parseInt(dayIndex)] };
    setRules(updated);
  };

  // Seasonal handlers
  const removeSeasonalRule = (index: number) => {
    if (!rules) return;
    const updated = { ...rules, seasonal: rules.seasonal.filter((_, i) => i !== index) };
    setRules(updated);
  };

  const addSeasonalRule = () => {
    if (!rules || newMonths.length === 0 || !newLabel) return;
    const rule: SeasonalRule = {
      months: [...newMonths].sort((a, b) => a - b),
      multiplier: parseFloat(newMultiplier) || 1.0,
      label: newLabel,
    };
    setRules({ ...rules, seasonal: [...rules.seasonal, rule] });
    setNewMonths([]);
    setNewMultiplier("1.10");
    setNewLabel("");
  };

  const toggleMonth = (m: number) => {
    setNewMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const multiplierToPercent = (m: number) => {
    const pct = Math.round((m - 1) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  if (loading) {
    return <p className="text-white/40 text-sm">Loading pricing rules...</p>;
  }

  if (!rules) {
    return <p className="text-red-400 text-sm">Failed to load rules.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Day-of-Week Rules */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">Day-of-Week Adjustments</h2>
        <p className="text-white/40 text-sm mb-6">
          Set price multipliers for specific days. 1.15 = +15%, 0.80 = -20%.
        </p>

        <div className="space-y-3">
          {DAY_NAMES.map((name, idx) => {
            const key = String(idx);
            const rule = rules.dayOfWeek[key];
            if (!rule) {
              return (
                <div key={key} className="flex items-center gap-4 bg-[#374151]/30 border border-white/5 p-3">
                  <span className="text-white/30 text-sm w-12">{name}</span>
                  <span className="text-white/20 text-sm flex-1">Base rate (no adjustment)</span>
                  <button
                    onClick={() => addDayRule(key)}
                    className="text-gold/60 text-xs hover:text-gold transition-colors"
                  >
                    + Add rule
                  </button>
                </div>
              );
            }
            return (
              <div key={key} className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-3">
                <span className="text-white font-medium text-sm w-12">{name}</span>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="3.0"
                    value={rule.multiplier}
                    onChange={(e) => updateDayRule(key, "multiplier", e.target.value)}
                    className="w-20 px-2 py-1.5 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  <span className={`text-xs font-medium w-12 ${rule.multiplier >= 1 ? "text-green-400" : "text-red-400"}`}>
                    {multiplierToPercent(rule.multiplier)}
                  </span>
                  <input
                    type="text"
                    value={rule.label}
                    onChange={(e) => updateDayRule(key, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1 px-2 py-1.5 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <button
                  onClick={() => removeDayRule(key)}
                  className="text-red-400/60 text-xs hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonal Rules */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">Seasonal Adjustments</h2>
        <p className="text-white/40 text-sm mb-6">
          Apply multipliers to specific months. Applied on top of day-of-week adjustments.
        </p>

        {rules.seasonal.length > 0 && (
          <div className="space-y-3 mb-6">
            {rules.seasonal.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-[#374151]/50 border border-white/5 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{rule.label}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {rule.months.map((m) => MONTH_NAMES[m]).join(", ")} — {multiplierToPercent(rule.multiplier)}
                  </p>
                </div>
                <span className={`text-sm font-medium ${rule.multiplier >= 1 ? "text-green-400" : "text-red-400"}`}>
                  {rule.multiplier}x
                </span>
                <button
                  onClick={() => removeSeasonalRule(idx)}
                  className="text-red-400/60 text-xs hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add seasonal rule */}
        <div className="bg-[#374151]/30 border border-white/5 p-4 space-y-3">
          <p className="text-white/50 text-xs font-semibold tracking-wide uppercase">Add Seasonal Rule</p>
          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES.map((name, idx) => (
              <button
                key={idx}
                onClick={() => toggleMonth(idx)}
                className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                  newMonths.includes(idx)
                    ? "bg-gold/20 border-gold/40 text-gold"
                    : "bg-[#374151]/50 border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">Multiplier</span>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="3.0"
                value={newMultiplier}
                onChange={(e) => setNewMultiplier(e.target.value)}
                className="w-20 px-2 py-1.5 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (e.g. Summer premium)"
              className="flex-1 px-2 py-1.5 bg-[#374151] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors"
            />
            <button
              onClick={addSeasonalRule}
              disabled={newMonths.length === 0 || !newLabel}
              className="bg-gold text-white px-4 py-1.5 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Holiday Multiplier */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <h2 className="text-white font-semibold text-lg mb-2">Holiday Premium</h2>
        <p className="text-white/40 text-sm mb-4">
          Extra multiplier applied during major holidays (New Year&apos;s, Christmas, Thanksgiving, 4th of July, etc.). Applied on top of other adjustments.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-sm">Multiplier</span>
          <input
            type="number"
            step="0.05"
            min="1.0"
            max="3.0"
            value={rules.holidayMultiplier}
            onChange={(e) =>
              setRules({ ...rules, holidayMultiplier: parseFloat(e.target.value) || 1.25 })
            }
            className="w-24 px-3 py-2 bg-[#374151] border border-white/10 text-white text-sm focus:outline-none focus:border-gold transition-colors"
          />
          <span className="text-green-400 text-sm font-medium">
            {multiplierToPercent(rules.holidayMultiplier)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => saveRules(rules)}
          disabled={saving}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Rules"}
        </button>
        <button
          onClick={resetToDefaults}
          disabled={saving}
          className="bg-transparent text-white/40 px-6 py-3 text-sm font-bold tracking-wider uppercase border border-white/10 hover:text-white/60 hover:border-white/20 transition-colors disabled:opacity-50"
        >
          Reset to Defaults
        </button>
      </div>

      {success && <p className="text-green-400 text-sm">{success}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Changes take effect on the next pricing calculation. Holidays are detected automatically (fixed calendar dates). No redeploy needed.
        </p>
      </div>
    </div>
  );
}
