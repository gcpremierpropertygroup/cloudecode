"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  EmailSettings,
  CheckInInstructions,
  ScheduledEmail,
  SentEmailRecord,
} from "@/types/booking";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

const SUB_TABS = [
  { id: "settings", label: "Timing" },
  { id: "check-in", label: "Check-in Info" },
  { id: "queue", label: "Email Queue" },
  { id: "history", label: "Sent History" },
] as const;

type SubTabId = (typeof SUB_TABS)[number]["id"];

const DEFAULT_SETTINGS: EmailSettings = {
  reminderDaysBefore: 2,
  reviewDaysAfter: 3,
  reminderEnabled: true,
  reviewEnabled: true,
};

const EMPTY_INSTRUCTIONS: Omit<CheckInInstructions, "propertyId"> = {
  wifiName: "",
  wifiPassword: "",
  doorCode: "",
  parkingInfo: "",
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  houseRules: "",
  specialNotes: "",
};

export default function AutomatedEmailsSection({ token }: { token: string }) {
  const [subTab, setSubTab] = useState<SubTabId>("settings");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<EmailSettings>(DEFAULT_SETTINGS);

  // Check-in instructions state
  const [selectedProperty, setSelectedProperty] = useState("prop-eastover-001");
  const [instructions, setInstructions] = useState<Omit<CheckInInstructions, "propertyId">>(EMPTY_INSTRUCTIONS);
  const [allInstructions, setAllInstructions] = useState<Record<string, CheckInInstructions | null>>({});

  // Queue & history
  const [pendingEmails, setPendingEmails] = useState<ScheduledEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>([]);

  const fetchEmailData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/emails", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      if (data.pendingEmails) setPendingEmails(data.pendingEmails);
      if (data.sentEmails) setSentEmails(data.sentEmails);
    } catch {
      setError("Failed to load email data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchInstructions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/checkin-instructions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.instructions) {
        setAllInstructions(data.instructions);
      }
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    fetchEmailData();
    fetchInstructions();
  }, [fetchEmailData, fetchInstructions]);

  // Load instructions when property changes
  useEffect(() => {
    const existing = allInstructions[selectedProperty];
    if (existing) {
      const { propertyId: _, ...rest } = existing;
      setInstructions(rest);
    } else {
      setInstructions(EMPTY_INSTRUCTIONS);
    }
  }, [selectedProperty, allInstructions]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/emails", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSuccess("Email settings saved!");
      } else {
        setError("Failed to save settings");
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInstructions = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/checkin-instructions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          instructions,
        }),
      });
      if (res.ok) {
        setSuccess("Check-in instructions saved!");
        fetchInstructions();
      } else {
        setError("Failed to save instructions");
      }
    } catch {
      setError("Failed to save instructions");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEmail = async (emailId: string) => {
    if (!confirm("Cancel this scheduled email?")) return;
    try {
      const res = await fetch("/api/admin/emails", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailId }),
      });
      if (res.ok) fetchEmailData();
    } catch {
      setError("Failed to cancel email");
    }
  };

  const propLabel = (id: string) =>
    PROPERTY_OPTIONS.find((p) => p.value === id)?.label || id;

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); setSuccess(""); setError(""); }}
            className={`px-4 py-2 text-sm font-semibold tracking-wide transition-colors rounded-sm ${
              subTab === tab.id
                ? "bg-gold/20 text-gold"
                : "text-white/40 hover:text-white/60 bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Timing Settings */}
      {subTab === "settings" && (
        <div className="bg-[#1F2937] border border-white/10 p-6 space-y-6">
          <h2 className="text-white font-semibold text-lg">Email Timing</h2>

          {/* Check-in Reminder */}
          <div className="flex items-start gap-4">
            <button
              onClick={() => setSettings({ ...settings, reminderEnabled: !settings.reminderEnabled })}
              className={`mt-1 w-10 h-6 rounded-full flex items-center transition-colors ${
                settings.reminderEnabled ? "bg-green-500 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full mx-1" />
            </button>
            <div className="flex-1">
              <p className="text-white font-semibold">Check-in Reminder</p>
              <p className="text-white/40 text-sm mt-1">
                Sends guests their check-in details (WiFi, door code, rules) before arrival.
              </p>
              {settings.reminderEnabled && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-white/40 text-sm">Send</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={settings.reminderDaysBefore}
                    onChange={(e) => setSettings({ ...settings, reminderDaysBefore: Number(e.target.value) || 2 })}
                    className="w-16 px-3 py-2 bg-[#374151] border border-white/10 text-white text-center focus:outline-none focus:border-gold transition-colors"
                  />
                  <label className="text-white/40 text-sm">days before check-in</label>
                </div>
              )}
            </div>
          </div>

          {/* Review Request */}
          <div className="flex items-start gap-4 border-t border-white/10 pt-6">
            <button
              onClick={() => setSettings({ ...settings, reviewEnabled: !settings.reviewEnabled })}
              className={`mt-1 w-10 h-6 rounded-full flex items-center transition-colors ${
                settings.reviewEnabled ? "bg-green-500 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full mx-1" />
            </button>
            <div className="flex-1">
              <p className="text-white font-semibold">Review Request</p>
              <p className="text-white/40 text-sm mt-1">
                Asks guests to leave a review after their stay.
              </p>
              {settings.reviewEnabled && (
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-white/40 text-sm">Send</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={settings.reviewDaysAfter}
                    onChange={(e) => setSettings({ ...settings, reviewDaysAfter: Number(e.target.value) || 3 })}
                    className="w-16 px-3 py-2 bg-[#374151] border border-white/10 text-white text-center focus:outline-none focus:border-gold transition-colors"
                  />
                  <label className="text-white/40 text-sm">days after check-out</label>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <div className="bg-white/5 border border-white/5 p-4">
            <p className="text-white/30 text-xs">
              Emails are processed daily at 9:00 AM UTC via a Vercel cron job.
              When a guest books, reminder and review emails are automatically scheduled based on these settings.
            </p>
          </div>
        </div>
      )}

      {/* Check-in Instructions */}
      {subTab === "check-in" && (
        <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
          <h2 className="text-white font-semibold text-lg">Check-in Instructions</h2>

          {/* Property selector with config status */}
          <div className="flex flex-wrap gap-2">
            {PROPERTY_OPTIONS.map((p) => {
              const hasConfig = !!allInstructions[p.value];
              return (
                <button
                  key={p.value}
                  onClick={() => setSelectedProperty(p.value)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors rounded-sm ${
                    selectedProperty === p.value
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "text-white/40 hover:text-white/60 bg-white/5 border border-transparent"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${hasConfig ? "bg-green-400" : "bg-white/20"}`} />
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Check-in Time
              </label>
              <input
                type="text"
                placeholder="e.g. 3:00 PM"
                value={instructions.checkInTime}
                onChange={(e) => setInstructions({ ...instructions, checkInTime: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Check-out Time
              </label>
              <input
                type="text"
                placeholder="e.g. 11:00 AM"
                value={instructions.checkOutTime}
                onChange={(e) => setInstructions({ ...instructions, checkOutTime: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Door Code
              </label>
              <input
                type="text"
                placeholder="e.g. 1234"
                value={instructions.doorCode}
                onChange={(e) => setInstructions({ ...instructions, doorCode: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                WiFi Network Name
              </label>
              <input
                type="text"
                placeholder="e.g. GC-Guest"
                value={instructions.wifiName}
                onChange={(e) => setInstructions({ ...instructions, wifiName: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                WiFi Password
              </label>
              <input
                type="text"
                placeholder="WiFi password"
                value={instructions.wifiPassword}
                onChange={(e) => setInstructions({ ...instructions, wifiPassword: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Parking Info
              </label>
              <input
                type="text"
                placeholder="e.g. Driveway, 2 spots available"
                value={instructions.parkingInfo}
                onChange={(e) => setInstructions({ ...instructions, parkingInfo: e.target.value })}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              House Rules
            </label>
            <textarea
              rows={4}
              placeholder="No smoking inside&#10;No parties or events&#10;Quiet hours: 10 PM - 8 AM"
              value={instructions.houseRules}
              onChange={(e) => setInstructions({ ...instructions, houseRules: e.target.value })}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Special Notes
            </label>
            <textarea
              rows={3}
              placeholder="Any special instructions for this property"
              value={instructions.specialNotes}
              onChange={(e) => setInstructions({ ...instructions, specialNotes: e.target.value })}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSaveInstructions}
            disabled={saving}
            className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : `Save ${propLabel(selectedProperty)} Instructions`}
          </button>
        </div>
      )}

      {/* Email Queue */}
      {subTab === "queue" && (
        <div className="bg-[#1F2937] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Scheduled Emails</h2>
            <button
              onClick={fetchEmailData}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-white/40 text-sm">Loading...</p>
          ) : pendingEmails.length === 0 ? (
            <p className="text-white/40 text-sm">No emails scheduled. Emails are automatically queued when a booking is made.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Type</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Guest</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Property</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Scheduled</th>
                    <th className="text-right text-white/40 font-bold text-xs tracking-wider uppercase py-3" />
                  </tr>
                </thead>
                <tbody>
                  {pendingEmails.map((email) => (
                    <tr key={email.id} className="border-b border-white/5">
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-sm ${
                          email.type === "check-in-reminder"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-purple-500/15 text-purple-400"
                        }`}>
                          {email.type === "check-in-reminder" ? "Check-in" : "Review"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-white">{email.guestName}</span>
                        <span className="text-white/30 text-xs ml-2 hidden md:inline">{email.guestEmail}</span>
                      </td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">
                        {propLabel(email.propertyId)}
                      </td>
                      <td className="py-3 pr-4 text-white/60 text-xs">
                        {new Date(email.scheduledFor).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleCancelEmail(email.id)}
                          className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sent History */}
      {subTab === "history" && (
        <div className="bg-[#1F2937] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Sent Emails</h2>
            <button
              onClick={fetchEmailData}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-white/40 text-sm">Loading...</p>
          ) : sentEmails.length === 0 ? (
            <p className="text-white/40 text-sm">No emails sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Type</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Guest</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4 hidden md:table-cell">Property</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3 pr-4">Sent</th>
                    <th className="text-left text-white/40 font-bold text-xs tracking-wider uppercase py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sentEmails.map((email, i) => (
                    <tr key={`${email.id}-${i}`} className="border-b border-white/5">
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-sm ${
                          email.type === "check-in-reminder"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-purple-500/15 text-purple-400"
                        }`}>
                          {email.type === "check-in-reminder" ? "Check-in" : "Review"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-white">{email.guestName}</span>
                        <span className="text-white/30 text-xs ml-2 hidden md:inline">{email.guestEmail}</span>
                      </td>
                      <td className="py-3 pr-4 text-white/60 hidden md:table-cell">
                        {email.propertyTitle}
                      </td>
                      <td className="py-3 pr-4 text-white/60 text-xs">
                        {new Date(email.sentAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-bold ${
                          email.status === "sent" ? "text-green-400" : "text-red-400"
                        }`}>
                          {email.status === "sent" ? "Sent" : "Failed"}
                        </span>
                        {email.error && (
                          <span className="text-red-400/50 text-xs ml-2" title={email.error}>
                            (hover for error)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
