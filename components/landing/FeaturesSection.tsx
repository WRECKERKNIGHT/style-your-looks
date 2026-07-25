"use client";

import { useRef } from "react";
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

const features = [
  {
    icon: ScanFace,
    number: "01",
    title: "Face Analysis",
    description:
      "478-point facial landmark detection. Symmetry, proportions, jawline, skin clarity — scored objectively with golden ratio adherence.",
    accent: "amber" as const,
    size: "large" as const,
  },
  {
    icon: Droplets,
    number: "02",
    title: "Skin Tone",
    description:
      "ITA color science with CIELAB conversion. Monk Scale, Fitzpatrick, undertone mapping. Seasonal color classification.",
    accent: "burgundy" as const,
    size: "small" as const,
  },
  {
    icon: Layers,
    number: "03",
    title: "Body Type",
    description:
      "Pose landmark detection. Shoulder, waist, hip measurements. 8 body type classifications with proportion scoring.",
    accent: "olive" as const,
    size: "small" as const,
  },
  {
    icon: Shirt,
    number: "04",
    title: "Virtual Try-On",
    description:
      "AI body detection overlays clothing on your photo. Preview before you commit to a look.",
    accent: "amber" as const,
    size: "medium" as const,
  },
  {
    icon: Scissors,
    number: "05",
    title: "Grooming Studio",
    description:
      "15 beard styles, 9 mustache types. Canvas overlays using facial landmarks. See what works before you commit.",
    accent: "burgundy" as const,
    size: "medium" as const,
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Outfit Picks",
    description:
      "AI-curated recommendations. 40+ outfits, 8 occasions, filtered by your unique profile and seasonal palette.",
    accent: "olive" as const,
    size: "small" as const,
  },
  {
    icon: Users,
    number: "07",
    title: "Community",
    description:
      "Share looks, get honest feedback, rate others. Build your style reputation with real people.",
    accent: "amber" as const,
    size: "small" as const,
  },
];

const accentMap = {
  amber: {
    border: "border-amber/20",
    text: "text-amber",
    bg: "bg-amber/[0.06]",
    dot: "#B8860B",
    glow: "shadow-[0_0_30px_rgba(184,134,11,0.08)]",
  },
  burgundy: {
    border: "border-burgundy/20",
    text: "text-burgundy",
    bg: "bg-burgundy/[0.06]",
    dot: "#722F37",
    glow: "shadow-[0_0_30px_rgba(114,47,55,0.06)]",
  },
  olive: {
    border: "border-olive/20",
    text: "text-olive",
    bg: "bg-olive/[0.06]",
    dot: "#556B2F",
    glow: "shadow-[0_0_30px_rgba(85,107,47,0.06)]",
  },
};

export function FeaturesSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={targetRef}
      className="relative bg-section-warm"
      id="features"
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-32 md:py-40">
        {/* Header — left-aligned, asymmetric */}
        <div className="mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="type-label text-amber/80">03 // Arsenal</span>
            <h2 className="mt-3 type-display text-espresso">
              WHAT WE{" "}
              <span className="text-gradient-gold italic">BUILD.</span>
            </h2>
          </motion.div>
        </div>

        {/* Asymmetric grid — not uniform */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {features.map((feature, index) => {
            const colors = accentMap[feature.accent];
            // Asymmetric sizing: large=col-span-7, medium=col-span-5, small=col-span-4/3
            let colSpan = "md:col-span-4";
            if (feature.size === "large") colSpan = "md:col-span-7";
            else if (feature.size === "medium") colSpan = "md:col-span-5";

            // Offset for visual rhythm
            const offset =
              index === 0
                ? "md:col-start-1"
                : index === 3
                ? "md:col-start-1"
                : index === 4
                ? "md:col-start-6"
                : "";

            return (
              <motion.div
                key={feature.number}
                className={`${colSpan} ${offset}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className={`relative h-full bg-cream/60 border ${colors.border} p-8 md:p-10 flex flex-col justify-between group cursor-default transition-all duration-500 hover:shadow-elegant-lg hover:-translate-y-1 ${
                    feature.size === "large" ? "min-h-[380px]" : "min-h-[300px]"
                  }`}
                >
                  {/* Large background number */}
                  <div className="absolute top-4 right-6 font-display text-[4rem] md:text-[5rem] font-bold text-espresso/[0.03] leading-none select-none group-hover:text-espresso/[0.06] transition-colors duration-700">
                    {feature.number}
                  </div>

                  {/* Top */}
                  <div className="relative z-10">
                    <div
                      className={`w-12 h-12 flex items-center justify-center border ${colors.border} ${colors.bg} mb-6`}
                    >
                      <feature.icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <h3 className="type-heading text-espresso mb-3">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Bottom */}
                  <div className="relative z-10">
                    <p className="text-sm text-coffee leading-relaxed font-body mb-6">
                      {feature.description}
                    </p>
                    <div className="h-px w-full bg-tan/20" />
                    <div className="mt-4 flex items-center gap-2.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: colors.dot }}
                      />
                      <span className="type-mono text-[0.55rem] text-coffee/50 tracking-widest group-hover:text-coffee/80 transition-colors duration-500">
                        EXPLORE &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-20">
          <div className="h-px w-full bg-tan/20 relative">
            <motion.div
              className="h-px bg-amber/60 absolute top-0 left-0"
              style={{ width: progressWidth }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
              {features.length} FEATURES
            </span>
            <span className="type-mono text-[0.5rem] text-coffee/40 tracking-widest">
              SCROLL &rarr;
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
