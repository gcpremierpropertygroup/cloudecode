"use client";

import { useState, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format, startOfDay, differenceInDays, addDays } from "date-fns";

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
  const [blockedDateStrings, setBlockedDateStrings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState(new Date());
  const [minStayWarning, setMinStayWarning] = useState(false);

  useEffect(() => {
    async function fetchCalendar() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/properties/${propertyId}/calendar`
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

  const handleSelect = (newRange: DateRange | undefined) => {
    setMinStayWarning(false);

    if (newRange?.from && newRange?.to) {
      const nights = differenceInDays(newRange.to, newRange.from);
      if (nights < minStay) {
        // Auto-extend checkout to meet minimum stay
        const extendedCheckout = addDays(newRange.from, minStay);
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
        Availability
      </h2>

      {minStay > 1 && (
        <p className="text-sm text-white/40 mb-4">
          Minimum stay: {minStay} nights
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

      {minStayWarning && (
        <p className="text-sm text-gold mt-3">
          Checkout was adjusted to meet the {minStay}-night minimum stay.
        </p>
      )}
    </div>
  );
}
