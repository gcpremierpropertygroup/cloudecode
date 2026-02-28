import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@/types/booking";
import path from "path";

const NAVY = "#111827";
const ACCENT = "#0EA5E9";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#9CA3AF";
const BORDER = "#E5E7EB";
const TABLE_BG = "#F8FAFC";

const s = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: NAVY,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  invoiceLabel: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
  },
  invoiceId: {
    fontSize: 8,
    color: LIGHT_GRAY,
    marginTop: 4,
    textAlign: "right",
  },
  // Accent bar
  accentBar: {
    height: 3,
    backgroundColor: ACCENT,
    borderRadius: 2,
    marginBottom: 24,
  },
  // Meta row
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  metaSubValue: {
    fontSize: 9,
    color: LIGHT_GRAY,
    marginTop: 2,
  },
  // Status badge
  badgePaid: {
    backgroundColor: "#DEF7EC",
    color: "#03543F",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgePartial: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: TABLE_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  colDesc: { flex: 1 },
  colQty: { width: 50, textAlign: "center" },
  colUnit: { width: 80, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  cellText: { fontSize: 10, color: NAVY },
  cellMuted: { fontSize: 10, color: GRAY },
  cellBold: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  // Totals
  totalsContainer: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: GRAY,
    flex: 1,
  },
  totalValue: {
    fontSize: 10,
    color: NAVY,
    width: 80,
    textAlign: "right",
  },
  totalDivider: {
    width: 220,
    height: 1,
    backgroundColor: ACCENT,
    opacity: 0.3,
    marginVertical: 6,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    paddingVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    width: 100,
    textAlign: "right",
  },
  // Schedule
  scheduleBox: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: TABLE_BG,
  },
  scheduleTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  scheduleLabel: {
    fontSize: 10,
    color: GRAY,
  },
  scheduleValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  scheduleValuePaid: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  // Notes
  notesBox: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 8,
    backgroundColor: "#F0F9FF",
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: GRAY,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 36,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: LIGHT_GRAY,
  },
});

function fmt(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const isSplit =
    invoice.splitPayment && (invoice.depositAmount ?? 0) > 0;
  const depositPaid = (invoice.payments ?? []).some(
    (p) => p.type === "deposit"
  );
  const isFullyPaid = invoice.status === "paid";
  const isPartiallyPaid = invoice.status === "partially_paid";

  const logoPath = path.join(process.cwd(), "public/images/gc-logo.png");

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Image src={logoPath} style={s.logo} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.invoiceLabel}>INVOICE</Text>
            <Text style={s.invoiceId}>#{invoice.id}</Text>
            {isFullyPaid && <Text style={s.badgePaid}>PAID</Text>}
            {isPartiallyPaid && (
              <Text style={s.badgePartial}>DEPOSIT PAID</Text>
            )}
          </View>
        </View>

        {/* Accent bar */}
        <View style={s.accentBar} />

        {/* Meta */}
        <View style={s.metaRow}>
          <View>
            <Text style={s.metaLabel}>Billed To</Text>
            <Text style={s.metaValue}>{invoice.recipientName}</Text>
            {invoice.recipientEmail &&
              invoice.recipientEmail !== "N/A" && (
                <Text style={s.metaSubValue}>
                  {invoice.recipientEmail}
                </Text>
              )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.metaLabel}>Date</Text>
            <Text style={s.metaSubValue}>
              {formatDate(invoice.createdAt)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.metaLabel}>Description</Text>
            <Text style={s.metaSubValue}>{invoice.description}</Text>
          </View>
        </View>

        {/* Line items table */}
        <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" }}>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
            <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
            <Text style={[s.tableHeaderText, s.colUnit]}>Unit Price</Text>
            <Text style={[s.tableHeaderText, s.colAmount]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
              <Text style={[s.cellMuted, s.colQty]}>
                {item.quantity || 1}
              </Text>
              <Text style={[s.cellMuted, s.colUnit]}>
                ${fmt(item.unitPrice || item.amount)}
              </Text>
              <Text style={[s.cellBold, s.colAmount]}>
                ${fmt(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsContainer}>
          {((invoice.taxRate ?? 0) > 0 ||
            (invoice.processingFeeRate ?? 0) > 0) && (
            <>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalValue}>
                  ${fmt(invoice.subtotal ?? invoice.total)}
                </Text>
              </View>
              {(invoice.taxRate ?? 0) > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>
                    Tax ({invoice.taxRate}%)
                  </Text>
                  <Text style={s.totalValue}>
                    ${fmt(invoice.taxAmount ?? 0)}
                  </Text>
                </View>
              )}
              {(invoice.processingFeeRate ?? 0) > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>
                    Processing Fee ({invoice.processingFeeRate}%)
                  </Text>
                  <Text style={s.totalValue}>
                    ${fmt(invoice.processingFeeAmount ?? 0)}
                  </Text>
                </View>
              )}
              <View style={s.totalDivider} />
            </>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandTotalLabel}>Total</Text>
            <Text style={s.grandTotalValue}>${fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* Split payment schedule */}
        {isSplit && (
          <View style={s.scheduleBox}>
            <Text style={s.scheduleTitle}>Payment Schedule</Text>
            <View style={s.scheduleRow}>
              <Text style={s.scheduleLabel}>
                Deposit ({invoice.depositPercentage}%)
                {(depositPaid || isPartiallyPaid) ? "  \u2713" : ""}
              </Text>
              <Text
                style={
                  depositPaid || isPartiallyPaid
                    ? s.scheduleValuePaid
                    : s.scheduleValue
                }
              >
                ${fmt(invoice.depositAmount ?? 0)}
              </Text>
            </View>
            <View style={s.scheduleRow}>
              <Text style={s.scheduleLabel}>
                Balance ({100 - (invoice.depositPercentage ?? 0)}%)
                {isFullyPaid ? "  \u2713" : ""}
              </Text>
              <Text
                style={isFullyPaid ? s.scheduleValuePaid : s.scheduleValue}
              >
                ${fmt(invoice.balanceAmount ?? 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Notes</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            G|C Premier Property Group
          </Text>
          <Text style={s.footerText}>
            contactus@gcpremierproperties.com | (601) 966-8308
          </Text>
        </View>
      </Page>
    </Document>
  );
}
