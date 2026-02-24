import { getGuestyService } from "@/lib/guesty";
import { getPriceLabsDataForProperty } from "@/lib/pricelabs/service";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import PropertyGrid from "@/components/properties/PropertyGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Direct & Save | G|C Premier Property Group",
  description:
    "Book directly with us and save up to 40%. Skip Airbnb and booking site fees. Premium short-term rentals in Jackson, Mississippi.",
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
          <SectionLabel>Book Direct & Save</SectionLabel>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-white mt-3">
            Skip the Booking Fees. Book With Us.
          </h1>
          <Divider className="mx-auto" />
          <p className="text-white/50 max-w-xl mx-auto mt-4">
            Why pay extra on Airbnb or other booking sites? Book directly with us and
            enjoy instant savings — 10% off every stay, plus up to 30% more for longer stays.
            Same properties, same Superhost quality, better price.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="bg-green-500/10 border border-green-500/20 px-5 py-3 text-center">
              <p className="text-green-400 font-semibold text-lg">10% Off</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">Every Booking</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 px-5 py-3 text-center">
              <p className="text-green-400 font-semibold text-lg">20% Off</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">7+ Night Stays</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 px-5 py-3 text-center">
              <p className="text-green-400 font-semibold text-lg">30% Off</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">30+ Night Stays</p>
            </div>
          </div>
        </div>

        <PropertyGrid properties={properties} />
      </div>
    </div>
  );
}
