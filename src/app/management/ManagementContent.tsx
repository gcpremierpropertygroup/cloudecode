"use client";

import {
  Camera,
  DollarSign,
  MessageSquare,
  Sparkles,
  Wrench,
  Star,
  FileBarChart,
  ClipboardCheck,
  Rocket,
  TrendingUp,
  Award,
  Users,
  Calendar,
} from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";

const serviceIcons = [Camera, DollarSign, MessageSquare, Sparkles, Wrench, Star, FileBarChart];
const stepIcons = [ClipboardCheck, Camera, Rocket, TrendingUp];
const statIcons = [Award, Star, Calendar, Users];

export default function ManagementContent() {
  const { t } = useTranslation();

  const services = [
    { icon: serviceIcons[0], title: t("mgmt.service1.title"), description: t("mgmt.service1.desc") },
    { icon: serviceIcons[1], title: t("mgmt.service2.title"), description: t("mgmt.service2.desc") },
    { icon: serviceIcons[2], title: t("mgmt.service3.title"), description: t("mgmt.service3.desc") },
    { icon: serviceIcons[3], title: t("mgmt.service4.title"), description: t("mgmt.service4.desc") },
    { icon: serviceIcons[4], title: t("mgmt.service5.title"), description: t("mgmt.service5.desc") },
    { icon: serviceIcons[5], title: t("mgmt.service6.title"), description: t("mgmt.service6.desc") },
    { icon: serviceIcons[6], title: t("mgmt.service7.title"), description: t("mgmt.service7.desc") },
  ];

  const steps = [
    { number: "01", icon: stepIcons[0], title: t("mgmt.step1.title"), description: t("mgmt.step1.desc") },
    { number: "02", icon: stepIcons[1], title: t("mgmt.step2.title"), description: t("mgmt.step2.desc") },
    { number: "03", icon: stepIcons[2], title: t("mgmt.step3.title"), description: t("mgmt.step3.desc") },
    { number: "04", icon: stepIcons[3], title: t("mgmt.step4.title"), description: t("mgmt.step4.desc") },
  ];

  const stats = [
    { icon: statIcons[0], value: "Superhost", label: t("mgmt.stat1") },
    { icon: statIcons[1], value: "4.88", label: t("mgmt.stat2") },
    { icon: statIcons[2], value: "90%+", label: t("mgmt.stat3") },
    { icon: statIcons[3], value: "24/7", label: t("mgmt.stat4") },
  ];

  const faqs = [
    { question: t("mgmt.faq1.q"), answer: t("mgmt.faq1.a") },
    { question: t("mgmt.faq2.q"), answer: t("mgmt.faq2.a") },
    { question: t("mgmt.faq3.q"), answer: t("mgmt.faq3.a") },
    { question: t("mgmt.faq4.q"), answer: t("mgmt.faq4.a") },
    { question: t("mgmt.faq5.q"), answer: t("mgmt.faq5.a") },
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
              {t("mgmt.label")}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              {t("mgmt.title1")}{" "}
              <span className="text-gold">{t("mgmt.title2")}</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              {t("mgmt.subtitle")}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                {t("mgmt.servicesLabel")}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                {t("mgmt.servicesTitle")}
              </h2>
              <div className="w-12 h-[2px] bg-gold mx-auto mb-6" />
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                {t("mgmt.servicesSubtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {services.map((service, i) => (
              <AnimateOnScroll key={i} delay={i * 0.08}>
                <div className="bg-[#1F2937] border border-white/10 p-10 md:p-12 hover:border-gold/20 transition-all duration-500 group">
                  <div className="w-16 h-16 bg-gold/10 flex items-center justify-center mb-8 group-hover:bg-gold/20 transition-colors duration-300">
                    <service.icon className="text-gold" size={32} />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-white/50 text-base md:text-lg leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-36 bg-[#0F172A] relative overflow-hidden px-6 md:px-16">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-20">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                {t("mgmt.howLabel")}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                {t("mgmt.howTitle")}
              </h2>
              <div className="w-12 h-[2px] bg-gold mx-auto mb-6" />
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                {t("mgmt.howSubtitle")}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10">
            {steps.map((step, i) => (
              <AnimateOnScroll key={i} delay={i * 0.15}>
                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-full group-hover:bg-gold/20 transition-colors duration-300">
                    <span className="font-serif text-2xl font-bold text-gold">
                      {step.number}
                    </span>
                  </div>
                  <step.icon className="mx-auto text-white/30 mb-4" size={28} />
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/40 text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                {t("mgmt.statsLabel")}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
                {t("mgmt.statsTitle")}
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={i} delay={i * 0.1}>
                <div className="bg-[#1F2937] border border-white/10 p-6 md:p-8 text-center hover:border-gold/20 transition-colors duration-300">
                  <stat.icon className="text-gold mx-auto mb-3" size={28} />
                  <p className="text-gold text-3xl md:text-4xl font-bold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-sm">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                {t("mgmt.faqLabel")}
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                {t("mgmt.faqTitle")}
              </h2>
              <div className="w-12 h-[2px] bg-gold mx-auto" />
            </div>
          </AnimateOnScroll>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <AnimateOnScroll key={i} delay={i * 0.08}>
                <div className="bg-[#1F2937] border border-white/10 p-8 hover:border-gold/20 transition-colors duration-300">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-white/50 text-base leading-relaxed">
                    {faq.answer}
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
              {t("mgmt.ctaTitle")}
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              {t("mgmt.ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="/assessment" size="lg">
                {t("mgmt.ctaButton1")}
              </Button>
              <Button as="a" href="/#contact" variant="secondary" size="lg">
                {t("mgmt.ctaButton2")}
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
