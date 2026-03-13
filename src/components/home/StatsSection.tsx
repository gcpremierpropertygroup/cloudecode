"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { target: 142, decimals: 0, suffix: "+", label: "Guests Hosted" },
  { target: 5.0, decimals: 1, suffix: "",  label: "Avg. Star Rating" },
  { target: 3,   decimals: 0, suffix: "",  label: "Luxury Properties" },
  { target: 100, decimals: 0, suffix: "%", label: "5-Star Reviews" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function StatItem({
  target,
  decimals,
  suffix,
  label,
  active,
}: (typeof stats)[0] & { active: boolean }) {
  const value = useCountUp({ target, decimals, duration: 1500, active });

  // For "+" suffix: only show after animation completes (value has reached target)
  const displaySuffix =
    suffix === "+" ? (parseFloat(value) >= target ? "+" : "") : suffix;

  return (
    <motion.div variants={itemVariants} className="text-center">
      <p className="font-serif text-5xl md:text-6xl font-bold text-gold leading-none">
        {value}{displaySuffix}
      </p>
      <p className="text-white/50 text-sm tracking-widest uppercase mt-2">
        {label}
      </p>
    </motion.div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  // null = SSR / preference unknown → animate normally (treat as false)
  const animate = shouldReduceMotion === true ? false : isInView;

  return (
    <section className="border-t border-gold/20 bg-[#111827]">
      <motion.div
        ref={ref}
        className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 py-20 px-6"
        variants={containerVariants}
        initial="hidden"
        animate={animate ? "visible" : "hidden"}
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} active={animate} />
        ))}
      </motion.div>
    </section>
  );
}
