"use client";

import { CheckCircle, Calendar, Users, Home, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/dates";
import { useTranslation } from "@/i18n/LanguageContext";

interface BookingDetails {
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  guestName: string;
  guestEmail: string;
  total: string;
}

export default function ConfirmationContent({
  booking,
  sessionId,
}: {
  booking: BookingDetails | null;
  sessionId?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="pt-28 pb-20 px-6 md:px-16 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/10 rounded-full mb-8">
            <CheckCircle className="text-gold" size={40} />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {t("confirmation.title")}
          </h1>
          <p className="text-white/40 text-lg leading-relaxed">
            {t("confirmation.subtitle")}
          </p>
        </div>

        {/* Booking details card */}
        {booking && (
          <div className="bg-[#1F2937] border border-white/10 p-8 mb-10">
            <h2 className="font-serif text-xl text-white mb-6 pb-4 border-b border-white/10">
              {t("confirmation.bookingDetails")}
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Home className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    {t("confirmation.property")}
                  </p>
                  <p className="text-white font-medium">
                    {booking.propertyTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    {t("confirmation.dates")}
                  </p>
                  <p className="text-white font-medium">
                    {formatDate(booking.checkIn)} &mdash;{" "}
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Users className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    {t("confirmation.guest")}
                  </p>
                  <p className="text-white font-medium">{booking.guestName}</p>
                  <p className="text-white/40 text-sm">
                    {booking.guests} {Number(booking.guests) > 1 ? t("propertyDetail.guestsPlural") : t("propertyDetail.guest")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                    {t("confirmation.sentTo")}
                  </p>
                  <p className="text-white font-medium">{booking.guestEmail}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-lg">{t("confirmation.totalPaid")}</span>
                  <span className="font-serif text-2xl font-bold text-gold">
                    ${booking.total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no session details */}
        {!booking && sessionId && (
          <div className="bg-[#1F2937] border border-white/10 p-8 mb-10 text-center">
            <p className="text-white/40 mb-2">
              {t("confirmation.paymentSuccess")}
            </p>
            <p className="text-white/30 text-sm">
              {t("confirmation.confirmationId")} {sessionId.slice(0, 24)}...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button as="a" href="/" size="md">
            {t("confirmation.backToHome")}
          </Button>
          <Button as="a" href="/properties" variant="outline" size="md">
            {t("confirmation.browseProperties")}
          </Button>
        </div>
      </div>
    </div>
  );
}
