import { getRedisClient } from "@/lib/kv/client";

export interface EmailLogEntry {
  id: string;
  type:
    | "contact-owner"
    | "contact-confirmation"
    | "assessment-owner"
    | "assessment-confirmation"
    | "booking-confirmation-guest"
    | "booking-confirmation-owner"
    | "check-in-reminder"
    | "review-request"
    | "invoice"
    | "invoice-resend"
    | "test-email";
  to: string;
  subject: string;
  status: "sent" | "failed";
  error?: string;
  /** Who is this email about / for context */
  recipientName?: string;
  /** Extra context like property name, invoice id, booking id */
  context?: string;
  sentAt: string;
}

const EMAIL_LOG_KEY = "email-log:all";
const MAX_LOG_ENTRIES = 500;

export async function logEmail(entry: Omit<EmailLogEntry, "id" | "sentAt">): Promise<void> {
  try {
    const redis = getRedisClient();
    const record: EmailLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
    };
    await redis.lpush(EMAIL_LOG_KEY, JSON.stringify(record));
    await redis.ltrim(EMAIL_LOG_KEY, 0, MAX_LOG_ENTRIES - 1);
  } catch (err) {
    // Never let logging break email sending
    console.error("Failed to log email:", err);
  }
}

export async function getEmailLog(limit = 100): Promise<EmailLogEntry[]> {
  try {
    const redis = getRedisClient();
    const raw = await redis.lrange(EMAIL_LOG_KEY, 0, limit - 1);
    return raw.map((entry) =>
      typeof entry === "string" ? JSON.parse(entry) : entry
    ) as EmailLogEntry[];
  } catch {
    return [];
  }
}
