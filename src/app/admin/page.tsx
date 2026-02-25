"use client";

import { useState } from "react";
import PromoSection from "@/components/admin/PromoSection";
import DatesSection from "@/components/admin/DatesSection";
import PricesSection from "@/components/admin/PricesSection";
import DiscountsSection from "@/components/admin/DiscountsSection";
import StatsSection from "@/components/admin/StatsSection";
import BlogSection from "@/components/admin/BlogSection";
import PricingRulesSection from "@/components/admin/PricingRulesSection";
import BasePricesSection from "@/components/admin/BasePricesSection";
import AnalyticsSection from "@/components/admin/AnalyticsSection";

const TABS = [
  { id: "promo", label: "Promo Codes" },
  { id: "dates", label: "Dates" },
  { id: "prices", label: "Display Prices" },
  { id: "base-prices", label: "Base Prices" },
  { id: "pricing-rules", label: "Pricing Rules" },
  { id: "discounts", label: "Discounts" },
  { id: "analytics", label: "Analytics" },
  { id: "stats", label: "PriceLabs" },
  { id: "blog", label: "Blog" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("promo");

  const handleLogin = async () => {
    setAuthError("");
    const authToken = password;
    try {
      const res = await fetch("/api/promo", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        setAuthError("Invalid password");
        return;
      }
      setToken(authToken);
      setAuthenticated(true);
    } catch {
      setAuthError("Connection error");
    }
  };

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-semibold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/40 text-sm">Enter admin password to continue</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3.5 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-gold text-white px-6 py-3.5 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-white">
              Admin Dashboard
            </h1>
            <div className="h-0.5 w-12 bg-gold mt-2" />
          </div>
          <button
            onClick={() => {
              setAuthenticated(false);
              setToken("");
              setPassword("");
            }}
            className="text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-white/10 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold tracking-wide transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-gold border-gold"
                  : "text-white/40 border-transparent hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "promo" && <PromoSection token={token} />}
          {activeTab === "dates" && <DatesSection token={token} />}
          {activeTab === "prices" && <PricesSection token={token} />}
          {activeTab === "base-prices" && <BasePricesSection token={token} />}
          {activeTab === "pricing-rules" && <PricingRulesSection token={token} />}
          {activeTab === "discounts" && <DiscountsSection token={token} />}
          {activeTab === "analytics" && <AnalyticsSection token={token} />}
          {activeTab === "stats" && <StatsSection token={token} />}
          {activeTab === "blog" && <BlogSection token={token} />}
        </div>
      </div>
    </div>
  );
}
