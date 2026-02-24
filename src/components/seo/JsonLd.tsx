export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "G|C Premier Property Group",
    description:
      "Premium short-term rental properties in Jackson, Mississippi. Professional property management with Superhost standards.",
    url: "https://www.gcpremierpropertygroup.com",
    telephone: "+16019668308",
    email: "contactus@gcpremierpropertygroup.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jackson",
      addressRegion: "MS",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Jackson, Mississippi" },
      { "@type": "Place", name: "Eastover, Jackson, MS" },
    ],
    priceRange: "$$",
    image: "https://www.gcpremierpropertygroup.com/images/hero.jpg",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61588380116975",
      "https://www.instagram.com/gcpremierpropertygroup",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.88",
      reviewCount: "38",
      bestRating: "5",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LodgingBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "G|C Premier Property Group",
    description:
      "Book directly for the best rates on premium short-term rentals in Jackson, MS.",
    url: "https://www.gcpremierpropertygroup.com/properties",
    telephone: "+16019668308",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jackson",
      addressRegion: "MS",
      addressCountry: "US",
    },
    checkinTime: "15:00",
    checkoutTime: "11:00",
    starRating: {
      "@type": "Rating",
      ratingValue: "4.88",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ReviewJsonLd({
  reviews,
}: {
  reviews: { name: string; text: string; rating: number; date: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "G|C Premier Property Group",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.88",
      reviewCount: String(reviews.length),
      bestRating: "5",
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
      },
      reviewBody: r.text,
      datePublished: r.date,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
