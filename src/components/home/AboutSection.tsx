import { Award, Shield, MapPin, BarChart3 } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const features = [
  {
    icon: Award,
    title: "Superhost Standards",
    description:
      "Every property maintains the highest standards of cleanliness, comfort, and guest communication.",
  },
  {
    icon: Shield,
    title: "Professionally Managed",
    description:
      "Hands-off ownership with full-service property management you can trust.",
  },
  {
    icon: MapPin,
    title: "Local Expertise",
    description:
      "Deep knowledge of Jackson's best neighborhoods, attractions, and hidden gems.",
  },
  {
    icon: BarChart3,
    title: "Best Direct Rates",
    description:
      "Book directly with us for the best available rates — no middleman fees.",
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
              Who We Are
            </p>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6">
              Managed with Care
            </h2>
            <div className="w-20 h-[2px] bg-gold mx-auto mb-8" />
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-4">
              G|C Premier Property Group specializes in short-term rental
              management in Jackson, Mississippi. We treat every property as our
              own, delivering Superhost standards with professional care.
            </p>
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto">
              Our properties are guest-ready at all times, professionally
              cleaned, and thoughtfully furnished to create memorable stays.
              Whether you&apos;re visiting for business or leisure, we make Jackson
              feel like home.
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
