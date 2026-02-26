import { getGuestyService } from "@/lib/guesty";
import { getPriceLabsDataForProperty } from "@/lib/pricelabs/service";
import { getDisplayPrices } from "@/lib/admin/prices";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import PropertyGrid from "@/components/properties/PropertyGrid";
import type { Metadata } from "next";
import { LodgingBusinessJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Short-Term Rentals in Jackson, MS — Book Direct for Best Rates",
  description:
    "Browse Superhost-rated vacation rentals in Jackson, Mississippi. Professionally managed Airbnb & VRBO properties in Eastover and beyond. Book directly with G|C Premier for the best rates — no platform fees.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/properties",
  },
};

export default async function PropertiesPage() {
  const service = getGuestyService();
  const rawProperties = await service.getListings();
  const displayPrices = await getDisplayPrices();

  // Enrich with display prices (from admin), falling back to PriceLabs, then defaults
  const properties = await Promise.all(
    rawProperties.map(async (property) => {
      // Admin display price takes priority (for "From $X/night" on cards)
      if (displayPrices[property.id]) {
        return {
          ...property,
          pricing: {
            ...property.pricing,
            baseNightlyRate: displayPrices[property.id],
          },
        };
      }
      // Fall back to PriceLabs dynamic pricing
      const priceLabsData = await getPriceLabsDataForProperty(property.id);
      if (priceLabsData) {
        return {
          ...property,
          pricing: {
            ...property.pricing,
            baseNightlyRate: priceLabsData.basePrice,
          },
        };
      }
      return property;
    })
  );

  return (
    <>
    <LodgingBusinessJsonLd />
    <BreadcrumbJsonLd
      items={[
        { name: "Home", url: "https://www.gcpremierproperties.com" },
        { name: "Properties", url: "https://www.gcpremierproperties.com/properties" },
      ]}
    />
    <div className="pt-28 pb-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Our Properties</SectionLabel>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3">
            Where to Stay in Jackson
          </h1>
          <Divider className="mx-auto" />
          <p className="text-white/50 max-w-xl mx-auto mt-4">
            Each of our properties is professionally managed with Superhost
            standards. Book directly for the best rates.
          </p>
        </div>

        <PropertyGrid properties={properties} />
      </div>
    </div>
    </>
  );
}
