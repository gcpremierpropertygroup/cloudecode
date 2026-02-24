import { TrendingUp, Shield, Star, BarChart3 } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const features = [
  {
    icon: TrendingUp,
    title: "Revenue Maximized",
    description:
      "Dynamic pricing powered by real-time market data ensures you earn the most on every booking.",
  },
  {
    icon: Shield,
    title: "Fully Managed",
    description:
      "Guests, cleaning, maintenance, reviews — we handle every touchpoint so you never have to.",
  },
  {
    icon: Star,
    title: "Superhost Standards",
    description:
      "Five-star hospitality that drives repeat bookings and top search rankings on Airbnb.",
  },
  {
    icon: BarChart3,
    title: "Full Transparency",
    description:
      "Clear reporting on occupancy, revenue, and expenses. You always know how your property is performing.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-32 md:py-44 bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Header - full width centered */}
        <AnimateOnScroll>
          <div className="text-center mb-16 md:mb-24">
            <p className="text-gold text-base md:text-lg font-bold tracking-[5px] uppercase mb-5">
              Why Property Owners Choose Us
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6">
              Your Property. Our Priority.
            </h2>
            <div className="w-20 h-[2px] bg-gold mx-auto mb-8" />
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
              G|C Premier Property Group is a full-service short-term rental
              management company in Jackson, Mississippi. We turn your property
              into a top-performing asset — while you enjoy hands-off ownership.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Feature cards - full width row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <AnimateOnScroll key={feature.title} delay={i * 0.1}>
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
