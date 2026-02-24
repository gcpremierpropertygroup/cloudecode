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
            See What Your Property{" "}
            <span className="text-gold">Could Earn</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            Get a free, no-obligation revenue projection for your property.
            We&apos;ll analyze your market, estimate your earnings, and show you
            exactly how we&apos;d maximize your returns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as="a" href="/assessment" size="lg">
              Get Your Free Assessment
            </Button>
            <Button as="a" href="/management" variant="secondary" size="lg">
              How We Manage
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
