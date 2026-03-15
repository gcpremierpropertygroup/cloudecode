"use client";

import { useState, useRef } from "react";
import { Paperclip, X, Send, Plus } from "lucide-react";

interface Attachment {
  file: File;
  id: string;
}

export default function DraftEmailSection({ token }: { token: string }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ccOpen, setCcOpen] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    if (!to.trim()) {
      setError("Recipient email is required");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!body.trim()) {
      setError("Email body is required");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("to", to.trim());
      formData.append("subject", subject.trim());
      formData.append("body", body.trim());
      if (cc.trim()) formData.append("cc", cc.trim());
      if (bcc.trim()) formData.append("bcc", bcc.trim());
      attachments.forEach((a) => {
        formData.append("attachments", a.file);
      });

      const res = await fetch("/api/admin/draft-email", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setSuccess("Email sent successfully!");
        setTo("");
        setSubject("");
        setBody("");
        setCc("");
        setBcc("");
        setAttachments([]);
        setCcOpen(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to send email");
      }
    } catch {
      setError("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    setTo("");
    setSubject("");
    setBody("");
    setCc("");
    setBcc("");
    setAttachments([]);
    setError("");
    setSuccess("");
    setCcOpen(false);
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <div className="bg-[#1F2937] border border-white/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Compose Email</h2>
          {(to || subject || body) && (
            <button
              onClick={handleClear}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* To */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40">
              To
            </label>
            {!ccOpen && (
              <button
                onClick={() => setCcOpen(true)}
                className="text-white/30 text-xs hover:text-white/60 transition-colors"
              >
                CC / BCC
              </button>
            )}
          </div>
          <input
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* CC / BCC */}
        {ccOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                CC
              </label>
              <input
                type="email"
                placeholder="cc@example.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                BCC
              </label>
              <input
                type="email"
                placeholder="bcc@example.com"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
            Subject
          </label>
          <input
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
            Message
          </label>
          <textarea
            rows={12}
            placeholder="Write your email here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-[#374151] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
            Attachments
          </label>

          {attachments.length > 0 && (
            <div className="space-y-2 mb-3">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-[#374151] border border-white/10 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip size={14} className="text-gold shrink-0" />
                    <span className="text-white text-sm truncate">
                      {a.file.name}
                    </span>
                    <span className="text-white/30 text-xs shrink-0">
                      {formatFileSize(a.file.size)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="text-white/30 hover:text-red-400 transition-colors ml-3 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAttach}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors text-sm"
          >
            <Plus size={14} />
            Add attachment
          </button>

          <p className="text-white/20 text-xs mt-2">
            Max 10 MB per attachment. Supported: PDF, images, documents.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 bg-gold text-white px-6 py-3 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
