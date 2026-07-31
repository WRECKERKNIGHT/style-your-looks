"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Shield, Sparkles, Palette, Shirt, TrendingUp } from "lucide-react";

const milestones = [
  {
    date: "2024 Q1",
    title: "Style Foundation",
    description: "Baseline facial analysis completed. Symmetry score: 72.4. Primary palette identified.",
    icon: Shield,
    color: "#6C2BD9",
    score: 72,
  },
  {
    date: "2024 Q2",
    title: "Color Profile",
    description: "Seasonal analysis: Deep Autumn. 12-tone palette locked. Contrast rating: high.",
    icon: Palette,
    color: "#8C59FF",
    score: 78,
  },
  {
    date: "2024 Q3",
    title: "Grooming Evolution",
    description: "Beard style optimized. Jawline framing improved angularity by 15%.",
    icon: Sparkles,
    color: "#FFCB20",
    score: 84,
  },
  {
    date: "2024 Q4",
    title: "Wardrobe Sync",
    description: "Capsule wardrobe aligned with color season. 94% palette coherence achieved.",
    icon: Shirt,
    color: "#E8B620",
    score: 89,
  },
  {
    date: "2025 Q1",
    title: "Peak Convergence",
    description: "All pillars aligned: harmony, angularity, dimorphism, health at optimal ratios.",
    icon: TrendingUp,
    color: "#00E676",
    score: 94,
  },
];

function TimelineNode({
  milestone,
  index,
  isLast,
  isHovered,
  onHover,
}: {
  milestone: typeof milestones[0];
  index: number;
  isLast: boolean;
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-6 group"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 cursor-pointer"
          style={{ borderColor: milestone.color }}
          animate={
            isHovered
              ? {
                  scale: 1.15,
                  boxShadow: `0 0 24px ${milestone.color}40`,
                }
              : { scale: 1, boxShadow: "0 0 0px transparent" }
          }
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundColor: milestone.color }}
          />
          <milestone.icon className="w-4 h-4" style={{ color: milestone.color }} />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 0px ${milestone.color}00`,
                `0 0 16px ${milestone.color}40`,
                `0 0 0px ${milestone.color}00`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          />
        </motion.div>

        {!isLast && (
          <div className="w-[2px] flex-1 my-1 relative overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${milestone.color}, transparent)`,
                transformOrigin: "top",
              }}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
            />
            <motion.div
              className="absolute inset-0"
              style={{ width: 2, background: `repeating-linear-gradient(to bottom, ${milestone.color}60 0px, ${milestone.color}60 4px, transparent 4px, transparent 8px)` }}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
            />
          </div>
        )}
      </div>

      <motion.div
        className="flex-1 pb-8"
        animate={isHovered ? { x: 4 } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="type-mono" style={{ color: milestone.color }}>
            {milestone.date}
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${milestone.color}40, transparent)` }} />
          <motion.span
            className="type-mono font-bold"
            style={{ color: milestone.color }}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          >
            {milestone.score}
          </motion.span>
        </div>
        <h3 className="type-label text-[#E8E0FF] dark:text-[#C4B5FD] mb-1">{milestone.title}</h3>
        <p className="text-xs text-[#7C6BC4] dark:text-[#5B4BA4] font-body leading-relaxed">
          {milestone.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function StyleTimeline() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[#0F0A2E]/40 dark:bg-[#0A0618]/60 border border-[#6C2BD9]/20 p-6"
    >
      <div className="flex items-center gap-2 mb-8">
        <Calendar className="w-4 h-4 text-[#8C59FF]" />
        <span className="type-label text-[#8C59FF]">STYLE EVOLUTION TIMELINE</span>
        <span className="type-mono text-[#6C2BD9] ml-auto">5 milestones</span>
      </div>

      <div className="space-y-1">
        {milestones.map((milestone, i) => (
          <TimelineNode
            key={milestone.date}
            milestone={milestone}
            index={i}
            isLast={i === milestones.length - 1}
            isHovered={hoveredIndex === i}
            onHover={(v) => setHoveredIndex(v ? i : null)}
          />
        ))}
      </div>
    </motion.div>
  );
}
