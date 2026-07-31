"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  threshold?: number;
  glow?: boolean;
}

const sizeMap = {
  sm: { size: 80, stroke: 4, fontSize: "1rem" },
  md: { size: 120, stroke: 5, fontSize: "1.5rem" },
  lg: { size: 180, stroke: 6, fontSize: "2.25rem" },
  xl: { size: 240, stroke: 8, fontSize: "3rem" },
};

function getScoreColor(score: number) {
  if (score >= 8) return { fill: "#FFCB20", label: "Excellent", hex: "#FFCB20" };
  if (score >= 6) return { fill: "#8C59FF", label: "Good", hex: "#8C59FF" };
  if (score >= 4) return { fill: "#E8B620", label: "Average", hex: "#E8B620" };
  return { fill: "#6C2BD9", label: "Needs Work", hex: "#6C2BD9" };
}

export function ScoreGauge({
  score,
  maxScore = 10,
  label = "",
  size = "lg",
  showLabel = true,
  threshold = 7,
  glow = true,
}: ScoreGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = sizeMap[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(score / maxScore, 1);
  const scoreColor = getScoreColor(score);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let frame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 2000;
      const t = Math.min(elapsed, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(eased * score);

      if (t < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, score]);

  const strokeDashoffset = circumference * (1 - (animatedScore / maxScore));

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="rgba(108, 43, 217, 0.1)"
            strokeWidth={config.stroke}
          />
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor.fill}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {glow && (
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-xl"
            style={{
              background: `radial-gradient(circle, ${scoreColor.fill}22, transparent 70%)`,
            }}
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-body font-bold text-nexus-800 dark:text-white leading-none"
            style={{ fontSize: config.fontSize }}
          >
            {animatedScore.toFixed(1)}
          </motion.span>
          <span className="type-mono text-[0.5rem] text-nexus-400/40 dark:text-cosmic-muted/40 tracking-widest mt-1">
            / {maxScore}
          </span>
        </div>

        {score >= threshold && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-aurum-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[0.5rem] text-white font-bold">✦</span>
          </motion.div>
        )}
      </div>

      {showLabel && (
        <>
          <span className="type-mono text-[0.6rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-widest uppercase">
            {label || scoreColor.label}
          </span>
          {label && (
            <span className="type-mono text-[0.5rem] text-nexus-400/30 dark:text-cosmic-muted/30 tracking-widest">
              {scoreColor.label}
            </span>
          )}
        </>
      )}
    </div>
  );
}
