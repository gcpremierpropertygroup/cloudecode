import { getStripeClient } from "@/lib/stripe/client";
import type { Metadata } from "next";
import ConfirmationContent from "./ConfirmationContent";

export const metadata: Metadata = {
  title: "Booking Confirmed | G|C Premier Property Group",
};

interface BookingDetails {
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestName: string;
  guestEmail: string;
  total: string;
}

async function getSessionDetails(
  sessionId: string
): Promise<BookingDetails | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata) {
      return {
        propertyTitle: session.metadata.propertyTitle || "",
        checkIn: session.metadata.checkIn || "",
        checkOut: session.metadata.checkOut || "",
        guests: session.metadata.guests || "",
        guestName: session.metadata.guestName || "",
        guestEmail: session.metadata.guestEmail || "",
        total: session.metadata.total || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    return null;
  }
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const booking = session_id ? await getSessionDetails(session_id) : null;

  return <ConfirmationContent booking={booking} sessionId={session_id} />;
}
