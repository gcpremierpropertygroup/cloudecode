import { CheckCircle, Calendar, Users, Home, Mail } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getStripeClient } from "@/lib/stripe/client";
import { formatDate } from "@/lib/utils/dates";
import type { Metadata } from "next";

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

  return (
    <div className="pt-28 pb-20 px-6 md:px-16 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/10 rounded-full mb-8">
            <CheckCircle className="text-gold" size={40} />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Booking Confirmed!
          </h1>

          <p className="text-white/40 text-lg leading-relaxed">
            Thank you for your reservation. You&apos;ll receive a confirmation
            email shortly with check-in instructions.
          </p>
        </div>

        {/* Booking details card */}
        {booking && (
          <div className="bg-[#1F2937] border border-white/10 p-8 mb-10">
            <h2 className="font-serif text-xl text-white mb-6 pb-4 border-b border-white/10">
              Booking Details
            </h2>

            <div className="space-y-5">
              {/* Property */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Home className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Property
                  </p>
                  <p className="text-white font-medium">
                    {booking.propertyTitle}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Dates
                  </p>
                  <p className="text-white font-medium">
                    {formatDate(booking.checkIn)} &mdash;{" "}
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Users className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Guest
                  </p>
                  <p className="text-white font-medium">{booking.guestName}</p>
                  <p className="text-white/40 text-sm">
                    {booking.guests} guest{Number(booking.guests) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Confirmation email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    Confirmation sent to
                  </p>
                  <p className="text-white font-medium">{booking.guestEmail}</p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-lg">Total Paid</span>
                  <span className="font-serif text-2xl font-bold text-gold">
                    ${booking.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no session details */}
        {!booking && session_id && (
          <div className="bg-[#1F2937] border border-white/10 p-8 mb-10 text-center">
            <p className="text-white/40 mb-2">
              Your payment was successful.
            </p>
            <p className="text-white/30 text-sm">
              Confirmation ID: {session_id.slice(0, 24)}...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as="a" href="/" size="md">
            Back to Home
          </Button>
          <Button as="a" href="/properties" variant="outline" size="md">
            Browse Properties
          </Button>
        </div>
      </div>
    </div>
  );
}
