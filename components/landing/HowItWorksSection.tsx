"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Camera, Cpu, Shirt } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "CAPTURE",
    description:
      "Take a selfie or upload a photo. Front-facing, good lighting. That's it.",
    detail: "Webcam or file upload. JPEG, PNG, WebP. Max 10MB.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "PROCESS",
    description:
      "MediaPipe runs 478 face landmarks + 33 pose landmarks. All on your GPU.",
    detail: "Zero server calls. Zero data collection. Pure client-side ML.",
  },
  {
    number: "03",
    icon: Shirt,
    title: "STYLE",
    description:
      "Get your scores, color palette, outfit picks, grooming recs. Everything personalized.",
    detail: "FaceIQ, skin tone, body type, virtual try-on, community ratings.",
  },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);
  const lineHeight = useTransform(lineProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-44 overflow-hidden bg-section-gradient"
      id="how-it-works"
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="type-label text-amber/80">04 // Process</span>
            <h2 className="mt-3 type-display text-espresso">
              HOW IT{" "}
              <span className="text-gradient-gold italic">WORKS.</span>
            </h2>
          </motion.div>
        </div>

        {/* Steps — architectural layout */}
        <div className="relative">
          {/* Connecting line — draws itself */}
          <div className="absolute left-[52px] md:left-1/2 top-0 bottom-0 w-px bg-tan/15 hidden md:block">
            <motion.div
              className="w-full bg-gradient-to-b from-amber/40 via-amber/20 to-transparent origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-24 md:space-y-36">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center`}
                  initial={{
                    opacity: 0,
                    x: isEven ? -60 : 60,
                  }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Number + icon side */}
                  <div
                    className={`md:col-span-5 ${
                      isEven ? "md:text-right md:pr-16" : "md:col-start-8 md:pl-16"
                    }`}
                  >
                    <div className={`flex items-center gap-8 ${isEven ? "md:justify-end" : ""}`}>
                      <div className="text-[clamp(5rem,10vw,9rem)] font-display font-bold text-amber/[0.08] leading-none select-none">
                        {step.number}
                      </div>
                      <div className="w-14 h-14 border border-amber/20 bg-cream/60 flex items-center justify-center shrink-0">
                        <step.icon className="w-6 h-6 text-amber/70" />
                      </div>
                    </div>
                  </div>

                  {/* Content side */}
                  <div
                    className={`md:col-span-6 ${
                      isEven
                        ? "md:col-start-7"
                        : "md:col-start-1 md:row-start-1"
                    }`}
                  >
                    <h3 className="text-3xl md:text-5xl font-display font-bold text-espresso tracking-tight mb-5">
                      {step.title}
                    </h3>
                    <p className="text-lg text-coffee leading-relaxed max-w-lg mb-5 font-body">
                      {step.description}
                    </p>
                    <p className="type-mono text-[0.7rem] text-coffee/40 max-w-md">
                      {step.detail}
                    </p>

                    {/* Decorative line */}
                    <div className="mt-10 h-px border-t border-dashed border-tan/20 w-full max-w-sm" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
