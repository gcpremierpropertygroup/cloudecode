import { getRedisClient } from "@/lib/kv/client";
import type { PromoCode } from "@/types/promo";

const INDEX_KEY = "promo:index";
const PREFIX = "promo:";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function buildLabel(discountType: "percentage" | "flat", discountValue: number, code: string): string {
  if (discountType === "percentage") {
    return `Promo ${code} (${discountValue}% off)`;
  }
  return `Promo ${code} (-$${discountValue})`;
}

export async function createPromoCode(params: {
  discountType: "percentage" | "flat";
  discountValue: number;
  propertyId?: string;
  expiresAt?: string | null;
  maxUses?: number | null;
}): Promise<PromoCode> {
  const kv = getRedisClient();

  // Generate unique code
  let code: string;
  let attempts = 0;
  do {
    code = generateCode();
    const exists = await kv.exists(`${PREFIX}${code}`);
    if (!exists) break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    throw new Error("Failed to generate unique code after 10 attempts");
  }

  const promo: PromoCode = {
    code,
    discountType: params.discountType,
    discountValue: params.discountValue,
    propertyId: params.propertyId || "*",
    expiresAt: params.expiresAt || null,
    maxUses: params.maxUses ?? null,
    currentUses: 0,
    createdAt: new Date().toISOString(),
    label: buildLabel(params.discountType, params.discountValue, code),
  };

  await kv.set(`${PREFIX}${code}`, JSON.stringify(promo));
  await kv.sadd(INDEX_KEY, code);

  return promo;
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const kv = getRedisClient();
  const codes = await kv.smembers(INDEX_KEY);

  if (!codes || codes.length === 0) return [];

  const pipeline = kv.pipeline();
  for (const code of codes) {
    pipeline.get(`${PREFIX}${code}`);
  }
  const results = await pipeline.exec();

  const promoCodes: PromoCode[] = [];
  for (const raw of results) {
    if (raw) {
      const promo = typeof raw === "string" ? JSON.parse(raw) : raw as PromoCode;
      promoCodes.push(promo);
    }
  }

  return promoCodes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function deletePromoCode(code: string): Promise<boolean> {
  const kv = getRedisClient();
  const key = `${PREFIX}${code.toUpperCase()}`;

  const exists = await kv.exists(key);
  if (!exists) return false;

  await kv.del(key);
  await kv.srem(INDEX_KEY, code.toUpperCase());
  return true;
}

export async function validatePromoCode(
  code: string,
  propertyId: string
): Promise<{
  valid: boolean;
  reason?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  label?: string;
  code?: string;
}> {
  const kv = getRedisClient();
  const raw = await kv.get(`${PREFIX}${code.toUpperCase()}`);

  if (!raw) {
    return { valid: false, reason: "Code not found" };
  }

  const promo: PromoCode = typeof raw === "string" ? JSON.parse(raw) : raw as PromoCode;

  // Check expiry
  if (promo.expiresAt) {
    const now = new Date();
    const expiry = new Date(promo.expiresAt + "T23:59:59");
    if (now > expiry) {
      return { valid: false, reason: "This code has expired" };
    }
  }

  // Check max uses
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
    return { valid: false, reason: "This code has reached its usage limit" };
  }

  // Check property
  if (promo.propertyId !== "*" && promo.propertyId !== propertyId) {
    return { valid: false, reason: "This code is not valid for this property" };
  }

  return {
    valid: true,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    label: promo.label,
    code: promo.code,
  };
}

export async function incrementPromoCodeUsage(code: string): Promise<void> {
  const kv = getRedisClient();
  const key = `${PREFIX}${code.toUpperCase()}`;
  const raw = await kv.get(key);

  if (!raw) return;

  const promo: PromoCode = typeof raw === "string" ? JSON.parse(raw) : raw as PromoCode;
  promo.currentUses += 1;
  await kv.set(key, JSON.stringify(promo));
}
