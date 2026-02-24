import type { Metadata } from "next";
import { BarChart3, Home, Star, Handshake } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Why G|C Premier | Your Revenue Partner in Jackson, MS",
  description:
    "We don't just list your property and hope for the best. We actively optimize every detail to maximize your return.",
};

const features = [
  {
    icon: BarChart3,
    title: "Dynamic Pricing Strategy",
    description:
      "We adjust rates daily based on demand, local events, seasonality, and competitor analysis to maximize your nightly revenue.",
  },
  {
    icon: Home,
    title: "Full-Service Operations",
    description:
      "Cleaning, maintenance, guest screening, check-in/out — we handle every touchpoint so you never have to.",
  },
  {
    icon: Star,
    title: "Superhost-Level Hospitality",
    description:
      "Our five-star guest experience drives repeat bookings and top search rankings on Airbnb and VRBO.",
  },
  {
    icon: Handshake,
    title: "Owner-First Transparency",
    description:
      "Clear reporting, open communication, and no hidden fees. You always know exactly how your property is performing.",
  },
];

export default function WhyUsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gold blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-6">
              Why G|C Premier
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              Not Just a Property Manager.{" "}
              <span className="text-gold">Your Revenue Partner.</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              We don&apos;t just list your property and hope for the best. We actively
              optimize every detail to maximize your return.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {features.map((feature, i) => (
              <AnimateOnScroll key={feature.title} delay={i * 0.1}>
                <div className="bg-[#1F2937] border border-white/10 p-10 md:p-12 hover:border-gold/20 transition-all duration-500 group">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gold/10 flex items-center justify-center mb-8 group-hover:bg-gold/20 transition-colors duration-300">
                    <feature.icon className="text-gold" size={32} />
                  </div>

                  {/* Content */}
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
              Ready to Maximize Your{" "}
              <span className="text-gold">Property&apos;s Potential?</span>
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              Get a free property assessment and revenue projection. No
              obligations, no hidden fees — just honest numbers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="/assessment" size="lg">
                Get Your Free Assessment
              </Button>
              <Button as="a" href="/properties" variant="secondary" size="lg">
                See Our Properties
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
