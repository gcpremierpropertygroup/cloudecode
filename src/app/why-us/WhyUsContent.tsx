"use client";

import { BarChart3, Home, Star, Handshake } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

const featureIcons = [BarChart3, Home, Star, Handshake];

export default function WhyUsContent() {
  const { t } = useTranslation();

  const features = [
    { icon: featureIcons[0], title: t("whyUs.feature1.title"), description: t("whyUs.feature1.desc") },
    { icon: featureIcons[1], title: t("whyUs.feature2.title"), description: t("whyUs.feature2.desc") },
    { icon: featureIcons[2], title: t("whyUs.feature3.title"), description: t("whyUs.feature3.desc") },
    { icon: featureIcons[3], title: t("whyUs.feature4.title"), description: t("whyUs.feature4.desc") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gold blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-6">
              {t("whyUs.label")}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              {t("whyUs.title1")}{" "}
              <span className="text-gold">{t("whyUs.title2")}</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              {t("whyUs.subtitle")}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {features.map((feature, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <div className="bg-[#1F2937] border border-white/10 p-10 md:p-12 hover:border-gold/20 transition-all duration-500 group">
                  <div className="w-16 h-16 bg-gold/10 flex items-center justify-center mb-8 group-hover:bg-gold/20 transition-colors duration-300">
                    <feature.icon className="text-gold" size={32} />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
              {t("whyUs.ctaTitle")}
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              {t("whyUs.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="/assessment" size="lg">
                {t("whyUs.ctaButton1")}
              </Button>
              <Button as="a" href="/properties" variant="secondary" size="lg">
                {t("whyUs.ctaButton2")}
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
