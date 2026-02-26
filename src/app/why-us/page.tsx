import type { Metadata } from "next";
import WhyUsContent from "./WhyUsContent";

export const metadata: Metadata = {
  title: "Why Choose G|C Premier — Airbnb Management That Maximizes Revenue",
  description:
    "We don't just list your property and hope for the best. G|C Premier actively optimizes pricing, guest experience, and operations to maximize your short-term rental revenue in Jackson, MS. 90%+ occupancy rates.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/why-us",
  },
};

export default function WhyUsPage() {
  return <WhyUsContent />;
}
