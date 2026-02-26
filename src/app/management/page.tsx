import type { Metadata } from "next";
import { FAQJsonLd, ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import ManagementContent from "./ManagementContent";

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
      <ManagementContent />
    </>
  );
}
