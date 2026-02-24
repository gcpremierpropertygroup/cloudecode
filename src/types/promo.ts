export interface PromoCode {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  propertyId: string;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  createdAt: string;
  label: string;
}
