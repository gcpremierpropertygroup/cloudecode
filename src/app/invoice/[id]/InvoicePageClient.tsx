"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Invoice } from "@/types/booking";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoicePageClient({
  invoice,
  justPaid,
}: {
  invoice: Invoice | null;
  justPaid: boolean;
}) {
  const [loading, setLoading] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="text-center">
          <FileText size={48} className="text-white/20 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            Invoice Not Found
          </h1>
          <p className="text-white/40">
            This invoice may have been removed or the link is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "paid" || justPaid;

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        alert("Failed to start checkout. Please try again.");
      }
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[520px]">
        {/* Gold top accent */}
        <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent rounded-t-2xl" />

        <div className="bg-[#111827] border border-white/[0.06] rounded-b-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center">
            <Image
              src="/images/gc-logo-white.png"
              alt="G|C Premier Property Group"
              width={140}
              height={71}
              className="mx-auto mb-8 opacity-90"
              priority
            />

            {isPaid ? (
              <>
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={30} className="text-green-400" />
                </div>
                <h1 className="font-serif text-[26px] font-bold text-white mb-2 tracking-tight">
                  Payment Received
                </h1>
                <p className="text-white/40 text-sm">Thank you for your payment.</p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-[26px] font-bold text-white mb-2 tracking-tight">
                  Invoice
                </h1>
                <p className="text-white/35 text-sm">{invoice.description}</p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Billed To / Date */}
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-gold/50 mb-1.5">
                  Billed To
                </p>
                <p className="text-white font-medium text-[15px]">
                  {invoice.recipientName}
                </p>
                <p className="text-white/30 text-xs mt-0.5">{invoice.recipientEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-gold/50 mb-1.5">
                  Date
                </p>
                <p className="text-white/50 text-sm">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="mx-8 mb-6 bg-[#0B0F1A] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.04]">
              <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-gold/50">
                Items
              </p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {invoice.lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-[18px]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-white/85 font-medium truncate">{item.description}</p>
                    <p className="text-xs text-white/25 mt-1 tabular-nums">
                      {item.quantity || 1} &times; ${(item.unitPrice || item.amount).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-[15px] text-white font-semibold tabular-nums ml-6 shrink-0">
                    ${item.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal / Tax / Processing Fee / Total */}
          <div className="mx-8 mb-8 space-y-2.5">
            {((invoice.taxRate ?? 0) > 0 || (invoice.processingFee ?? 0) > 0) && (
              <>
                <div className="flex justify-between items-center px-1">
                  <span className="text-white/30 text-sm">Subtotal</span>
                  <span className="text-white/45 text-sm tabular-nums">
                    ${(invoice.subtotal ?? invoice.total).toFixed(2)}
                  </span>
                </div>
                {(invoice.taxRate ?? 0) > 0 && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-white/30 text-sm">Tax ({invoice.taxRate}%)</span>
                    <span className="text-white/45 text-sm tabular-nums">
                      ${(invoice.taxAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {(invoice.processingFee ?? 0) > 0 && (
                  <div className="flex justify-between items-center px-1">
                    <span className="text-white/30 text-sm">Processing Fee</span>
                    <span className="text-white/45 text-sm tabular-nums">
                      ${(invoice.processingFee ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              </>
            )}
            <div className="flex justify-between items-center px-1 pt-1">
              <span className="text-white/50 font-medium text-[15px]">Total Due</span>
              <span className="text-[28px] font-bold text-gold tabular-nums tracking-tight">
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mx-8 mb-8 p-5 bg-gold/[0.04] border border-gold/[0.08] rounded-xl">
              <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-gold/50 mb-2">
                Notes
              </p>
              <p className="text-white/45 text-sm leading-relaxed whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Action */}
          <div className="px-8 pb-8">
            {isPaid ? (
              <div className="text-center py-4">
                <span className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/15 text-green-400 text-sm font-semibold">
                  <CheckCircle2 size={18} />
                  Payment Complete
                </span>
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={loading}
                className="group w-full bg-gold text-[#0B0F1A] px-6 py-4 text-sm font-bold tracking-[1.5px] uppercase rounded-xl hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-lg shadow-gold/10"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  `Pay $${invoice.total.toFixed(2)}`
                )}
              </button>
            )}
            <p className="text-center text-white/15 text-[11px] mt-3 tracking-wide">
              Secure payment powered by Stripe
            </p>
          </div>

          {/* Footer */}
          <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          <div className="px-8 py-7 text-center">
            <p className="text-white/15 text-[11px] tracking-wide">
              G|C Premier Property Group &middot; Jackson, Mississippi
            </p>
            <p className="text-white/15 text-[11px] mt-1.5 tracking-wide">
              contactus@gcpremierproperties.com &middot; (601) 966-8308
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
