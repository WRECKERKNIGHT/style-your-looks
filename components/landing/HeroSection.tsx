"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { StatsCounter } from "./StatsCounter";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { KineticHeadline } from "./KineticHeadline";
import { Mannequin3D } from "./Mannequin3D";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const headlineWords = ["ZERVEY."];

const stats = [
  { target: 47, suffix: "-Point", label: "Analysis" },
  { target: 100, suffix: "%", label: "Private" },
  { target: 0, suffix: "", prefix: "Real-time ", label: "AI" },
];

const floatingTags = [
  { label: "FACE IQ", sub: "478 landmarks", x: "6%", y: "8%", delay: 0 },
  { label: "ITA COLOR", sub: "tone science", x: "2%", y: "48%", delay: 0.8 },
  { label: "TRY-ON", sub: "fit preview", x: "12%", y: "76%", delay: 1.6 },
];

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const mannequinY = useTransform(smoothProgress, [0, 1], [0, -120]);
  const mannequinRotate = useTransform(smoothProgress, [0, 1], [0, -14]);
  const mannequinScale = useTransform(smoothProgress, [0, 1], [1, 0.9]);
  const typeY = useTransform(smoothProgress, [0, 1], [0, 140]);
  const typeScale = useTransform(smoothProgress, [0, 1], [1, 1.08]);
  const typeOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0.15]);
  const headlineWeight = useTransform(smoothProgress, [0, 1], [300, 800]);
  const fadeOut = useTransform(smoothProgress, [0.6, 1], [1, 0]);
  const exitSkew = useTransform(smoothProgress, [0, 1], [0, -5]);
  const exitBlur = useTransform(smoothProgress, [0.25, 1], [0, 10]);
  const exitBlurFilter = useMotionTemplate`blur(${exitBlur}px)`;
  const sideTextY = useTransform(smoothProgress, [0, 1], [0, -180]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spotlightX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const spotlightY = useTransform(my, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      id="hero-landing"
      className="relative min-h-screen overflow-hidden bg-cosmic-base paper-texture"
    >
      <div className="absolute inset-0 grid-bg opacity-60" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[520px] h-[520px] rounded-full bg-aurum-400/15 blur-[160px] animate-drift" />
        <div className="absolute top-[45%] left-[5%] w-[420px] h-[420px] rounded-full bg-nexus-500/10 blur-[140px] animate-drift" style={{ animationDelay: "-5s" }} />
        <div className="absolute bottom-[5%] right-[25%] w-[360px] h-[360px] rounded-full bg-aurum-300/12 blur-[120px] animate-drift" style={{ animationDelay: "-10s" }} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 opacity-0 lg:opacity-100"
        style={{
          background: `radial-gradient(700px circle at ${spotlightX} ${spotlightY}, rgba(185,139,86,0.14), transparent 60%)`,
        }}
      />

      <motion.div
        aria-hidden
        style={{ y: sideTextY, willChange: "transform" }}
        className="pointer-events-none absolute left-2 top-1/2 z-[1] hidden xl:block"
      >
        <span className="block rotate-180 font-display text-[10rem] font-black leading-none tracking-tight text-[color-mix(in_srgb,var(--text-primary)_6%,transparent)] [writing-mode:vertical-rl]">
          MEASURED.
        </span>
      </motion.div>

      <motion.div style={{ opacity: fadeOut }} className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20">
        <motion.div
          className="max-w-[1400px] mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div className="relative">
              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                <div className="section-divider" />
                <span className="section-number">AI Style Intelligence</span>
              </motion.div>

              <motion.div
                variants={itemVariants}
                style={{
                  y: typeY,
                  scale: typeScale,
                  opacity: typeOpacity,
                  skewY: exitSkew,
                  filter: exitBlurFilter,
                  fontWeight: headlineWeight,
                  willChange: "transform",
                }}
              >
                <h1 className="type-massive text-[var(--text-primary)] leading-[0.85] mb-6">
                  {headlineWords.map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden align-bottom">
                      <motion.span
                        initial={{ y: "110%", rotate: 3 }}
                        animate={{ y: 0, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                  <span className="text-gradient-aurum italic">MEASURED.</span>
                  <span className="text-gradient-aurum italic"> MADE.</span>
                  <span className="text-gradient-aurum italic"> YOURS.</span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="type-label mb-6 text-[0.7rem]"
              >
                AI-POWERED STYLE INTELLIGENCE
              </motion.p>

              <motion.p
                variants={itemVariants}
                className="text-[var(--text-secondary)] text-lg md:text-xl max-w-lg font-body leading-relaxed"
              >
                Unlock your style DNA with 47-point facial analysis, body
                typing, and personalized recommendations — all running
                privately on your device. Measured like a tailor, computed
                like an atelier.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-12 flex flex-wrap gap-5"
              >
                <MagneticButton>
                  <Link href="/signup" className="btn-nexus">
                    START YOUR ANALYSIS
                    <span className="text-lg leading-none inline-block">
                      &rarr;
                    </span>
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.2}>
                  <Link href="#features" className="btn-outline border-[var(--accent-caramel)] text-[var(--text-primary)]">
                    EXPLORE FEATURES
                  </Link>
                </MagneticButton>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="hidden lg:flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[360px] h-[560px]"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-aurum opacity-10 blur-[100px]" />

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-aurum-400/25 glow-pulse"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[330px] h-[330px] rounded-full border border-nexus-500/15" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-dashed border-aurum-500/20"
                />

                {/* rotating circular stamp */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                  aria-hidden
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <path id="hero-stamp" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                    </defs>
                    <text className="fill-[var(--accent-caramel)]" style={{ fontSize: "8px", letterSpacing: "2.5px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                      <textPath href="#hero-stamp">
                        MADE TO MEASURE • CRAFTED FOR YOU •
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-aurum-400/80 glow-pulse" />
                  </div>
                </motion.div>

                {/* the mannequin */}
                <motion.div
                  style={{
                    y: mannequinY,
                    rotate: mannequinRotate,
                    scale: mannequinScale,
                    willChange: "transform",
                  }}
                  className="absolute inset-0 z-10"
                >
                  <Mannequin3D className="w-full h-full" />
                </motion.div>

                {/* floating measurement tags */}
                {floatingTags.map((tag) => (
                  <FloatingTag key={tag.label} tag={tag} progress={smoothProgress} />
                ))}

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-[var(--overlay)] blur-[16px] rounded-full" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-16 lg:mt-20 grid grid-cols-3 gap-8 max-w-2xl"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-lg px-6 py-5 text-center group hover:border-[color-mix(in_srgb,var(--accent-caramel)_40%,transparent)] transition-colors duration-500">
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-aurum">
                  {stat.prefix && <span className="text-[var(--text-muted)] text-sm">{stat.prefix}</span>}
                  <StatsCounter target={stat.target} suffix="" />
                  <span className="text-lg">{stat.suffix}</span>
                </div>
                <div className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="type-mono text-[0.5rem] tracking-[0.3em] text-[var(--text-muted)]">
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 border-r-2 border-b-2 border-[color-mix(in_srgb,var(--accent-mocha)_60%,transparent)] rotate-45"
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent-caramel)_40%,transparent)] to-transparent" />

      <KineticHeadline
        text="LOOKS ARE DATA"
        className="absolute bottom-24 right-8 md:right-16 z-[1] hidden lg:block"
        fillClassName="text-gradient-aurum"
        dimClassName="text-[color-mix(in_srgb,var(--text-primary)_8%,transparent)]"
        weightFrom={300}
        weightTo={800}
        as="p"
      />
    </section>
  );
}

type FloatingTagProps = {
  tag: (typeof floatingTags)[number];
  progress: MotionValue<number>;
};

function FloatingTag({ tag, progress }: FloatingTagProps) {
  const exitY = useTransform(
    progress,
    [0.35 + tag.delay * 0.12, 1],
    [0, -(70 + tag.delay * 30)]
  );
  const exitOpacity = useTransform(
    progress,
    [0.4 + tag.delay * 0.1, 1],
    [1, 0]
  );
  const exitBlur = useTransform(progress, [0.5, 1], [0, 6]);
  const exitBlurFilter = useMotionTemplate`blur(${exitBlur}px)`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2 + tag.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute z-20"
      style={{ left: tag.x, top: tag.y }}
    >
      <motion.div
        style={{ y: exitY, opacity: exitOpacity, filter: exitBlurFilter, willChange: "transform" }}
        className="absolute"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4 + tag.delay, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card rounded-md px-3.5 py-2 border-glow"
        >
          <div className="type-mono text-[0.55rem] font-bold tracking-widest text-[var(--accent-mocha)]">
            {tag.label}
          </div>
          <div className="type-mono text-[0.5rem] text-[var(--text-muted)]">
            {tag.sub}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
