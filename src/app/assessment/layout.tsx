import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Property Assessment | G|C Premier Property Group",
  description:
    "Get a free evaluation of your property's short-term rental potential in Jackson, MS. Revenue projection within 24 hours. No obligation.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/assessment",
  },
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
