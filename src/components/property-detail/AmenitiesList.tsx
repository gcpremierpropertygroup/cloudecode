"use client";

import { useState } from "react";
import {
  Wifi,
  UtensilsCrossed,
  WashingMachine,
  Car,
  Tv,
  Wind,
  Flame,
  ShieldCheck,
  Shirt,
  Waves,
  Coffee,
  Refrigerator,
  Check,
} from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Kitchen: UtensilsCrossed,
  Washer: WashingMachine,
  Dryer: WashingMachine,
  "Free parking": Car,
  "Smart TV": Tv,
  "Air conditioning": Wind,
  Heating: Flame,
  "Smoke alarm": ShieldCheck,
  "Carbon monoxide alarm": ShieldCheck,
  Iron: Shirt,
  "Hair dryer": Waves,
  "Coffee maker": Coffee,
  Refrigerator: Refrigerator,
};

export default function AmenitiesList({
  amenities,
}: {
  amenities: string[];
}) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, 12);

  return (
    <div className="mb-10">
      <h2 className="font-serif text-xl font-semibold text-white mb-6">
        {t("propertyDetail.amenities")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visible.map((amenity) => {
          const Icon = amenityIcons[amenity] || Check;
          return (
            <div
              key={amenity}
              className="flex items-center gap-3 text-white/60 text-sm"
            >
              <Icon size={18} className="text-gold shrink-0" />
              <span>{amenity}</span>
            </div>
          );
        })}
      </div>

      {amenities.length > 12 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-6 text-sm font-medium text-gold hover:text-gold-dark transition-colors underline underline-offset-4"
        >
          {showAll
            ? t("propertyDetail.showLess")
            : t("propertyDetail.showAll", { count: amenities.length })}
        </button>
      )}
    </div>
  );
}
