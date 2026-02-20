export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            GC Premier Property Group
          </span>
          <nav className="hidden gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:flex">
            <a href="#about" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              About
            </a>
            <a href="#services" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Services
            </a>
            <a href="#contact" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-zinc-950">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Premium Real Estate, Exceptional Service
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Whether you&apos;re buying, selling, or investing — GC Premier Property
          Group delivers results with integrity and expertise.
        </p>
        <a
          href="#contact"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Get in Touch
        </a>
      </section>

      {/* About */}
      <section id="about" className="bg-white px-6 py-20 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            About Us
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            GC Premier Property Group is a full-service real estate firm
            committed to helping clients navigate every stage of the property
            journey. From first-time buyers to seasoned investors, we bring
            market expertise and personalized attention to every transaction.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Our Services
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Buying",
                description:
                  "Find your dream property with expert guidance through every step of the buying process.",
              },
              {
                title: "Selling",
                description:
                  "Maximize your property's value with our strategic marketing and negotiation expertise.",
              },
              {
                title: "Property Management",
                description:
                  "Hassle-free property management that protects your investment and keeps tenants happy.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white px-6 py-20 dark:bg-zinc-900">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Contact Us
          </h2>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            Ready to get started? Reach out and a member of our team will be in
            touch.
          </p>
          <a
            href="mailto:info@gcpremierpropertygroup.com"
            className="mt-6 inline-flex h-12 items-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            info@gcpremierpropertygroup.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} GC Premier Property Group. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
