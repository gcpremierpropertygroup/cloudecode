import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getGuestyService } from "@/lib/guesty";
import { getPriceLabsDataForProperty } from "@/lib/pricelabs/service";
import { LodgingBusinessJsonLd } from "@/components/seo/JsonLd";
import PropertyHeader from "@/components/property-detail/PropertyHeader";
import PropertyDescription from "@/components/property-detail/PropertyDescription";
import AmenitiesList from "@/components/property-detail/AmenitiesList";

const PhotoGallery = dynamic(
  () => import("@/components/property-detail/PhotoGallery"),
  {
    loading: () => (
      <div className="h-[400px] md:h-[500px] bg-[#1F2937] animate-pulse" />
    ),
  }
);

const BookingPanel = dynamic(
  () => import("@/components/property-detail/BookingPanel"),
  {
    loading: () => (
      <div className="bg-[#1F2937] border border-white/10 p-6 h-[400px] animate-pulse" />
    ),
  }
);

async function getProperty(slug: string) {
  const service = getGuestyService();
  const properties = await service.getListings();
  const property = properties.find((p) => p.slug === slug) || null;
  if (!property) return null;

  // Enrich with PriceLabs dynamic pricing
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property Not Found" };

  return {
    title: `${property.title} | G|C Premier Property Group`,
    description: property.description,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="pt-20">
      <LodgingBusinessJsonLd />
      <PhotoGallery photos={property.photos} />

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-10">
        {/* Main content grid - details left, booking card right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column - details */}
          <div className="lg:col-span-2">
            <PropertyHeader property={property} />
            <PropertyDescription property={property} />
            <AmenitiesList amenities={property.amenities} />
          </div>

          {/* Right column - booking panel (card + calendar) */}
          <div className="lg:col-span-1">
            <BookingPanel property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
