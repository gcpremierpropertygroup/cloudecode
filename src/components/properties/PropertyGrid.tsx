import type { Property } from "@/types/property";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({
  properties,
}: {
  properties: Property[];
}) {
  return (
    <div className={`grid grid-cols-1 ${properties.length > 1 ? "md:grid-cols-2" : "max-w-xl mx-auto"} gap-8`}>
      {properties.map((property, i) => (
        <PropertyCard key={property.id} property={property} index={i} />
      ))}
    </div>
  );
}
