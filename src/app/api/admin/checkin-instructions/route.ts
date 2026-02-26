import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import {
  getCheckInInstructions,
  setCheckInInstructions,
} from "@/lib/email/scheduling";

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
      const instructions = await getCheckInInstructions(propertyId);
      return NextResponse.json({ instructions });
    }

    // Return all properties' instructions
    const all: Record<string, unknown> = {};
    await Promise.all(
      PROPERTY_IDS.map(async (id) => {
        all[id] = await getCheckInInstructions(id);
      })
    );

    return NextResponse.json({ instructions: all });
  } catch (error) {
    console.error("Failed to load check-in instructions:", error);
    return NextResponse.json({ error: "Failed to load instructions" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, instructions } = body;

    if (!propertyId || !instructions) {
      return NextResponse.json(
        { error: "propertyId and instructions are required" },
        { status: 400 }
      );
    }

    await setCheckInInstructions(propertyId, {
      propertyId,
      ...instructions,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save check-in instructions:", error);
    return NextResponse.json({ error: "Failed to save instructions" }, { status: 500 });
  }
}
