import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import {
  sendBookingConfirmation,
  sendCheckInReminderEmail,
  sendReviewRequestEmail,
  sendAssessmentEmail,
  sendContactEmail,
  sendInvoiceEmail,
  sendInvoicePaymentConfirmation,
  sendContractEmail,
} from "@/lib/email";
import { getCheckInInstructions } from "@/lib/email/scheduling";

const PROPERTY_TITLES: Record<string, string> = {
  "prop-eastover-001": "The Eastover House",
  "prop-spacious-002": "Modern Retreat",
  "prop-pinelane-003": "Pine Lane",
};

function getNextFriday() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function getNextSunday() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + 2);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com")
  .trim()
  .replace(/\/+$/, "");

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailType, recipientEmail, propertyId } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "recipientEmail is required" },
        { status: 400 }
      );
    }

    const propertyTitle = PROPERTY_TITLES[propertyId] || "The Eastover House";
    const checkIn = getNextFriday();
    const checkOut = getNextSunday();

    // ── Bookings ────────────────────────────────────────────────────────
    if (emailType === "booking-confirmation") {
      await sendBookingConfirmation({
        guestName: "Test Guest",
        guestEmail: recipientEmail,
        propertyTitle,
        checkIn,
        checkOut,
        guests: "2",
        total: "450.00",
      });

    } else if (emailType === "check-in-reminder") {
      const instructions = propertyId ? await getCheckInInstructions(propertyId) : null;
      await sendCheckInReminderEmail({
        guestName: "Test Guest",
        guestEmail: recipientEmail,
        propertyTitle,
        checkIn,
        checkOut,
        checkInTime: instructions?.checkInTime || "3:00 PM",
        checkOutTime: instructions?.checkOutTime || "11:00 AM",
        wifiName: instructions?.wifiName || "GC-Guest",
        wifiPassword: instructions?.wifiPassword || "welcome123",
        doorCode: instructions?.doorCode || "1234",
        parkingInfo: instructions?.parkingInfo || "Driveway parking",
        houseRules: instructions?.houseRules || "No smoking inside\nQuiet hours: 10 PM – 8 AM",
        specialNotes: instructions?.specialNotes || "",
      });

    } else if (emailType === "review-request") {
      await sendReviewRequestEmail({
        guestName: "Test Guest",
        guestEmail: recipientEmail,
        propertyTitle,
        checkOut,
      });

    // ── Invoices ────────────────────────────────────────────────────────
    } else if (emailType === "invoice") {
      await sendInvoiceEmail({
        recipientName: "Test Guest",
        recipientEmail,
        description: "Short-Term Rental Stay",
        lineItems: [
          {
            description: `${propertyTitle} — ${checkIn} to ${checkOut} (2 guests)`,
            quantity: 1,
            unitPrice: 450,
            amount: 450,
          },
          {
            description: "Cleaning fee",
            quantity: 1,
            unitPrice: 75,
            amount: 75,
          },
        ],
        subtotal: 525,
        total: 525,
        invoiceUrl: `${BASE_URL}/invoice/inv_test000001`,
      });

    } else if (emailType === "invoice-payment-full") {
      await sendInvoicePaymentConfirmation({
        recipientName: "Test Guest",
        recipientEmail,
        description: "Short-Term Rental Stay",
        amount: 525,
        paymentType: "full",
        invoiceUrl: `${BASE_URL}/invoice/inv_test000001`,
      });

    } else if (emailType === "invoice-payment-deposit") {
      await sendInvoicePaymentConfirmation({
        recipientName: "Test Guest",
        recipientEmail,
        description: "Short-Term Rental Stay",
        amount: 262.50,
        paymentType: "deposit",
        invoiceUrl: `${BASE_URL}/invoice/inv_test000001`,
      });

    } else if (emailType === "invoice-payment-balance") {
      await sendInvoicePaymentConfirmation({
        recipientName: "Test Guest",
        recipientEmail,
        description: "Short-Term Rental Stay",
        amount: 262.50,
        paymentType: "balance",
        invoiceUrl: `${BASE_URL}/invoice/inv_test000001`,
      });

    // ── Contracts ───────────────────────────────────────────────────────
    } else if (emailType === "contract") {
      await sendContractEmail({
        recipientName: "Test Guest",
        recipientEmail,
        title: "Short-Term Rental Agreement",
        contractUrl: `${BASE_URL}/contract/ctr_test000001`,
      });

    // ── Leads ───────────────────────────────────────────────────────────
    } else if (emailType === "contact-confirmation") {
      await sendContactEmail({
        name: "Test User",
        email: recipientEmail,
        subject: "General Inquiry",
        message: "Hi, I'm interested in renting one of your properties. Could you send me more details?",
      });

    } else if (emailType === "assessment-confirmation") {
      await sendAssessmentEmail({
        firstName: "Jane",
        lastName: "Smith",
        email: recipientEmail,
        phone: "(601) 999-8888",
        address: "742 Magnolia Drive",
        city: "Jackson",
        state: "MS",
        zip: "39211",
        bedrooms: "3",
        bathrooms: "2",
        furnished: "Yes",
        onAirbnb: "No",
        notes: "Recently renovated, large backyard.",
        _ownerEmailOverride: "noreply-test@gcpremierproperties.com",
      });

    } else if (emailType === "assessment-owner") {
      await sendAssessmentEmail({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "(601) 999-8888",
        address: "742 Magnolia Drive",
        city: "Jackson",
        state: "MS",
        zip: "39211",
        bedrooms: "3",
        bathrooms: "2",
        furnished: "Yes",
        onAirbnb: "No",
        notes: "Recently renovated, large backyard.",
        _ownerEmailOverride: recipientEmail,
      });

    } else {
      return NextResponse.json({ error: "Invalid emailType" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send test email:", error);
    return NextResponse.json(
      { error: `Failed to send: ${String(error)}` },
      { status: 500 }
    );
  }
}
