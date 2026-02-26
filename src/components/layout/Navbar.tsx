"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Facebook, Instagram } from "lucide-react";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { t } = useTranslation();

  const navLabelMap: Record<string, string> = {
    "/properties": t("nav.bookWithUs"),
    "/reviews": t("nav.reviews"),
    "/management": t("nav.management"),
    "/blog": t("nav.blog"),
    "/#contact": t("nav.contact"),
  };

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
          {/* Stacked text logo on mobile */}
          <Link href="/" className="md:hidden flex flex-col leading-none" aria-label="G|C Premier Property Group — Home">
            <span className="font-serif text-white text-xl font-bold tracking-wide">G|C</span>
            <span className="text-white/70 text-[8px] font-bold tracking-[2px] uppercase">Premier Property Group</span>
          </Link>
          {/* Image logo on tablet+ */}
          <div className="hidden md:block">
            <Logo variant="compact" height={44} className="-mt-[1px]" />
          </div>

          {/* Desktop nav */}
          <div className="hidden xl:flex items-center gap-6">
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
                {navLabelMap[link.href] || link.label}
              </Link>
            ))}
            {/* Social icons + language */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
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
              <LanguageSwitcher />
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
                {t("nav.bookNow")}
              </button>
            ) : (
              <Link
                href="/properties"
                className="bg-gold text-white px-5 py-2 text-xs font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
              >
                {t("nav.bookNow")}
              </Link>
            )}
          </div>

          {/* Flags + hamburger (visible below xl) */}
          <div className="flex xl:hidden items-center gap-2 ml-auto">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
                {navLabelMap[link.href] || link.label}
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
                {t("nav.bookNow")}
              </button>
            ) : (
              <Link
                href="/properties"
                onClick={() => setMobileOpen(false)}
                className="bg-gold text-white px-8 py-3 text-sm font-bold tracking-wider uppercase mt-4"
              >
                {t("nav.bookNow")}
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
