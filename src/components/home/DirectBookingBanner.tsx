"use client";

import { Home, DollarSign, ArrowRight } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

export default function DirectBookingBanner() {
  const { t } = useTranslation();

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Gold accent glow */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-gold blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-16">
        <AnimateOnScroll>
          <div className="border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent p-10 md:p-16 relative overflow-hidden">
            {/* Large decorative icon */}
            <div className="absolute -top-4 -right-4 opacity-[0.04]">
              <Home size={280} strokeWidth={0.8} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              {/* Left: Message */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-gold text-base md:text-lg font-bold tracking-[5px] uppercase mb-5">
                  {t("directBooking.label")}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {t("directBooking.title1")}{" "}
                  <span className="text-gold">{t("directBooking.title2")}</span>
                </h2>
                <p className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl">
                  {t("directBooking.description")}
                </p>
              </div>

              {/* Right: Highlights + CTA */}
              <div className="shrink-0 flex flex-col items-center lg:items-start gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-full">
                    <DollarSign className="text-gold" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{t("directBooking.feature1.title")}</p>
                    <p className="text-white/40 text-sm">{t("directBooking.feature1.desc")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-full">
                    <Home className="text-gold" size={24} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{t("directBooking.feature2.title")}</p>
                    <p className="text-white/40 text-sm">{t("directBooking.feature2.desc")}</p>
                  </div>
                </div>

                <Button
                  as="a"
                  href="/management"
                  size="lg"
                  className="mt-4 group"
                >
                  {t("directBooking.cta")}
                  <ArrowRight
                    className="inline-block ml-2 group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
