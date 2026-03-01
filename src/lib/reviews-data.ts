export interface PropertyReview {
  name: string;
  rating: number;
  date: string;
  text: string;
}

export interface PropertyReviewData {
  totalReviews: number;
  averageRating: number;
  airbnbUrl: string;
  reviews: PropertyReview[];
}

export const PROPERTY_REVIEWS: Record<string, PropertyReviewData> = {
  "prop-eastover-001": {
    totalReviews: 38,
    averageRating: 4.71,
    airbnbUrl: "https://www.airbnb.com/rooms/1080584437881428956",
    reviews: [
      {
        name: "Brandi",
        rating: 5,
        date: "December 2025",
        text: "Fantastic stay for a family Christmas gathering. The home was spacious, clean, and had everything we needed. Guillermo was very responsive and accommodating. Highly recommend!",
      },
      {
        name: "Deidre",
        rating: 5,
        date: "November 2025",
        text: "I love this place!! It was clean, comfortable, warm and welcoming! The host was very responsive and helpful throughout our stay. Will definitely be back.",
      },
      {
        name: "Darlicia",
        rating: 5,
        date: "October 2025",
        text: "The house was as pictured. Beautiful 4 bedroom home with plenty of space for our group. Everything was clean and well-maintained.",
      },
      {
        name: "Jennifer",
        rating: 5,
        date: "September 2025",
        text: "We enjoyed this spacious and clean home. Great location and the host was very attentive. Would definitely recommend to others visiting Jackson.",
      },
      {
        name: "Shardaya",
        rating: 5,
        date: "September 2025",
        text: "My family & I enjoyed our stay! Guillermo was friendly and very responsive. The house had everything we needed and was in a great neighborhood.",
      },
    ],
  },

  "prop-spacious-002": {
    totalReviews: 6,
    averageRating: 5.0,
    airbnbUrl: "https://www.airbnb.com/rooms/1536893356839380254",
    reviews: [
      {
        name: "Dawn",
        rating: 5,
        date: "January 2026",
        text: "Perfect host — the home was clean and ready when we arrived. Great space for our group trip, fenced backyard was a bonus. Will definitely book again.",
      },
      {
        name: "Nadia",
        rating: 5,
        date: "December 2025",
        text: "I really enjoyed my stay. The house was great, very clean, and the host was super responsive. Everything was exactly as described — highly recommend!",
      },
      {
        name: "James",
        rating: 5,
        date: "November 2025",
        text: "We had a great stay in Jackson! The location was very convenient and the fenced backyard was a huge bonus for us. Host was helpful and easy to communicate with.",
      },
      {
        name: "Martin",
        rating: 5,
        date: "December 2025",
        text: "Highly recommended — you feel like you're at home. Peaceful place, great amenities, and a wonderful host. Would stay again without hesitation.",
      },
      {
        name: "Felipe",
        rating: 5,
        date: "November 2025",
        text: "Very responsive and extremely easy to work with. 10/10 experience from start to finish. The house was exactly as shown and everything worked perfectly.",
      },
    ],
  },

  "prop-pinelane-003": {
    totalReviews: 3,
    averageRating: 5.0,
    airbnbUrl: "https://www.airbnb.com/rooms/1532602068184368578",
    reviews: [
      {
        name: "Neil",
        rating: 5,
        date: "December 2025",
        text: "Nice place to stay on the northern side of Jackson. Clean, comfortable, and everything was as described. Easy check-in and great communication.",
      },
      {
        name: "Lhiquita",
        rating: 5,
        date: "November 2025",
        text: "We enjoyed our stay. They were very responsive and made sure we had everything we needed. The house is cozy and well-equipped. Would stay again!",
      },
      {
        name: "Christine",
        rating: 5,
        date: "December 2025",
        text: "Nice place to stay. Clean, comfortable, and exactly as described. Great value and a pleasant experience overall.",
      },
    ],
  },
};
