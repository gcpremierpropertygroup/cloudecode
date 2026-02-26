"use client";

import { useState, useEffect, useCallback } from "react";
import type { CheckInInstructions } from "@/types/booking";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

const EMPTY_INSTRUCTIONS = {
  wifiName: "",
  wifiPassword: "",
  doorCode: "",
  parkingInfo: "",
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  houseRules: "",
  specialNotes: "",
};

export default function CheckInInstructionsSection({ token }: { token: string }) {
  const [selectedProperty, setSelectedProperty] = useState(PROPERTY_OPTIONS[0].value);
  const [allInstructions, setAllInstructions] = useState<Record<string, CheckInInstructions | null>>({});
  const [form, setForm] = useState(EMPTY_INSTRUCTIONS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/checkin-instructions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.instructions) {
        setAllInstructions(data.instructions);
      }
    } catch {
      setError("Failed to load instructions");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Sync form when property changes or data loads
  useEffect(() => {
    const current = allInstructions[selectedProperty];
    if (current) {
      setForm({
        wifiName: current.wifiName || "",
        wifiPassword: current.wifiPassword || "",
        doorCode: current.doorCode || "",
        parkingInfo: current.parkingInfo || "",
        checkInTime: current.checkInTime || "3:00 PM",
        checkOutTime: current.checkOutTime || "11:00 AM",
        houseRules: current.houseRules || "",
        specialNotes: current.specialNotes || "",
      });
    } else {
      setForm(EMPTY_INSTRUCTIONS);
    }
    setSuccess("");
    setError("");
  }, [selectedProperty, allInstructions]);

  const handleSave = async () => {
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
          instructions: form,
        }),
      });
      if (res.ok) {
        setSuccess("Instructions saved!");
        setAllInstructions((prev) => ({
          ...prev,
          [selectedProperty]: { propertyId: selectedProperty, ...form },
        }));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save instructions");
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const propertyLabel = PROPERTY_OPTIONS.find((p) => p.value === selectedProperty)?.label || "";

  if (loading && !Object.keys(allInstructions).length) {
    return <p className="text-white/40">Loading instructions...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Property selector */}
      <div className="flex flex-wrap gap-2">
        {PROPERTY_OPTIONS.map((prop) => {
          const isActive = selectedProperty === prop.value;
          const hasData = !!allInstructions[prop.value];
          return (
            <button
              key={prop.value}
              onClick={() => setSelectedProperty(prop.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
              }`}
            >
              {hasData && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
              {prop.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6 space-y-5">
          <h3 className="text-white font-semibold">Access &amp; Info</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Check-in Time
              </label>
              <input
                type="text"
                value={form.checkInTime}
                onChange={(e) => update("checkInTime", e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                Check-out Time
              </label>
              <input
                type="text"
                value={form.checkOutTime}
                onChange={(e) => update("checkOutTime", e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Door Code
            </label>
            <input
              type="text"
              value={form.doorCode}
              onChange={(e) => update("doorCode", e.target.value)}
              placeholder="e.g. 1027 ENTER"
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                WiFi Name
              </label>
              <input
                type="text"
                value={form.wifiName}
                onChange={(e) => update("wifiName", e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                WiFi Password
              </label>
              <input
                type="text"
                value={form.wifiPassword}
                onChange={(e) => update("wifiPassword", e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Parking Info
            </label>
            <input
              type="text"
              value={form.parkingInfo}
              onChange={(e) => update("parkingInfo", e.target.value)}
              placeholder="e.g. Driveway parking only, 2 spots available"
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              House Rules
            </label>
            <textarea
              value={form.houseRules}
              onChange={(e) => update("houseRules", e.target.value)}
              placeholder="One rule per line..."
              rows={4}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
              Special Notes
            </label>
            <textarea
              value={form.specialNotes}
              onChange={(e) => update("specialNotes", e.target.value)}
              placeholder="Any special instructions for this property..."
              rows={3}
              className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Instructions"}
          </button>
        </div>

        {/* Live email preview */}
        <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Email Preview</h3>
          <p className="text-white/30 text-xs mb-4">
            How the check-in reminder email will look to guests
          </p>
          <div className="rounded-lg overflow-hidden border border-white/10">
            <iframe
              srcDoc={buildPreviewHtml(form, propertyLabel)}
              className="w-full bg-white"
              style={{ minHeight: 500 }}
              title="Email preview"
              sandbox=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Build an HTML preview of the check-in reminder email using current form values */
function buildPreviewHtml(
  form: {
    doorCode: string;
    wifiName: string;
    wifiPassword: string;
    checkInTime: string;
    checkOutTime: string;
    parkingInfo: string;
    houseRules: string;
    specialNotes: string;
  },
  propertyTitle: string
) {
  const nextFriday = new Date();
  nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7 || 7));
  const nextSunday = new Date(nextFriday);
  nextSunday.setDate(nextSunday.getDate() + 2);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const detailRows = [
    form.doorCode && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Door Code</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace;font-size:18px;letter-spacing:2px">${form.doorCode}</td></tr>`,
    form.wifiName && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Network</td><td style="padding:12px;border-bottom:1px solid #eee">${form.wifiName}</td></tr>`,
    form.wifiPassword && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">WiFi Password</td><td style="padding:12px;border-bottom:1px solid #eee;font-family:monospace">${form.wifiPassword}</td></tr>`,
    form.checkInTime && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-in Time</td><td style="padding:12px;border-bottom:1px solid #eee">${form.checkInTime}</td></tr>`,
    form.checkOutTime && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Check-out Time</td><td style="padding:12px;border-bottom:1px solid #eee">${form.checkOutTime}</td></tr>`,
    form.parkingInfo && `<tr><td style="padding:12px;font-weight:bold;border-bottom:1px solid #eee;color:#333">Parking</td><td style="padding:12px;border-bottom:1px solid #eee">${form.parkingInfo}</td></tr>`,
  ]
    .filter(Boolean)
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5">
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
      <div style="background:#111;padding:30px;text-align:center">
        <h1 style="color:#5CBF6E;margin:0;font-size:24px">Your Stay is Coming Up!</h1>
        <p style="color:#999;margin:10px 0 0">G|C Premier Property Group</p>
      </div>
      <div style="padding:30px;background:#fff">
        <p style="color:#333">Hi Jane,</p>
        <p style="color:#333">We're excited to welcome you to <strong>${propertyTitle || "Your Property"}</strong>! Here's everything you need for your stay.</p>
        <div style="background:#f0fdf4;border-left:4px solid #5CBF6E;padding:16px;margin:20px 0">
          <p style="margin:0;font-weight:bold;color:#333">Stay Details</p>
          <p style="margin:8px 0 0;color:#555">Check-in: <strong>${fmt(nextFriday)}</strong></p>
          <p style="margin:4px 0 0;color:#555">Check-out: <strong>${fmt(nextSunday)}</strong></p>
        </div>
        ${detailRows ? `
        <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">Access &amp; Info</h3>
        <table style="border-collapse:collapse;width:100%;margin:0 0 20px">${detailRows}</table>
        ` : '<p style="color:#999;font-style:italic">Fill in the form to see access details here</p>'}
        ${form.houseRules ? `
        <h3 style="color:#5CBF6E;margin:24px 0 12px;font-size:16px">House Rules</h3>
        <div style="background:#f9f9f9;padding:16px;border-radius:4px">
          <p style="margin:0;color:#555;white-space:pre-wrap">${form.houseRules}</p>
        </div>` : ""}
        ${form.specialNotes ? `
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;margin:20px 0">
          <p style="margin:0;font-weight:bold;color:#333">Special Notes</p>
          <p style="margin:8px 0 0;color:#555;white-space:pre-wrap">${form.specialNotes}</p>
        </div>` : ""}
        <p style="color:#333;margin-top:24px">If you have any questions before your arrival, don't hesitate to reach out!</p>
        <hr style="border:none;border-top:1px solid #eee;margin:30px 0" />
        <p style="color:#999;font-size:12px;margin:0">G|C Premier Property Group<br/>Jackson, Mississippi<br/>contactus@gcpremierproperties.com | (601) 966-8308</p>
      </div>
    </div>
  </body></html>`;
}
