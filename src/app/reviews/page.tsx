import type { Metadata } from "next";
import { ReviewJsonLd } from "@/components/seo/JsonLd";
import ReviewsContent from "./ReviewsContent";

export const metadata: Metadata = {
  title: "Guest Reviews — 4.88 Stars Across 38+ Airbnb Stays in Jackson, MS",
  description:
    "Read real 5-star guest reviews from our professionally managed short-term rentals in Jackson, Mississippi. 4.88 average rating, Superhost status, and repeat bookings. See why guests choose G|C Premier.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/reviews",
  },
};

const reviews = [
  {
    name: "Monica",
    text: "Chaves was an excellent host. Anytime we needed something he responded immediately. The home was very clean and comfortable with a home away from home feel. We will definitely be back. Highly Recommend!",
    rating: 5,
    date: "February 2025",
  },
  {
    name: "Megan",
    text: "Great stay! Very clean, spacious home. Chaves was very helpful and responsive. Would definitely recommend to anyone visiting Jackson.",
    rating: 5,
    date: "January 2025",
  },
  {
    name: "Mark",
    text: "Chaves was great. Very responsive to any need that we had. We thoroughly enjoyed our time in this great home. Neighborhood was quiet and felt very safe. I would definitely stay here again.",
    rating: 5,
    date: "December 2024",
  },
  {
    name: "Jasmine",
    text: "This home was absolutely beautiful and so spacious. We had more than enough room for my family. Chaves was very attentive and made our stay comfortable. I highly recommend this property!",
    rating: 5,
    date: "November 2024",
  },
  {
    name: "Keisha",
    text: "Great location, beautiful home, and an amazing host. Everything was clean and well-maintained. Check-in was smooth and easy. We will be booking again for sure!",
    rating: 5,
    date: "October 2024",
  },
  {
    name: "Anthony",
    text: "Perfect place for our group trip. The house had everything we needed and more. The kitchen was fully stocked, beds were comfortable, and the neighborhood was peaceful. Five stars all around!",
    rating: 5,
    date: "September 2024",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <ReviewJsonLd reviews={reviews} />
      <ReviewsContent />
    </>
  );
}
