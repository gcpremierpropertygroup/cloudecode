"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, RefreshCw } from "lucide-react";

const PROPERTY_OPTIONS = [
  { value: "prop-eastover-001", label: "The Eastover House" },
  { value: "prop-spacious-002", label: "Modern Retreat" },
  { value: "prop-pinelane-003", label: "Pine Lane" },
];

type EmailType = "booking-confirmation" | "check-in-reminder" | "review-request" | "contact-confirmation" | "assessment-confirmation";

const EMAIL_TYPES: { value: EmailType; label: string }[] = [
  { value: "booking-confirmation", label: "Booking Confirmation" },
  { value: "check-in-reminder", label: "Check-in Reminder" },
  { value: "review-request", label: "Review Request" },
  { value: "contact-confirmation", label: "Contact Confirmation" },
  { value: "assessment-confirmation", label: "Assessment Confirmation" },
];

export default function EmailPreviewSection({ token }: { token: string }) {
  const [emailType, setEmailType] = useState<EmailType>("booking-confirmation");
  const [selectedProperty, setSelectedProperty] = useState(PROPERTY_OPTIONS[0].value);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/email-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emailType, propertyId: selectedProperty }),
      });
      const data = await res.json();
      if (data.html) {
        setPreviewHtml(data.html);
      } else {
        setError(data.error || "Failed to load preview");
      }
    } catch {
      setError("Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [token, emailType, selectedProperty]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setError("Enter an email address");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/email-preview/send-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailType,
          recipientEmail: testEmail.trim(),
          propertyId: selectedProperty,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Test email sent to ${testEmail.trim()}`);
      } else {
        setError(data.error || "Failed to send test email");
      }
    } catch {
      setError("Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email type selector */}
      <div className="flex flex-wrap gap-2">
        {EMAIL_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setEmailType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              emailType === type.value
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Property selector (relevant for check-in reminder) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-white/30 text-xs font-bold tracking-[2px] uppercase">
          Property:
        </span>
        {PROPERTY_OPTIONS.map((prop) => (
          <button
            key={prop.value}
            onClick={() => setSelectedProperty(prop.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedProperty === prop.value
                ? "bg-white/10 text-white border border-white/20"
                : "text-white/40 border border-transparent hover:text-white/60"
            }`}
          >
            {prop.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Preview */}
      <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Preview</h3>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="text-white/30 hover:text-white/60 transition-colors p-1"
            title="Refresh preview"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading && !previewHtml ? (
          <div className="flex items-center justify-center h-96 text-white/30">
            Loading preview...
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-white/10">
            <iframe
              srcDoc={previewHtml}
              className="w-full bg-white"
              style={{ minHeight: 600 }}
              title="Email preview"
              sandbox=""
            />
          </div>
        )}
      </div>

      {/* Send test */}
      <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Send Test Email</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendTest()}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors text-sm"
          />
          <button
            onClick={handleSendTest}
            disabled={sending || !testEmail.trim()}
            className="flex items-center gap-2 bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sending ? "Sending..." : "Send Test"}
          </button>
        </div>
        <p className="text-white/20 text-xs mt-2">
          Sends a test version of the selected email to the address above
        </p>
      </div>
    </div>
  );
}
