"use client";

import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Users } from "lucide-react";
import type { Property } from "@/types/property";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useTranslation } from "@/i18n/LanguageContext";

export default function PropertyCard({
  property,
  index = 0,
}: {
  property: Property;
  index?: number;
}) {
  const { t } = useTranslation();
  const heroPhoto = property.photos[0];

  return (
    <AnimateOnScroll delay={index * 0.15}>
      <Link
        href={`/properties/${property.slug}`}
        className="group block bg-[#1F2937] overflow-hidden border border-white/10 hover:border-gold/30 transition-all duration-500"
      >
        {/* Image */}
        <div className="relative h-64 md:h-72 overflow-hidden bg-[#374151]">
          {heroPhoto ? (
            <Image
              src={heroPhoto.full}
              alt={heroPhoto.caption || property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F2937]/60 to-[#374151]/40 flex items-center justify-center">
              <span className="font-serif text-white/20 text-lg">
                {t("propertyCard.photoComingSoon")}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-gold text-white text-xs font-bold px-3 py-1">
              {t("propertyCard.from")} ${property.pricing.baseNightlyRate}{t("propertyCard.perNight")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-semibold text-white group-hover:text-gold transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-white/40 mt-1">{property.location}</p>

          <div className="flex items-center gap-6 mt-4 text-white/50 text-sm">
            <div className="flex items-center gap-1.5">
              <Bed size={16} />
              <span>{property.bedrooms} {property.bedrooms > 1 ? t("propertyCard.beds") : t("propertyCard.bed")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath size={16} />
              <span>{property.bathrooms} {property.bathrooms > 1 ? t("propertyCard.baths") : t("propertyCard.bath")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{property.guests} {t("propertyCard.guests")}</span>
            </div>
          </div>

          <p className="text-sm text-white/50 mt-4 line-clamp-2 leading-relaxed">
            {property.description}
          </p>
        </div>
      </Link>
    </AnimateOnScroll>
  );
}
