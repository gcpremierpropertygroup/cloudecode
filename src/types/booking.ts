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

export interface StoredBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  total: string;
  bookedAt: string;
  status: "confirmed" | "cancelled";
}

export interface EmailSettings {
  reminderDaysBefore: number;
  reviewDaysAfter: number;
  reminderEnabled: boolean;
  reviewEnabled: boolean;
}

export interface CheckInInstructions {
  propertyId: string;
  wifiName: string;
  wifiPassword: string;
  doorCode: string;
  parkingInfo: string;
  checkInTime: string;
  checkOutTime: string;
  houseRules: string;
  specialNotes: string;
}

export interface ScheduledEmail {
  id: string;
  bookingId: string;
  type: "check-in-reminder" | "review-request";
  guestEmail: string;
  guestName: string;
  propertyId: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  scheduledFor: string;
}

export interface SentEmailRecord {
  id: string;
  bookingId: string;
  type: string;
  guestEmail: string;
  guestName: string;
  propertyTitle: string;
  sentAt: string;
  status: "sent" | "failed";
  error?: string;
}
