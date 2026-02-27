"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center border-b border-white/5">
            <div className="inline-flex items-center gap-1.5 mb-6">
              <span className="text-3xl font-serif font-bold text-white">G</span>
              <span className="text-gold text-2xl font-light">|</span>
              <span className="text-3xl font-serif font-bold text-white">C</span>
            </div>

            {isPaid ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-white mb-1">
                  Payment Received
                </h1>
                <p className="text-white/40 text-sm">Thank you for your payment.</p>
              </>
            ) : (
              <>
                <h1 className="font-serif text-2xl font-bold text-white mb-1">
                  Invoice
                </h1>
                <p className="text-white/40 text-sm">{invoice.description}</p>
              </>
            )}
          </div>

          {/* Details */}
          <div className="px-8 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/25 mb-1">
                  Billed To
                </p>
                <p className="text-white font-medium text-sm">
                  {invoice.recipientName}
                </p>
                <p className="text-white/40 text-xs">{invoice.recipientEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/25 mb-1">
                  Date
                </p>
                <p className="text-white/60 text-sm">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-[#0F172A] border border-white/5 rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-[10px] font-bold tracking-[2px] uppercase text-white/25">
                      Description
                    </th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold tracking-[2px] uppercase text-white/25">
                      Qty
                    </th>
                    <th className="text-right px-3 py-3 text-[10px] font-bold tracking-[2px] uppercase text-white/25">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold tracking-[2px] uppercase text-white/25">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-white/70">{item.description}</td>
                      <td className="px-2 py-3 text-white/50 text-center tabular-nums">
                        {item.quantity || 1}
                      </td>
                      <td className="px-3 py-3 text-white/50 text-right tabular-nums">
                        ${(item.unitPrice || item.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-right tabular-nums">
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal / Tax / Total */}
            <div className="space-y-2 py-4 border-t border-white/10">
              {(invoice.taxRate ?? 0) > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">Subtotal</span>
                    <span className="text-white/60 text-sm tabular-nums">
                      ${(invoice.subtotal ?? invoice.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">Tax ({invoice.taxRate}%)</span>
                    <span className="text-white/60 text-sm tabular-nums">
                      ${(invoice.taxAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/50 font-medium">Total</span>
                <span className="text-2xl font-bold text-gold tabular-nums">
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <p className="text-[10px] font-bold tracking-[2px] uppercase text-white/25 mb-2">
                  Notes
                </p>
                <p className="text-white/50 text-sm whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="px-8 pb-8">
            {isPaid ? (
              <div className="text-center py-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Paid
                </span>
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-gold text-white px-6 py-4 text-sm font-bold tracking-wider uppercase rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-white/5 text-center">
            <p className="text-white/20 text-xs">
              G|C Premier Property Group &middot; Jackson, Mississippi
            </p>
            <p className="text-white/20 text-xs mt-1">
              contactus@gcpremierproperties.com &middot; (601) 966-8308
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
