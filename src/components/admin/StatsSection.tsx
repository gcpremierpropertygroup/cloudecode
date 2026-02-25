"use client";

import { useState, useEffect, useCallback } from "react";

interface PropertyStats {
  propertyId: string;
  propertyName: string;
  matched: boolean;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  recommendedBasePrice?: number;
}

interface StatsData {
  configured: boolean;
  stats: PropertyStats[];
  fetchedAt: string;
}

export default function StatsSection({ token }: { token: string }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.stats) setData(result);
      else setError(result.error || "Failed to load");
    } catch {
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <p className="text-white/40 text-sm">Loading PriceLabs data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={fetchStats} className="text-gold text-sm mt-2 hover:text-gold-light transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Status */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">PriceLabs Integration</h2>
          <button onClick={fetchStats} className="text-white/30 text-xs hover:text-white/60 transition-colors">
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className={`w-2 h-2 rounded-full ${data.configured ? "bg-green-400" : "bg-red-400"}`} />
          <span className="text-white text-sm">
            {data.configured ? "API Key configured" : "API Key not configured"}
          </span>
        </div>
        <p className="text-white/30 text-xs">
          Last fetched: {new Date(data.fetchedAt).toLocaleString()}
        </p>
      </div>

      {/* Property cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.stats.map((stat) => (
          <div key={stat.propertyId} className="bg-[#1F2937] border border-white/10 p-6">
            <h3 className="text-white font-semibold text-sm mb-4">{stat.propertyName}</h3>

            {!stat.matched ? (
              <p className="text-white/40 text-sm">No PriceLabs data available</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Base Price</span>
                  <span className="text-gold font-bold text-lg">${stat.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Min</span>
                  <span className="text-white text-sm">${stat.minPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Max</span>
                  <span className="text-white text-sm">${stat.maxPrice}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Recommended</span>
                  <span className="text-white/60 text-sm">${stat.recommendedBasePrice}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#1F2937]/50 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          PriceLabs data is cached for 1 hour. Base prices shown here may differ from display prices on property cards.
        </p>
      </div>
    </div>
  );
}
