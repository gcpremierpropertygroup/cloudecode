import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { sendBookingConfirmation } from "@/lib/email";

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
