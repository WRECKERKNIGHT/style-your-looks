"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import Link from "next/link";
import { StatsCounter } from "./StatsCounter";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { KineticHeadline } from "./KineticHeadline";

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

const stats = [
  { target: 47, suffix: "-Point", label: "Analysis" },
  { target: 100, suffix: "%", label: "Private" },
  { target: 0, suffix: "", prefix: "Real-time ", label: "AI" },
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

  const bgY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const typeY = useTransform(smoothProgress, [0, 1], [0, 140]);
  const typeScale = useTransform(smoothProgress, [0, 1], [1, 1.12]);
  const typeOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0.15]);
  const fadeOut = useTransform(smoothProgress, [0.6, 1], [1, 0]);

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
      className="relative min-h-screen overflow-hidden bg-cosmic-base"
    >
      <div className="absolute inset-0 grid-bg opacity-40" />

      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] right-[15%] w-[600px] h-[600px] rounded-full bg-nexus-400/10 blur-[180px] animate-drift" />
        <div className="absolute top-[40%] left-[10%] w-[400px] h-[400px] rounded-full bg-aurum-400/8 blur-[140px] animate-drift" style={{ animationDelay: "-5s" }} />
        <div className="absolute bottom-[10%] right-[25%] w-[350px] h-[350px] rounded-full bg-nexus-600/10 blur-[120px] animate-drift" style={{ animationDelay: "-10s" }} />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 opacity-0 lg:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(108,43,217,0.12), transparent 60%)`,
        }}
      />

      <motion.div style={{ opacity: fadeOut }} className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-20">
        <motion.div
          className="max-w-[1400px] mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div>
              <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                <div className="section-divider" />
                <span className="section-number">AI Style Intelligence</span>
              </motion.div>

              <motion.div variants={itemVariants} style={{ y: typeY, scale: typeScale, opacity: typeOpacity }}>
                <h1 className="type-massive text-white leading-[0.85] mb-4">
                  NEX
                  <span className="text-gradient-aurum">ARI</span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="type-label text-aurum-400/80 mb-6 text-[0.7rem]"
              >
                AI-POWERED STYLE INTELLIGENCE
              </motion.p>

              <motion.p
                variants={itemVariants}
                className="text-nexus-200/60 text-lg md:text-xl max-w-lg font-body leading-relaxed"
              >
                Unlock your style DNA with 47-point facial analysis, body
                typing, and personalized recommendations — all running
                privately on your device.
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
                  <Link href="#features" className="btn-outline border-aurum-400/50 text-aurum-400 hover:text-white">
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
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.03, 1.03, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[400px] h-[500px]"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-nexus opacity-10 blur-[100px]" />
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-nexus-400/20 glow-pulse"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-aurum-400/20" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-dashed border-nexus-400/10"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="type-massive text-nexus-400/10 select-none">
                    47
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="mt-16 lg:mt-20 grid grid-cols-3 gap-8 max-w-2xl"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-lg px-6 py-5 text-center group hover:border-nexus-400/30 transition-colors duration-500">
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-aurum">
                  {stat.prefix && <span className="text-white/40 text-sm">{stat.prefix}</span>}
                  <StatsCounter target={stat.target} suffix="" />
                  <span className="text-lg">{stat.suffix}</span>
                </div>
                <div className="type-mono text-[0.5rem] text-nexus-300/60 tracking-widest mt-2">
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
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 border-r-2 border-b-2 border-nexus-400/60 rotate-45"
        />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nexus-400/30 to-transparent" />

      <KineticHeadline
        text="LOOKS ARE DATA"
        className="absolute bottom-6 right-8 md:right-16 z-[1] hidden lg:block"
        fillClassName="text-gradient-aurum"
        dimClassName="text-white/8"
        as="p"
      />
    </section>
  );
}
