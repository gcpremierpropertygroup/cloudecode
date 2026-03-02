import React from "react";
import fs from "fs";
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

const NAVY     = "#0B0F1A";
const CARD     = "#111827";
const GOLD     = "#D4A853";
const WHITE    = "#FFFFFF";
const WHITE50  = "rgba(255,255,255,0.5)";
const WHITE25  = "rgba(255,255,255,0.25)";
const WHITE08  = "rgba(255,255,255,0.08)";
const GOLD15   = "rgba(212,168,83,0.15)";
const GOLD25   = "rgba(212,168,83,0.25)";
const GREEN    = "#6EE7B7";
const GREEN_BG = "#065F46";
const BLUE     = "#93C5FD";
const BLUE_BG  = "#1E3A5F";

const s = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: WHITE,
  },
  topBar: {
    height: 3,
    backgroundColor: GOLD,
  },
  content: {
    padding: 44,
    paddingBottom: 80,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: {
    width: 140,
    height: 28,
    objectFit: "contain",
  },
  invoiceLabel: {
    fontSize: 30,
    fontFamily: "Times-Roman",
    color: GOLD,
    letterSpacing: 3,
  },
  invoiceId: {
    fontSize: 8,
    color: WHITE25,
    marginTop: 4,
    textAlign: "right",
  },
  badgePaid: {
    backgroundColor: GREEN_BG,
    color: GREEN,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    textAlign: "center",
  },
  badgePartial: {
    backgroundColor: BLUE_BG,
    color: BLUE,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    textAlign: "center",
  },
  // Divider under header
  headerDivider: {
    height: 1,
    backgroundColor: WHITE08,
    marginBottom: 28,
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
    color: GOLD,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  metaSubValue: {
    fontSize: 9,
    color: WHITE50,
    marginTop: 2,
  },
  // Table
  tableContainer: {
    backgroundColor: CARD,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: WHITE08,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: WHITE08,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  colDesc:   { flex: 1 },
  colQty:    { width: 50, textAlign: "center" },
  colUnit:   { width: 80, textAlign: "right" },
  colAmount: { width: 80, textAlign: "right" },
  cellText: { fontSize: 10, color: WHITE },
  cellMuted: { fontSize: 10, color: WHITE50 },
  cellBold:  { fontSize: 10, fontFamily: "Helvetica-Bold", color: WHITE },
  // Totals
  totalsContainer: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 300,
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: WHITE50,
    flex: 1,
  },
  totalValue: {
    fontSize: 10,
    color: WHITE,
    width: 100,
    textAlign: "right",
  },
  totalDivider: {
    width: 300,
    height: 1,
    backgroundColor: GOLD25,
    marginVertical: 8,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 300,
    paddingVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    width: 160,
    textAlign: "right",
  },
  // Payment schedule
  scheduleBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: WHITE08,
    borderRadius: 8,
  },
  scheduleTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  scheduleLabel: {
    fontSize: 10,
    color: WHITE50,
  },
  scheduleValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  scheduleValuePaid: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
  },
  // Notes
  notesBox: {
    marginTop: 16,
    padding: 14,
    backgroundColor: GOLD15,
    borderWidth: 1,
    borderColor: GOLD25,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: WHITE50,
    lineHeight: 1.6,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: GOLD25,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: WHITE25,
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

function loadLogo(): string | undefined {
  try {
    const buffer = fs.readFileSync(
      path.join(process.cwd(), "public/images/gc-logo-white.png")
    );
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const isSplit = invoice.splitPayment && (invoice.depositAmount ?? 0) > 0;
  const depositPaid = (invoice.payments ?? []).some((p) => p.type === "deposit");
  const isFullyPaid = invoice.status === "paid";
  const isPartiallyPaid = invoice.status === "partially_paid";
  const logoSrc = loadLogo();

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Gold top bar */}
        <View style={s.topBar} />

        <View style={s.content}>
          {/* Header */}
          <View style={s.header}>
            {logoSrc ? (
              <Image src={logoSrc} style={s.logo} />
            ) : (
              <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: WHITE }}>
                G|C Premier Property Group
              </Text>
            )}
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.invoiceLabel}>INVOICE</Text>
              <Text style={s.invoiceId}>#{invoice.id}</Text>
              {isFullyPaid && <Text style={s.badgePaid}>PAID</Text>}
              {isPartiallyPaid && <Text style={s.badgePartial}>DEPOSIT PAID</Text>}
            </View>
          </View>

          {/* Divider */}
          <View style={s.headerDivider} />

          {/* Meta row */}
          <View style={s.metaRow}>
            <View>
              <Text style={s.metaLabel}>Billed To</Text>
              <Text style={s.metaValue}>{invoice.recipientName}</Text>
              {invoice.recipientEmail && invoice.recipientEmail !== "N/A" && (
                <Text style={s.metaSubValue}>{invoice.recipientEmail}</Text>
              )}
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaSubValue}>{formatDate(invoice.createdAt)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.metaLabel}>Description</Text>
              <Text style={s.metaSubValue}>{invoice.description}</Text>
            </View>
          </View>

          {/* Line items table */}
          <View style={s.tableContainer}>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
              <Text style={[s.tableHeaderText, s.colQty]}>Qty</Text>
              <Text style={[s.tableHeaderText, s.colUnit]}>Unit Price</Text>
              <Text style={[s.tableHeaderText, s.colAmount]}>Amount</Text>
            </View>
            {invoice.lineItems.map((item, i) => (
              <View key={i} style={s.tableRow}>
                <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
                <Text style={[s.cellMuted, s.colQty]}>{item.quantity || 1}</Text>
                <Text style={[s.cellMuted, s.colUnit]}>
                  ${fmt(item.unitPrice || item.amount)}
                </Text>
                <Text style={[s.cellBold, s.colAmount]}>${fmt(item.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={s.totalsContainer}>
            {((invoice.taxRate ?? 0) > 0 || (invoice.processingFeeRate ?? 0) > 0) && (
              <>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Subtotal</Text>
                  <Text style={s.totalValue}>
                    ${fmt(invoice.subtotal ?? invoice.total)}
                  </Text>
                </View>
                {(invoice.taxRate ?? 0) > 0 && (
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                    <Text style={s.totalValue}>${fmt(invoice.taxAmount ?? 0)}</Text>
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

          {/* Payment schedule */}
          {isSplit && (
            <View style={s.scheduleBox}>
              <Text style={s.scheduleTitle}>Payment Schedule</Text>
              <View style={s.scheduleRow}>
                <Text style={s.scheduleLabel}>
                  Deposit ({invoice.depositPercentage}%)
                  {depositPaid || isPartiallyPaid ? "  \u2713" : ""}
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
                <Text style={isFullyPaid ? s.scheduleValuePaid : s.scheduleValue}>
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
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>G|C Premier Property Group</Text>
          <Text style={s.footerText}>
            contactus@gcpremierproperties.com | (601) 966-8308
          </Text>
        </View>
      </Page>
    </Document>
  );
}
