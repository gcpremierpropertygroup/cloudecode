import type { CalendarDay, PriceBreakdown } from "@/types/booking";
import { SERVICE_FEE_RATE } from "@/lib/constants";

export function computePriceBreakdown(
  calendarDays: CalendarDay[],
  cleaningFee: number,
  currency: string
): PriceBreakdown {
  const numberOfNights = calendarDays.length;
  const subtotal = calendarDays.reduce((sum, day) => sum + day.price, 0);
  const nightlyRate =
    numberOfNights > 0 ? Math.round(subtotal / numberOfNights) : 0;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + cleaningFee + serviceFee;

  return {
    nightlyRate,
    numberOfNights,
    subtotal,
    cleaningFee,
    serviceFee,
    total,
    currency,
  };
}
