"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

interface MetricBarProps {
  label: string;
  score: number;
  maxScore?: number;
  description?: string;
  value?: string;
  spread?: number;
  className?: string;
}

export function MetricBar({
  label,
  score,
  maxScore = 10,
  description,
  value,
  spread,
  className,
}: MetricBarProps) {
  const percentage = (score / maxScore) * 100;

  let color = "#C8963E";
  if (percentage >= 80) color = "#C8963E";
  else if (percentage >= 60) color = "#B98B56";
  else if (percentage >= 40) color = "#9C7142";
  else color = "#6F4A30";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-body font-bold text-nexus-800 dark:text-white">{label}</span>
        <span className="text-lg font-body font-bold text-nexus-800 dark:text-white">
          <AnimatedCounter target={score} duration={1.2} decimals={1} className="inline-block" />
          <span className="text-nexus-400 dark:text-cosmic-muted font-body font-normal text-sm">/{maxScore}</span>
        </span>
      </div>
      <div className="relative h-6 bg-light-border dark:bg-cosmic-border overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 rounded-full shimmer"
          style={{
            backgroundColor: color,
            backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
        {percentage > 15 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white mix-blend-difference">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-nexus-400 dark:text-cosmic-muted font-body">{description}</p>
      )}
      {(value || spread !== undefined) && (
        <div className="flex items-center gap-3">
          {value && (
            <span className="inline-block px-2 py-0.5 bg-aurum-500/10 border border-aurum-500/25 text-aurum-500 text-xs font-mono rounded-sm">
              {value}
            </span>
          )}
          {spread !== undefined && spread > 0 && (
            <span className="text-xs font-mono text-nexus-400 dark:text-cosmic-muted">
              ±{spread.toFixed(2)} across photos
            </span>
          )}
        </div>
      )}
    </div>
  );
}
