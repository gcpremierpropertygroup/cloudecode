"use client";

import { Star, Quote } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { useTranslation } from "@/i18n/LanguageContext";

const reviews = [
  {
    name: "Dawn",
    property: "Brand New Spacious House",
    rating: 5,
    text: "Perfect host — the home was clean and ready when we arrived. Great space for our group trip, fenced backyard was a bonus. Will definitely book again.",
    date: "January 2026",
  },
  {
    name: "Brandi",
    property: "The Eastover House",
    rating: 5,
    text: "Fantastic stay for a family Christmas gathering. The home was spacious, clean, and had everything we needed. Guillermo was very responsive and accommodating. Highly recommend!",
    date: "December 2025",
  },
  {
    name: "Nadia",
    property: "Brand New Spacious House",
    rating: 5,
    text: "I really enjoyed my stay. The house was great, very clean, and the host was super responsive. Everything was exactly as described — highly recommend!",
    date: "December 2025",
  },
  {
    name: "Deidre",
    property: "The Eastover House",
    rating: 5,
    text: "I love this place!! It was clean, comfortable, warm and welcoming! The host was very responsive and helpful throughout our stay. Will definitely be back.",
    date: "November 2025",
  },
  {
    name: "Felipe",
    property: "Brand New Spacious House",
    rating: 5,
    text: "Very responsive and extremely easy to work with. 10/10 experience from start to finish. The house was exactly as shown and everything worked perfectly.",
    date: "November 2025",
  },
  {
    name: "Neil",
    property: "The Pine Lane Greenhouse",
    rating: 5,
    text: "Nice place to stay on the northern side of Jackson. Clean, comfortable, and everything was as described. Easy check-in and great communication.",
    date: "December 2025",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className="fill-gold text-gold"
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-[#0F172A] py-24 md:py-32">
      <div className="container-custom">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <p className="text-gold font-sans text-sm md:text-base tracking-[4px] uppercase mb-4">
              {t("reviews.label")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              {t("reviews.title")}
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t("reviews.subtitle")}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review, index) => (
            <AnimateOnScroll
              key={index}
              delay={index * 0.1}
            >
              <div className="bg-[#1F2937] border border-white/10 rounded-lg p-8 h-full flex flex-col hover:border-gold/30 transition-colors duration-300">
                <div className="flex items-start justify-between mb-4">
                  <StarRating rating={review.rating} />
                  <Quote size={24} className="text-gold/30" />
                </div>

                <p className="text-white/70 text-base leading-relaxed mb-6 flex-grow">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-white font-semibold text-sm">
                    {review.name}
                  </p>
                  <p className="text-gold/70 text-xs mt-1">
                    {review.property} &middot; {review.date}
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.4}>
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-[#1F2937] border border-white/10 rounded-full px-6 py-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="fill-gold text-gold" />
                ))}
              </div>
              <span className="text-white/60 text-sm">
                {t("reviews.stats")}
              </span>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
