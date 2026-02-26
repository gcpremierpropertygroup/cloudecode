"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Logo from "@/components/ui/Logo";
import { useTranslation } from "@/i18n/LanguageContext";

const bedroomOptions = ["1", "2", "3", "4", "5+"];
const bathroomOptions = ["1", "1.5", "2", "2.5", "3+"];

export default function AssessmentPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("MS");
  const [zip, setZip] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnished, setFurnished] = useState("");
  const [onAirbnb, setOnAirbnb] = useState("");
  const [notes, setNotes] = useState("");

  const furnishedOptions = [t("assessment.furnishedYes"), t("assessment.furnishedNo"), t("assessment.furnishedPartially")];
  const listingOptions = [t("assessment.listingYes"), t("assessment.listingNo"), t("assessment.listingPreviously")];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          address, city, state, zip,
          bedrooms, bathrooms, furnished, onAirbnb, notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setSending(false);
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6">
        <AnimateOnScroll>
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-gold/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="text-gold" size={40} />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              {t("assessment.successTitle")}
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-8">
              {t("assessment.successMessage")}
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center bg-gold text-white px-8 py-4 text-sm font-bold tracking-wider uppercase hover:bg-gold-light transition-colors"
            >
              {t("assessment.backToHome")}
            </a>
          </div>
        </AnimateOnScroll>
      </section>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 px-6 md:px-16 text-center">
        <AnimateOnScroll>
          <div className="flex justify-center mb-8">
            <Logo variant="full" height={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("assessment.title")}
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("assessment.subtitle")}
          </p>
        </AnimateOnScroll>
      </section>

      {/* Form */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Your Information */}
            <AnimateOnScroll>
              <div className="space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
                  {t("assessment.yourInfo")}
                </h2>
                <div className="w-[40px] h-[2px] bg-gold mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.firstName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.lastName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.email")}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.phone")}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Property Details */}
            <AnimateOnScroll delay={0.1}>
              <div className="space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
                  {t("assessment.propertyDetails")}
                </h2>
                <div className="w-[40px] h-[2px] bg-gold mb-6" />

                <div>
                  <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                    {t("assessment.address")}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.city")}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.state")}
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.zip")}
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.bedrooms")}
                    </label>
                    <select
                      required
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/30">
                        {t("assessment.select")}
                      </option>
                      {bedroomOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1F2937]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.bathrooms")}
                    </label>
                    <select
                      required
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/30">
                        {t("assessment.select")}
                      </option>
                      {bathroomOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1F2937]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.furnished")}
                    </label>
                    <select
                      required
                      value={furnished}
                      onChange={(e) => setFurnished(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/30">
                        {t("assessment.select")}
                      </option>
                      {furnishedOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1F2937]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-[2px] uppercase text-white/40 mb-2">
                      {t("assessment.onAirbnb")}
                    </label>
                    <select
                      required
                      value={onAirbnb}
                      onChange={(e) => setOnAirbnb(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-white/30">
                        {t("assessment.select")}
                      </option>
                      {listingOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#1F2937]">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Additional Notes */}
            <AnimateOnScroll delay={0.2}>
              <div className="space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white mb-2">
                  {t("assessment.notes")}
                </h2>
                <div className="w-[40px] h-[2px] bg-gold mb-6" />

                <textarea
                  rows={5}
                  placeholder={t("assessment.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#1F2937] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors resize-none"
                />
              </div>
            </AnimateOnScroll>

            {/* Submit */}
            <AnimateOnScroll delay={0.3}>
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-gold text-white px-12 py-4 text-sm font-bold tracking-[3px] uppercase hover:bg-gold-light transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sending ? t("assessment.submitting") : t("assessment.submit")}
                </button>
                <p className="text-white/30 text-sm mt-4">
                  {t("assessment.noObligation")}
                </p>
              </div>
            </AnimateOnScroll>
          </form>
        </div>
      </section>
    </>
  );
}
