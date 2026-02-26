import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

const PROPERTY_IDS = [
  "prop-eastover-001",
  "prop-spacious-002",
  "prop-pinelane-003",
];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId");

    if (propertyId) {
      const settings = await getConfig(`config:property-settings:${propertyId}`, null);
      return NextResponse.json({ settings });
    }

    const all: Record<string, unknown> = {};
    await Promise.all(
      PROPERTY_IDS.map(async (id) => {
        all[id] = await getConfig(`config:property-settings:${id}`, null);
      })
    );
    return NextResponse.json({ settings: all });
  } catch (error) {
    console.error("Failed to load property settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, settings } = body;

    if (!propertyId || !settings) {
      return NextResponse.json(
        { error: "propertyId and settings are required" },
        { status: 400 }
      );
    }

    await setConfig(`config:property-settings:${propertyId}`, {
      propertyId,
      ...settings,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save property settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
