"use client";

import { useState } from "react";
import type { Property } from "@/types/property";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/i18n/LanguageContext";

type TabKey = "about" | "space" | "neighborhood" | "rules";

export default function PropertyDescription({
  property,
}: {
  property: Property;
}) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("about");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "about", label: t("propertyDetail.about") },
    { key: "space", label: t("propertyDetail.theSpace") },
    { key: "neighborhood", label: t("propertyDetail.neighborhood") },
    { key: "rules", label: t("propertyDetail.houseRules") },
  ];

  // Use translated descriptions when available, fall back to API content
  const propKey = `prop.${property.id}`;
  const translatedDesc = locale !== "en" ? t(`${propKey}.description`, {}, "") : "";
  const translatedSpace = locale !== "en" ? t(`${propKey}.space`, {}, "") : "";
  const translatedNeighborhood = locale !== "en" ? t(`${propKey}.neighborhood`, {}, "") : "";
  const translatedNotes = locale !== "en" ? t(`${propKey}.notes`, {}, "") : "";

  const content: Record<TabKey, string> = {
    about: translatedDesc || property.description,
    space: translatedSpace || property.fullDescription.space,
    neighborhood: translatedNeighborhood || property.fullDescription.neighborhood,
    rules: translatedNotes || property.fullDescription.notes,
  };

  return (
    <div className="mb-10">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.key
                ? "text-gold border-b-2 border-gold"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <p className="text-white/50 leading-relaxed whitespace-pre-line">
        {content[activeTab] || t("propertyDetail.noInfo")}
      </p>
    </div>
  );
}
