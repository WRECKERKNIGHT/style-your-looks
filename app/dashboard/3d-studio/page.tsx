"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";
import { MANNEQUIN_URL } from "@/lib/three/mannequin";

// three.js is ~600KB of JS — keep it out of the dashboard's shared chunks and
// only fetch it when the studio page itself is opened.
const StyleStudio = dynamic(() => import("@/components/three/StyleStudio"), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-10 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
      <span className="spinner" />
      <p className="type-mono text-[var(--text-muted)] tracking-widest uppercase">
        Waking up the studio…
      </p>
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function StudioPage() {
  useEffect(() => { document.title = "3D Style Studio | ZERVEY"; }, []);

  // Start streaming the mannequin GLB immediately — it downloads in parallel
  // with the studio JS chunk instead of serialised after mount.
  useEffect(() => {
    if ("fetch" in window) void fetch(MANNEQUIN_URL, { priority: "low" }).catch(() => {});
  }, []);

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
            Pose a fully rigged mannequin in true 3D or dial in your measurements on the fit form —
            private, offline-capable, runs in your browser.
          </p>
        </motion.div>
      </ScrollParallax>

      <ScrollBlur blur={0} minOpacity={0.9}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-h-[60vh] md:max-h-none overflow-hidden">
          <StyleStudio />
        </motion.div>
      </ScrollBlur>
    </div>
  );
}
