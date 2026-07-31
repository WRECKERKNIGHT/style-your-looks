"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Mannequin3D } from "./Mannequin3D";

const hotspots = [
  { id: "face", label: "Face IQ", sublabel: "478-point analysis", x: "75%", y: "10%", side: "right" as const },
  { id: "skin", label: "Color Analysis", sublabel: "ITA skin tone", x: "75%", y: "25%", side: "right" as const },
  { id: "body", label: "Body Analysis", sublabel: "Pose landmarks", x: "25%", y: "45%", side: "left" as const },
  { id: "grooming", label: "Grooming", sublabel: "15+ styles", x: "75%", y: "42%", side: "right" as const },
  { id: "tryon", label: "Virtual Try-On", sublabel: "Outfit overlay", x: "25%", y: "62%", side: "left" as const },
  { id: "outfits", label: "Outfit Picks", sublabel: "AI recommendations", x: "75%", y: "60%", side: "right" as const },
];

export function MannequinSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden bg-cosmic-elevated" id="mannequin">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">03 // Analysis</span>
          </div>
          <h2 className="type-display text-white">
            EVERY
            <br />
            FEATURE.
            <br />
            <span className="text-gradient-aurum">MAPPED.</span>
          </h2>
        </motion.div>

        <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[200px] md:w-[260px] flex-shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-nexus opacity-[0.08] blur-[80px]" />
            <Mannequin3D className="w-full relative z-10" />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[140%] h-4 bg-black/30 blur-[20px] rounded-full" />
          </motion.div>

          <div className="relative flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hotspots.map((spot, index) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-lg p-5 flex items-start gap-4 group"
              >
                <div className="relative mt-1">
                  <div className="w-3 h-3 rounded-full bg-aurum-400/80 glow-pulse" />
                </div>
                <div>
                  <h4 className="text-white font-display font-semibold text-sm tracking-wide">
                    {spot.label}
                  </h4>
                  <p className="type-mono text-[0.6rem] text-nexus-300/50 mt-1">
                    {spot.sublabel}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 text-center text-nexus-200/40 text-sm font-body max-w-xl mx-auto"
        >
          Every analysis runs on your device. Your data never leaves your hands.
        </motion.p>
      </div>
    </section>
  );
}
