import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import StatsSection from "@/components/home/StatsSection";
import ReviewsSection from "@/components/home/ReviewsSection";
import DirectBookingBanner from "@/components/home/DirectBookingBanner";
import ContactSection from "@/components/home/ContactSection";
import { getGuestyService } from "@/lib/guesty";
import { getDisplayPrices } from "@/lib/admin/prices";

export default async function HomePage() {
  const service = getGuestyService();
  const [rawProperties, displayPrices] = await Promise.all([
    service.getListings(),
    getDisplayPrices(),
  ]);

  const properties = rawProperties.map((property) => {
    if (displayPrices[property.id]) {
      return {
        ...property,
        pricing: {
          ...property.pricing,
          baseNightlyRate: displayPrices[property.id],
        },
      };
    }
    return property;
  });

  return (
    <>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <HowItWorks />
      <FeaturedProperties properties={properties} />
      <ReviewsSection />
      <DirectBookingBanner />
      <ContactSection />
    </>
  );
}
