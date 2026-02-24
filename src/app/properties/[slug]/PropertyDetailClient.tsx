"use client";

import { useCallback } from "react";
import type { Property } from "@/types/property";
import AvailabilityCalendar from "@/components/property-detail/AvailabilityCalendar";

export default function PropertyDetailClient({
  property,
}: {
  property: Property;
}) {
  const handleDateChange = useCallback(() => {
    // Dates are handled by the BookingPanel component
    // This calendar is for visual reference on desktop
  }, []);

  return (
    <AvailabilityCalendar
      propertyId={property.id}
      minStay={property.minStay}
      onDateChange={handleDateChange}
    />
  );
}
