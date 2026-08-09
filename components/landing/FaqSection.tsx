"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";
import { ScrollParallax, ScrollBlur } from "@/components/shared/ScrollEffects";

const faqs = [
  {
    q: "Is my data ever sent to a server?",
    a: "No. Every pixel is processed entirely on your device using MediaPipe and your GPU. No photos, scores, or measurements ever leave your browser.",
  },
  {
    q: "What does the free plan include?",
    a: "Everything. Face analysis, skin tone, body type, grooming studio, virtual try-on, outfit picks, and community ratings — free forever. No paywalls, no tiers.",
  },
  {
    q: "Does it work on any device?",
    a: "Yes. ZERVEY runs in modern desktop and mobile browsers — Chrome, Edge, Safari, and Firefox. No downloads and no account required to start.",
  },
  {
    q: "How accurate is the face analysis?",
    a: "It maps 478 facial landmarks and scores symmetry, proportions, and harmony against golden-ratio mathematics — the same objective framework used by facial analyzers and designers.",
  },
  {
    q: "Do I need an account to try it?",
    a: "No. You can run a full analysis instantly without an account. Sign up only if you want to save history, publish looks, and join the community.",
  },
  {
    q: "What happens to my photos?",
    a: "Nothing. Photos are read locally for analysis and never uploaded. Your face never leaves your hands — delete them whenever you want.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-32 md:py-44 overflow-hidden bg-cosmic-surface" id="faq">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-80 rounded-full bg-aurum-400/8 blur-[160px]" />
        <ScrollParallax speed={0.3} distance={80} className="absolute top-[20%] right-[4%]">
          <div className="w-[400px] h-[400px] rounded-full bg-nexus-500/8 blur-[140px] animate-drift" />
        </ScrollParallax>
      </div>
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <Reveal x={-30} className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">06 // FAQ</span>
          </div>
          <KineticHeadline text="THE FINE PRINT." className="type-display text-[var(--text-primary)]" weightFrom={300} weightTo={800} />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            Straight answers. No fine print, no data harvesting, no hidden
            costs.
          </p>
        </Reveal>

        <ScrollBlur blur={6} minOpacity={1} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <Reveal key={faq.q} y={24} delay={(index % 2) * 0.08}>
                <div
                  className={`glass-card rounded-xl overflow-hidden transition-colors duration-500 ${
                    isOpen ? "border-aurum-400/40" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-6 p-6 md:p-8 text-left group"
                  >
                    <span
                      className={`text-sm md:text-base font-display font-semibold tracking-wide transition-colors duration-300 ${
                        isOpen
                          ? "text-[var(--accent-mocha)]"
                          : "text-[var(--text-primary)] group-hover:text-[var(--accent-mocha)]"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                        isOpen
                          ? "border-aurum-400/50 text-aurum-400"
                          : "border-[var(--border-primary)] text-[var(--text-muted)]"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <p className="px-6 md:px-8 pb-6 md:pb-8 text-sm text-[var(--text-secondary)] font-body leading-relaxed max-w-prose">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </ScrollBlur>
      </div>
    </section>
  );
}
