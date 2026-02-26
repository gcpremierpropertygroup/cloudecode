"use client";

import { useState, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, startOfDay, differenceInDays, addDays, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "@/i18n/LanguageContext";

interface AvailabilityCalendarProps {
  propertyId: string;
  minStay: number;
  onDateChange: (range: { checkIn: string; checkOut: string } | null) => void;
}

export default function AvailabilityCalendar({
  propertyId,
  minStay,
  onDateChange,
}: AvailabilityCalendarProps) {
  const { t, locale } = useTranslation();
  const [blockedDateStrings, setBlockedDateStrings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState(new Date());
  const [minStayWarning, setMinStayWarning] = useState(false);
  const [blockedDateWarning, setBlockedDateWarning] = useState(false);

  useEffect(() => {
    async function fetchCalendar() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/properties/${propertyId}/calendar?t=${Date.now()}`
        );
        const data = await res.json();
        setBlockedDateStrings(data.calendar?.blockedDates || []);
      } catch (err) {
        console.error("Failed to load calendar:", err);
      }
      setLoading(false);
    }
    fetchCalendar();
  }, [propertyId]);

  // Check if a date range overlaps with any blocked dates
  const rangeHasBlockedDates = (from: Date, to: Date): boolean => {
    const days = eachDayOfInterval({ start: from, end: to });
    return days.some((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      return blockedDateStrings.includes(dayStr);
    });
  };

  const handleSelect = (newRange: DateRange | undefined) => {
    setMinStayWarning(false);
    setBlockedDateWarning(false);

    if (newRange?.from && newRange?.to) {
      // Reject ranges that span across blocked (Airbnb-booked) dates
      if (rangeHasBlockedDates(newRange.from, newRange.to)) {
        setBlockedDateWarning(true);
        setRange(undefined);
        onDateChange(null);
        return;
      }

      const nights = differenceInDays(newRange.to, newRange.from);
      if (nights < minStay) {
        // Auto-extend checkout to meet minimum stay
        const extendedCheckout = addDays(newRange.from, minStay);
        // Also check if extended range hits blocked dates
        if (rangeHasBlockedDates(newRange.from, extendedCheckout)) {
          setBlockedDateWarning(true);
          setRange(undefined);
          onDateChange(null);
          return;
        }
        setRange({ from: newRange.from, to: extendedCheckout });
        setMinStayWarning(true);
        return;
      }
    }

    setRange(newRange);
  };

  useEffect(() => {
    if (range?.from && range?.to) {
      onDateChange({
        checkIn: format(range.from, "yyyy-MM-dd"),
        checkOut: format(range.to, "yyyy-MM-dd"),
      });
    } else {
      onDateChange(null);
    }
  }, [range, onDateChange]);

  const blockedDates = blockedDateStrings.map(
    (d) => new Date(d + "T00:00:00")
  );

  const today = startOfDay(new Date());

  return (
    <div className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-white mb-4">
        {t("propertyDetail.availability")}
      </h2>

      {minStay > 1 && (
        <p className="text-sm text-white/40 mb-4">
          {t("propertyDetail.minStay", { count: minStay })}
        </p>
      )}

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex justify-center">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            onMonthChange={setMonth}
            min={minStay}
            locale={locale === "es" ? es : undefined}
            numberOfMonths={typeof window !== "undefined" && window.innerWidth >= 768 ? 2 : 1}
            disabled={[
              ...blockedDates,
              { before: today },
            ]}
            modifiers={{
              blocked: blockedDates,
            }}
            modifiersClassNames={{
              blocked: "rdp-day_disabled",
            }}
            className="text-white"
          />
        </div>
      )}

      {blockedDateWarning && (
        <p className="text-sm text-red-400 mt-3">
          {t("propertyDetail.datesBooked")}
        </p>
      )}

      {minStayWarning && (
        <p className="text-sm text-gold mt-3">
          {t("propertyDetail.checkoutAdjusted", { count: minStay })}
        </p>
      )}
    </div>
  );
}
