import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";
import AnimateOnScroll from "@/components/ui/AnimateOnScroll";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Jackson MS Airbnb & Short-Term Rental Blog — Tips, Data & Guides",
  description:
    "Expert insights on Airbnb hosting, short-term rental management, Jackson MS market data, regulations, and revenue optimization strategies from G|C Premier Property Group.",
  alternates: {
    canonical: "https://www.gcpremierproperties.com/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.gcpremierproperties.com" },
          { name: "Blog", url: "https://www.gcpremierproperties.com/blog" },
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-gold blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gold blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimateOnScroll>
            <p className="text-gold text-sm font-bold tracking-[5px] uppercase mb-6">
              Insights & Guides
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              Jackson MS{" "}
              <span className="text-gold">STR Insights</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Market data, hosting guides, and expert advice for short-term
              rental owners in Jackson, Mississippi.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <AnimateOnScroll key={post.slug} delay={index * 0.1}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="bg-[#1F2937] border border-white/10 p-8 h-full flex flex-col hover:border-gold/30 transition-all duration-300">
                    {/* Category */}
                    <span className="text-gold text-xs font-bold tracking-[3px] uppercase mb-4">
                      {post.category}
                    </span>

                    {/* Title */}
                    <h2 className="font-serif text-xl md:text-2xl font-semibold text-white mb-4 group-hover:text-gold transition-colors duration-300">
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p className="text-white/50 text-base leading-relaxed mb-6 flex-grow">
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="flex items-center gap-4 text-white/30 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </article>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold blur-[200px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <AnimateOnScroll>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6">
              Have a Property in{" "}
              <span className="text-gold">Jackson, MS?</span>
            </h2>
            <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed">
              Find out what your property could earn as a short-term rental.
              Free assessment, no obligation.
            </p>
            <a
              href="/assessment"
              className="inline-flex items-center justify-center bg-gold text-white px-10 py-4 text-sm font-bold tracking-[3px] uppercase hover:bg-gold-light transition-colors"
            >
              Get Your Free Assessment
            </a>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
