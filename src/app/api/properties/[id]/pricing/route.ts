import { NextRequest, NextResponse } from "next/server";
import { getGuestyService } from "@/lib/guesty";
import { getNights } from "@/lib/utils/dates";
import { getDailyPricing } from "@/lib/pricelabs/service";

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

    const cleaningFee = property.pricing.cleaningFee;
    const serviceFee = Math.round(subtotal * 0.08);

    const pricing = {
      nightlyRate: avgNightlyRate,
      numberOfNights: nights,
      subtotal,
      cleaningFee,
      serviceFee,
      total: subtotal + cleaningFee + serviceFee,
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
