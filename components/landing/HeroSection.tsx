"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { MagneticButton } from "@/components/shared/MagneticButton";

const headline = [
  { word: "Stop", size: "text-[clamp(2.5rem,5vw,4.5rem)]", weight: "font-normal", italic: true, depth: 2 },
  { word: "dressing", size: "text-[clamp(3.5rem,9vw,8rem)]", weight: "font-bold", italic: false, depth: 1 },
  { word: "like", size: "text-[clamp(2rem,4vw,3.5rem)]", weight: "font-light", italic: true, depth: 3 },
  { word: "an", size: "text-[clamp(2rem,4vw,3.5rem)]", weight: "font-light", italic: false, depth: 3 },
  { word: "algorithm", size: "text-[clamp(3.5rem,9vw,8rem)]", weight: "font-bold", italic: false, gold: true, depth: 1 },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Z-Axis Depth Parallax — each layer moves at different speed
  // Background layers (slow) → midground → foreground (fast)
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const gridScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const watermarkY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const watermarkScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.4]);
  const watermarkOpacity = useTransform(scrollYProgress, [0, 0.5], [0.04, 0]);

  // Headline layers — different depths create tunnel feel
  const headlineDeepY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const headlineMidY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const headlineCloseY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const ctaY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Right visual — accelerates away (closest to camera)
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 350]);
  const visualScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Stat cards — each at different depth
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, 350]);

  const depthMap = {
    1: headlineDeepY,
    2: headlineMidY,
    3: headlineCloseY,
  };

  return (
    <section ref={ref} className="relative min-h-[115vh] overflow-hidden bg-section-hero">
      {/* Subtle grid — background layer (moves slowest) */}
      <motion.div
        style={{ y: bgY, scale: gridScale }}
        className="absolute inset-0 opacity-[0.025] origin-center"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(#C4A882 1px, transparent 1px), linear-gradient(90deg, #C4A882 1px, transparent 1px)",
            backgroundSize: "100px 100px",
            transform: "rotate(-2deg) scale(1.1)",
          }}
        />
      </motion.div>

      {/* Warm glow — mid-depth layer */}
      <motion.div
        style={{ y: glowY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber/[0.04] blur-[150px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-burgundy/[0.03] blur-[100px]" />
      </motion.div>

      {/* Main content — two-column asymmetric layout */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left — headline */}
          <div className="lg:col-span-7">
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: headlineDeepY }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="section-divider" />
              <span className="type-label text-amber/80">Est. MMXXVI</span>
            </motion.div>

            {/* Staggered headline — each word at different Z-depth */}
            <div className="space-y-0">
              {headline.map((item, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.span
                    style={{ y: depthMap[item.depth as keyof typeof depthMap] }}
                    className={`block ${item.size} ${item.weight} ${
                      item.italic ? "italic" : ""
                    } tracking-tight text-espresso leading-[0.92] ${
                      item.gold ? "text-gradient-gold" : ""
                    }`}
                    initial={{ y: "110%", rotateX: -20 }}
                    animate={{ y: 0, rotateX: 0 }}
                    transition={{
                      duration: 1.1,
                      delay: 0.4 + i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {item.word}
                  </motion.span>
                </div>
              ))}
            </div>

            {/* Subtitle — mid-depth */}
            <motion.p
              style={{ y: subtitleY, opacity: subtitleOpacity }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 text-coffee text-lg md:text-xl max-w-lg font-body leading-relaxed"
            >
              478 facial landmarks. Zero server calls. Your face stays on your
              device — we just tell you what works and what doesn&apos;t.
            </motion.p>

            {/* CTAs — near layer */}
            <motion.div
              style={{ y: ctaY, opacity: ctaOpacity }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-wrap gap-5"
            >
              <MagneticButton>
                <Link href="/signup" className="btn-gold">
                  Get Your Score
                  <span className="text-lg leading-none">&rarr;</span>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link href="#how-it-works" className="btn-elegant">
                  See How It Works
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right — visual element: closest layer (moves fastest) */}
          <motion.div
            style={{ y: visualY, scale: visualScale, opacity: visualOpacity }}
            className="lg:col-span-5 relative hidden lg:flex items-center justify-center"
          >
            {/* Giant watermark number — mid-depth, scales up as you scroll */}
            <motion.div
              style={{ y: watermarkY, scale: watermarkScale, opacity: watermarkOpacity }}
              className="absolute select-none pointer-events-none"
            >
              <span className="text-[clamp(12rem,20vw,22rem)] font-display font-bold text-amber leading-none">
                478
              </span>
            </motion.div>

            {/* Floating stat cards — each at different depth */}
            <motion.div
              style={{ y: card1Y }}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="absolute top-[10%] right-[5%] bg-cream/80 backdrop-blur-md border border-tan/30 px-6 py-5 shadow-elegant"
            >
              <div className="text-3xl font-display font-bold text-amber">
                <AnimatedCounter target={478} duration={2.5} />
              </div>
              <div className="type-mono text-[0.55rem] text-coffee/60 tracking-widest mt-1">
                FACE POINTS
              </div>
            </motion.div>

            <motion.div
              style={{ y: card2Y }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              className="absolute top-[35%] left-[0%] bg-cream/80 backdrop-blur-md border border-tan/30 px-6 py-5 shadow-elegant"
            >
              <div className="text-3xl font-display font-bold text-amber">
                <AnimatedCounter target={100} suffix="%" duration={2} />
              </div>
              <div className="type-mono text-[0.55rem] text-coffee/60 tracking-widest mt-1">
                ON-DEVICE
              </div>
            </motion.div>

            <motion.div
              style={{ y: card3Y }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
              className="absolute bottom-[15%] right-[15%] bg-cream/80 backdrop-blur-md border border-tan/30 px-6 py-5 shadow-elegant"
            >
              <div className="text-3xl font-display font-bold text-amber">
                <AnimatedCounter target={0} duration={1} />
              </div>
              <div className="type-mono text-[0.55rem] text-coffee/60 tracking-widest mt-1">
                SERVER CALLS
              </div>
            </motion.div>

            {/* Decorative line — foreground layer */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
              className="absolute left-1/2 top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-tan/30 to-transparent origin-top"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 right-8 md:right-16 z-10 flex flex-col items-center gap-3"
      >
        <span className="type-mono text-[0.5rem] text-tan tracking-[0.3em] uppercase rotate-90 origin-center mb-12">
          Scroll
        </span>
        <motion.div
          className="w-px h-16 bg-gradient-to-b from-amber/60 to-transparent origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 2.8, duration: 1.2, ease: "easeOut" }}
        />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1 h-1 rounded-full bg-amber/50"
        />
      </motion.div>

      {/* Corner ornaments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute top-8 left-8 w-8 h-8 border-l-[1.5px] border-t-[1.5px] border-amber/20"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 right-8 w-8 h-8 border-r-[1.5px] border-b-[1.5px] border-amber/20"
      />
    </section>
  );
}
