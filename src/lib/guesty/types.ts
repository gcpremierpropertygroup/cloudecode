export interface GuestyListing {
  _id: string;
  title: string;
  nickname?: string;
  propertyType?: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  beds?: number;
  address: {
    full: string;
    city: string;
    state: string;
    country: string;
  };
  pictures: GuestyPicture[];
  amenities: string[];
  publicDescription: {
    summary: string;
    space: string;
    access: string;
    neighborhood: string;
    transit: string;
    notes: string;
  };
  prices: {
    basePrice: number;
    currency: string;
    cleaningFee?: number;
  };
  terms?: {
    minNights?: number;
    maxNights?: number;
  };
  active: boolean;
  listed: boolean;
}

export interface GuestyPicture {
  _id: string;
  thumbnail: string;
  regular: string;
  large?: string;
  caption?: string;
  original?: string;
}

export interface GuestyCalendarDay {
  date: string;
  status: "available" | "booked" | "blocked";
  price: number;
  currency: string;
  minNights?: number;
  allotment?: number;
}

export interface GuestyListingsResponse {
  results: GuestyListing[];
  count: number;
  limit: number;
  skip: number;
}
