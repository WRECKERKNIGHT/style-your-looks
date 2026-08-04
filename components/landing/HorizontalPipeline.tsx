"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Camera, Cpu, Shirt, Share2 } from "lucide-react";

const pipelineSteps = [
  {
    number: "01",
    icon: Camera,
    title: "CAPTURE",
    tagline: "A single photo.",
    description:
      "Snap or upload a front-facing selfie. That is the only input you will ever need.",
    accent: "from-nexus-600 to-nexus-400",
  },
  {
    number: "02",
    icon: Cpu,
    title: "ANALYZE",
    tagline: "478 landmarks. 33 pose points.",
    description:
      "MediaPipe runs entirely on your GPU. Face geometry, skin tone, body typing — computed in milliseconds.",
    accent: "from-aurum-500 to-aurum-300",
  },
  {
    number: "03",
    icon: Shirt,
    title: "STYLE",
    tagline: "Scored. Ranked. Curated.",
    description:
      "FaceIQ, harmony indices, outfit picks, grooming recs. Everything personalized to your unique profile.",
    accent: "from-nexus-700 to-aurum-500",
  },
  {
    number: "04",
    icon: Share2,
    title: "SHARE",
    tagline: "Join the style economy.",
    description:
      "Publish your look to the community. Get honest ratings from real people. Level up your style reputation.",
    accent: "from-aurum-500 to-nexus-500",
  },
];

function StepCard({
  step,
  index,
  scrollYProgress,
}: {
  step: (typeof pipelineSteps)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = 0.16 + index * 0.17;
  const opacity = useTransform(scrollYProgress, [start - 0.03, start + 0.06], [0, 1]);
  const scale = useTransform(scrollYProgress, [start - 0.03, start + 0.06], [0.88, 1]);
  const y = useTransform(scrollYProgress, [start - 0.03, start + 0.06], [32, 0]);

  return (
    <div
      className="relative w-[78vw] md:w-[420px] flex-shrink-0 group"
    >
      <div className="absolute -top-16 left-0 right-0 flex items-center gap-4 opacity-40">
        <span className="type-mono text-[0.7rem] text-[var(--accent-mocha)] tracking-[0.3em]">
          STEP {step.number}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-caramel)_40%,transparent)] to-transparent" />
      </div>

      <motion.div
        style={{ opacity, scale, y }}
        className="glass-card rounded-2xl p-8 md:p-12 h-[420px] md:h-[480px] flex flex-col justify-between relative overflow-hidden"
      >
        <div
          className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${step.accent} opacity-10 blur-[70px]`}
        />

        <div>
          <div className="text-6xl md:text-7xl font-display font-bold text-[var(--text-primary)]/[0.08] leading-none">
            {step.number}
          </div>
          <div className="mt-8 w-14 h-14 rounded-full bg-gradient-aurum flex items-center justify-center shadow-aurum">
            <step.icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div>
          <h3 className="type-heading text-[var(--text-primary)] mb-3">
            {step.title}
          </h3>
          <p className="type-mono text-[0.65rem] text-[var(--accent-mocha)] tracking-[0.15em] mb-4 uppercase">
            {step.tagline}
          </p>
          <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
            {step.description}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-nexus-500 to-aurum-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
      </motion.div>
    </div>
  );
}

export function HorizontalPipeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const distance = trackRef.current.scrollWidth - window.innerWidth;
      setScrollDistance(Math.max(0, distance + 160));
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    const schedule = () => {
      requestAnimationFrame(measure);
    };

    let fontsCancelled = false;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!fontsCancelled) schedule();
      });
    }

    const t1 = window.setTimeout(measure, 300);
    const t2 = window.setTimeout(measure, 1000);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      fontsCancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0.02, 0.98], [0, -scrollDistance]);

  return (
    <section
      ref={sectionRef}
      id="pipeline"
      className="relative h-[260vh] bg-cosmic-surface"
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center will-change-transform">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full bg-aurum-400/10 blur-[200px] pointer-events-none" />

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="relative z-10 flex items-center gap-8 md:gap-14 pl-8 md:pl-16 lg:pl-24 pr-[8vw]"
        >
          <div className="w-[80vw] md:w-[38vw] lg:w-[36vw] flex-shrink-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="section-divider" />
              <span className="section-number">THE PIPELINE</span>
            </div>
            <h2 className="type-display text-[var(--text-primary)] leading-[0.92]">
              FROM ONE
              <br />
              PHOTO TO A
              <br />
              <span className="text-gradient-aurum italic">FULL STYLE</span>
              <br />
              IDENTITY.
            </h2>
            <p className="mt-8 text-[var(--text-secondary)] text-base md:text-lg font-body leading-relaxed max-w-md">
              Four steps. Zero servers. Scroll through the entire journey your
              photo takes inside ZERVEY.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {pipelineSteps.map((step, i) => (
                <div
                  key={step.number}
                  className="flex items-center gap-3 glass-card rounded-lg px-4 py-3 border-glow"
                >
                  <span className="type-mono text-[0.6rem] font-bold text-[var(--accent-mocha)]">
                    {step.number}
                  </span>
                  <span className="type-mono text-[0.6rem] text-[var(--text-secondary)] tracking-widest">
                    {step.title}
                  </span>
                  <span className="ml-auto text-[var(--accent-caramel)]">
                    &rarr;
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-3 text-[var(--text-muted)]">
              <div className="w-10 h-px bg-aurum-400/40" />
              <span className="type-mono text-[0.6rem] tracking-[0.25em]">
                SCROLL TO TRAVEL
              </span>
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-aurum-400/70"
              >
                &rarr;
              </motion.div>
            </div>
          </div>

          {pipelineSteps.map((step, i) => (
            <StepCard
              key={step.number}
              step={step}
              index={i}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <div className="w-[60vw] md:w-[26vw] flex-shrink-0 flex flex-col items-center gap-6 text-center">
            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0.85, 0.95], [0, 1]) }}
              className="w-20 h-20 rounded-full border border-aurum-400/40 flex items-center justify-center"
            >
              <span className="text-gradient-aurum text-3xl font-display font-bold">
                &rarr;
              </span>
            </motion.div>
            <motion.p
              style={{ opacity: useTransform(scrollYProgress, [0.85, 0.95], [0, 1]) }}
              className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-[0.3em] uppercase"
            >
              End of the pipeline
            </motion.p>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-20" />

        <div className="absolute bottom-0 left-0 right-0 h-px bg-[color-mix(in_srgb,var(--text-muted)_18%,transparent)]">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-nexus-500 via-aurum-400 to-aurum-300"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </section>
  );
}
