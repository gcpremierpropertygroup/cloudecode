import { NextRequest, NextResponse } from "next/server";
import { getGuestyService } from "@/lib/guesty";
import { getStripeClient } from "@/lib/stripe/client";
import { getNights, formatDate } from "@/lib/utils/dates";
import { getDailyPricing } from "@/lib/pricelabs/service";
import { trackEvent } from "@/lib/analytics";
import { getConfig } from "@/lib/admin/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    if (
      !propertyId ||
      !checkIn ||
      !checkOut ||
      !guests ||
      !guestName ||
      !guestEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = getGuestyService();
    const property = await service.getListing(propertyId);
    const numberOfNights = getNights(checkIn, checkOut);

    // Validate min stay
    if (numberOfNights < property.minStay) {
      return NextResponse.json(
        { error: "Minimum stay not met" },
        { status: 400 }
      );
    }

    // Use PriceLabs pricing (same source as what user sees)
    const dailyRates = await getDailyPricing(propertyId, checkIn, checkOut);

    let subtotal: number;
    if (dailyRates && dailyRates.length > 0) {
      subtotal = dailyRates.reduce((sum, d) => sum + d.rate, 0);
    } else {
      subtotal = property.pricing.baseNightlyRate * numberOfNights;
    }

    // Cleaning fee: Redis override → property default
    const cleaningFeeOverrides = await getConfig<Record<string, number>>("config:cleaning-fees", {});
    const cleaningFee = cleaningFeeOverrides[propertyId] ?? property.pricing.cleaningFee;
    const serviceFee = Math.round(subtotal * 0.08);
    const total = subtotal + cleaningFee + serviceFee;

    const stripe = getStripeClient();
    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com"
    ).trim().replace(/\/+$/, "");

    const successUrl = `${baseUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/properties/${property.slug}`;

    console.log("Checkout URLs:", { baseUrl, successUrl, cancelUrl });
    console.log("Checkout pricing:", { subtotal, cleaningFee, serviceFee, total, currency: property.pricing.currency });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: property.pricing.currency.toLowerCase(),
            product_data: {
              name: `${property.title} - ${numberOfNights} Night Stay`,
              description: `Check-in: ${formatDate(checkIn)} | Check-out: ${formatDate(checkOut)} | Guests: ${guests}`,
            },
            unit_amount: Math.round(total * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId,
        propertyTitle: property.title,
        checkIn,
        checkOut,
        guests: String(guests),
        guestName,
        guestEmail,
        guestPhone: guestPhone || "",
        total: String(total),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Track analytics (fire-and-forget)
    trackEvent({
      event: "checkout_started",
      propertyId,
      propertyTitle: property.title,
      amount: total,
      guestEmail,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
