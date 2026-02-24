export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  description: string;
  fullDescription: {
    space: string;
    access: string;
    neighborhood: string;
    notes: string;
  };
  photos: PropertyPhoto[];
  amenities: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  pricing: {
    baseNightlyRate: number;
    cleaningFee: number;
    currency: string;
  };
  minStay: number;
  maxGuests: number;
}

export interface PropertyPhoto {
  id: string;
  thumbnail: string;
  full: string;
  caption?: string;
}
