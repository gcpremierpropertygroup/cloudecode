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
  recipientName?: string;
  context?: string;
  hasHtml?: boolean;
  sentAt: string;
}

const EMAIL_LOG_KEY = "email-log:all";
const MAX_LOG_ENTRIES = 500;
/** HTML bodies expire after 30 days to save storage */
const HTML_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function logEmail(
  entry: Omit<EmailLogEntry, "id" | "sentAt" | "hasHtml"> & { html?: string }
): Promise<void> {
  try {
    const redis = getRedisClient();
    const id = crypto.randomUUID();
    const { html, ...meta } = entry;

    const record: EmailLogEntry = {
      ...meta,
      id,
      hasHtml: !!html,
      sentAt: new Date().toISOString(),
    };

    await redis.lpush(EMAIL_LOG_KEY, JSON.stringify(record));
    await redis.ltrim(EMAIL_LOG_KEY, 0, MAX_LOG_ENTRIES - 1);

    // Store HTML body separately so the list stays lightweight
    if (html) {
      await redis.set(`email-html:${id}`, html, { ex: HTML_TTL_SECONDS });
    }
  } catch (err) {
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

export async function getEmailHtml(id: string): Promise<string | null> {
  try {
    const redis = getRedisClient();
    return await redis.get<string>(`email-html:${id}`);
  } catch {
    return null;
  }
}
