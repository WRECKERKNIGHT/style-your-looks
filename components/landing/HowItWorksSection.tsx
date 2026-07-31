"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Cpu, Shirt } from "lucide-react";

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

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="relative py-32 md:py-44 overflow-hidden bg-cosmic-base" id="how-it-works">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">02 // Process</span>
          </div>
          <h2 className="type-display text-white">
            HOW IT{" "}
            <span className="text-gradient-aurum italic">WORKS.</span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute top-24 left-[2.25rem] md:left-[2.75rem] bottom-24 w-px bg-gradient-to-b from-nexus-400/40 via-aurum-400/20 to-nexus-400/40 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                custom={index}
                variants={stepVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="relative"
              >
                <div className="glass-card rounded-xl p-8 md:p-10 h-full relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-nexus opacity-[0.06]" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-nexus flex items-center justify-center mb-6 shadow-nexus">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="type-mono text-[0.6rem] text-aurum-400/70 tracking-[0.2em]">
                        STEP 0{step.number}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-nexus-400/20 to-transparent" />
                    </div>

                    <h3 className="type-heading text-white mb-3 text-2xl">
                      {step.title}
                    </h3>

                    <p className="text-nexus-200/60 text-sm font-body leading-relaxed mb-4">
                      {step.description}
                    </p>

                    <p className="type-mono text-[0.65rem] text-nexus-300/40">
                      {step.detail}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 translate-x-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-cosmic-surface border border-nexus-400/30 flex items-center justify-center">
                      <span className="text-nexus-300 text-sm">&rarr;</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
