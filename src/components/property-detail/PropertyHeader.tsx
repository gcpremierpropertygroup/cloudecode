import { Bed, Bath, Users, CalendarDays, MapPin } from "lucide-react";
import type { Property } from "@/types/property";

export default function PropertyHeader({
  property,
}: {
  property: Property;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
        <MapPin size={14} />
        <span>{property.location}</span>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
        {property.title}
      </h1>

      <div className="flex flex-wrap items-center gap-6 text-white/50 text-sm">
        <div className="flex items-center gap-2">
          <Bed size={18} className="text-gold" />
          <span>
            {property.bedrooms} bedroom{property.bedrooms > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Bath size={18} className="text-gold" />
          <span>
            {property.bathrooms} bathroom{property.bathrooms > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gold" />
          <span>Up to {property.guests} guests</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-gold" />
          <span>{property.minStay} night min</span>
        </div>
      </div>
    </div>
  );
}
