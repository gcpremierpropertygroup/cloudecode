"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Facebook, Instagram } from "lucide-react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showSolid = scrolled || !isHome;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          showSolid
            ? "bg-[#111827]/95 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto pl-4 pr-6 md:pl-8 md:pr-16 flex items-center justify-between h-20">
          <Logo variant="compact" height={44} className="-mt-[1px]" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wider uppercase transition-colors",
                  pathname === link.href
                    ? "text-gold"
                    : "text-white/70 hover:text-gold"
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* Social icons */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
            </div>

            {pathname.startsWith("/properties/") ? (
              <button
                onClick={() => {
                  const calendar = document.querySelector(".rdp");
                  if (calendar) {
                    calendar.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                className="bg-gold text-white px-5 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
              >
                Book Now
              </button>
            ) : (
              <Link
                href="/properties"
                className="bg-gold text-white px-5 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
              >
                Book Now
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-[#111827] flex flex-col items-center justify-center gap-8"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-serif text-white hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {pathname.startsWith("/properties/") ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => {
                    const calendar = document.querySelector(".rdp");
                    if (calendar) {
                      calendar.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }, 300);
                }}
                className="bg-gold text-white px-8 py-3 text-sm font-bold tracking-wider uppercase mt-4"
              >
                Book Now
              </button>
            ) : (
              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="bg-gold text-white px-8 py-3 text-sm font-bold tracking-wider uppercase mt-4"
              >
                Book Now
              </Link>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-5 mt-6">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={26} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={26} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
