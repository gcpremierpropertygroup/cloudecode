import { getRedisClient } from "@/lib/kv/client";
import { getConfig, setConfig } from "@/lib/admin/config";
import { sendCheckInReminderEmail, sendReviewRequestEmail } from "@/lib/email";
import type {
  StoredBooking,
  EmailSettings,
  CheckInInstructions,
  ScheduledEmail,
  SentEmailRecord,
} from "@/types/booking";

const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  reminderDaysBefore: 2,
  reviewDaysAfter: 3,
  reminderEnabled: true,
  reviewEnabled: true,
};

// ─── Settings ────────────────────────────────────────────────────

export async function getEmailSettings(): Promise<EmailSettings> {
  return getConfig<EmailSettings>("config:email-settings", DEFAULT_EMAIL_SETTINGS);
}

export async function setEmailSettings(settings: EmailSettings): Promise<void> {
  await setConfig("config:email-settings", settings);
}

// ─── Check-in Instructions ───────────────────────────────────────

export async function getCheckInInstructions(
  propertyId: string
): Promise<CheckInInstructions | null> {
  return getConfig<CheckInInstructions | null>(
    `config:checkin-instructions:${propertyId}`,
    null
  );
}

export async function setCheckInInstructions(
  propertyId: string,
  instructions: CheckInInstructions
): Promise<void> {
  await setConfig(`config:checkin-instructions:${propertyId}`, instructions);
}

// ─── Scheduling ──────────────────────────────────────────────────

export async function scheduleBookingEmails(
  bookingId: string,
  booking: StoredBooking
): Promise<void> {
  const settings = await getEmailSettings();
  const redis = getRedisClient();

  if (settings.reminderEnabled && booking.checkIn) {
    const checkInDate = new Date(booking.checkIn + "T09:00:00Z");
    const sendDate = new Date(checkInDate);
    sendDate.setDate(sendDate.getDate() - settings.reminderDaysBefore);

    // Only schedule if send date is in the future
    if (sendDate.getTime() > Date.now()) {
      const email: ScheduledEmail = {
        id: crypto.randomUUID(),
        bookingId,
        type: "check-in-reminder",
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        propertyId: booking.propertyId,
        propertyTitle: booking.propertyTitle,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        scheduledFor: sendDate.toISOString(),
      };

      await redis.zadd("emails:scheduled", {
        score: sendDate.getTime(),
        member: JSON.stringify(email),
      });
    }
  }

  if (settings.reviewEnabled && booking.checkOut) {
    const checkOutDate = new Date(booking.checkOut + "T09:00:00Z");
    const sendDate = new Date(checkOutDate);
    sendDate.setDate(sendDate.getDate() + settings.reviewDaysAfter);

    if (sendDate.getTime() > Date.now()) {
      const email: ScheduledEmail = {
        id: crypto.randomUUID(),
        bookingId,
        type: "review-request",
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        propertyId: booking.propertyId,
        propertyTitle: booking.propertyTitle,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        scheduledFor: sendDate.toISOString(),
      };

      await redis.zadd("emails:scheduled", {
        score: sendDate.getTime(),
        member: JSON.stringify(email),
      });
    }
  }
}

// ─── Queue & History ─────────────────────────────────────────────

export async function getPendingEmails(): Promise<ScheduledEmail[]> {
  try {
    const redis = getRedisClient();
    const raw = await redis.zrange("emails:scheduled", 0, -1);
    return raw.map((entry) =>
      typeof entry === "string" ? JSON.parse(entry) : entry
    ) as ScheduledEmail[];
  } catch {
    return [];
  }
}

export async function getSentEmails(limit = 50): Promise<SentEmailRecord[]> {
  try {
    const redis = getRedisClient();
    const raw = await redis.lrange("emails:sent", 0, limit - 1);
    return raw.map((entry) =>
      typeof entry === "string" ? JSON.parse(entry) : entry
    ) as SentEmailRecord[];
  } catch {
    return [];
  }
}

export async function cancelScheduledEmail(emailId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const all = await redis.zrange("emails:scheduled", 0, -1);
    for (const entry of all) {
      const parsed: ScheduledEmail =
        typeof entry === "string" ? JSON.parse(entry) : entry;
      if (parsed.id === emailId) {
        await redis.zrem("emails:scheduled", entry);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Cron Processing ─────────────────────────────────────────────

export async function processDueEmails(): Promise<{
  sent: number;
  failed: number;
}> {
  const redis = getRedisClient();
  let sent = 0;
  let failed = 0;

  // Get all emails due (score <= now)
  const now = Date.now();
  const dueEntries = await redis.zrange("emails:scheduled", 0, now, { byScore: true });

  for (const entry of dueEntries) {
    const email: ScheduledEmail =
      typeof entry === "string" ? JSON.parse(entry) : entry;

    const record: SentEmailRecord = {
      id: email.id,
      bookingId: email.bookingId,
      type: email.type,
      guestEmail: email.guestEmail,
      guestName: email.guestName,
      propertyTitle: email.propertyTitle,
      sentAt: new Date().toISOString(),
      status: "sent",
    };

    try {
      if (email.type === "check-in-reminder") {
        const instructions = await getCheckInInstructions(email.propertyId);
        await sendCheckInReminderEmail({
          guestName: email.guestName,
          guestEmail: email.guestEmail,
          propertyTitle: email.propertyTitle,
          checkIn: email.checkIn,
          checkOut: email.checkOut,
          checkInTime: instructions?.checkInTime || "3:00 PM",
          checkOutTime: instructions?.checkOutTime || "11:00 AM",
          wifiName: instructions?.wifiName || "",
          wifiPassword: instructions?.wifiPassword || "",
          doorCode: instructions?.doorCode || "",
          parkingInfo: instructions?.parkingInfo || "",
          houseRules: instructions?.houseRules || "",
          specialNotes: instructions?.specialNotes || "",
        });
        sent++;
      } else if (email.type === "review-request") {
        await sendReviewRequestEmail({
          guestName: email.guestName,
          guestEmail: email.guestEmail,
          propertyTitle: email.propertyTitle,
          checkOut: email.checkOut,
        });
        sent++;
      }
    } catch (err) {
      record.status = "failed";
      record.error = String(err);
      failed++;
    }

    // Remove from scheduled, add to sent log
    await redis.zrem("emails:scheduled", entry);
    await redis.lpush("emails:sent", JSON.stringify(record));
    await redis.ltrim("emails:sent", 0, 199); // Keep last 200
  }

  return { sent, failed };
}
