import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import DirectBookingBanner from "@/components/home/DirectBookingBanner";
import CTABanner from "@/components/home/CTABanner";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <DirectBookingBanner />
      <CTABanner />
      <ContactSection />
    </>
  );
}
