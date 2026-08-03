"use client";

import { useRef, useState } from "react";
import type { ElementType } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
import { Reveal } from "@/components/shared/Reveal";
import {
  FeaturePreviewModal,
  type FeaturePreviewData,
} from "@/components/shared/FeaturePreviewModal";

const features: (FeaturePreviewData & {
  icon: ElementType;
})[] = [
  {
    icon: ScanFace,
    title: "Face Analysis",
    description:
      "478-point facial landmark detection. Symmetry, proportions, jawline, skin clarity — scored objectively with golden ratio adherence.",
    image: "/images/features/face.jpg",
    route: "/dashboard/face-analysis",
    tags: ["478 Landmarks", "Symmetry Score", "On-Device"],
    cta: "Analyze My Face",
  },
  {
    icon: Droplets,
    title: "Skin Tone",
    description:
      "ITA color science with CIELAB conversion. Monk Scale, Fitzpatrick, undertone mapping. Seasonal color classification.",
    image: "/images/features/skin.jpg",
    route: "/dashboard/color-analysis",
    tags: ["ITA Science", "Undertone", "Seasonal Palette"],
    cta: "Find My Tone",
  },
  {
    icon: Layers,
    title: "Body Type",
    description:
      "Pose landmark detection. Shoulder, waist, hip measurements. 8 body type classifications with proportion scoring.",
    image: "/images/features/body.jpg",
    route: "/dashboard/body-analysis",
    tags: ["Pose Detection", "8 Types", "Proportions"],
    cta: "Measure Myself",
  },
  {
    icon: Shirt,
    title: "Virtual Try-On",
    description:
      "AI body detection overlays clothing on your photo. Preview before you commit to a look.",
    image: "/images/features/tryon.jpg",
    route: "/dashboard/virtual-tryon",
    tags: ["Try-On", "Overlay", "AI Styling"],
    cta: "Try It On",
  },
  {
    icon: Scissors,
    title: "Grooming Studio",
    description:
      "15 beard styles, 9 mustache types. Canvas overlays using facial landmarks. See what works before you commit.",
    image: "/images/features/grooming.jpg",
    route: "/dashboard/grooming",
    tags: ["15 Beard Styles", "9 Mustaches", "Canvas Overlay"],
    cta: "Style My Grooming",
  },
  {
    icon: Sparkles,
    title: "Outfit Picks",
    description:
      "AI-curated recommendations. 40+ outfits, 8 occasions, filtered by your unique profile and seasonal palette.",
    image: "/images/features/outfit.jpg",
    route: "/dashboard/recommendations",
    tags: ["40+ Outfits", "8 Occasions", "Seasonal"],
    cta: "Get My Picks",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Share looks, get honest feedback, rate others. Build your style reputation with real people.",
    image: "/images/features/community.jpg",
    route: "/dashboard/community",
    tags: ["Share Looks", "Feedback", "Ratings"],
    cta: "Join the Community",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<FeaturePreviewData | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], [32, -32]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.7, 0.35]);

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden bg-cosmic-surface" id="features">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <motion.div
        aria-hidden
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-aurum-400/10 blur-[160px]"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
        <Reveal x={-30} className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="section-divider" />
            <span className="section-number">01 // Features</span>
          </div>
          <KineticHeadline
            text="WHAT WE BUILD."
            className="type-display text-[var(--text-primary)]"
          />
          <p className="mt-5 text-[var(--text-secondary)] max-w-md font-body text-base leading-relaxed">
            Seven instruments, one fitting room. Every analysis runs on your
            device — measured, cut, and tailored for you.
          </p>
        </Reveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ y: gridY, willChange: "transform" }}
        >
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={index * 0.08}
              y={40}
              scale={0.97}
              amount={0.2}
              className="group h-full"
            >
              <div className="h-full transition-transform duration-500 group-hover:-translate-y-1.5">
                <SpotlightCard
                  spotlightColor="rgba(185, 139, 86, 0.18)"
                  tilt={5}
                  className="h-full card-nexus relative overflow-hidden rounded-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-aurum opacity-[0.05] rounded-bl-full" />
                  <div className="relative z-10 p-8">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
                        className="w-12 h-12 rounded-full bg-gradient-aurum flex items-center justify-center shadow-aurum group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500"
                      >
                        <feature.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="type-mono text-[0.55rem] text-[color-mix(in_srgb,var(--text-muted)_50%,transparent)] tracking-[0.25em]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="type-heading text-[var(--text-primary)] mb-3 text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPreview({
                            title: feature.title,
                            description: feature.description,
                            image: feature.image,
                            route: feature.route,
                            tags: feature.tags,
                            cta: feature.cta,
                          })
                        }
                        className="flex items-center gap-2 text-left w-full cursor-pointer group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-aurum-400/60 transition-all duration-300 group-hover:scale-150" />
                        <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest group-hover:text-[var(--accent-mocha)] transition-colors">
                          EXPLORE &rarr;
                        </span>
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </Reveal>
          ))}

          <FeaturePreviewModal data={preview} onClose={() => setPreview(null)} />
        </motion.div>
      </div>
    </section>
  );
}
