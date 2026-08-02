"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ScanFace,
  Shirt,
  Scissors,
  Users,
  Droplets,
  Sparkles,
  Layers,
} from "lucide-react";
import { SpotlightCard } from "@/components/shared/SpotlightCard";
import { KineticHeadline } from "./KineticHeadline";

const features = [
  {
    icon: ScanFace,
    title: "Face Analysis",
    description:
      "478-point facial landmark detection. Symmetry, proportions, jawline, skin clarity — scored objectively with golden ratio adherence.",
  },
  {
    icon: Droplets,
    title: "Skin Tone",
    description:
      "ITA color science with CIELAB conversion. Monk Scale, Fitzpatrick, undertone mapping. Seasonal color classification.",
  },
  {
    icon: Layers,
    title: "Body Type",
    description:
      "Pose landmark detection. Shoulder, waist, hip measurements. 8 body type classifications with proportion scoring.",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description:
      "AI body detection overlays clothing on your photo. Preview before you commit to a look.",
  },
  {
    icon: Scissors,
    title: "Grooming Studio",
    description:
      "15 beard styles, 9 mustache types. Canvas overlays using facial landmarks. See what works before you commit.",
  },
  {
    icon: Sparkles,
    title: "Outfit Picks",
    description:
      "AI-curated recommendations. 40+ outfits, 8 occasions, filtered by your unique profile and seasonal palette.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Share looks, get honest feedback, rate others. Build your style reputation with real people.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden bg-cosmic-surface" id="features">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">01 // Features</span>
          </div>
          <KineticHeadline
            text="WHAT WE BUILD."
            className="type-display text-white"
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group"
            >
              <SpotlightCard className="h-full card-nexus relative overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-nexus opacity-[0.03] rounded-bl-full" />
                <div className="relative z-10 p-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-nexus flex items-center justify-center mb-5 shadow-nexus group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="type-heading text-white mb-3 text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-nexus-200/60 font-body leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 pt-4 border-t border-nexus-800/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-aurum-400/60" />
                    <span className="type-mono text-[0.55rem] text-nexus-300/40 tracking-widest group-hover:text-nexus-300/70 transition-colors">
                      EXPLORE &rarr;
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
