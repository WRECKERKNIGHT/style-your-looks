"use client";

import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import StyleStudio from "@/components/three/StyleStudio";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function StudioPage() {
  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <span className="section-number">EST. MMXXIV // 3D STYLE STUDIO</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Boxes className="w-7 h-7 text-[var(--accent-aurum)]" />
            <h1 className="type-display text-[var(--text-primary)] tracking-tight">
              3D STYLE <span className="text-gradient-aurum">STUDIO.</span>
            </h1>
          </div>
          <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
            Build your virtual twin in true 3D — body, hair, frames and outfit. Free, private, runs in your browser.
          </p>
        </motion.div>
      </ScrollParallax>

      <ScrollBlur blur={0} minOpacity={0.9}>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <StyleStudio />
        </motion.div>
      </ScrollBlur>
    </div>
  );
}
