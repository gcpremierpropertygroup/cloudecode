"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isKrishna = pathname?.startsWith("/krishna");
  return (
    <>
      {!isAdmin && !isKrishna && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!isAdmin && !isKrishna && <Footer />}
    </>
  );
}
