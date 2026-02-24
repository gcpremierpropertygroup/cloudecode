"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionTitle from "@/components/ui/SectionTitle";
import Divider from "@/components/ui/Divider";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { CONTACT_PHONE, CONTACT_PHONE_RAW, CONTACT_EMAIL } from "@/lib/constants";

export default function ContactSection() {
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
          <SectionLabel>Get In Touch</SectionLabel>
          <SectionTitle className="mt-3">Contact Us</SectionTitle>
          <Divider className="mx-auto" />
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
                    Location
                  </h3>
                  <p className="text-white/50">Jackson, Mississippi</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold/10 flex items-center justify-center shrink-0">
                  <Mail className="text-gold" size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-1">
                    Email
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
                    Phone
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
                  Thank you!
                </h3>
                <p className="text-white/50">
                  We&apos;ll get back to you as soon as possible.
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
                    placeholder="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                />
                <textarea
                  placeholder="Your Message"
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
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
