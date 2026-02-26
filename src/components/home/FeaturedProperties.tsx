"use client";

import type { Property } from "@/types/property";
import PropertyCard from "@/components/properties/PropertyCard";
import { useTranslation } from "@/i18n/LanguageContext";

export default function FeaturedProperties({
  properties,
}: {
  properties: Property[];
}) {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-sm md:text-base font-bold tracking-[4px] uppercase mb-4">
            {t("properties.label")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white mt-3">
            {t("properties.title")}
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {properties.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
