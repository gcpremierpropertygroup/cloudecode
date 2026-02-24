import type { Property } from "@/types/property";
import type { CalendarDay, PriceBreakdown } from "@/types/booking";
import { MOCK_PROPERTIES } from "./mock-data";
import { computePriceBreakdown } from "@/lib/utils/pricing";
import { getDatesInRange } from "@/lib/utils/dates";
import { addDays, parseISO, format } from "date-fns";

export class MockGuestyService {
  async getListings(): Promise<Property[]> {
    return MOCK_PROPERTIES;
  }

  async getListing(id: string): Promise<Property> {
    const property = MOCK_PROPERTIES.find((p) => p.id === id || p.slug === id);
    if (!property) {
      throw new Error(`Property not found: ${id}`);
    }
    return property;
  }

  async getCalendar(
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarDay[]> {
    const property = await this.getListing(listingId);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days: CalendarDay[] = [];

    let current = start;
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dayOfMonth = current.getDate();

      // Simulate some blocked dates (every 7th and 14th, plus a random mid-week block)
      const isBlocked =
        dayOfMonth === 7 ||
        dayOfMonth === 8 ||
        dayOfMonth === 14 ||
        dayOfMonth === 15;

      // Weekend premium pricing
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const price = isWeekend
        ? Math.round(property.pricing.baseNightlyRate * 1.2)
        : property.pricing.baseNightlyRate;

      days.push({
        date: format(current, "yyyy-MM-dd"),
        available: !isBlocked,
        price,
        minStay: property.minStay,
      });

      current = addDays(current, 1);
    }

    return days;
  }

  async calculatePrice(
    listingId: string,
    checkIn: string,
    checkOut: string
  ): Promise<PriceBreakdown> {
    const property = await this.getListing(listingId);
    const calendar = await this.getCalendar(listingId, checkIn, checkOut);

    const stayDates = getDatesInRange(parseISO(checkIn), parseISO(checkOut));
    const stayDays = stayDates.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      return (
        calendar.find((c) => c.date === dateStr) || {
          date: dateStr,
          available: true,
          price: property.pricing.baseNightlyRate,
          minStay: property.minStay,
        }
      );
    });

    return computePriceBreakdown(
      stayDays,
      property.pricing.cleaningFee,
      property.pricing.currency
    );
  }
}
