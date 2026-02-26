import { NextRequest, NextResponse } from "next/server";
import { getGuestyService } from "@/lib/guesty";
import { getNights } from "@/lib/utils/dates";
import { getDailyPricing } from "@/lib/pricelabs/service";
import { CUSTOM_DISCOUNTS } from "@/lib/constants";
import type { CustomDiscount } from "@/lib/constants";
import { getConfig } from "@/lib/admin/config";
import { validatePromoCode } from "@/lib/promo/service";
import { trackEvent } from "@/lib/analytics";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { checkIn, checkOut, guests } = body;

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "checkIn and checkOut are required" },
        { status: 400 }
      );
    }

    const nights = getNights(checkIn, checkOut);
    if (nights <= 0) {
      return NextResponse.json(
        { error: "checkOut must be after checkIn" },
        { status: 400 }
      );
    }

    // Track page view / pricing lookup (fire-and-forget)
    trackEvent({ event: "page_view", propertyId: id });

    const service = getGuestyService();
    const property = await service.getListing(id);

    // Check min stay
    if (nights < property.minStay) {
      return NextResponse.json(
        {
          error: "minimum_stay_not_met",
          message: `This property requires a minimum stay of ${property.minStay} nights.`,
          minNights: property.minStay,
        },
        { status: 400 }
      );
    }

    // Check guest count
    if (guests && guests > property.maxGuests) {
      return NextResponse.json(
        {
          error: "max_guests_exceeded",
          message: `This property accommodates up to ${property.maxGuests} guests.`,
          maxGuests: property.maxGuests,
        },
        { status: 400 }
      );
    }

    // Get daily pricing from PriceLabs + adjustments
    const dailyRates = await getDailyPricing(id, checkIn, checkOut);

    let subtotal: number;
    let avgNightlyRate: number;
    let dailyBreakdown: { date: string; rate: number }[] | undefined;

    if (dailyRates && dailyRates.length > 0) {
      // Use per-night dynamic pricing
      subtotal = dailyRates.reduce((sum, d) => sum + d.rate, 0);
      avgNightlyRate = Math.round(subtotal / dailyRates.length);
      dailyBreakdown = dailyRates;
    } else {
      // Fallback to flat mock rate
      avgNightlyRate = property.pricing.baseNightlyRate;
      subtotal = avgNightlyRate * nights;
    }

    // Length-of-stay discounts
    let discount: { percentage: number; amount: number; label: string } | undefined;
    if (nights >= 30) {
      const discountAmount = Math.round(subtotal * 0.3);
      discount = { percentage: 30, amount: discountAmount, label: "Monthly discount (30%)" };
    } else if (nights >= 7) {
      const discountAmount = Math.round(subtotal * 0.2);
      discount = { percentage: 20, amount: discountAmount, label: "Weekly discount (20%)" };
    }

    // Direct booking discount (10%) — does NOT stack with monthly discount
    // Monthly stays get 30% total, not 40%
    const applyDirectDiscount = !discount || discount.percentage < 30;
    const directBookingDiscountAmount = applyDirectDiscount ? Math.round(subtotal * 0.10) : 0;
    const directBookingDiscount = applyDirectDiscount
      ? {
          percentage: 10,
          amount: directBookingDiscountAmount,
          label: "Direct booking discount (10%)",
        }
      : undefined;

    const totalDiscount = directBookingDiscountAmount + (discount?.amount || 0);
    const discountedSubtotal = subtotal - totalDiscount;

    // Custom discounts (Redis + hardcoded fallback from constants.ts)
    let customDiscount: { amount: number; label: string } | undefined;
    const redisDiscounts = await getConfig<CustomDiscount[]>("config:custom-discounts", []);
    const allDiscounts = [...redisDiscounts, ...CUSTOM_DISCOUNTS];
    const matchingDiscount = allDiscounts.find((d) => {
      if (d.propertyId !== "*" && d.propertyId !== id) return false;
      if (d.start && checkIn < d.start) return false;
      if (d.end && checkOut > d.end) return false;
      return true;
    });
    if (matchingDiscount) {
      const amt = matchingDiscount.type === "percentage"
        ? Math.round(discountedSubtotal * (matchingDiscount.value / 100))
        : matchingDiscount.value;
      customDiscount = { amount: amt, label: matchingDiscount.label };
    }

    // Cleaning fee: Redis override → property default
    const cleaningFeeOverrides = await getConfig<Record<string, number>>("config:cleaning-fees", {});
    const cleaningFee = cleaningFeeOverrides[id] ?? property.pricing.cleaningFee;
    const afterCustomDiscount = discountedSubtotal - (customDiscount?.amount || 0);

    // Promo code discount (applied last, on already-discounted subtotal)
    let promoDiscount: { amount: number; label: string; code: string } | undefined;
    if (body.promoCode) {
      try {
        const promo = await validatePromoCode(body.promoCode, id);
        if (promo.valid && promo.discountType && promo.discountValue && promo.label && promo.code) {
          const baseForPromo = afterCustomDiscount;
          const amt = promo.discountType === "percentage"
            ? Math.round(baseForPromo * (promo.discountValue / 100))
            : Math.min(promo.discountValue, baseForPromo);
          promoDiscount = { amount: amt, label: promo.label, code: promo.code };
        }
      } catch (err) {
        console.warn("Promo code validation failed:", err);
      }
    }

    const afterPromoDiscount = afterCustomDiscount - (promoDiscount?.amount || 0);

    const pricing = {
      nightlyRate: avgNightlyRate,
      numberOfNights: nights,
      subtotal,
      ...(directBookingDiscount && { directBookingDiscount }),
      ...(discount && { discount }),
      ...(customDiscount && { customDiscount }),
      ...(promoDiscount && { promoDiscount }),
      cleaningFee,
      serviceFee: 0,
      total: afterPromoDiscount + cleaningFee,
      currency: property.pricing.currency,
      ...(dailyBreakdown && { dailyRates: dailyBreakdown }),
    };

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("Failed to calculate pricing:", error);
    return NextResponse.json(
      { error: "Failed to calculate pricing" },
      { status: 500 }
    );
  }
}
