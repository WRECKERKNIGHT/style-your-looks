"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const textScale = useTransform(scrollYProgress, [0.15, 0.5], [1.15, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="relative bg-section-dark py-40 md:py-52 overflow-hidden">
      {/* Radial glow */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber/[0.06] blur-[200px]" />
      </motion.div>

      {/* Gold shimmer overlay */}
      <div className="absolute inset-0 gold-shimmer pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 text-center">
        {/* Massive headline — the most dramatic moment */}
        <motion.div style={{ scale: textScale, opacity: textOpacity }}>
          <h2 className="type-massive text-parchment/90 leading-[0.8]">
            NO MORE
            <br />
            <span className="text-gradient-gold">SLOP.</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 text-tan/50 text-lg max-w-md mx-auto font-body leading-relaxed"
        >
          Your style. Your data. Your rules. Free forever.
          No account required to start.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14"
        >
          <MagneticButton>
            <Link href="/signup" className="btn-dark">
              START NOW
              <span className="text-xl">&rarr;</span>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber/50 rounded-full" />
            <span className="type-mono text-[0.55rem] text-tan/30 tracking-widest">100% ON-DEVICE</span>
          </div>
          <div className="h-px w-6 bg-tan/15" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber/50 rounded-full" />
            <span className="type-mono text-[0.55rem] text-tan/30 tracking-widest">ZERO SERVER CALLS</span>
          </div>
          <div className="h-px w-6 bg-tan/15 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber/50 rounded-full" />
            <span className="type-mono text-[0.55rem] text-tan/30 tracking-widest">FREE FOREVER</span>
          </div>
        </motion.div>
      </div>

      {/* Corner ornaments — asymmetric, only two */}
      <div className="absolute top-10 left-10 w-8 h-8 border-l-[1.5px] border-t-[1.5px] border-parchment/10" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-r-[1.5px] border-b-[1.5px] border-parchment/10" />
    </section>
  );
}
