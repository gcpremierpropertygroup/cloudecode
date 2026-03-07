import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/admin/auth";
import { getConfig, setConfig } from "@/lib/admin/config";
import { getRedisClient } from "@/lib/kv/client";
import { sendContractEmail } from "@/lib/email";
import type { Contract } from "@/types/booking";

function generateContractId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "ctr_";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, title, recipientName, recipientEmail, body: contractBody, notes, propertyId, sendEmail } = body;

    if (!type || !title || !recipientName || !recipientEmail || !contractBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = generateContractId();

    const contract: Contract = {
      id,
      status: sendEmail ? "sent" : "draft",
      type,
      title,
      recipientName,
      recipientEmail,
      body: contractBody,
      notes: notes || undefined,
      propertyId: propertyId || undefined,
      createdAt: new Date().toISOString(),
      sentAt: sendEmail ? new Date().toISOString() : undefined,
    };

    await setConfig(`contract:${id}`, contract);
    const redis = getRedisClient();
    await redis.zadd("contracts:index", { score: Date.now(), member: id });

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com").trim().replace(/\/+$/, "");
    const contractUrl = `${baseUrl}/contract/${id}`;

    if (sendEmail) {
      try {
        await sendContractEmail({ recipientName, recipientEmail, title, contractUrl });
      } catch (emailError) {
        console.error("Failed to send contract email:", emailError);
      }
    }

    return NextResponse.json({ contract, contractUrl });
  } catch (error) {
    console.error("Failed to create contract:", error);
    return NextResponse.json({ error: "Failed to create contract" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, type, title, recipientName, recipientEmail, body: contractBody, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing contract ID" }, { status: 400 });
    }

    const existing = await getConfig<Contract | null>(`contract:${id}`, null);
    if (!existing) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Only draft contracts can be edited" }, { status: 400 });
    }

    const updated: Contract = {
      ...existing,
      type: type || existing.type,
      title: title || existing.title,
      recipientName: recipientName || existing.recipientName,
      recipientEmail: recipientEmail || existing.recipientEmail,
      body: contractBody || existing.body,
      notes: notes !== undefined ? (notes || undefined) : existing.notes,
    };

    await setConfig(`contract:${id}`, updated);
    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("Failed to update contract:", error);
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const redis = getRedisClient();
    const contractIds = await redis.zrange("contracts:index", 0, -1, { rev: true });

    const contracts: Contract[] = [];
    await Promise.all(
      contractIds.map(async (id) => {
        const contract = await getConfig<Contract | null>(`contract:${id}`, null);
        if (contract) contracts.push(contract);
      })
    );

    contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("Failed to load contracts:", error);
    return NextResponse.json({ error: "Failed to load contracts" }, { status: 500 });
  }
}
