"use client";

import { Star, ExternalLink } from "lucide-react";
import type { PropertyReviewData } from "@/lib/reviews-data";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-gold text-gold" : "fill-white/10 text-white/10"}
        />
      ))}
    </div>
  );
}

interface PropertyReviewsProps {
  data: PropertyReviewData;
}

export default function PropertyReviews({ data }: PropertyReviewsProps) {
  const { totalReviews, averageRating, airbnbUrl, reviews } = data;

  return (
    <section className="mt-12 pt-10 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star size={20} className="fill-gold text-gold" />
            <span className="text-white text-2xl font-semibold">
              {averageRating.toFixed(2)}
            </span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <span className="text-white/60 text-sm">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""} on Airbnb
          </span>
        </div>

        <a
          href={airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-gold/80 hover:text-gold text-sm transition-colors duration-200"
        >
          View all on Airbnb
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Review grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="bg-[#1F2937] border border-white/10 rounded-lg p-6 hover:border-gold/20 transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <StarRating rating={review.rating} />
              <span className="text-white/40 text-xs">{review.date}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="text-white font-semibold text-sm">{review.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
