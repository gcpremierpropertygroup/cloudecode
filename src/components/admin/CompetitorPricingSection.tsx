"use client";

import { useState, useEffect, useCallback } from "react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

const PLATFORM_OPTIONS = ["Airbnb", "VRBO", "Booking.com", "Other"];

interface CompetitorListing {
  id: string;
  name: string;
  platform: string;
  url: string;
  propertyType: string;
  nightlyRate: number;
  ownPropertyId: string;
  rateHistory: { date: string; rate: number }[];
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

// Approximate own property rates for comparison display
const OWN_RATES: Record<string, number> = {
  "prop-eastover-001": 185,
  "prop-spacious-002": 180,
  "prop-pinelane-003": 165,
};

export default function CompetitorPricingSection({ token }: { token: string }) {
  const [competitors, setCompetitors] = useState<CompetitorListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("Airbnb");
  const [url, setUrl] = useState("");
  const [propertyType, setPropertyType] = useState("Entire home");
  const [nightlyRate, setNightlyRate] = useState("");
  const [ownPropertyId, setOwnPropertyId] = useState("prop-eastover-001");
  const [notes, setNotes] = useState("");

  // History view
  const [historyId, setHistoryId] = useState<string | null>(null);

  const fetchCompetitors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/competitors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.competitors) setCompetitors(data.competitors);
    } catch {
      setError("Failed to load competitors");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setPlatform("Airbnb");
    setUrl("");
    setPropertyType("Entire home");
    setNightlyRate("");
    setOwnPropertyId("prop-eastover-001");
    setNotes("");
  };

  const handleEdit = (c: CompetitorListing) => {
    setEditId(c.id);
    setName(c.name);
    setPlatform(c.platform);
    setUrl(c.url);
    setPropertyType(c.propertyType);
    setNightlyRate(String(c.nightlyRate));
    setOwnPropertyId(c.ownPropertyId);
    setNotes(c.notes);
  };

  const handleSave = async () => {
    if (!name || !nightlyRate) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const method = editId ? "PUT" : "POST";
      const payload = {
        ...(editId && { id: editId }),
        name,
        platform,
        url,
        propertyType,
        nightlyRate: Number(nightlyRate),
        ownPropertyId,
        notes,
      };

      const res = await fetch("/api/admin/competitors", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editId ? "Competitor updated!" : "Competitor added!");
        resetForm();
        fetchCompetitors();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save competitor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, competitorName: string) => {
    if (!confirm(`Delete "${competitorName}"?`)) return;
    try {
      const res = await fetch("/api/admin/competitors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchCompetitors();
    } catch {
      setError("Failed to delete competitor");
    }
  };

  // Group competitors by own property
  const grouped = PROPERTY_OPTIONS.map((prop) => ({
    ...prop,
    ownRate: OWN_RATES[prop.value] || 0,
    competitors: competitors.filter((c) => c.ownPropertyId === prop.value),
  }));

  const historyCompetitor = historyId ? competitors.find((c) => c.id === historyId) : null;

  return (
    <div className="space-y-8">
      {/* Add/Edit form */}
      <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            {editId ? "Edit Competitor" : "Add Competitor Listing"}
          </h2>
          {editId && (
            <button
              onClick={resetForm}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Listing Name
            </label>
            <input
              type="text"
              placeholder="e.g. Charming Belhaven Bungalow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Listing URL
            </label>
            <input
              type="url"
              placeholder="https://airbnb.com/rooms/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              <option value="Entire home">Entire home</option>
              <option value="Private room">Private room</option>
              <option value="Shared room">Shared room</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Nightly Rate ($)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={nightlyRate}
              onChange={(e) => setNightlyRate(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Compare To
            </label>
            <select
              value={ownPropertyId}
              onChange={(e) => setOwnPropertyId(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors"
            >
              {PROPERTY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Notes
            </label>
            <input
              type="text"
              placeholder="Optional notes about this competitor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name || !nightlyRate || saving}
          className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : editId ? "Update Competitor" : "Add Competitor"}
        </button>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 p-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {/* Comparison by property */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Rate Comparison</h2>
          <button
            onClick={fetchCompetitors}
            className="text-white/30 text-xs hover:text-white/60 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-white/40 text-sm">Loading...</p>
        ) : competitors.length === 0 ? (
          <p className="text-white/40 text-sm">No competitors tracked yet. Add one above.</p>
        ) : (
          <div className="space-y-8">
            {grouped
              .filter((g) => g.competitors.length > 0)
              .map((group) => (
                <div key={group.value}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <h3 className="text-white font-semibold">{group.label}</h3>
                    <span className="text-gold text-sm font-semibold">
                      Your rate: ${group.ownRate}/night
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Name</th>
                          <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Platform</th>
                          <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Rate</th>
                          <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Diff</th>
                          <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Updated</th>
                          <th className="text-right text-white/40 font-bold text-xs tracking-wider uppercase py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {group.competitors.map((c) => {
                          const diff = group.ownRate - c.nightlyRate;
                          const diffLabel = diff > 0 ? `+$${diff}` : diff < 0 ? `-$${Math.abs(diff)}` : "Same";
                          const diffColor = diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-white/40";

                          return (
                            <tr key={c.id} className="border-b border-white/5">
                              <td className="py-3 pr-4">
                                <span className="text-white">{c.name}</span>
                                {c.url && (
                                  <a
                                    href={c.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-gold/50 hover:text-gold text-xs transition-colors"
                                  >
                                    Link
                                  </a>
                                )}
                              </td>
                              <td className="py-3 pr-4 text-white/60">{c.platform}</td>
                              <td className="py-3 pr-4 text-white font-semibold">${c.nightlyRate}</td>
                              <td className={`py-3 pr-4 font-semibold ${diffColor}`}>
                                {diffLabel}
                              </td>
                              <td className="py-3 pr-4 text-white/40 text-xs hidden md:table-cell">
                                {c.lastUpdated.split("T")[0]}
                              </td>
                              <td className="py-3 text-right space-x-3">
                                <button
                                  onClick={() => setHistoryId(historyId === c.id ? null : c.id)}
                                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                                >
                                  History
                                </button>
                                <button
                                  onClick={() => handleEdit(c)}
                                  className="text-gold/60 hover:text-gold text-xs transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(c.id, c.name)}
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
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Rate History */}
      {historyCompetitor && (
        <div className="bg-[#1F2937] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">
              Rate History — {historyCompetitor.name}
            </h2>
            <button
              onClick={() => setHistoryId(null)}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Close
            </button>
          </div>

          {historyCompetitor.rateHistory.length === 0 ? (
            <p className="text-white/40 text-sm">No rate history yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Date</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Rate</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historyCompetitor.rateHistory].reverse().map((entry, i, arr) => {
                    const prev = arr[i + 1];
                    const change = prev ? entry.rate - prev.rate : 0;
                    return (
                      <tr key={`${entry.date}-${i}`} className="border-b border-white/5">
                        <td className="py-2 pr-4 text-white/60">{entry.date}</td>
                        <td className="py-2 pr-4 text-white font-semibold">${entry.rate}</td>
                        <td className="py-2">
                          {change !== 0 ? (
                            <span className={change > 0 ? "text-red-400" : "text-green-400"}>
                              {change > 0 ? `+$${change}` : `-$${Math.abs(change)}`}
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
