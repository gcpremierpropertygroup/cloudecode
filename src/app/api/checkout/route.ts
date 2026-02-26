import { NextRequest, NextResponse } from "next/server";
import { getGuestyService } from "@/lib/guesty";
import { getStripeClient } from "@/lib/stripe/client";
import { getNights, formatDate } from "@/lib/utils/dates";
import { getDailyPricing } from "@/lib/pricelabs/service";
import { trackEvent } from "@/lib/analytics";
import { getConfig } from "@/lib/admin/config";
import { CUSTOM_DISCOUNTS } from "@/lib/constants";
import type { CustomDiscount } from "@/lib/constants";
import { validatePromoCode } from "@/lib/promo/service";

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

    // Length-of-stay discounts (must match pricing API)
    let discount: { percentage: number; amount: number; label: string } | undefined;
    if (numberOfNights >= 30) {
      const discountAmount = Math.round(subtotal * 0.3);
      discount = { percentage: 30, amount: discountAmount, label: "Monthly discount (30%)" };
    } else if (numberOfNights >= 7) {
      const discountAmount = Math.round(subtotal * 0.2);
      discount = { percentage: 20, amount: discountAmount, label: "Weekly discount (20%)" };
    }

    // Direct booking discount (10%) — does NOT stack with monthly discount
    const applyDirectDiscount = !discount || discount.percentage < 30;
    const directBookingDiscountAmount = applyDirectDiscount ? Math.round(subtotal * 0.10) : 0;

    const totalDiscount = directBookingDiscountAmount + (discount?.amount || 0);
    const discountedSubtotal = subtotal - totalDiscount;

    // Custom discounts (Redis + hardcoded fallback from constants.ts)
    let customDiscountAmount = 0;
    const redisDiscounts = await getConfig<CustomDiscount[]>("config:custom-discounts", []);
    const allDiscounts = [...redisDiscounts, ...CUSTOM_DISCOUNTS];
    const matchingDiscount = allDiscounts.find((d) => {
      if (d.propertyId !== "*" && d.propertyId !== propertyId) return false;
      if (d.start && checkIn < d.start) return false;
      if (d.end && checkOut > d.end) return false;
      return true;
    });
    if (matchingDiscount) {
      customDiscountAmount = matchingDiscount.type === "percentage"
        ? Math.round(discountedSubtotal * (matchingDiscount.value / 100))
        : matchingDiscount.value;
    }

    const afterCustomDiscount = discountedSubtotal - customDiscountAmount;

    // Promo code discount (applied last, on already-discounted subtotal)
    let promoDiscountAmount = 0;
    if (body.promoCode) {
      try {
        const promo = await validatePromoCode(body.promoCode, propertyId);
        if (promo.valid && promo.discountType && promo.discountValue) {
          promoDiscountAmount = promo.discountType === "percentage"
            ? Math.round(afterCustomDiscount * (promo.discountValue / 100))
            : Math.min(promo.discountValue, afterCustomDiscount);
        }
      } catch (err) {
        console.warn("Promo code validation failed during checkout:", err);
      }
    }

    const afterPromoDiscount = afterCustomDiscount - promoDiscountAmount;

    // Cleaning fee: Redis override → property default
    const cleaningFeeOverrides = await getConfig<Record<string, number>>("config:cleaning-fees", {});
    const cleaningFee = cleaningFeeOverrides[propertyId] ?? property.pricing.cleaningFee;
    const total = afterPromoDiscount + cleaningFee;

    const stripe = getStripeClient();
    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com"
    ).trim().replace(/\/+$/, "");

    const successUrl = `${baseUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/properties/${property.slug}`;

    console.log("Checkout URLs:", { baseUrl, successUrl, cancelUrl });
    console.log("Checkout pricing:", {
      subtotal,
      directBookingDiscount: directBookingDiscountAmount,
      lengthDiscount: discount?.amount || 0,
      customDiscount: customDiscountAmount,
      promoDiscount: promoDiscountAmount,
      cleaningFee,
      total,
      currency: property.pricing.currency,
    });

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
