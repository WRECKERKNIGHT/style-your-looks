"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";
import { Camera, Cpu, Shirt } from "lucide-react";
import { KineticHeadline } from "./KineticHeadline";
import { Reveal } from "@/components/shared/Reveal";
import { ScrollParallax } from "@/components/shared/ScrollEffects";

const steps = [
  {
    number: 1,
    icon: Camera,
    title: "Capture",
    description:
      "Take a selfie or upload a photo. Front-facing, good lighting. That's it.",
    detail: "Webcam or file upload. JPEG, PNG, WebP. Max 10MB.",
  },
  {
    number: 2,
    icon: Cpu,
    title: "Process",
    description:
      "MediaPipe runs 478 face landmarks + 33 pose landmarks. All on your GPU.",
    detail: "Zero server calls. Zero data collection. Pure client-side ML.",
  },
  {
    number: 3,
    icon: Shirt,
    title: "Style",
    description:
      "Get your scores, color palette, outfit picks, grooming recs. Everything personalized.",
    detail: "FaceIQ, skin tone, body type, virtual try-on, community ratings.",
  },
];

const DESKTOP_OFFSET = ["", "md:mt-14", "md:mt-5"];

function StepCard({
  step,
  index,
  scrollYProgress,
  count,
}: {
  step: (typeof steps)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
  count: number;
}) {
  const segment = count > 1 ? 1 / count : 1;
  const from = index * segment;
  const to = (index + 1) * segment;
  const y = useTransform(scrollYProgress, [from, to], [44, -44]);

  return (
    <Reveal
      key={step.number}
      delay={index * 0.12}
      y={54}
      amount={0.25}
      className={`relative ${DESKTOP_OFFSET[index] ?? ""}`}
    >
      <motion.div
        style={{ y, willChange: "transform" }}
        className="h-full"
      >
        <div className="glass-card rounded-2xl p-8 md:p-10 h-full relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-aurum opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-700" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-aurum-400/0 blur-[60px] group-hover:bg-aurum-400/10 transition-colors duration-700" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-gradient-aurum flex items-center justify-center mb-6 shadow-aurum group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
              <step.icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="type-mono text-[0.6rem] text-[var(--accent-mocha)] tracking-[0.2em]">
                STEP 0{step.number}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] to-transparent" />
            </div>

            <h3 className="type-heading text-[var(--text-primary)] mb-3 text-2xl">
              {step.title}
            </h3>

            <p className="text-[var(--text-secondary)] text-sm font-body leading-relaxed mb-4">
              {step.description}
            </p>

            <p className="type-mono text-[0.65rem] text-[var(--text-muted)]">
              {step.detail}
            </p>
          </div>
        </div>

        {index < steps.length - 1 && (
          <div className="hidden md:flex absolute top-1/2 -right-6 translate-x-1/2 z-20">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] flex items-center justify-center group-hover:border-aurum-400/50 transition-colors shadow-paper">
              <span className="text-[var(--accent-mocha)] text-sm group-hover:text-[var(--accent-caramel)] transition-colors">&rarr;</span>
            </div>
          </div>
        )}
      </motion.div>
    </Reveal>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const lineScaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 26 });

  return (
    <section ref={sectionRef} className="relative py-32 md:py-44 overflow-hidden bg-cosmic-base paper-texture scroll-mt-20" id="how-it-works">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-72 rounded-full bg-aurum-400/10 blur-[150px]" />
        <ScrollParallax speed={0.35} distance={90} className="absolute top-1/4 right-[2%]">
          <div className="w-[420px] h-[420px] rounded-full bg-nexus-500/8 blur-[140px] animate-drift" />
        </ScrollParallax>
        <ScrollParallax speed={0.25} distance={70} className="absolute bottom-[10%] left-[4%]">
          <div className="w-[360px] h-[360px] rounded-full bg-aurum-400/8 blur-[120px] animate-drift" style={{ animationDelay: "-8s" }} />
        </ScrollParallax>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <Reveal x={-30} className="mb-24">
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">02 // Process</span>
          </div>
          <KineticHeadline text="HOW IT WORKS." className="type-display text-[var(--text-primary)]" />
        </Reveal>

        <div className="relative">
          <div className="absolute top-24 left-[2.25rem] md:left-[2.75rem] bottom-24 w-px bg-[var(--border-primary)] hidden md:block" />
          <motion.div
            style={{ scaleY: lineScaleY }}
            className="absolute top-24 left-[2.25rem] md:left-[2.75rem] bottom-24 w-[2px] origin-top bg-gradient-to-b from-aurum-400 via-[var(--accent-mocha)] to-aurum-400 hidden md:block rounded-full shadow-aurum"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                scrollYProgress={scrollYProgress}
                count={steps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
