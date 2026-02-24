import { ClipboardCheck, Camera, TrendingUp } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const steps = [
  {
    number: "1",
    icon: ClipboardCheck,
    title: "We Assess Your Property",
    description:
      "We evaluate your home's earning potential with a detailed market analysis, revenue projection, and setup plan — completely free.",
  },
  {
    number: "2",
    icon: Camera,
    title: "We Set Up & List It",
    description:
      "Professional photography, optimized listings, dynamic pricing, and everything needed to get your property live and earning on Airbnb and VRBO.",
  },
  {
    number: "3",
    icon: TrendingUp,
    title: "You Earn, We Handle It",
    description:
      "Guest communication, cleaning coordination, maintenance, reviews — we manage it all. You just collect the income.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-36 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <SectionLabel className="text-sm tracking-[5px]">How It Works</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-white mt-4">
            Three Steps to Passive Income
          </h2>
          <Divider className="mx-auto" />
          <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
            We make it simple. You own the property — we do everything else.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, i) => (
            <AnimateOnScroll key={step.number} delay={i * 0.15}>
              <div className="relative text-center group">
                {/* Step number */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-gold/10 border border-gold/20 group-hover:bg-gold/20 transition-colors duration-300" />
                  <span className="relative font-serif text-4xl font-bold text-gold">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <step.icon className="mx-auto text-white/30" size={36} />
                </div>

                {/* Content */}
                <h3 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
