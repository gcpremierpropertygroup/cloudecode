import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import HowItWorks from "@/components/home/HowItWorks";
import ReviewsSection from "@/components/home/ReviewsSection";
import CTABanner from "@/components/home/CTABanner";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <HowItWorks />
      <ReviewsSection />
      <CTABanner />
      <ContactSection />
    </>
  );
}
