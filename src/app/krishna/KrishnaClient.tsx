"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ─── DATA ─────────────────────────────────────────────── */

const NAV_LINKS = ["About", "Sound", "Tennis", "Film", "Contact"] as const;

const SOUND_CARDS = [
  {
    num: "001",
    title: "Modular Synthesis",
    desc: "Patching chaos into order. Eurorack modules wired like neural pathways, each connection a decision between consonance and beautiful noise.",
  },
  {
    num: "002",
    title: "Ambient Textures",
    desc: "Long reverb tails and granular clouds. The kind of sound that fills a room the way morning light fills a hospital corridor — slowly, then all at once.",
  },
  {
    num: "003",
    title: "Rhythmic Deconstruction",
    desc: "Breakbeats fed through distortion and reassembled wrong. Glitch as grammar. The pulse underneath is always human, even when the surface isn't.",
  },
];

const FILM_PHOTOS = [
  { stock: "Kodak Portra 400", title: "West Virginia", color: "#C4956A" },
  { stock: "Ilford HP5+", title: "The Musician", color: "#8A8A8A" },
  { stock: "Fuji Pro 400H", title: "Great Falls", color: "#7BAF8E" },
  { stock: "Kodak Tri-X 400", title: "Winter Light", color: "#6B6B6B" },
  { stock: "CineStill 800T", title: "River at Dusk", color: "#5B7FA5" },
  { stock: "Kodak Portra 800", title: "The Bride", color: "#D4A574" },
  { stock: "Kodak Portra 400", title: "Frozen Rapids", color: "#8FAAB3" },
  { stock: "Fuji Pro 400H", title: "Winter Bend", color: "#6B9E7A" },
];

/* ─── HELPERS ──────────────────────────────────────────── */

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionNumber({ n }: { n: string }) {
  return (
    <span className="font-mono text-xs tracking-[0.25em] text-white/30">
      {n}
    </span>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────── */

export default function KrishnaClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="krishna-page bg-[#0A0A0A] text-[#E8E4DF] min-h-screen selection:bg-[#C4956A]/30 selection:text-white">
      {/* ─── NAV ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          <button
            onClick={() => scrollTo("hero")}
            className="font-serif text-lg tracking-[0.15em] text-white/90 hover:text-white transition-colors"
          >
            K.
          </button>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <button
                  onClick={() => scrollTo(link.toLowerCase())}
                  className="text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors duration-300"
                >
                  {link}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
              }`}
            />
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
            >
              <ul className="flex flex-col items-center py-8 gap-6">
                {NAV_LINKS.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollTo(link.toLowerCase())}
                      className="text-sm uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO ─── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Film strip border effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }} />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6">
          {/* Film canister label */}
          <FadeIn>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/25 mb-2">
              DEVELOPING FILM&hellip;
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 mb-12">
              PORTRA 400 &mdash; 35MM
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#C4956A]/60 mb-6">
              KRISHNA &mdash; 2026
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-[0.08em] text-white/95 mb-8">
              KRISHNA.
            </h1>
          </FadeIn>

          <FadeIn delay={0.5}>
            <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-white/35 mb-6">
              Physician &bull; Sound Explorer &bull; Analog Soul
            </p>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/15">
              f/2.8 &bull; 1/125 &bull; ISO 400
            </p>
          </FadeIn>

          <FadeIn delay={0.65}>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/10 mt-1">
              No. 24A
            </p>
          </FadeIn>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
          <span className="font-mono text-[9px] tracking-[0.4em] text-white/20 uppercase">
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ─── 01: THE DOCTOR (ABOUT) ─── */}
      <section id="about" className="relative py-28 md:py-40 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionNumber n="01" />
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-[0.05em] mt-2 mb-2 text-white/90">
              THE DOCTOR
            </h2>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/20 mb-14">
              BETWEEN SHIFTS &bull; PORTRA 400
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-lg md:text-xl leading-relaxed text-white/50 font-light mb-6">
              Saving lives by day, bending frequencies by night.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-base leading-relaxed text-white/40 mb-6 max-w-3xl">
              Krishna is a physician who moves between operating rooms and oscillators with equal
              precision. Medicine taught him pattern recognition; electronic music taught him to
              break every pattern he finds.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <blockquote className="border-l-2 border-[#C4956A]/30 pl-6 my-12">
              <p className="text-base md:text-lg italic text-white/45 leading-relaxed font-light">
                There&apos;s a strange parallel between reading an ECG and reading a waveform. Both
                tell you a story about rhythm, timing, and when something extraordinary is about to
                happen.
              </p>
            </blockquote>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-3 gap-6 mt-16 pt-12 border-t border-white/[0.06]">
              <div className="text-center md:text-left">
                <p className="font-serif text-3xl md:text-4xl text-white/80 font-light">MD</p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-white/25 mt-2 uppercase">
                  Board Certified Physician
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-serif text-3xl md:text-4xl text-white/80 font-light">120+</p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-white/25 mt-2 uppercase">
                  BPM on a Good Night
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="font-serif text-3xl md:text-4xl text-white/80 font-light">36</p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-white/25 mt-2 uppercase">
                  Rolls of Film Shot This Year
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── 02: THE SOUND ─── */}
      <section id="sound" className="relative py-28 md:py-40 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionNumber n="02" />
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-[0.05em] mt-2 mb-14 text-white/90">
              THE SOUND
            </h2>
          </FadeIn>

          <div className="space-y-12">
            {SOUND_CARDS.map((card, i) => (
              <FadeIn key={card.num} delay={i * 0.1}>
                <div className="group relative border border-white/[0.06] rounded-sm p-8 md:p-10 hover:border-white/[0.12] transition-all duration-500 bg-white/[0.01] hover:bg-white/[0.02]">
                  <div className="flex items-start gap-6">
                    <span className="font-mono text-[#C4956A]/40 text-xs tracking-wider shrink-0 pt-1">
                      {card.num}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl md:text-2xl font-light text-white/80 mb-3">
                        {card.title}
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed text-white/35 font-light">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <blockquote className="border-l-2 border-[#C4956A]/30 pl-6 mt-16">
              <p className="text-base md:text-lg italic text-white/45 leading-relaxed font-light">
                The space between signal and noise is where the interesting things happen.
              </p>
            </blockquote>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── 03: THE COURT (TENNIS) ─── */}
      <section id="tennis" className="relative py-28 md:py-40 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionNumber n="03" />
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-[0.05em] mt-2 mb-2 text-white/90">
              THE COURT
            </h2>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/20 mb-14">
              GAME DAY &bull; TRI-X 400
            </p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <p className="font-serif text-2xl md:text-3xl font-light text-white/60 tracking-wide mb-10">
              SERVE VOLLEY REPEAT
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-base leading-relaxed text-white/40 mb-6 max-w-3xl">
              There&apos;s a meditative quality to tennis that mirrors both surgery and synthesis —
              complete presence, precise timing, and the willingness to commit fully to every shot.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-base leading-relaxed text-white/35 mb-14 max-w-3xl">
              Currently oscillating between Wilson and Babolat. The eternal racket dilemma: the
              precision of one, the spin potential of the other. Why choose when you can keep
              switching?
            </p>
          </FadeIn>

          {/* Rackets */}
          <FadeIn delay={0.2}>
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="border border-white/[0.06] rounded-sm p-8 bg-white/[0.01]">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#C4956A]/50 mb-1">
                  Wilson
                </p>
                <p className="font-serif text-lg text-white/70 font-light">
                  Pro Staff RF97 Autograph
                </p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-white/20 mt-2 uppercase">
                  Current
                </p>
              </div>
              <div className="border border-white/[0.06] rounded-sm p-8 bg-white/[0.01]">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#C4956A]/50 mb-1">
                  Babolat
                </p>
                <p className="font-serif text-lg text-white/70 font-light">Pure Aero 2024</p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-white/20 mt-2 uppercase">
                  Next Up
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Federer tribute */}
          <FadeIn delay={0.25}>
            <div className="relative border border-white/[0.06] rounded-sm p-8 md:p-10 bg-white/[0.01]">
              <div className="flex items-start gap-6 md:gap-8">
                <span className="font-serif text-5xl md:text-6xl text-white/10 font-light shrink-0 leading-none">
                  20
                </span>
                <div>
                  <h3 className="font-serif text-xl font-light text-white/70 mb-3">
                    The Federer Standard
                  </h3>
                  <p className="text-sm leading-relaxed text-white/35 font-light">
                    Twenty Grand Slams. Effortless power. The one-handed backhand as an act of
                    defiance against modern tennis orthodoxy. If medicine is science and music is art,
                    Federer proved tennis could be both — every rally a composition, every match a
                    performance.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── 04: THE FRAMES (FILM) ─── */}
      <section id="film" className="relative py-28 md:py-40 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionNumber n="04" />
            <h2 className="font-serif text-3xl md:text-5xl font-light tracking-[0.05em] mt-2 mb-14 text-white/90">
              THE FRAMES
            </h2>
          </FadeIn>

          {/* Photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {FILM_PHOTOS.map((photo, i) => (
              <FadeIn key={photo.title} delay={i * 0.05}>
                <div className="group relative aspect-[3/4] rounded-sm overflow-hidden cursor-pointer">
                  {/* Placeholder with film stock color */}
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${photo.color}40 0%, ${photo.color}15 50%, ${photo.color}08 100%)`,
                    }}
                  />

                  {/* Film grain overlay */}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                  }} />

                  {/* Label overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="font-mono text-[9px] tracking-[0.2em] text-white/50">
                      {photo.stock}
                    </p>
                    <p className="font-serif text-sm text-white/90 mt-1">{photo.title}</p>
                  </div>

                  {/* Default visible label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 group-hover:opacity-0 transition-opacity duration-500">
                    <p className="font-mono text-[8px] md:text-[9px] tracking-[0.15em] text-white/25">
                      {photo.stock}
                    </p>
                    <p className="font-serif text-xs md:text-sm text-white/50 mt-0.5">
                      {photo.title}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <blockquote className="border-l-2 border-[#C4956A]/30 pl-6 mt-16">
              <p className="text-base md:text-lg italic text-white/45 leading-relaxed font-light">
                There is nothing quite like the weight of a camera loaded with 36 chances to get it
                right.
              </p>
            </blockquote>
          </FadeIn>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="relative py-28 md:py-40 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="font-mono text-[10px] tracking-[0.3em] text-white/20 mb-4">
              SAY HELLO.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#C4956A]/40 mb-8">
              FOLLOW ON INSTAGRAM
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <a
              href="https://instagram.com/krishna_ambient"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-serif text-2xl md:text-3xl text-white/70 hover:text-white/90 transition-colors duration-300 tracking-wide"
            >
              @krishna_ambient
            </a>
          </FadeIn>

          {/* Social links */}
          <FadeIn delay={0.25}>
            <div className="flex items-center justify-center gap-10 mt-14">
              {[
                { label: "Instagram", href: "https://instagram.com/krishna_ambient" },
                { label: "SoundCloud", href: "#" },
                { label: "Email", href: "mailto:hello@krishna.com" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/25 hover:text-white/60 transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[9px] tracking-[0.3em] text-white/15 uppercase">
            &copy; Krishna 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
