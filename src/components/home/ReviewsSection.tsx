"use client";

import { Star, Quote } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";

const reviews = [
  {
    name: "Monica",
    property: "The Eastover House",
    rating: 5,
    text: "Chaves was an excellent host. Anytime we needed something he responded immediately. The home was very clean and comfortable with a home away from home feel. We will definitely be back. Highly Recommend!",
    date: "February 2025",
  },
  {
    name: "Megan",
    property: "The Eastover House",
    rating: 5,
    text: "Great stay! Very clean, spacious home. Chaves was very helpful and responsive. Would definitely recommend to anyone visiting Jackson.",
    date: "January 2025",
  },
  {
    name: "Mark",
    property: "The Eastover House",
    rating: 5,
    text: "Chaves was great. Very responsive to any need that we had. We thoroughly enjoyed our time in this great home. Neighborhood was quiet and felt very safe. I would definitely stay here again.",
    date: "December 2024",
  },
  {
    name: "Jasmine",
    property: "The Eastover House",
    rating: 5,
    text: "This home was absolutely beautiful and so spacious. We had more than enough room for my family. Chaves was very attentive and made our stay comfortable. I highly recommend this property!",
    date: "November 2024",
  },
  {
    name: "Keisha",
    property: "The Eastover House",
    rating: 5,
    text: "Great location, beautiful home, and an amazing host. Everything was clean and well-maintained. Check-in was smooth and easy. We will be booking again for sure!",
    date: "October 2024",
  },
  {
    name: "Anthony",
    property: "The Eastover House",
    rating: 5,
    text: "Perfect place for our group trip. The house had everything we needed and more. The kitchen was fully stocked, beds were comfortable, and the neighborhood was peaceful. Five stars all around!",
    date: "September 2024",
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
  return (
    <section className="bg-[#0F172A] py-24 md:py-32">
      <div className="container-custom">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <p className="text-gold font-sans text-sm md:text-base tracking-[4px] uppercase mb-4">
              Guest Reviews
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              What Our Guests Say
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Don&apos;t just take our word for it — hear from guests who&apos;ve
              experienced our properties firsthand.
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
                4.88 average &middot; 38 reviews on Airbnb
              </span>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
