import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";

interface DateRange {
  start: string;
  end: string;
}

const PROPERTY_IDS = ["prop-eastover-001", "prop-spacious-002", "prop-pinelane-003"];

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result: Record<string, { blocks: DateRange[]; unblocks: DateRange[] }> = {};

    for (const pid of PROPERTY_IDS) {
      const blocks = await getConfig<DateRange[]>(`config:blocks:${pid}`, []);
      const unblocks = await getConfig<DateRange[]>(`config:unblocks:${pid}`, []);
      result[pid] = { blocks, unblocks };
    }

    return NextResponse.json({ dates: result });
  } catch (error) {
    console.error("Failed to load date overrides:", error);
    return NextResponse.json({ error: "Failed to load date overrides" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, start, end, type } = body;

    if (!propertyId || !start || !end || !type) {
      return NextResponse.json(
        { error: "propertyId, start, end, and type are required" },
        { status: 400 }
      );
    }

    if (!["block", "unblock"].includes(type)) {
      return NextResponse.json(
        { error: "type must be 'block' or 'unblock'" },
        { status: 400 }
      );
    }

    if (!PROPERTY_IDS.includes(propertyId)) {
      return NextResponse.json({ error: "Invalid propertyId" }, { status: 400 });
    }

    const key = type === "block"
      ? `config:blocks:${propertyId}`
      : `config:unblocks:${propertyId}`;

    const existing = await getConfig<DateRange[]>(key, []);
    existing.push({ start, end });
    await setConfig(key, existing);

    // Purge cached calendar for this property
    revalidatePath(`/api/properties/${propertyId}/calendar`);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to add date override:", error);
    return NextResponse.json({ error: "Failed to add date override" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { propertyId, start, end, type } = body;

    if (!propertyId || !start || !end || !type) {
      return NextResponse.json(
        { error: "propertyId, start, end, and type are required" },
        { status: 400 }
      );
    }

    const key = type === "block"
      ? `config:blocks:${propertyId}`
      : `config:unblocks:${propertyId}`;

    const existing = await getConfig<DateRange[]>(key, []);
    const filtered = existing.filter(
      (r) => !(r.start === start && r.end === end)
    );
    await setConfig(key, filtered);

    // Purge cached calendar for this property
    revalidatePath(`/api/properties/${propertyId}/calendar`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete date override:", error);
    return NextResponse.json({ error: "Failed to delete date override" }, { status: 500 });
  }
}
