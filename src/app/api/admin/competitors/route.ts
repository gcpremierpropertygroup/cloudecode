import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

const REDIS_KEY = "config:competitors";

interface CompetitorListing {
  id: string;
  name: string;
  platform: string;
  url: string;
  propertyType: string;
  nightlyRate: number;
  ownPropertyId: string;
  rateHistory: { date: string; rate: number }[];
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const competitors = await getConfig<CompetitorListing[]>(REDIS_KEY, []);
    return NextResponse.json({ competitors });
  } catch (error) {
    console.error("Failed to load competitors:", error);
    return NextResponse.json({ error: "Failed to load competitors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, platform, url, propertyType, nightlyRate, ownPropertyId, notes } = body;

    if (!name || !platform || typeof nightlyRate !== "number" || !ownPropertyId) {
      return NextResponse.json(
        { error: "name, platform, nightlyRate, and ownPropertyId are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];

    const competitor: CompetitorListing = {
      id: crypto.randomUUID(),
      name,
      platform,
      url: url || "",
      propertyType: propertyType || "Entire home",
      nightlyRate,
      ownPropertyId,
      rateHistory: [{ date: today, rate: nightlyRate }],
      notes: notes || "",
      createdAt: now,
      lastUpdated: now,
    };

    const existing = await getConfig<CompetitorListing[]>(REDIS_KEY, []);
    existing.push(competitor);
    await setConfig(REDIS_KEY, existing);

    return NextResponse.json({ success: true, competitor }, { status: 201 });
  } catch (error) {
    console.error("Failed to create competitor:", error);
    return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, platform, url, propertyType, nightlyRate, ownPropertyId, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await getConfig<CompetitorListing[]>(REDIS_KEY, []);
    const idx = existing.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const old = existing[idx];

    // If rate changed, add to history
    if (typeof nightlyRate === "number" && nightlyRate !== old.nightlyRate) {
      old.rateHistory.push({ date: today, rate: nightlyRate });
    }

    existing[idx] = {
      ...old,
      ...(name && { name }),
      ...(platform && { platform }),
      ...(url !== undefined && { url }),
      ...(propertyType && { propertyType }),
      ...(typeof nightlyRate === "number" && { nightlyRate }),
      ...(ownPropertyId && { ownPropertyId }),
      ...(notes !== undefined && { notes }),
      lastUpdated: now,
    };

    await setConfig(REDIS_KEY, existing);
    return NextResponse.json({ success: true, competitor: existing[idx] });
  } catch (error) {
    console.error("Failed to update competitor:", error);
    return NextResponse.json({ error: "Failed to update competitor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const existing = await getConfig<CompetitorListing[]>(REDIS_KEY, []);
    const filtered = existing.filter((c) => c.id !== id);
    await setConfig(REDIS_KEY, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete competitor:", error);
    return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
  }
}
