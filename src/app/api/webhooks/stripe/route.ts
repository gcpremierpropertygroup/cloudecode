import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { sendBookingConfirmation } from "@/lib/email";
import { incrementPromoCodeUsage } from "@/lib/promo/service";
import { trackEvent } from "@/lib/analytics";
import { setConfig } from "@/lib/admin/config";
import { getRedisClient } from "@/lib/kv/client";
import { scheduleBookingEmails } from "@/lib/email/scheduling";
import { getConfig } from "@/lib/admin/config";
import type { StoredBooking, Invoice } from "@/types/booking";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const meta = session.metadata;

        console.log("Booking completed:", {
          propertyTitle: meta?.propertyTitle,
          checkIn: meta?.checkIn,
          checkOut: meta?.checkOut,
          guestName: meta?.guestName,
          guestEmail: meta?.guestEmail,
          total: meta?.total,
        });

        // Track booking completed
        trackEvent({
          event: "booking_completed",
          propertyId: meta?.propertyId,
          propertyTitle: meta?.propertyTitle,
          amount: meta?.total ? Number(meta.total) : undefined,
          guestEmail: meta?.guestEmail,
          promoCode: meta?.promoCode,
        });

        // Send confirmation emails to guest and owner
        if (meta?.guestEmail && meta?.guestName) {
          try {
            await sendBookingConfirmation({
              guestName: meta.guestName,
              guestEmail: meta.guestEmail,
              propertyTitle: meta.propertyTitle || "Property",
              checkIn: meta.checkIn || "",
              checkOut: meta.checkOut || "",
              guests: meta.guests || "1",
              total: meta.total || "0",
            });
            console.log("Confirmation emails sent successfully");
          } catch (emailError) {
            console.error("Failed to send confirmation emails:", emailError);
            // Don't fail the webhook — booking is still valid
          }
        }

        // Save booking to Redis and schedule automated emails
        try {
          const bookingId = session.id;
          const booking: StoredBooking = {
            id: bookingId,
            propertyId: meta?.propertyId || "",
            propertyTitle: meta?.propertyTitle || "",
            guestName: meta?.guestName || "",
            guestEmail: meta?.guestEmail || "",
            guestPhone: meta?.guestPhone || "",
            checkIn: meta?.checkIn || "",
            checkOut: meta?.checkOut || "",
            guests: meta?.guests || "1",
            total: meta?.total || "0",
            bookedAt: new Date().toISOString(),
            status: "confirmed",
          };
          await setConfig(`bookings:${bookingId}`, booking);

          // Add to bookings index sorted by check-in date
          const redis = getRedisClient();
          const checkInTimestamp = new Date(meta?.checkIn || "").getTime();
          if (!isNaN(checkInTimestamp)) {
            await redis.zadd("bookings:index", {
              score: checkInTimestamp,
              member: bookingId,
            });
          }

          await scheduleBookingEmails(bookingId, booking);
          console.log(`Booking ${bookingId} saved and emails scheduled`);
        } catch (bookingError) {
          console.error("Failed to save booking/schedule emails:", bookingError);
          // Don't fail the webhook
        }

        // Increment promo code usage if one was used
        if (meta?.promoCode) {
          try {
            await incrementPromoCodeUsage(meta.promoCode);
            trackEvent({ event: "promo_used", promoCode: meta.promoCode, propertyId: meta?.propertyId });
            console.log(`Promo code ${meta.promoCode} usage incremented`);
          } catch (promoError) {
            console.error("Failed to increment promo code usage:", promoError);
            // Don't fail the webhook — booking is still valid
          }
        }

        // ─── Invoice payment ──────────────────────────────────────
        if (meta?.type === "invoice" && meta?.invoiceId) {
          try {
            const invoice = await getConfig<Invoice | null>(`invoice:${meta.invoiceId}`, null);
            if (invoice && invoice.status !== "paid") {
              invoice.status = "paid";
              invoice.paidAt = new Date().toISOString();
              invoice.stripeSessionId = session.id;
              await setConfig(`invoice:${meta.invoiceId}`, invoice);
              console.log(`Invoice ${meta.invoiceId} marked as paid`);
            }
          } catch (invoiceError) {
            console.error("Failed to update invoice:", invoiceError);
          }
        }

        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
