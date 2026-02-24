import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import Button from "@/components/ui/Button";

export default function CTABanner() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#0F172A] to-[#111827] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <AnimateOnScroll>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
            Book Your Stay in{" "}
            <span className="text-gold">Jackson, MS</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Experience Jackson&apos;s finest short-term rentals. Book directly
            for the best rates and a seamless experience.
          </p>
          <Button as="a" href="/properties" size="lg">
            Browse Properties
          </Button>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
