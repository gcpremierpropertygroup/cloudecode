"use client";

import { TrendingUp, Shield, Star, BarChart3 } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useTranslation } from "@/i18n/LanguageContext";

const featureIcons = [TrendingUp, Shield, Star, BarChart3];

export default function AboutSection() {
  const { t } = useTranslation();

  const features = [
    { icon: featureIcons[0], title: t("about.feature1.title"), description: t("about.feature1.desc") },
    { icon: featureIcons[1], title: t("about.feature2.title"), description: t("about.feature2.desc") },
    { icon: featureIcons[2], title: t("about.feature3.title"), description: t("about.feature3.desc") },
    { icon: featureIcons[3], title: t("about.feature4.title"), description: t("about.feature4.desc") },
  ];

  return (
    <section id="about" className="py-32 md:py-44 bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header - full width centered */}
        <AnimateOnScroll>
          <div className="text-center mb-16 md:mb-24">
            <p className="text-gold text-base md:text-lg font-bold tracking-[5px] uppercase mb-5">
              {t("about.label")}
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6">
              {t("about.title")}
            </h2>
            <div className="w-20 h-[2px] bg-gold mx-auto mb-8" />
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
              {t("about.description")}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Feature cards - full width row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <AnimateOnScroll key={i} delay={i * 0.1}>
              <div className="bg-[#1F2937] border border-white/10 p-10 hover:bg-white/5 transition-colors text-center">
                <feature.icon className="text-gold mb-6 mx-auto" size={42} />
                <h3 className="font-serif text-2xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
