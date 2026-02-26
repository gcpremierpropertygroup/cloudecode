"use client";

import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

export default function CTABanner() {
  const { t } = useTranslation();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#0F172A] to-[#111827] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
            {t("cta.title1")}{" "}
            <span className="text-gold">{t("cta.title2")}</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="a" href="/assessment" size="lg">
              {t("cta.cta1")}
            </Button>
            <Button as="a" href="/management" variant="secondary" size="lg">
              {t("cta.cta2")}
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
