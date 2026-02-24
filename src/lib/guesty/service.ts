import type { Property } from "@/types/property";
import type { CalendarDay, PriceBreakdown } from "@/types/booking";
import type {
  GuestyListing,
  GuestyCalendarDay,
  GuestyListingsResponse,
} from "./types";
import { GuestyApiClient } from "./client";
import { slugify } from "@/lib/utils/slug";
import { computePriceBreakdown } from "@/lib/utils/pricing";
import { getDatesInRange } from "@/lib/utils/dates";
import { parseISO } from "date-fns";

export class GuestyService {
  constructor(private client: GuestyApiClient) {}

  async getListings(): Promise<Property[]> {
    const response = await this.client.get<GuestyListingsResponse>(
      "/listings",
      {
        fields:
          "_id,title,accommodates,bedrooms,bathrooms,beds,address,pictures,amenities,publicDescription,prices,terms,active,listed",
        active: "true",
        listed: "true",
      }
    );
    return response.results.map((l) => this.normalizeListing(l));
  }

  async getListing(id: string): Promise<Property> {
    const listing = await this.client.get<GuestyListing>(`/listings/${id}`, {
      fields:
        "_id,title,accommodates,bedrooms,bathrooms,beds,address,pictures,amenities,publicDescription,prices,terms",
    });
    return this.normalizeListing(listing);
  }

  async getCalendar(
    listingId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarDay[]> {
    const days = await this.client.get<GuestyCalendarDay[]>(
      `/availability-pricing/api/calendar/listings/${listingId}`,
      { startDate, endDate },
      300
    );
    return days.map((d) => this.normalizeCalendarDay(d));
  }

  async calculatePrice(
    listingId: string,
    checkIn: string,
    checkOut: string
  ): Promise<PriceBreakdown> {
    const [listing, calendar] = await Promise.all([
      this.getListing(listingId),
      this.getCalendar(listingId, checkIn, checkOut),
    ]);

    const stayDates = getDatesInRange(parseISO(checkIn), parseISO(checkOut));
    const stayDays = stayDates.map((d) => {
      const dateStr = d.toISOString().split("T")[0];
      const calDay = calendar.find((c) => c.date === dateStr);
      return calDay || { date: dateStr, available: true, price: listing.pricing.baseNightlyRate, minStay: listing.minStay };
    });

    return computePriceBreakdown(
      stayDays,
      listing.pricing.cleaningFee,
      listing.pricing.currency
    );
  }

  private normalizeListing(raw: GuestyListing): Property {
    return {
      id: raw._id,
      slug: slugify(raw.title),
      title: raw.title,
      location: `${raw.address.city}, ${raw.address.state}`,
      description: raw.publicDescription?.summary || "",
      fullDescription: {
        space: raw.publicDescription?.space || "",
        access: raw.publicDescription?.access || "",
        neighborhood: raw.publicDescription?.neighborhood || "",
        notes: raw.publicDescription?.notes || "",
      },
      photos: (raw.pictures || []).map((p) => ({
        id: p._id,
        thumbnail: p.thumbnail,
        full: p.regular || p.large || p.original || p.thumbnail,
        caption: p.caption,
      })),
      amenities: raw.amenities || [],
      guests: raw.accommodates,
      bedrooms: raw.bedrooms,
      bathrooms: raw.bathrooms,
      beds: raw.beds || raw.bedrooms,
      pricing: {
        baseNightlyRate: raw.prices.basePrice,
        cleaningFee: raw.prices.cleaningFee || 0,
        currency: raw.prices.currency || "USD",
      },
      minStay: raw.terms?.minNights || 1,
      maxGuests: raw.accommodates,
    };
  }

  private normalizeCalendarDay(raw: GuestyCalendarDay): CalendarDay {
    const available =
      raw.allotment !== undefined
        ? raw.allotment > 0
        : raw.status === "available";
    return {
      date: raw.date,
      available,
      price: raw.price,
      minStay: raw.minNights || 1,
    };
  }
}
