"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmailLogEntry } from "@/lib/email/logging";
import { Search, RefreshCw, Filter, ChevronDown, ChevronRight, Mail, User, Clock, AlertCircle, Tag, FileText } from "lucide-react";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  "contact-owner": { label: "Contact (Owner)", color: "bg-orange-500/15 text-orange-400" },
  "contact-confirmation": { label: "Contact (Guest)", color: "bg-orange-500/15 text-orange-300" },
  "assessment-owner": { label: "Assessment (Owner)", color: "bg-amber-500/15 text-amber-400" },
  "assessment-confirmation": { label: "Assessment (Guest)", color: "bg-amber-500/15 text-amber-300" },
  "booking-confirmation-guest": { label: "Booking (Guest)", color: "bg-green-500/15 text-green-400" },
  "booking-confirmation-owner": { label: "Booking (Owner)", color: "bg-green-500/15 text-green-300" },
  "check-in-reminder": { label: "Check-in", color: "bg-blue-500/15 text-blue-400" },
  "review-request": { label: "Review", color: "bg-purple-500/15 text-purple-400" },
  "invoice": { label: "Invoice", color: "bg-gold/15 text-gold" },
  "invoice-resend": { label: "Invoice (Resend)", color: "bg-gold/15 text-gold" },
  "test-email": { label: "Test", color: "bg-white/10 text-white/50" },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Emails" },
  { value: "contact", label: "Contact" },
  { value: "assessment", label: "Assessment" },
  { value: "booking", label: "Booking" },
  { value: "check-in-reminder", label: "Check-in" },
  { value: "review-request", label: "Review" },
  { value: "invoice", label: "Invoice" },
];

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={14} className="text-white/30 mt-0.5 shrink-0" />
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{label}</p>
        <p className="text-white/80 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function EmailLogSection({ token }: { token: string }) {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-log?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs
  const filtered = logs.filter((log) => {
    // Type filter
    if (typeFilter !== "all") {
      if (typeFilter === "contact" && !log.type.startsWith("contact")) return false;
      if (typeFilter === "assessment" && !log.type.startsWith("assessment")) return false;
      if (typeFilter === "booking" && !log.type.startsWith("booking")) return false;
      if (typeFilter === "invoice" && !log.type.startsWith("invoice")) return false;
      if (typeFilter === "check-in-reminder" && log.type !== "check-in-reminder") return false;
      if (typeFilter === "review-request" && log.type !== "review-request") return false;
    }
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return (
        log.to.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q) ||
        (log.recipientName || "").toLowerCase().includes(q) ||
        (log.context || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeInfo = (type: string) => TYPE_LABELS[type] || { label: type, color: "bg-white/10 text-white/40" };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-white/40 text-sm">
            {filtered.length} email{filtered.length !== 1 ? "s" : ""}
            {typeFilter !== "all" || search ? " (filtered)" : ""}
          </p>
          <button
            onClick={fetchLogs}
            className="text-white/30 hover:text-white/60 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Type filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-8 pr-3 py-2 bg-[#374151] border border-white/10 text-white text-xs focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 pl-8 pr-3 py-2 bg-[#374151] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Logs list */}
      <div className="bg-[#1F2937] border border-white/10">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-white/40 text-sm">Loading email log...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/40 text-sm">
              {logs.length === 0
                ? "No emails logged yet. Emails will appear here as they are sent."
                : "No emails match your filters."}
            </p>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto] gap-x-3 px-4 py-3 border-b border-white/10">
              <div className="w-5" />
              <p className="text-white/40 font-bold text-[10px] tracking-wider uppercase">Type & Recipient</p>
              <p className="text-white/40 font-bold text-[10px] tracking-wider uppercase hidden sm:block">Subject</p>
              <p className="text-white/40 font-bold text-[10px] tracking-wider uppercase">Date</p>
              <p className="text-white/40 font-bold text-[10px] tracking-wider uppercase">Status</p>
            </div>

            {/* Rows */}
            {filtered.map((log) => {
              const typeInfo = getTypeInfo(log.type);
              const isExpanded = expandedId === log.id;
              const sentDate = new Date(log.sentAt);

              return (
                <div key={log.id} className="border-b border-white/5 last:border-b-0">
                  {/* Clickable row */}
                  <button
                    onClick={() => toggleExpand(log.id)}
                    className="w-full grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_1fr_auto_auto] gap-x-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    {/* Chevron */}
                    <div className="flex items-center w-5">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-white/40" />
                      ) : (
                        <ChevronRight size={14} className="text-white/30" />
                      )}
                    </div>

                    {/* Type + Recipient */}
                    <div className="min-w-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <p className="text-white/60 text-xs mt-1 truncate">
                        {log.recipientName ? `${log.recipientName} — ` : ""}{log.to}
                      </p>
                    </div>

                    {/* Subject */}
                    <p className="text-white/40 text-xs truncate self-center hidden sm:block">
                      {log.subject}
                    </p>

                    {/* Date */}
                    <div className="text-right self-center whitespace-nowrap">
                      <p className="text-white/50 text-xs">
                        {sentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-white/30 text-[10px]">
                        {sentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="self-center text-right">
                      <span className={`text-xs font-bold ${log.status === "sent" ? "text-green-400" : "text-red-400"}`}>
                        {log.status === "sent" ? "✓ Sent" : "✗ Failed"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 ml-9 mr-4 mb-2 bg-white/[0.02] border border-white/5 rounded">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 divide-y divide-white/5 sm:divide-y-0">
                        <div className="space-y-1">
                          <DetailRow icon={Mail} label="To" value={log.to} />
                          <DetailRow icon={User} label="Recipient Name" value={log.recipientName || "—"} />
                          <DetailRow icon={FileText} label="Subject" value={log.subject} />
                        </div>
                        <div className="space-y-1 pt-2 sm:pt-0">
                          <DetailRow icon={Tag} label="Type" value={`${typeInfo.label} (${log.type})`} />
                          <DetailRow icon={Tag} label="Context" value={log.context || "—"} />
                          <DetailRow
                            icon={Clock}
                            label="Sent At"
                            value={sentDate.toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          />
                          {log.error && (
                            <DetailRow icon={AlertCircle} label="Error" value={log.error} />
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5">
                        <p className="text-white/20 text-[10px] font-mono">ID: {log.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-white/5 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Showing the last {Math.min(logs.length, 200)} emails. Click any row to see full details. All outbound emails are logged automatically.
        </p>
      </div>
    </div>
  );
}
