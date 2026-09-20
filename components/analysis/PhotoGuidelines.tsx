"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sun, Eye, Maximize, User, ScanFace, Layers, HelpCircle } from "lucide-react";

const guidelines = [
  {
    icon: Maximize,
    title: "Frame the face",
    text: "Face should take up roughly 15–90% of the photo width. Small or close-up faces get accuracy warnings — only extreme crops are rejected.",
  },
  {
    icon: Eye,
    title: "Shoot at eye level",
    text: "No low-angle or selfie-cam distortion. Hold the phone level with your face. Strong upward/downward camera angles are rejected.",
  },
  {
    icon: Sun,
    title: "Face the light",
    text: "Natural, even lighting in front of you. Avoid strong backlight, harsh shadows, and dark rooms.",
  },
  {
    icon: User,
    title: "Head straight-ish",
    text: "Both eyes roughly level and a mild head turn is fine (up to ~30°). Only full side-on frames are rejected — unless it's your profile photo.",
  },
  {
    icon: ScanFace,
    title: "Clear your face",
    text: "No sunglasses, hat brim, or hair covering the eyes. The landmarks need the whole face visible.",
  },
  {
    icon: Layers,
    title: "Only you in frame",
    text: "A person-sized second face is rejected. Small background faces are kept with a warning — the largest face wins.",
  },
];

export function PhotoGuidelines() {
  const [open, setOpen] = useState(true);

  return (
    <div className="glass-card border border-[var(--border-primary)]/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <span className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-[var(--accent-aurum)]" />
          <span className="type-subhead text-[var(--text-primary)] tracking-wider text-sm">
            HOW TO TAKE A GOOD PHOTO
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-5 pb-5">
              {guidelines.map((g, i) => (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 shrink-0 border border-[var(--border-primary)] bg-[var(--bg-base)]/40 flex items-center justify-center">
                    <g.icon className="w-4 h-4 text-[var(--accent-caramel)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] font-body uppercase tracking-wider mb-0.5">
                      {g.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
                      {g.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <p className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">
                PHOTOS THAT VIOLATE THESE RULES ARE REJECTED AUTOMATICALLY — REPLACE THEM, NOT THE SCORE.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
