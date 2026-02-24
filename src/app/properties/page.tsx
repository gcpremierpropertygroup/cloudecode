import { getGuestyService } from "@/lib/guesty";
import { getPriceLabsDataForProperty } from "@/lib/pricelabs/service";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import PropertyGrid from "@/components/properties/PropertyGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Properties | G|C Premier Property Group",
  description:
    "Browse our premium short-term rental properties in Jackson, Mississippi. Book directly for the best rates.",
};

export default async function PropertiesPage() {
  const service = getGuestyService();
  const rawProperties = await service.getListings();

  // Enrich with PriceLabs dynamic pricing
  const properties = await Promise.all(
    rawProperties.map(async (property) => {
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
  );
}
