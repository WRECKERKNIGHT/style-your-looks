"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { TextReveal } from "@/components/shared/TextReveal";

const headline = [
  { word: "Stop", size: "text-[clamp(2.5rem,5vw,4.5rem)]", weight: "font-normal", italic: true, depth: 2, rotate: -3 },
  { word: "dressing", size: "text-[clamp(3.5rem,9vw,8rem)]", weight: "font-bold", italic: false, depth: 1, rotate: 0 },
  { word: "like", size: "text-[clamp(2rem,4vw,3.5rem)]", weight: "font-light", italic: true, depth: 3, rotate: 2 },
  { word: "an", size: "text-[clamp(2rem,4vw,3.5rem)]", weight: "font-light", italic: false, depth: 3, rotate: -1 },
  { word: "algorithm", size: "text-[clamp(3.5rem,9vw,8rem)]", weight: "font-bold", italic: false, gold: true, depth: 1, rotate: 0 },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const bgY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const gridScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);
  const glowY = useTransform(smoothProgress, [0, 1], [0, 150]);
  const watermarkY = useTransform(smoothProgress, [0, 1], [0, 250]);
  const watermarkScale = useTransform(smoothProgress, [0, 0.6], [1, 1.4]);
  const watermarkOpacity = useTransform(smoothProgress, [0, 0.5], [0.04, 0]);

  const headlineDeepY = useTransform(smoothProgress, [0, 1], [0, 60]);
  const headlineMidY = useTransform(smoothProgress, [0, 1], [0, 120]);
  const headlineCloseY = useTransform(smoothProgress, [0, 1], [0, 200]);

  const subtitleY = useTransform(smoothProgress, [0, 1], [0, 160]);
  const subtitleOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0]);

  const ctaY = useTransform(smoothProgress, [0, 1], [0, 180]);
  const ctaOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);

  const visualY = useTransform(smoothProgress, [0, 1], [0, 350]);
  const visualScale = useTransform(smoothProgress, [0, 0.5], [1, 0.85]);
  const visualOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  const card1Y = useTransform(smoothProgress, [0, 1], [0, 300]);
  const card2Y = useTransform(smoothProgress, [0, 1], [0, 400]);
  const card3Y = useTransform(smoothProgress, [0, 1], [0, 350]);

  const depthMap = {
    1: headlineDeepY,
    2: headlineMidY,
    3: headlineCloseY,
  };

  const rotateMap = {
    1: 0,
    2: 0,
    3: 0,
  };

  return (
    <section ref={ref} className="relative min-h-[120vh] overflow-hidden bg-section-hero">
      <motion.div style={{ y: bgY, scale: gridScale }} className="absolute inset-0 opacity-[0.025] origin-center">
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

      <motion.div style={{ y: glowY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[10%] w-[600px] h-[600px] rounded-full bg-amber/[0.05] blur-[180px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full bg-burgundy/[0.03] blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-olive/[0.02] blur-[100px]" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
          <div className="lg:col-span-7">
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

            <div className="space-y-0">
              {headline.map((item, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.span
                    style={{
                      y: depthMap[item.depth as keyof typeof depthMap],
                      rotateX: rotateMap[item.depth as keyof typeof rotateMap],
                    }}
                    className={`block ${item.size} ${item.weight} ${
                      item.italic ? "italic" : ""
                    } tracking-tight text-espresso leading-[0.92] ${
                      item.gold ? "text-gradient-gold" : ""
                    }`}
                    initial={{ y: "120%", rotateX: -30, opacity: 0 }}
                    animate={{ y: 0, rotateX: 0, opacity: 1 }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4 + i * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {item.word}
                  </motion.span>
                </div>
              ))}
            </div>

            <motion.p
              style={{ y: subtitleY, opacity: subtitleOpacity }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 text-coffee text-lg md:text-xl max-w-lg font-body leading-relaxed"
            >
              478 facial landmarks. Zero server calls. Your face stays on your
              device — we just tell you what works and what doesn&apos;t.
            </motion.p>

            <motion.div
              style={{ y: ctaY, opacity: ctaOpacity }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-wrap gap-5"
            >
              <MagneticButton>
                <Link href="/signup" className="btn-gold">
                  Get Your Score
                  <motion.span
                    className="text-lg leading-none inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    &rarr;
                  </motion.span>
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link href="#how-it-works" className="btn-elegant">
                  See How It Works
                </Link>
              </MagneticButton>
            </motion.div>
          </div>

          <motion.div
            style={{ y: visualY, scale: visualScale, opacity: visualOpacity }}
            className="lg:col-span-5 relative hidden lg:flex items-center justify-center"
          >
            <motion.div
              style={{ y: watermarkY, scale: watermarkScale, opacity: watermarkOpacity }}
              className="absolute select-none pointer-events-none"
            >
              <span className="text-[clamp(12rem,20vw,22rem)] font-display font-bold text-amber leading-none">
                478
              </span>
            </motion.div>

            {[
              { y: card1Y, xOffset: 40, delay: 1.8, target: 478, suffix: "", label: "FACE POINTS", pos: { top: "10%", right: "5%" } },
              { y: card2Y, xOffset: -40, delay: 2.0, target: 100, suffix: "%", label: "ON-DEVICE", pos: { top: "35%", left: "0%" } },
              { y: card3Y, xOffset: 0, delay: 2.2, target: 0, suffix: "", label: "SERVER CALLS", pos: { bottom: "15%", right: "15%" } },
            ].map((card, i) => (
              <motion.div
                key={i}
                style={{ y: card.y, ...card.pos }}
                initial={{ opacity: 0, x: card.xOffset }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: card.delay }}
                className="absolute bg-cream/80 backdrop-blur-md border border-tan/30 px-6 py-5 shadow-elegant"
                whileHover={{ y: -4, boxShadow: "0 12px 40px -8px rgba(44,24,16,0.2)" }}
              >
                <div className="text-3xl font-display font-bold text-amber">
                  <AnimatedCounter target={card.target} duration={2.5} />
                  {card.suffix}
                </div>
                <div className="type-mono text-[0.55rem] text-coffee/60 tracking-widest mt-1">
                  {card.label}
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
              className="absolute left-1/2 top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-tan/30 to-transparent origin-top"
            />
          </motion.div>
        </div>
      </div>

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
