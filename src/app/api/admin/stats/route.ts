import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getPriceLabsDataForProperty, isPriceLabsConfigured } from "@/lib/pricelabs/service";

const PROPERTIES = [
  { id: "prop-eastover-001", name: "The Eastover House" },
  { id: "prop-spacious-002", name: "Modern Retreat" },
  { id: "prop-pinelane-003", name: "Pine Lane" },
];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const configured = isPriceLabsConfigured();

    const stats = await Promise.all(
      PROPERTIES.map(async (prop) => {
        const data = await getPriceLabsDataForProperty(prop.id);
        return {
          propertyId: prop.id,
          propertyName: prop.name,
          ...(data
            ? {
                basePrice: data.basePrice,
                minPrice: data.minPrice,
                maxPrice: data.maxPrice,
                recommendedBasePrice: data.recommendedBasePrice,
                matched: true,
              }
            : {
                matched: false,
              }),
        };
      })
    );

    return NextResponse.json({
      configured,
      stats,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch PriceLabs stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
