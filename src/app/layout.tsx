import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierproperties.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  verification: {
    google: "5S8oMhzRMzCw_xGnSfFSQVowzNM3iEEsVc8W5uSWTUg",
  },
  title: {
    default: "G|C Premier Property Group | Book Your Stay in Jackson, MS",
    template: "%s | G|C Premier Property Group",
  },
  description:
    "Jackson, MS's trusted Airbnb & VRBO management company. Full-service property management with Superhost standards — dynamic pricing, guest communication, cleaning & 90%+ occupancy rates. Book direct or get a free property assessment.",
  keywords: [
    "Airbnb management Jackson MS",
    "short-term rental management Jackson Mississippi",
    "VRBO property management Jackson",
    "vacation rental management Jackson MS",
    "Airbnb property manager Jackson Mississippi",
    "short-term rental property management",
    "Airbnb co-host Jackson MS",
    "property management Jackson Mississippi",
    "book direct Jackson MS rental",
    "Superhost property manager",
    "G|C Premier Property Group",
  ],
  authors: [{ name: "G|C Premier Property Group" }],
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "G|C Premier Property Group | Airbnb & STR Management in Jackson, MS",
    description:
      "Full-service Airbnb & VRBO management in Jackson, Mississippi. Dynamic pricing, professional cleaning, guest communication & 90%+ occupancy rates. Book direct for the best rates.",
    type: "website",
    locale: "en_US",
    siteName: "G|C Premier Property Group",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "G|C Premier Property Group — Premium Rentals in Jackson, MS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "G|C Premier Property Group | Airbnb Management Jackson, MS",
    description:
      "Full-service Airbnb & VRBO management in Jackson, Mississippi. 90%+ occupancy, Superhost standards, dynamic pricing.",
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans bg-[#111827] text-[#E2E8F0] antialiased`}
      >
        <LocalBusinessJsonLd />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
