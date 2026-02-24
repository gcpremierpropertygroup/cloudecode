"use client";

import { useState } from "react";
import type { Property } from "@/types/property";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { key: "about", label: "About" },
  { key: "space", label: "The Space" },
  { key: "neighborhood", label: "Neighborhood" },
  { key: "rules", label: "House Rules" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function PropertyDescription({
  property,
}: {
  property: Property;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("about");

  const content: Record<TabKey, string> = {
    about: property.description,
    space: property.fullDescription.space,
    neighborhood: property.fullDescription.neighborhood,
    rules: property.fullDescription.notes,
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
        {content[activeTab] || "No information available."}
      </p>
    </div>
  );
}
