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

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  const textScale = useTransform(smoothProgress, [0.15, 0.5], [1.2, 1]);
  const textOpacity = useTransform(smoothProgress, [0.1, 0.35], [0, 1]);
  const bgOpacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);
  const particleY = useTransform(smoothProgress, [0, 1], [100, -100]);
  const particleOpacity = useTransform(smoothProgress, [0.2, 0.4, 0.6, 0.8], [0, 0.5, 0.5, 0]);

  return (
    <section ref={ref} className="relative bg-dark-base py-40 md:py-52 overflow-hidden">
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-amber/[0.06] blur-[250px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-burgundy/[0.04] blur-[150px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-olive/[0.03] blur-[120px]" />
      </motion.div>

      <motion.div
        style={{ y: particleY, opacity: particleOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[15%] left-[10%] w-1 h-1 rounded-full bg-amber/30" />
        <div className="absolute top-[25%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber/20" />
        <div className="absolute top-[50%] left-[30%] w-1 h-1 rounded-full bg-amber/20" />
        <div className="absolute top-[60%] right-[30%] w-1.5 h-1.5 rounded-full bg-amber/25" />
        <div className="absolute top-[80%] left-[15%] w-1 h-1 rounded-full bg-amber/15" />
        <div className="absolute top-[35%] right-[40%] w-1 h-1 rounded-full bg-amber/20" />
      </motion.div>

      <div className="absolute inset-0 gold-shimmer pointer-events-none opacity-30" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 text-center">
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
              <motion.span
                className="text-xl inline-block"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                &rarr;
              </motion.span>
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
            { label: "100% ON-DEVICE", color: "bg-olive/60" },
            { label: "ZERO SERVER CALLS", color: "bg-amber/50" },
            { label: "FREE FOREVER", color: "bg-amber/50" },
            { label: "YOUR DATA STAYS YOURS", color: "bg-olive/60" },
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
              <span className="type-mono text-[0.55rem] text-tan/30 tracking-widest">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute top-10 left-10 w-10 h-10 border-l-[1.5px] border-t-[1.5px] border-parchment/10" />
      <div className="absolute bottom-10 right-10 w-10 h-10 border-r-[1.5px] border-b-[1.5px] border-parchment/10" />

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.15), transparent)",
          opacity: bgOpacity,
        }}
      />
    </section>
  );
}
