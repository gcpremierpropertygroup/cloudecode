import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { SOCIAL_LINKS, CONTACT_PHONE, CONTACT_PHONE_RAW, CONTACT_EMAIL } from "@/lib/constants";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Logo variant="full" height={44} />
            <p className="mt-4 text-sm leading-relaxed">
              Premium short-term rental properties in Jackson, Mississippi.
              Managed with care, delivering Superhost standards.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg text-white mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/" className="hover:text-gold transition-colors">
                Home
              </Link>
              <Link href="/properties" className="hover:text-gold transition-colors">
                Properties
              </Link>
              <Link href="/why-us" className="hover:text-gold transition-colors">
                Why Us
              </Link>
              <Link href="/management" className="hover:text-gold transition-colors">
                Management
              </Link>
              <Link href="/#about" className="hover:text-gold transition-colors">
                About Us
              </Link>
              <Link href="/#contact" className="hover:text-gold transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg text-white mb-4">Get In Touch</h3>
            <p className="text-sm mb-3">Jackson, Mississippi</p>
            <a
              href={`tel:+1${CONTACT_PHONE_RAW}`}
              className="block text-sm mb-3 hover:text-gold transition-colors"
            >
              {CONTACT_PHONE}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="block text-sm mb-6 hover:text-gold transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} G|C Premier Property Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
