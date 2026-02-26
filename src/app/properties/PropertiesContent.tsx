"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import Divider from "@/components/ui/Divider";
import PropertyGrid from "@/components/properties/PropertyGrid";
import type { Property } from "@/types/property";
import { useTranslation } from "@/i18n/LanguageContext";

export default function PropertiesContent({
  properties,
}: {
  properties: Property[];
}) {
  const { t } = useTranslation();

  return (
    <div className="pt-28 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>{t("properties.label")}</SectionLabel>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3">
            {t("properties.title")}
          </h1>
          <Divider className="mx-auto" />
          <p className="text-white/50 max-w-xl mx-auto mt-4">
            {t("properties.subtitle")}
          </p>
        </div>

        <PropertyGrid properties={properties} />
      </div>
    </div>
  );
}
