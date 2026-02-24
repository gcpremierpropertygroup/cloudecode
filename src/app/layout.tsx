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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.gcpremierpropertygroup.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "G|C Premier Property Group | Book Your Stay in Jackson, MS",
    template: "%s | G|C Premier Property Group",
  },
  description:
    "Premium short-term rental properties in Jackson, Mississippi. Book directly for the best rates. Superhost standards with professional management.",
  keywords: [
    "Jackson Mississippi",
    "short-term rental",
    "Airbnb",
    "vacation rental",
    "property management",
    "book direct",
    "Superhost",
    "G|C Premier",
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
    title: "G|C Premier Property Group",
    description:
      "Premium short-term rental properties in Jackson, Mississippi. Book directly for the best rates.",
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
    title: "G|C Premier Property Group",
    description:
      "Premium short-term rental properties in Jackson, Mississippi.",
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
