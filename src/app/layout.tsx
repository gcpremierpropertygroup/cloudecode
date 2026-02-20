import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GC Premier Property Group",
  description:
    "Premium real estate services — buying, selling, and property management by GC Premier Property Group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
