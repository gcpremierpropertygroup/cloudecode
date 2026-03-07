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
  Mail,
  Pencil,
  Ban,
} from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/lib/contracts/templates";
import type { Contract, ContractType } from "@/types/booking";

type View = "create" | "list" | "edit";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_LABELS: Record<ContractType, string> = {
  property_management: "Property Mgmt",
  lease_agreement: "Lease",
  service_contract: "Service",
  contract_acknowledgment: "Contract Ack.",
};

export default function ContractsSection({ token }: { token: string }) {
  const [view, setView] = useState<View>("create");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create form state
  const [contractType, setContractType] = useState<ContractType | "">("");
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [voiding, setVoiding] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.contracts) {
        setContracts(data.contracts);
      } else {
        setError(data.error || "Failed to load contracts");
      }
    } catch {
      setError("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === "list") {
      fetchContracts();
    }
  }, [view, fetchContracts]);

  const handleTemplateChange = (type: ContractType | "") => {
    setContractType(type);
    if (type) {
      const template = CONTRACT_TEMPLATES.find((t) => t.type === type);
      if (template) {
        setTitle(template.defaultTitle);
        setBody(template.body);
      }
    } else {
      setTitle("");
      setBody("");
    }
  };

  const resetForm = () => {
    setContractType("");
    setTitle("");
    setRecipientName("");
    setRecipientEmail("");
    setBody("");
    setNotes("");
    setCreatedUrl("");
    setError("");
  };

  const handleCreate = async (sendEmail: boolean) => {
    if (!contractType || !title || !recipientName || !recipientEmail || !body) {
      setError("Please fill in all required fields.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: contractType,
          title,
          recipientName,
          recipientEmail,
          body,
          notes: notes || undefined,
          sendEmail,
        }),
      });

      const data = await res.json();

      if (data.contractUrl) {
        setCreatedUrl(data.contractUrl);
      } else {
        setError(data.error || "Failed to create contract");
      }
    } catch {
      setError("Failed to create contract");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (contract: Contract) => {
    setContractType(contract.type);
    setTitle(contract.title);
    setRecipientName(contract.recipientName);
    setRecipientEmail(contract.recipientEmail);
    setBody(contract.body);
    setNotes(contract.notes || "");
    setEditingContractId(contract.id);
    setCreatedUrl("");
    setError("");
    setView("edit");
  };

  const handleUpdate = async () => {
    if (!editingContractId) return;

    if (!title || !recipientName || !recipientEmail || !body) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/contracts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingContractId,
          type: contractType,
          title,
          recipientName,
          recipientEmail,
          body,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (data.contract) {
        setEditingContractId(null);
        resetForm();
        setView("list");
      } else {
        setError(data.error || "Failed to update contract");
      }
    } catch {
      setError("Failed to update contract");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (contractId: string) => {
    setResending(contractId);
    try {
      await fetch("/api/admin/contracts/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contractId }),
      });
      // Refresh list to show updated status
      fetchContracts();
    } catch {
      // Silently fail
    } finally {
      setResending(null);
    }
  };

  const handleVoid = async (contractId: string) => {
    if (!confirm("Void this contract? The recipient will no longer be able to sign.")) return;
    setVoiding(contractId);
    try {
      const res = await fetch("/api/admin/contracts/void", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contractId }),
      });
      if (res.ok) {
        setContracts((prev) =>
          prev.map((c) =>
            c.id === contractId
              ? { ...c, status: "voided", voidedAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch {
      // Silently fail
    } finally {
      setVoiding(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { if (createdUrl) resetForm(); if (editingContractId) { setEditingContractId(null); resetForm(); } setView("create"); }}
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
          All Contracts
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
                  <p className="text-white font-medium">Contract Created!</p>
                  <p className="text-white/40 text-sm">
                    Share this link with the recipient to sign.
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
                Create another contract
              </button>
            </div>
          ) : (
            <div className="bg-[#1F2937] border border-white/10 rounded-lg p-6 space-y-5">
              {view === "edit" && (
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-2">
                  <Pencil size={14} className="text-gold" />
                  <span className="text-gold text-sm font-medium">Editing Contract #{editingContractId}</span>
                </div>
              )}

              {/* Template selector */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Contract Template
                </label>
                <select
                  value={contractType}
                  onChange={(e) => handleTemplateChange(e.target.value as ContractType | "")}
                  className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm"
                >
                  <option value="">Select a template...</option>
                  {CONTRACT_TEMPLATES.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Contract Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Property Management Agreement"
                  className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

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

              {/* Contract Body */}
              <div>
                <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                  Contract Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Contract content... Use {{PLACEHOLDERS}} for fields to fill in."
                  rows={16}
                  className="w-full px-4 py-3 bg-[#374151] border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors text-sm resize-none font-mono leading-relaxed"
                />
                <p className="text-white/20 text-xs mt-1">
                  Edit the template text above. Replace {"{{PLACEHOLDERS}}"} with actual values before sending.
                </p>
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
                    onClick={() => { setEditingContractId(null); resetForm(); setView("list"); }}
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
                    {creating ? "Creating..." : "Create & Send"}
                  </button>
                  <button
                    onClick={() => handleCreate(false)}
                    disabled={creating}
                    className="px-6 py-3 text-sm font-bold tracking-wider uppercase rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save size={14} />
                    Save as Draft
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
              onClick={fetchContracts}
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
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase text-white/40">
                      Title
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
                  {loading && contracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                        Loading...
                      </td>
                    </tr>
                  ) : contracts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-white/30">
                        No contracts yet
                      </td>
                    </tr>
                  ) : (
                    contracts.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white/50">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{c.recipientName}</p>
                          <p className="text-white/30 text-xs">{c.recipientEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-white/50">
                          {TYPE_LABELS[c.type]}
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {c.title}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === "signed"
                                ? "bg-green-500/10 text-green-400"
                                : c.status === "voided"
                                ? "bg-red-500/10 text-red-400"
                                : c.status === "viewed"
                                ? "bg-blue-500/10 text-blue-400"
                                : c.status === "sent"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-white/5 text-white/40"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleCopy(`${window.location.origin}/contract/${c.id}`)
                              }
                              className="p-1.5 text-white/30 hover:text-white/60 transition-colors"
                              title="Copy link"
                            >
                              <Copy size={14} />
                            </button>
                            {c.status === "draft" && (
                              <button
                                onClick={() => startEdit(c)}
                                className="p-1.5 text-white/30 hover:text-gold transition-colors"
                                title="Edit contract"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                            {(c.status === "draft" || c.status === "sent" || c.status === "viewed") && (
                              <>
                                <button
                                  onClick={() => handleSend(c.id)}
                                  disabled={resending === c.id}
                                  className="p-1.5 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                                  title={c.status === "draft" ? "Send" : "Resend email"}
                                >
                                  <Mail
                                    size={14}
                                    className={resending === c.id ? "animate-pulse" : ""}
                                  />
                                </button>
                                <button
                                  onClick={() => handleVoid(c.id)}
                                  disabled={voiding === c.id}
                                  className="p-1.5 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                                  title="Void contract"
                                >
                                  <Ban
                                    size={14}
                                    className={voiding === c.id ? "animate-pulse" : ""}
                                  />
                                </button>
                              </>
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
