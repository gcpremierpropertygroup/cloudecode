export const SITE_NAME = "G|C Premier Property Group";
export const SITE_TAGLINE = "Your Property. Our Priority. Premier Returns.";
export const SITE_DESCRIPTION =
  "Premium short-term rental properties in Jackson, Mississippi. Book directly for the best rates.";

export const NAV_LINKS = [
  { label: "Book With Us", href: "/properties" },
  { label: "Reviews", href: "/reviews" },
  { label: "Management", href: "/management" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
] as const;

export const CONTACT_PHONE = "(601) 966-8308";
export const CONTACT_PHONE_RAW = "6019668308";
export const CONTACT_EMAIL = "contactus@gcpremierproperties.com";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61588380116975",
  instagram: "https://www.instagram.com/gcpremierpropertygroup",
} as const;

export const SERVICE_FEE_RATE = 0.1; // 10% service fee

/**
 * Custom discounts — add/remove entries here to apply discounts to bookings.
 *
 * propertyId: property ID (e.g. "prop-spacious-002") or "*" for all properties
 * start/end:  optional date range (YYYY-MM-DD). Omit for always-active discounts.
 * type:       "percentage" (of discounted subtotal) or "flat" (dollar amount)
 * value:      the number — e.g. 15 for 15%, or 100 for $100 off
 * label:      what the guest sees on the price breakdown
 *
 * Examples:
 *   { propertyId: "prop-spacious-002", start: "2026-03-01", end: "2026-03-31", type: "percentage", value: 15, label: "Spring Special (15% off)" }
 *   { propertyId: "*", type: "flat", value: 100, label: "Promo discount (-$100)" }
 */
export interface CustomDiscount {
  propertyId: string;
  start?: string;
  end?: string;
  type: "percentage" | "flat";
  value: number;
  label: string;
}

export const CUSTOM_DISCOUNTS: CustomDiscount[] = [
  // Add your discounts here. Example:
  // { propertyId: "*", type: "flat", value: 50, label: "Welcome discount (-$50)" },
];

/**
 * Display "from $X/night" prices shown on property cards and booking panels.
 * These are independent of PriceLabs dynamic pricing — just for marketing display.
 */
export const DISPLAY_PRICES: Record<string, number> = {
  "prop-eastover-001": 175,
  "prop-spacious-002": 150,
  "prop-pinelane-003": 165,
};
