"use client";

import { useState } from "react";
import {
  Tag,
  CalendarDays,
  Mail,
  DollarSign,
  Layers,
  SlidersHorizontal,
  SprayCan,
  Percent,
  BarChart3,
  LineChart,
  TrendingUp,
  FileText,
  LogOut,
  Menu,
  X,
  ClipboardList,
  KeyRound,
  Eye,
  Building2,
  Receipt,
  Send,
} from "lucide-react";
import PromoSection from "@/components/admin/PromoSection";
import DatesSection from "@/components/admin/DatesSection";
import PricesSection from "@/components/admin/PricesSection";
import DiscountsSection from "@/components/admin/DiscountsSection";
import StatsSection from "@/components/admin/StatsSection";
import BlogSection from "@/components/admin/BlogSection";
import PricingRulesSection from "@/components/admin/PricingRulesSection";
import BasePricesSection from "@/components/admin/BasePricesSection";
import AnalyticsSection from "@/components/admin/AnalyticsSection";
import CompetitorPricingSection from "@/components/admin/CompetitorPricingSection";
import AutomatedEmailsSection from "@/components/admin/AutomatedEmailsSection";
import CleaningFeeSection from "@/components/admin/CleaningFeeSection";
import BookingsSection from "@/components/admin/BookingsSection";
import CheckInInstructionsSection from "@/components/admin/CheckInInstructionsSection";
import EmailPreviewSection from "@/components/admin/EmailPreviewSection";
import PropertySettingsSection from "@/components/admin/PropertySettingsSection";
import InvoicesSection from "@/components/admin/InvoicesSection";
import EmailLogSection from "@/components/admin/EmailLogSection";
import type { LucideIcon } from "lucide-react";

type TabId =
  | "promo"
  | "dates"
  | "emails"
  | "prices"
  | "base-prices"
  | "pricing-rules"
  | "cleaning-fees"
  | "discounts"
  | "competitors"
  | "analytics"
  | "stats"
  | "blog"
  | "bookings"
  | "checkin-instructions"
  | "email-preview"
  | "invoices"
  | "email-log"
  | "property-settings";

type NavGroup = {
  label: string;
  items: { id: TabId; label: string; icon: LucideIcon }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Bookings",
    items: [
      { id: "bookings", label: "Bookings", icon: ClipboardList },
      { id: "invoices", label: "Invoices", icon: Receipt },
      { id: "promo", label: "Promo Codes", icon: Tag },
      { id: "dates", label: "Date Overrides", icon: CalendarDays },
      { id: "checkin-instructions", label: "Check-in Info", icon: KeyRound },
      { id: "emails", label: "Emails", icon: Mail },
      { id: "email-preview", label: "Email Preview", icon: Eye },
      { id: "email-log", label: "Email Log", icon: Send },
    ],
  },
  {
    label: "Pricing",
    items: [
      { id: "prices", label: "Display Prices", icon: DollarSign },
      { id: "base-prices", label: "Base Prices", icon: Layers },
      { id: "pricing-rules", label: "Pricing Rules", icon: SlidersHorizontal },
      { id: "cleaning-fees", label: "Cleaning Fees", icon: SprayCan },
      { id: "discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "competitors", label: "Competitors", icon: BarChart3 },
      { id: "analytics", label: "Analytics", icon: LineChart },
      { id: "stats", label: "PriceLabs", icon: TrendingUp },
    ],
  },
  {
    label: "Properties",
    items: [{ id: "property-settings", label: "Settings", icon: Building2 }],
  },
  {
    label: "Content",
    items: [{ id: "blog", label: "Blog", icon: FileText }],
  },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("promo");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Find active tab label
  const activeLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((item) => item.id === activeTab)
      ?.label || "";

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#1F2937] border border-white/10 rounded-xl p-8 space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-1 mb-4">
                <span className="text-3xl font-serif font-bold text-white">
                  G
                </span>
                <span className="text-gold text-2xl font-light">|</span>
                <span className="text-3xl font-serif font-bold text-white">
                  C
                </span>
              </div>
              <h1 className="font-serif text-xl font-semibold text-white mb-1">
                Admin Dashboard
              </h1>
              <p className="text-white/40 text-sm">
                Enter password to continue
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
              {authError && (
                <p className="text-red-400 text-sm text-center">{authError}</p>
              )}
              <button
                onClick={handleLogin}
                className="w-full bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-50 bg-[#111827] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              sidebarOpen
                ? "bg-gold/10 text-gold"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            <span className="text-xs font-semibold tracking-wide uppercase">
              {sidebarOpen ? "Close" : "Menu"}
            </span>
          </button>

          {/* Active section name */}
          <div className="flex flex-col items-center">
            <span className="text-white text-sm font-semibold">{activeLabel}</span>
            <span className="text-white/30 text-[10px] tracking-widest uppercase">Admin</span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              setAuthenticated(false);
              setToken("");
              setPassword("");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
          >
            <LogOut size={14} />
            <span className="text-xs font-semibold tracking-wide uppercase">Out</span>
          </button>
        </div>
      </div>

      <div className="flex bg-[#0F172A]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[#111827] border-r border-white/10 flex flex-col transition-transform duration-200 ease-in-out`}
        >
          {/* Sidebar header */}
          <div className="hidden md:flex items-center gap-2 px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-serif font-bold text-white">
                G
              </span>
              <span className="text-gold text-xl font-light">|</span>
              <span className="text-2xl font-serif font-bold text-white">
                C
              </span>
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-widest uppercase ml-1">
              Admin
            </span>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[10px] font-bold tracking-[3px] uppercase text-white/25">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gold/10 text-gold"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} className={isActive ? "text-gold" : "text-white/30"} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="hidden md:block px-3 py-4 border-t border-white/10">
            <button
              onClick={() => {
                setAuthenticated(false);
                setToken("");
                setPassword("");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen bg-[#0F172A]">
          {/* Content header */}
          <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
            <h1 className="font-serif text-xl md:text-2xl font-semibold text-white">
              {activeLabel}
            </h1>
            <div className="h-0.5 w-10 bg-gold mt-2 rounded-full" />
          </div>

          {/* Tab content */}
          <div className="px-6 md:px-8 pb-8">
            {activeTab === "promo" && <PromoSection token={token} />}
            {activeTab === "dates" && <DatesSection token={token} />}
            {activeTab === "prices" && <PricesSection token={token} />}
            {activeTab === "base-prices" && <BasePricesSection token={token} />}
            {activeTab === "pricing-rules" && (
              <PricingRulesSection token={token} />
            )}
            {activeTab === "cleaning-fees" && (
              <CleaningFeeSection token={token} />
            )}
            {activeTab === "discounts" && <DiscountsSection token={token} />}
            {activeTab === "competitors" && (
              <CompetitorPricingSection token={token} />
            )}
            {activeTab === "analytics" && <AnalyticsSection token={token} />}
            {activeTab === "emails" && (
              <AutomatedEmailsSection token={token} />
            )}
            {activeTab === "stats" && <StatsSection token={token} />}
            {activeTab === "bookings" && <BookingsSection token={token} />}
            {activeTab === "checkin-instructions" && (
              <CheckInInstructionsSection token={token} />
            )}
            {activeTab === "email-preview" && (
              <EmailPreviewSection token={token} />
            )}
            {activeTab === "property-settings" && (
              <PropertySettingsSection token={token} />
            )}
            {activeTab === "invoices" && <InvoicesSection token={token} />}
            {activeTab === "email-log" && <EmailLogSection token={token} />}
            {activeTab === "blog" && <BlogSection token={token} />}
          </div>
        </main>
      </div>
    </div>
  );
}
