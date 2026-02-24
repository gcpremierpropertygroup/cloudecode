export interface CalendarDay {
  date: string;
  available: boolean;
  price: number;
  minStay: number;
}

export interface PriceBreakdown {
  nightlyRate: number; // average nightly rate
  numberOfNights: number;
  subtotal: number;
  discount?: { percentage: number; amount: number; label: string };
  directBookingDiscount?: { percentage: number; amount: number; label: string };
  customDiscount?: { amount: number; label: string };
  promoDiscount?: { amount: number; label: string; code: string };
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  dailyRates?: { date: string; rate: number; label?: string }[];
}

export interface BookingRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}
