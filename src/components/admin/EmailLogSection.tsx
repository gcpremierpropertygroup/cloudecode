"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmailLogEntry } from "@/lib/email/logging";
import { Search, RefreshCw, Filter } from "lucide-react";

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

export default function EmailLogSection({ token }: { token: string }) {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

      {/* Logs table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4">
                    Type
                  </th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4">
                    To
                  </th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4 hidden lg:table-cell">
                    Subject
                  </th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4 hidden md:table-cell">
                    Context
                  </th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4">
                    Date
                  </th>
                  <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 px-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const typeInfo = getTypeInfo(log.type);
                  return (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-sm whitespace-nowrap ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          {log.recipientName && (
                            <p className="text-white text-sm font-medium truncate max-w-[160px]">
                              {log.recipientName}
                            </p>
                          )}
                          <p className="text-white/40 text-xs truncate max-w-[160px]">
                            {log.to}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <p className="text-white/60 text-xs truncate max-w-[200px]" title={log.subject}>
                          {log.subject}
                        </p>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-white/40 text-xs truncate max-w-[180px]" title={log.context}>
                          {log.context || "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="text-white/50 text-xs">
                          {new Date(log.sentAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-white/30 text-[10px]">
                          {new Date(log.sentAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold ${
                          log.status === "sent" ? "text-green-400" : "text-red-400"
                        }`}>
                          {log.status === "sent" ? "Sent" : "Failed"}
                        </span>
                        {log.error && (
                          <p className="text-red-400/50 text-[10px] mt-0.5 truncate max-w-[100px]" title={log.error}>
                            {log.error}
                          </p>
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

      {/* Info note */}
      <div className="bg-white/5 border border-white/5 p-4">
        <p className="text-white/30 text-xs">
          Showing the last {Math.min(logs.length, 200)} emails. All outbound emails (invoices, booking confirmations, contact forms, check-in reminders, review requests) are logged automatically.
        </p>
      </div>
    </div>
  );
}
