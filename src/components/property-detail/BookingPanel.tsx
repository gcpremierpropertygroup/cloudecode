"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Property } from "@/types/property";
import type { PriceBreakdown } from "@/types/booking";
import AvailabilityCalendar from "./AvailabilityCalendar";
import Button from "@/components/ui/Button";
import { getNights, formatDateShort } from "@/lib/utils/dates";

// Properties that redirect to Airbnb for booking
const AIRBNB_BOOKING_PROPERTIES: Record<string, string> = {
  "prop-pinelane-003": "https://www.airbnb.com/rooms/1532602068184368578",
};

export default function BookingPanel({
  property,
}: {
  property: Property;
}) {
  const airbnbUrl = AIRBNB_BOOKING_PROPERTIES[property.id];
  const [dates, setDates] = useState<{
    checkIn: string;
    checkOut: string;
  } | null>(null);
  const [guests, setGuests] = useState(1);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoValidating, setPromoValidating] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const fetchPricing = useCallback(
    async (range: { checkIn: string; checkOut: string }, appliedPromo: string | null) => {
      setLoadingPrice(true);
      setPricingError(null);
      try {
        const res = await fetch(
          `/api/properties/${property.id}/pricing`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              checkIn: range.checkIn,
              checkOut: range.checkOut,
              guests,
              ...(appliedPromo && { promoCode: appliedPromo }),
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setPricingError(
            data.message || data.error || "Failed to calculate price"
          );
        } else {
          setPricing(data.pricing);
        }
      } catch {
        setPricingError("Failed to calculate price");
      }
      setLoadingPrice(false);
    },
    [property.id, guests]
  );

  const handleDateChange = useCallback(
    async (range: { checkIn: string; checkOut: string } | null) => {
      setDates(range);
      setPricing(null);
      setPricingError(null);

      if (!range) return;
      await fetchPricing(range, promoApplied);
    },
    [fetchPricing, promoApplied]
  );

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !dates) return;
    setPromoValidating(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, propertyId: property.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied(promoCode.toUpperCase());
        setPromoError(null);
        // Re-fetch pricing with promo code
        await fetchPricing(dates, promoCode.toUpperCase());
      } else {
        setPromoError(data.reason || "Invalid code");
        setPromoApplied(null);
      }
    } catch {
      setPromoError("Failed to validate code");
    }
    setPromoValidating(false);
  };

  const handleRemovePromo = async () => {
    setPromoApplied(null);
    setPromoCode("");
    setPromoError(null);
    if (dates) {
      await fetchPricing(dates, null);
    }
  };

  const handleBooking = async () => {
    if (!dates || !pricing || !guestName || !guestEmail) return;

    setBookingLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests,
          guestName,
          guestEmail,
          guestPhone,
          ...(promoApplied && { promoCode: promoApplied }),
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPricingError(data.error || "Failed to create checkout session");
        setBookingLoading(false);
      }
    } catch {
      setPricingError("Something went wrong. Please try again.");
      setBookingLoading(false);
    }
  };

  const nights = dates ? getNights(dates.checkIn, dates.checkOut) : 0;
  const canBook =
    dates &&
    pricing &&
    guestName.trim() &&
    guestEmail.trim() &&
    !bookingLoading;

  // For Airbnb properties, render a simple card with just the price and Airbnb link
  if (airbnbUrl) {
    return (
      <div className="bg-[#1F2937] border border-white/10 p-6">
        {/* Price header */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-white/40 text-sm">from</span>
          <span className="font-serif text-2xl font-bold text-white">
            ${property.pricing.baseNightlyRate}
          </span>
          <span className="text-white/40 text-sm">/ night</span>
        </div>

        <a
          href={airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button className="w-full" size="lg">
            Book on Airbnb
          </Button>
        </a>

        <p className="text-xs text-white/30 text-center mt-3">
          You&apos;ll be redirected to Airbnb to complete your booking
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Sticky booking card */}
      <div className="bg-[#1F2937] border border-white/10 p-6">
        {/* Price header */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-white/40 text-sm">from</span>
          <span className="font-serif text-2xl font-bold text-white">
            ${property.pricing.baseNightlyRate}
          </span>
          <span className="text-white/40 text-sm">/ night</span>
        </div>

        {/* Date display */}
        {dates && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-white/10 p-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Check-in
              </p>
              <p className="font-medium text-white">
                {formatDateShort(dates.checkIn)}
              </p>
            </div>
            <div className="border border-white/10 p-3">
              <p className="text-xs text-white/40 uppercase tracking-wider">
                Check-out
              </p>
              <p className="font-medium text-white">
                {formatDateShort(dates.checkOut)}
              </p>
            </div>
          </div>
        )}

        {/* Guest selector */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full border border-white/10 p-3 bg-[#374151] text-white focus:outline-none focus:border-gold"
          >
            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              )
            )}
          </select>
        </div>

        {/* Price breakdown */}
        <div className="min-h-[48px]">
        {loadingPrice && (
          <div className="py-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {pricingError && (
          <div className="bg-red-900/20 border border-red-500/30 p-3 mb-4 text-red-400 text-sm">
            {pricingError}
          </div>
        )}

        {pricing && (
          <div className="border-t border-white/10 pt-4 mb-6 space-y-3 text-sm">
            {/* Nightly rate summary */}
            {pricing.dailyRates && pricing.dailyRates.length > 0 ? (
              <>
                <div className="flex justify-between text-white/50">
                  <span>
                    ~${pricing.nightlyRate} avg x {pricing.numberOfNights} night
                    {pricing.numberOfNights > 1 ? "s" : ""}
                  </span>
                  <span>${pricing.subtotal}</span>
                </div>

                {/* Toggle daily breakdown */}
                <button
                  onClick={() => setShowDailyBreakdown(!showDailyBreakdown)}
                  className="flex items-center gap-1 text-gold text-xs hover:text-gold-light transition-colors"
                >
                  {showDailyBreakdown ? (
                    <>
                      <ChevronUp size={14} /> Hide nightly rates
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> View nightly rates
                    </>
                  )}
                </button>

                {showDailyBreakdown && (
                  <div className="bg-[#374151] border border-white/5 p-3 space-y-1.5 max-h-48 overflow-y-auto">
                    {pricing.dailyRates.map((day) => {
                      const d = new Date(day.date + "T00:00:00");
                      const dayName = d.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const dateLabel = d.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const isDiscount = day.label === "20% off";
                      const isWeekend = day.label === "weekend";
                      const isHoliday = day.label && !isDiscount && !isWeekend;
                      return (
                        <div
                          key={day.date}
                          className="flex items-center justify-between text-white/40 text-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={isWeekend ? "text-gold/70" : isDiscount ? "text-green-400/80" : ""}>
                              {dayName}, {dateLabel}
                            </span>
                            {day.label && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
                                  isDiscount
                                    ? "bg-green-500/15 text-green-400"
                                    : isWeekend
                                      ? "bg-gold/10 text-gold/60"
                                      : isHoliday
                                        ? "bg-red-500/10 text-red-400"
                                        : ""
                                }`}
                              >
                                {day.label}
                              </span>
                            )}
                          </span>
                          <span className="text-white/60">${day.rate}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between text-white/50">
                <span>
                  ${pricing.nightlyRate} x {pricing.numberOfNights} night
                  {pricing.numberOfNights > 1 ? "s" : ""}
                </span>
                <span>${pricing.subtotal}</span>
              </div>
            )}

            {pricing.directBookingDiscount && (
              <div className="flex justify-between text-green-400">
                <span>{pricing.directBookingDiscount.label}</span>
                <span>-${pricing.directBookingDiscount.amount}</span>
              </div>
            )}
            {pricing.discount && (
              <div className="flex justify-between text-green-400">
                <span>{pricing.discount.label}</span>
                <span>-${pricing.discount.amount}</span>
              </div>
            )}
            {pricing.customDiscount && (
              <div className="flex justify-between text-green-400">
                <span>{pricing.customDiscount.label}</span>
                <span>-${pricing.customDiscount.amount}</span>
              </div>
            )}
            {pricing.promoDiscount && (
              <div className="flex justify-between text-green-400">
                <span>{pricing.promoDiscount.label}</span>
                <span>-${pricing.promoDiscount.amount}</span>
              </div>
            )}
            <div className="flex justify-between text-white/50">
              <span>Cleaning fee</span>
              <span>${pricing.cleaningFee}</span>
            </div>
            {pricing.serviceFee > 0 && (
              <div className="flex justify-between text-white/50">
                <span>Service fee</span>
                <span>${pricing.serviceFee}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
              <span>Total</span>
              <span>${pricing.total}</span>
            </div>
          </div>
        )}

        </div>

        {/* Promo code */}
        {pricing && (
          <div className="mb-4">
            {!showPromoInput && !promoApplied ? (
              <button
                onClick={() => setShowPromoInput(true)}
                className="w-full border border-gold/40 bg-gold/5 text-gold hover:bg-gold/10 hover:border-gold/60 transition-all py-2.5 px-4 text-sm font-semibold tracking-wide"
              >
                🎟️ Have a promo code?
              </button>
            ) : (
              <div className="space-y-2">
                {!promoApplied && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      className="flex-1 border border-white/10 p-3 text-sm bg-[#374151] text-white placeholder:text-white/30 focus:outline-none focus:border-gold uppercase tracking-wider font-mono"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || promoValidating}
                      className="bg-gold text-white px-4 py-3 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      {promoValidating ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-red-400 text-xs">{promoError}</p>
                )}
                {promoApplied && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs">
                      Code <span className="font-mono font-bold">{promoApplied}</span> applied!
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-white/40 hover:text-red-400 text-xs transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guest info */}
        {pricing && (
          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="Full Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border border-white/10 p-3 text-sm bg-[#374151] text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
            <input
              type="email"
              placeholder="Email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border border-white/10 p-3 text-sm bg-[#374151] text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full border border-white/10 p-3 text-sm bg-[#374151] text-white placeholder:text-white/30 focus:outline-none focus:border-gold"
            />
          </div>
        )}

        {/* Book button */}
        <Button
          onClick={handleBooking}
          disabled={!canBook}
          className={`w-full ${!canBook ? "opacity-50 cursor-not-allowed" : ""}`}
          size="lg"
        >
          {bookingLoading
            ? "Processing..."
            : dates
              ? `Book Now${pricing ? ` - $${pricing.total}` : ""}`
              : "Select Dates to Book"}
        </Button>

        {!dates && (
          <p className="text-xs text-white/30 text-center mt-3">
            Select your dates on the calendar below
          </p>
        )}
      </div>

      {/* Calendar section - full width below the booking card */}
      <div className="mt-8">
        <AvailabilityCalendar
          propertyId={property.id}
          minStay={property.minStay}
          onDateChange={handleDateChange}
        />
      </div>
    </>
  );
}
