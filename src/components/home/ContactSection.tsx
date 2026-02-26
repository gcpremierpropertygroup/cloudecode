"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { CONTACT_PHONE, CONTACT_PHONE_RAW, CONTACT_EMAIL } from "@/lib/constants";
import { useTranslation } from "@/i18n/LanguageContext";

export default function ContactSection() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-20 md:py-28 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-sm md:text-base font-bold tracking-[4px] uppercase mb-4">
            {t("contact.label")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white mt-3">
            {t("contact.title")}
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <AnimateOnScroll>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-gold" size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-1">
                    {t("contact.location")}
                  </h3>
                  <p className="text-white/50">{t("contact.locationValue")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center shrink-0">
                  <Mail className="text-gold" size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-1">
                    {t("contact.email")}
                  </h3>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-white/50 hover:text-gold transition-colors"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center shrink-0">
                  <Phone className="text-gold" size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-1">
                    {t("contact.phone")}
                  </h3>
                  <a
                    href={`tel:+1${CONTACT_PHONE_RAW}`}
                    className="text-white/50 hover:text-gold transition-colors"
                  >
                    {CONTACT_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Contact form */}
          <AnimateOnScroll delay={0.2}>
            {submitted ? (
              <div className="bg-gold/10 p-8 text-center">
                <h3 className="font-serif text-xl font-semibold text-white mb-2">
                  {t("contact.thankYou")}
                </h3>
                <p className="text-white/50">
                  {t("contact.thankYouMessage")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t("contact.namePlaceholder")}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    type="email"
                    placeholder={t("contact.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder={t("contact.subjectPlaceholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                />
                <textarea
                  placeholder={t("contact.messagePlaceholder")}
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={sending}
                >
                  {sending ? t("contact.sending") : t("contact.send")}
                </Button>
              </form>
            )}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
