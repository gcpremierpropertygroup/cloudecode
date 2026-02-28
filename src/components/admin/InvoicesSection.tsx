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
  Pencil,
} from "lucide-react";
import { INVOICE_DESCRIPTION_PRESETS } from "@/lib/constants";
import type { Invoice } from "@/types/booking";

type View = "create" | "list" | "edit";

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
  const [lineItems, setLineItems] = useState([{ description: "", quantity: "1", unitPrice: "" }]);
  const [taxRate, setTaxRate] = useState("");
  const [processingFeeRate, setProcessingFeeRate] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState("50");
  const [resending, setResending] = useState<string | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const subtotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const taxPct = parseFloat(taxRate) || 0;
  const taxAmount = subtotal * (taxPct / 100);
  const feePct = parseFloat(processingFeeRate) || 0;
  const feeAmount = subtotal * (feePct / 100);
  const total = subtotal + taxAmount + feeAmount;
  const depPct = parseFloat(depositPercentage) || 0;
  const depositAmt = splitPayment && depPct > 0 ? Math.round(total * (depPct / 100) * 100) / 100 : 0;
  const balanceAmt = splitPayment && depPct > 0 ? Math.round((total - depositAmt) * 100) / 100 : 0;

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (
    index: number,
    field: "description" | "quantity" | "unitPrice",
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
    setLineItems([{ description: "", quantity: "1", unitPrice: "" }]);
    setTaxRate("");
    setProcessingFeeRate("");
    setSplitPayment(false);
    setDepositPercentage("50");
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
      (item) => item.description && (parseFloat(item.quantity) || 0) > 0 && (parseFloat(item.unitPrice) || 0) > 0
    );
    if (validItems.length === 0) {
      setError("Please add at least one line item with description, quantity, and price.");
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
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          })),
          taxRate: taxPct > 0 ? taxPct : undefined,
          processingFeeRate: feePct > 0 ? feePct : undefined,
          splitPayment: splitPayment && depPct > 0 && depPct < 100 ? true : undefined,
          depositPercentage: splitPayment && depPct > 0 && depPct < 100 ? depPct : undefined,
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

  const startEdit = (invoice: Invoice) => {
    setRecipientName(invoice.recipientName);
    setRecipientEmail(invoice.recipientEmail);
    // Check if the description matches a preset or is custom
    const isPreset = INVOICE_DESCRIPTION_PRESETS.some((group) =>
      group.options.includes(invoice.description)
    );
    if (isPreset) {
      setDescription(invoice.description);
      setCustomDescription("");
    } else {
      setDescription("__custom__");
      setCustomDescription(invoice.description);
    }
    setLineItems(
      invoice.lineItems.map((item) => ({
        description: item.description,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      }))
    );
    setTaxRate(invoice.taxRate ? String(invoice.taxRate) : "");
    setProcessingFeeRate(invoice.processingFeeRate ? String(invoice.processingFeeRate) : "");
    setSplitPayment(invoice.splitPayment || false);
    setDepositPercentage(invoice.depositPercentage ? String(invoice.depositPercentage) : "50");
    setNotes(invoice.notes || "");
    setEditingInvoiceId(invoice.id);
    setCreatedUrl("");
    setError("");
    setView("edit");
  };

  const handleUpdate = async () => {
    if (!editingInvoiceId) return;

    const finalDescription =
      description === "__custom__" ? customDescription : description;

    if (!recipientName || !recipientEmail || !finalDescription) {
      setError("Please fill in recipient name, email, and description.");
      return;
    }

    const validItems = lineItems.filter(
      (item) =>
        item.description &&
        (parseFloat(item.quantity) || 0) > 0 &&
        (parseFloat(item.unitPrice) || 0) > 0
    );
    if (validItems.length === 0) {
      setError("Please add at least one line item with description, quantity, and price.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingInvoiceId,
          recipientName,
          recipientEmail,
          description: finalDescription,
          lineItems: validItems.map((item) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          })),
          taxRate: taxPct > 0 ? taxPct : undefined,
          processingFeeRate: feePct > 0 ? feePct : undefined,
          splitPayment: splitPayment && depPct > 0 && depPct < 100 ? true : undefined,
          depositPercentage: splitPayment && depPct > 0 && depPct < 100 ? depPct : undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (data.invoice) {
        setEditingInvoiceId(null);
        resetForm();
        setView("list");
      } else {
        setError(data.error || "Failed to update invoice");
      }
    } catch {
      setError("Failed to update invoice");
    } finally {
      setSaving(false);
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
          onClick={() => { if (createdUrl) resetForm(); if (editingInvoiceId) { setEditingInvoiceId(null); resetForm(); } setView("create"); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === "create" || view === "edit"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "bg-[#1F2937] text-white/50 border border-white/10 hover:text-white/80"
          }`}
        >
          {view === "edit" ? <Pencil size={14} /> : <Plus size={14} />}
          {view === "edit" ? "Editing" : "Create"}
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

      {/* ─── Create / Edit View ─── */}
      {(view === "create" || view === "edit") && (
        <div className="space-y-6">
          {createdUrl && view === "create" ? (
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
              {view === "edit" && (
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-2">
                  <Pencil size={14} className="text-gold" />
                  <span className="text-gold text-sm font-medium">Editing Invoice #{editingInvoiceId}</span>
                </div>
              )}
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
                {/* Column headers */}
                <div className="flex gap-2 mb-1 px-1">
                  <span className="flex-1 text-[10px] font-bold tracking-[1.5px] uppercase text-white/25">Description</span>
                  <span className="w-16 text-[10px] font-bold tracking-[1.5px] uppercase text-white/25 text-center">Qty</span>
                  <span className="w-28 text-[10px] font-bold tracking-[1.5px] uppercase text-white/25 text-right">Unit Price</span>
                  <span className="w-24 text-[10px] font-bold tracking-[1.5px] uppercase text-white/25 text-right">Total</span>
                  {lineItems.length > 1 && <span className="w-10" />}
                </div>
                <div className="space-y-2">
                  {lineItems.map((item, i) => {
                    const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
                    return (
                      <div key={i} className="flex gap-2 items-center">
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
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(i, "quantity", e.target.value)
                          }
                          placeholder="1"
                          min="1"
                          step="1"
                          className="w-16 px-2 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-center"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(i, "unitPrice", e.target.value)
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-28 px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-right"
                        />
                        <span className="w-24 text-right text-sm text-white/50 font-medium tabular-nums">
                          ${lineTotal.toFixed(2)}
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(i)}
                            className="p-3 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={addLineItem}
                  className="mt-2 text-gold text-sm hover:underline flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add line item
                </button>
              </div>

              {/* Subtotal / Tax / Total */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Subtotal</span>
                  <span className="text-white/60 text-sm font-medium tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">Tax</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-20 px-3 py-1.5 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-right"
                    />
                    <span className="text-white/30 text-sm">%</span>
                  </div>
                  <span className="text-white/60 text-sm font-medium tabular-nums">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-sm">Processing Fee</span>
                    <input
                      type="number"
                      value={processingFeeRate}
                      onChange={(e) => setProcessingFeeRate(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-20 px-3 py-1.5 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-right"
                    />
                    <span className="text-white/30 text-sm">%</span>
                  </div>
                  <span className="text-white/60 text-sm font-medium tabular-nums">
                    ${feeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white/50 font-medium text-sm">Total</span>
                  <span className="text-xl font-bold text-gold tabular-nums">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Split Payment */}
              <div className="border-t border-white/10 pt-3 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitPayment}
                    onChange={(e) => setSplitPayment(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#374151] accent-gold"
                  />
                  <span className="text-white/60 text-sm font-medium">Split Payment (deposit + balance)</span>
                </label>
                {splitPayment && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-sm">Deposit</span>
                      <input
                        type="number"
                        value={depositPercentage}
                        onChange={(e) => setDepositPercentage(e.target.value)}
                        placeholder="50"
                        min="1"
                        max="99"
                        step="1"
                        className="w-20 px-3 py-1.5 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm text-right"
                      />
                      <span className="text-white/30 text-sm">%</span>
                    </div>
                    {total > 0 && depPct > 0 && depPct < 100 && (
                      <div className="bg-[#0F172A] border border-white/[0.06] rounded-lg p-3 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-xs">Deposit ({depPct}%)</span>
                          <span className="text-gold text-sm font-semibold tabular-nums">${depositAmt.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-xs">Balance ({100 - depPct}%)</span>
                          <span className="text-white/50 text-sm font-medium tabular-nums">${balanceAmt.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
              {view === "edit" ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => { setEditingInvoiceId(null); resetForm(); setView("list"); }}
                    disabled={saving}
                    className="px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
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
              )}
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
                                : inv.status === "partially_paid"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-gold/10 text-gold"
                            }`}
                          >
                            {inv.status === "partially_paid" ? "deposit paid" : inv.status}
                          </span>
                          {inv.splitPayment && inv.status === "pending" && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/30 ml-1">
                              split
                            </span>
                          )}
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
                                onClick={() => startEdit(inv)}
                                className="p-1.5 text-white/30 hover:text-gold transition-colors"
                                title="Edit invoice"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {(inv.status === "pending" || inv.status === "partially_paid") && (
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
