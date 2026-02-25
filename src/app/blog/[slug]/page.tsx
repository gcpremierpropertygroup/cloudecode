import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getStaticPostSlugs } from "@/lib/blog/posts";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  // Only pre-build static (hardcoded) post slugs.
  // Redis posts are rendered on-demand via dynamicParams = true.
  const slugs = getStaticPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://www.gcpremierproperties.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["G|C Premier Property Group"],
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="font-serif text-2xl md:text-3xl font-semibold text-white mt-12 mb-6"
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={key++} className="text-white font-semibold mt-6 mb-2">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.startsWith("**")) {
      const parts = line.split("**");
      elements.push(
        <p key={key++} className="text-white/70 text-base leading-relaxed mb-4">
          <strong className="text-white">{parts[1]}</strong>
          {parts[2]}
        </p>
      );
    } else if (line.trim() === "") {
      // skip empty lines
    } else {
      elements.push(
        <p
          key={key++}
          className="text-white/70 text-base md:text-lg leading-relaxed mb-4"
        >
          {line}
        </p>
      );
    }
  }

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.gcpremierproperties.com" },
          { name: "Blog", url: "https://www.gcpremierproperties.com/blog" },
          {
            name: post.title,
            url: `https://www.gcpremierproperties.com/blog/${post.slug}`,
          },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: {
              "@type": "Organization",
              name: "G|C Premier Property Group",
              url: "https://www.gcpremierproperties.com",
            },
            publisher: {
              "@type": "Organization",
              name: "G|C Premier Property Group",
              url: "https://www.gcpremierproperties.com",
            },
          }),
        }}
      />

      {/* Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm font-medium tracking-wider uppercase mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <span className="text-gold text-xs font-bold tracking-[3px] uppercase block mb-4">
            {post.category}
          </span>

          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-white/40 text-sm">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 md:pb-36 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="border-t border-white/10 pt-10">
            {renderMarkdown(post.content)}
          </div>

          {/* Internal Links */}
          <div className="mt-16 p-8 bg-[#1F2937] border border-white/10">
            <h3 className="font-serif text-xl font-semibold text-white mb-4">
              Ready to Learn More?
            </h3>
            <div className="space-y-3">
              <Link
                href="/management"
                className="block text-gold hover:text-gold-light transition-colors"
              >
                Explore our property management services &rarr;
              </Link>
              <Link
                href="/assessment"
                className="block text-gold hover:text-gold-light transition-colors"
              >
                Get a free property assessment &rarr;
              </Link>
              <Link
                href="/properties"
                className="block text-gold hover:text-gold-light transition-colors"
              >
                See our managed properties &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
