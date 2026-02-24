import type { Metadata } from "next";
import { Star, Quote, Home, MessageCircle } from "lucide-react";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";
import { ReviewJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Guest Reviews | G|C Premier Property Group",
  description:
    "See what our guests have to say about their stays at G|C Premier properties in Jackson, MS. 4.88 average rating across 38+ Airbnb reviews.",
};

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

const stats = [
  {
    icon: Star,
    value: "4.88",
    label: "Average Rating",
  },
  {
    icon: MessageCircle,
    value: "38+",
    label: "Guest Reviews",
  },
  {
    icon: Home,
    value: "6",
    label: "Properties",
  },
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={size} className="fill-gold text-gold" />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <>
      <ReviewJsonLd
        reviews={reviews.map((r) => ({
          name: r.name,
          text: r.text,
          rating: r.rating,
          date: r.date,
        }))}
      />
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gold blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-6">
              Guest Reviews
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              Hear From Our{" "}
              <span className="text-gold">Happy Guests</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Real reviews from real guests who have stayed at our properties in
              Jackson, Mississippi.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16 md:pb-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 0.1}>
                <div className="bg-[#1F2937] border border-white/10 p-6 md:p-8 text-center hover:border-gold/20 transition-colors duration-300">
                  <stat.icon className="text-gold mx-auto mb-3" size={28} />
                  <p className="text-gold text-3xl md:text-4xl font-bold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-sm">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review, index) => (
              <AnimateOnScroll key={index} delay={index * 0.1}>
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
        </div>
      </section>

      {/* Airbnb Badge */}
      <section className="pb-16 md:pb-24 px-6 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll>
            <div className="bg-[#1F2937] border border-white/10 rounded-lg p-10 md:p-14">
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={28} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-white text-2xl md:text-3xl font-serif font-bold mb-2">
                4.88 out of 5
              </p>
              <p className="text-white/40 text-base mb-6">
                Based on 38 reviews on Airbnb
              </p>
              <a
                href="https://www.airbnb.com/rooms/1080584437881428956"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-light transition-colors text-sm font-medium tracking-wider uppercase"
              >
                View All Reviews on Airbnb &rarr;
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience It{" "}
              <span className="text-gold">For Yourself?</span>
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              Book directly with us for the best rates and a five-star experience
              from check-in to checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button as="a" href="/properties" size="lg">
                Browse Properties
              </Button>
              <Button as="a" href="/#contact" variant="secondary" size="lg">
                Contact Us
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
