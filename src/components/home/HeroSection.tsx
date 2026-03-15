"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

export default function HeroSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background — video loop with dark overlay */}
      <div className="absolute inset-0 bg-[#060911]">
        {shouldReduceMotion === true ? (
          <Image
            src="/images/hero.jpg"
            alt="Premium rental property at twilight"
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.3) 60%, rgba(6,9,17,0.92) 100%)",
          }}
        />
      </div>

      {/* Ambient warm glow — top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "800px",
          height: "800px",
          top: "-20%",
          left: "-15%",
          background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)",
          animation: "slowPulse 6s ease-in-out infinite",
        }}
      />
      {/* Ambient warm glow — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "700px",
          height: "700px",
          bottom: "-10%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)",
          animation: "slowPulse 6s ease-in-out infinite",
          animationDelay: "3s",
        }}
      />

      <div className="relative z-10 text-center px-6 md:px-12 lg:px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gold text-sm md:text-base font-bold tracking-[5px] uppercase mb-4 md:mb-6"
        >
          {t("hero.location")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 md:mb-6"
        >
          {t("hero.title1")}{" "}
          <br className="hidden md:block" />
          <span className="text-gold">{t("hero.title2")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-white/80 text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button as="a" href="/assessment" size="lg">
            {t("hero.cta1")}
          </Button>
          <Button as="a" href="/management" variant="secondary" size="lg">
            {t("hero.cta2")}
          </Button>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#111827] to-transparent" />
    </section>
  );
}
