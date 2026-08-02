"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
  });

  const textScale = useTransform(smoothProgress, [0.15, 0.5], [1.2, 1]);
  const textOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1]);

  return (
    <section ref={ref} className="relative py-40 md:py-52 overflow-hidden bg-cosmic-elevated">
      <div className="absolute inset-0 bg-gradient-aurum opacity-[0.06]" />

      <motion.div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-aurum-400/10 blur-[250px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-nexus-500/10 blur-[150px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-aurum-400/8 blur-[120px]" />
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 text-center">
        <motion.div style={{ scale: textScale, opacity: textOpacity }}>
          <h2 className="type-massive text-[color-mix(in_srgb,var(--text-primary)_90%,transparent)] leading-[0.85] mb-8">
            READY TO
            <br />
            DISCOVER YOUR
            <br />
            <span className="text-gradient-aurum hand-underline">STYLE DNA?</span>
          </h2>
        </motion.div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          aria-hidden
          className="hidden md:block absolute top-16 right-16 lg:right-32 w-28 h-28"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <path id="cta-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text className="fill-[var(--accent-mocha)]" style={{ fontSize: "8.5px", letterSpacing: "2.5px" }}>
              <textPath href="#cta-circle">
                FREE FOREVER • ON-DEVICE • PRIVATE •
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-aurum-400/80 glow-pulse" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-[var(--text-secondary)] text-lg max-w-md mx-auto font-body leading-relaxed"
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
            <Link href="/signup" className="btn-nexus text-sm py-4 px-10">
              GET STARTED FREE
              <span
                className="text-xl inline-block"
                style={{
                  animation: "none",
                }}
              >
                &rarr;
              </span>
            </Link>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { label: "100% ON-DEVICE", color: "bg-nexus-500/60" },
            { label: "ZERO SERVER CALLS", color: "bg-aurum-400/50" },
            { label: "FREE FOREVER", color: "bg-aurum-400/50" },
            { label: "YOUR DATA STAYS YOURS", color: "bg-nexus-500/60" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
              <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute top-10 left-10 w-10 h-10 border-l-[1.5px] border-t-[1.5px] border-[var(--border-primary)]" />
      <div className="absolute bottom-10 right-10 w-10 h-10 border-r-[1.5px] border-b-[1.5px] border-[var(--border-primary)]" />
    </section>
  );
}
