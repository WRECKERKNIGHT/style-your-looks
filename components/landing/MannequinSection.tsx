"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mannequin3D } from "./Mannequin3D";

const features = [
  {
    id: "face",
    label: "FACE ANALYSIS",
    sublabel: "478-point detection",
    x: "74%",
    y: "14%",
    side: "right" as const,
  },
  {
    id: "grooming",
    label: "GROOMING STUDIO",
    sublabel: "15+ beard styles",
    x: "74%",
    y: "26%",
    side: "right" as const,
  },
  {
    id: "skin",
    label: "SKIN TONE",
    sublabel: "ITA color science",
    x: "74%",
    y: "38%",
    side: "right" as const,
  },
  {
    id: "body",
    label: "BODY TYPE",
    sublabel: "Pose landmark AI",
    x: "26%",
    y: "50%",
    side: "left" as const,
  },
  {
    id: "tryon",
    label: "VIRTUAL TRY-ON",
    sublabel: "Outfit overlay",
    x: "26%",
    y: "62%",
    side: "left" as const,
  },
  {
    id: "color",
    label: "COLOR STUDIO",
    sublabel: "Palette matching",
    x: "74%",
    y: "54%",
    side: "right" as const,
  },
  {
    id: "outfits",
    label: "OUTFIT PICKS",
    sublabel: "AI recommendations",
    x: "74%",
    y: "70%",
    side: "right" as const,
  },
];

export function MannequinSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const mannequinOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const mannequinScale = useTransform(scrollYProgress, [0, 0.2], [0.85, 1]);
  const mannequinRotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] bg-section-dark"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Radial glow behind mannequin */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
          initial={false}
        >
          <div className="w-full h-full rounded-full bg-amber/[0.08] blur-[120px]" />
        </motion.div>

        {/* Diagonal line pattern — very subtle on dark */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #C4A882 0, #C4A882 1px, transparent 0, transparent 60px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Title — top left, light text on dark */}
        <div className="absolute top-14 left-8 md:left-16 z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="type-label text-amber/60">02 // The Body</span>
            <h2 className="mt-3 type-display text-parchment/90">
              EVERY
              <br />
              FEATURE.
              <br />
              <span className="text-gradient-gold">MAPPED.</span>
            </h2>
            <p className="mt-5 text-tan/60 text-sm max-w-xs font-body leading-relaxed">
              Every analysis runs on your device. Your data never leaves your
              hands.
            </p>
          </motion.div>
        </div>

        {/* Mannequin — with scroll-driven rotation */}
        <motion.div
          style={{
            opacity: mannequinOpacity,
            scale: mannequinScale,
            rotateY: mannequinRotate,
          }}
          className="relative z-10"
        >
          <Mannequin3D interactive className="w-[280px] md:w-[340px]" />
        </motion.div>

        {/* Feature labels — fly in from edges */}
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            className="feature-label"
            style={{
              left: feature.x,
              top: feature.y,
              transform:
                feature.side === "left" ? "translateX(-100%)" : "none",
            }}
            initial={{
              opacity: 0,
              x: feature.side === "left" ? -50 : 50,
              scale: 0.92,
            }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 14,
              delay: 0.3 + index * 0.08,
            }}
          >
            <div className="flex flex-col">
              <span>{feature.label}</span>
              <span className="text-coffee/70 text-[0.5rem] font-body font-normal tracking-normal normal-case">
                {feature.sublabel}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Connector lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {features.map((feature, index) => (
            <motion.line
              key={feature.id}
              x1="50"
              y1={feature.y}
              x2={feature.x}
              y2={feature.y}
              stroke="rgba(196, 168, 130, 0.15)"
              strokeWidth="0.1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.5 + index * 0.08,
                ease: "easeOut",
              }}
            />
          ))}
        </svg>

        {/* Bottom info bar */}
        <div className="absolute bottom-8 left-8 md:left-16 z-10 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber/60 rounded-full" />
            <span className="type-mono text-[0.6rem] text-tan/40 tracking-widest">FRONT VIEW</span>
          </div>
          <div className="h-px w-10 bg-tan/15" />
          <span className="type-mono text-[0.6rem] text-tan/30 tracking-widest">1:1 SCALE</span>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 right-8 md:right-16 z-10"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="type-mono text-[0.5rem] text-tan/30 tracking-widest uppercase">
            Scroll to rotate
          </span>
        </motion.div>
      </div>
    </section>
  );
}
