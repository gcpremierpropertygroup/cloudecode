import type { Property } from "@/types/property";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import PropertyCard from "@/components/properties/PropertyCard";

export default function FeaturedProperties({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <section className="py-20 md:py-28 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <SectionLabel>Our Properties</SectionLabel>
          <SectionTitle className="mt-3">
            Where to Stay in Jackson
          </SectionTitle>
          <Divider className="mx-auto" />
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
