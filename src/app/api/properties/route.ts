import { NextResponse } from "next/server";
import { getGuestyService } from "@/lib/guesty";
import { getPriceLabsDataForProperty } from "@/lib/pricelabs/service";

export async function GET() {
  try {
    const service = getGuestyService();
    const properties = await service.getListings();

    // Enrich with PriceLabs dynamic pricing
    const enriched = await Promise.all(
      properties.map(async (property) => {
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

    return NextResponse.json(
      { properties: enriched },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
