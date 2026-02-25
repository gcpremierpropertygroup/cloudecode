import type { Metadata } from "next";
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
import { FAQJsonLd, ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const faqs = [
  {
    question: "How much does Airbnb property management cost in Jackson, MS?",
    answer:
      "G|C Premier Property Group charges a competitive management fee based on a percentage of rental revenue. There are no hidden fees, and you only pay when your property earns. Contact us for a free property assessment and detailed pricing.",
  },
  {
    question: "What does your short-term rental management service include?",
    answer:
      "Our full-service management includes listing creation and optimization, professional photography, dynamic pricing, guest communication and screening, professional cleaning and turnover, maintenance coordination, review management, and monthly financial reporting.",
  },
  {
    question: "How do you maximize occupancy and revenue for my property?",
    answer:
      "We use data-driven dynamic pricing that adjusts nightly rates based on demand, local events, seasonality, and competitor analysis. Combined with optimized listings and Superhost-level hospitality, our managed properties average 90%+ occupancy rates.",
  },
  {
    question: "Do I need to be in Jackson to have my property managed?",
    answer:
      "No. Many of our property owners are remote. We handle everything on-site — from guest check-ins to maintenance emergencies — and provide transparent reporting so you always know how your property is performing.",
  },
  {
    question: "What areas in Jackson, MS do you manage properties?",
    answer:
      "We manage short-term rental properties throughout the Jackson, Mississippi metro area, including Eastover, Fondren, Belhaven, Northeast Jackson, and surrounding communities.",
  },
];

export const metadata: Metadata = {
  title: "Airbnb & Short-Term Rental Management Services in Jackson, MS",
  description:
    "Full-service Airbnb & VRBO property management in Jackson, Mississippi. Listing optimization, dynamic pricing, professional cleaning, guest communication, maintenance & financial reporting. Get a free property assessment today.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/management",
  },
};

const services = [
  {
    icon: Camera,
    title: "Listing Creation & Optimization",
    description:
      "Professional photography, compelling descriptions, and strategic keyword placement to maximize visibility on Airbnb, Vrbo, and direct booking channels.",
  },
  {
    icon: DollarSign,
    title: "Dynamic Pricing",
    description:
      "Data-driven pricing strategies that adjust nightly rates based on demand, local events, seasonality, and competitor analysis.",
  },
  {
    icon: MessageSquare,
    title: "Guest Communication & Screening",
    description:
      "Every booking is screened, every question answered promptly, and every guest welcomed — from first inquiry to final review.",
  },
  {
    icon: Sparkles,
    title: "Cleaning & Turnover Management",
    description:
      "Professional cleaning teams ensure your property is spotless, restocked, and guest-ready between every stay with zero downtime.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Property Care",
    description:
      "Routine inspections, coordinated repairs, and year-round upkeep so small issues never become big problems.",
  },
  {
    icon: Star,
    title: "Review & Reputation Management",
    description:
      "We deliver five-star experiences and respond to every review to build and protect your property's reputation.",
  },
  {
    icon: FileBarChart,
    title: "Financial Reporting",
    description:
      "Clear, regular reports on occupancy, revenue, expenses, and performance trends so you always know where you stand.",
  },
];

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Property Assessment",
    description:
      "We evaluate your property's earning potential with a detailed market analysis and revenue projection.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Professional Setup",
    description:
      "We handle photography, listing creation, pricing strategy, and everything needed to go live.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Launch & Manage",
    description:
      "Your property goes live. We manage guests, cleaning, maintenance, and reviews — you collect income.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Optimize & Grow",
    description:
      "Ongoing pricing optimization, performance reporting, and strategic improvements to maximize your returns.",
  },
];

const stats = [
  {
    icon: Award,
    value: "Superhost",
    label: "Status Maintained",
  },
  {
    icon: Star,
    value: "4.88",
    label: "Average Guest Rating",
  },
  {
    icon: Calendar,
    value: "90%+",
    label: "Average Occupancy",
  },
  {
    icon: Users,
    value: "24/7",
    label: "Owner & Guest Support",
  },
];

export default function ManagementPage() {
  return (
    <>
      <FAQJsonLd faqs={faqs} />
      <ServiceJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.gcpremierproperties.com" },
          { name: "Property Management", url: "https://www.gcpremierproperties.com/management" },
        ]}
      />
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
              Property Management
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              Full-Service Management.{" "}
              <span className="text-gold">Maximum Returns.</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              We manage every detail of your short-term rental — from listing
              optimization to five-star reviews — so you can enjoy the returns
              without the work.
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
                Our Services
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                Everything Your Property Needs
              </h2>
              <div className="w-12 h-[2px] bg-gold mx-auto mb-6" />
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                We take your property from listed to leading. Here&apos;s
                what&apos;s included.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {services.map((service, i) => (
              <AnimateOnScroll key={service.title} delay={i * 0.08}>
                <div className="bg-[#1F2937] border border-white/10 p-10 md:p-12 hover:border-gold/20 transition-all duration-500 group">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gold/10 flex items-center justify-center mb-8 group-hover:bg-gold/20 transition-colors duration-300">
                    <service.icon className="text-gold" size={32} />
                  </div>

                  {/* Content */}
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
        {/* Background glow */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-20">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                How It Works
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                Four Steps to Passive Income
              </h2>
              <div className="w-12 h-[2px] bg-gold mx-auto mb-6" />
              <p className="text-white/50 text-lg max-w-2xl mx-auto">
                From assessment to ongoing management — we make it simple.
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10">
            {steps.map((step, i) => (
              <AnimateOnScroll key={step.title} delay={i * 0.15}>
                <div className="relative text-center group">
                  {/* Step number */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gold/10 border border-gold/20 flex items-center justify-center rounded-full group-hover:bg-gold/20 transition-colors duration-300">
                    <span className="font-serif text-2xl font-bold text-gold">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <step.icon
                    className="mx-auto text-white/30 mb-4"
                    size={28}
                  />

                  {/* Content */}
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

      {/* Stats / Social Proof */}
      <section className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                By The Numbers
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
                Results That Speak for Themselves
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 0.1}>
                <div className="bg-[#1F2937] border border-white/10 p-6 md:p-8 text-center hover:border-gold/20 transition-colors duration-300">
                  <stat.icon
                    className="text-gold mx-auto mb-3"
                    size={28}
                  />
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

      {/* FAQ Section */}
      <section className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-4">
                Common Questions
              </p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4">
                Frequently Asked Questions
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
              Wondering What Your Property{" "}
              <span className="text-gold">Could Earn?</span>
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              Whether you already have a short-term rental or you&apos;re
              considering turning your property into one, we&apos;ll give you an
              honest assessment of its potential — no strings attached.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="/assessment" size="lg">
                Get Your Free Assessment
              </Button>
              <Button as="a" href="/#contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
