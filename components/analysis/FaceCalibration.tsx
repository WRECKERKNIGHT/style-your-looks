"use client";

import { motion } from "framer-motion";
import { Sun, Camera, Ruler, ScanLine, Layers, ArrowRight } from "lucide-react";

const protocol = [
  {
    icon: Sun,
    title: "SOFT, EVEN LIGHT",
    detail: "Window light from the front. Avoid harsh top-down flash or hard shadows across the face.",
  },
  {
    icon: Camera,
    title: "EYE LEVEL",
    detail: "Camera at eye level, facing the lens directly. No up or down angles — tilt distorts geometry.",
  },
  {
    icon: Ruler,
    title: "FILL THE FRAME",
    detail: "Step back about an arm's length. Your face should fill most of the frame, no crop at the chin.",
  },
  {
    icon: ScanLine,
    title: "NEUTRAL FACE",
    detail: "Relaxed expression, head straight. Keep head roll and pitch under 15° for reliable symmetry.",
  },
  {
    icon: Layers,
    title: "2–3 PHOTOS",
    detail: "Slight angle and light variation between shots boosts cross-photo consistency and confidence.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function FaceCalibration({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper-lg p-8 md:p-12"
      >
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-56 h-72 shrink-0">
            <div className="absolute inset-0 rounded-lg border-2 border-dashed border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]" />
            <span className="absolute -top-2 left-6 w-4 h-4 border-t-2 border-l-2 border-aurum-400" />
            <span className="absolute -top-2 right-6 w-4 h-4 border-t-2 border-r-2 border-aurum-400" />
            <span className="absolute -bottom-2 left-6 w-4 h-4 border-b-2 border-l-2 border-aurum-400" />
            <span className="absolute -bottom-2 right-6 w-4 h-4 border-b-2 border-r-2 border-aurum-400" />
            <motion.div
              className="absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-[var(--accent-aurum)] to-transparent"
              initial={{ top: "12%" }}
              animate={{ top: ["12%", "88%", "12%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center space-y-2">
              <ScanLine className="w-8 h-8 text-[var(--accent-aurum)] mx-auto" />
              <span className="type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-[0.3em] uppercase block">
                Face IQ
              </span>
              <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest uppercase block">
                Calibration
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <span className="section-number">CALIBRATE FIRST</span>
            <h2 className="type-display text-[var(--text-primary)] tracking-tight mt-3">
              A GREAT SCAN <span className="text-gradient-aurum">STARTS WITH LIGHT.</span>
            </h2>
            <p className="text-[var(--text-muted)] font-body type-subhead mt-3 max-w-lg mx-auto md:mx-0">
              Thirty seconds of setup returns dramatically more accurate symmetry, proportions, and
              skin scores. Follow the protocol, then capture.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {protocol.map((item, i) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 relative"
          >
            <span className="absolute top-4 right-4 type-mono text-[0.5rem] text-[color-mix(in_srgb,var(--text-muted)_50%,transparent)] tracking-[0.25em]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-aurum flex items-center justify-center shadow-aurum mb-4">
              <item.icon className="w-4.5 h-4.5 text-white" />
            </div>
            <h3 className="type-label text-[var(--text-primary)] mb-2">{item.title}</h3>
            <p className="text-xs text-[var(--text-secondary)] font-body leading-relaxed">
              {item.detail}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBegin}
          className="btn-nexus w-full sm:w-auto justify-center"
        >
          <Camera className="w-5 h-5" />
          BEGIN CAPTURE
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <p className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest uppercase">
          2–3 photos · ~30 seconds
        </p>
      </motion.div>
    </div>
  );
}
