"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  List,
  RefreshCw,
  Copy,
  Check,
  Send,
  Save,
  Trash2,
  Mail,
} from "lucide-react";
import { INVOICE_DESCRIPTION_PRESETS } from "@/lib/constants";
import type { Invoice } from "@/types/booking";

type View = "create" | "list";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoicesSection({ token }: { token: string }) {
  const [view, setView] = useState<View>("create");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [description, setDescription] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [lineItems, setLineItems] = useState([{ description: "", amount: "" }]);
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      } else {
        setError(data.error || "Failed to load invoices");
      }
    } catch {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === "list") {
      fetchInvoices();
    }
  }, [view, fetchInvoices]);

  const total = lineItems.reduce((sum, item) => {
    const amt = parseFloat(item.amount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const resetForm = () => {
    setRecipientName("");
    setRecipientEmail("");
    setDescription("");
    setCustomDescription("");
    setLineItems([{ description: "", amount: "" }]);
    setNotes("");
    setCreatedUrl("");
    setError("");
  };

  const handleCreate = async (sendEmail: boolean) => {
    const finalDescription =
      description === "__custom__" ? customDescription : description;

    if (!recipientName || !recipientEmail || !finalDescription) {
      setError("Please fill in recipient name, email, and description.");
      return;
    }

    const validItems = lineItems.filter(
      (item) => item.description && parseFloat(item.amount) > 0
    );
    if (validItems.length === 0) {
      setError("Please add at least one line item with a description and amount.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          description: finalDescription,
          lineItems: validItems.map((item) => ({
            description: item.description,
            amount: parseFloat(item.amount),
          })),
          notes: notes || undefined,
          sendEmail,
        }),
      });

      const data = await res.json();

      if (data.invoiceUrl) {
        setCreatedUrl(data.invoiceUrl);
      } else {
        setError(data.error || "Failed to create invoice");
      }
    } catch {
      setError("Failed to create invoice");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async (invoiceId: string) => {
    setResending(invoiceId);
    try {
      await fetch("/api/admin/invoices/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoiceId }),
      });
    } catch {
      // Silently fail — not critical
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "create"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
          }`}
        >
          <Plus size={14} />
          Create
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "list"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
          }`}
        >
          <List size={14} />
          All Invoices
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* ─── Create View ─── */}
      {view === "create" && (
        <div className="space-y-6">
          {createdUrl ? (
            <div className="bg-[#1F2937] border border-green-500/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Check size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Invoice Created!</p>
                  <p className="text-white/40 text-sm">
                    Share this link with the recipient.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={createdUrl}
                  className="flex-1 px-4 py-3 bg-[#0F172A] border border-white/10 rounded-lg text-white text-sm font-mono"
                />
                <button
                  onClick={() => handleCopy(createdUrl)}
                  className="px-4 py-3 bg-gold text-white rounded-lg hover:bg-gold-light transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                onClick={resetForm}
                className="text-gold text-sm hover:underline"
              >
                Create another invoice
              </button>
            </div>
          ) : (
            <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6 space-y-5">
              {/* Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Description
                </label>
                <select
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
                >
                  <option value="">Select a description...</option>
                  {INVOICE_DESCRIPTION_PRESETS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__custom__">Custom...</option>
                </select>
                {description === "__custom__" && (
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Enter custom description"
                    className="w-full mt-2 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                )}
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Line Items
                </label>
                <div className="space-y-2">
                  {lineItems.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(i, "description", e.target.value)
                        }
                        placeholder="Item description"
                        className="flex-1 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          updateLineItem(i, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-28 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-right"
                      />
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(i)}
                          className="p-3 text-white/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addLineItem}
                  className="mt-2 text-gold text-sm hover:underline flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add line item
                </button>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="text-white/50 font-medium text-sm">Total</span>
                <span className="text-xl font-bold text-gold">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes for the recipient..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleCreate(true)}
                  disabled={creating}
                  className="flex-1 bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {creating ? "Creating..." : "Create & Send Email"}
                </button>
                <button
                  onClick={() => handleCreate(false)}
                  disabled={creating}
                  className="px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} />
                  Create Only
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── List View ─── */}
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="text-white/30 hover:text-white/60 transition-colors p-2"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="bg-[#1F2937] border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-white/30"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-white/30"
                      >
                        No invoices yet
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 text-white/50">
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">
                            {inv.recipientName}
                          </p>
                          <p className="text-white/30 text-xs">
                            {inv.recipientEmail}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {inv.description}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          ${inv.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              inv.status === "paid"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-gold/10 text-gold"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleCopy(
                                  `${window.location.origin}/invoice/${inv.id}`
                                )
                              }
                              className="p-1.5 text-white/30 hover:text-white/60 transition-colors"
                              title="Copy link"
                            >
                              <Copy size={14} />
                            </button>
                            {inv.status === "pending" && (
                              <button
                                onClick={() => handleResend(inv.id)}
                                disabled={resending === inv.id}
                                className="p-1.5 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                                title="Resend email"
                              >
                                <Mail
                                  size={14}
                                  className={
                                    resending === inv.id ? "animate-pulse" : ""
                                  }
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
