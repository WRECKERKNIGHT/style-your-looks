"use client";

import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  score: number;
  maxScore?: number;
  description?: string;
  className?: string;
}

export function MetricBar({
  label,
  score,
  maxScore = 10,
  description,
  className,
}: MetricBarProps) {
  const percentage = (score / maxScore) * 100;

  let color = "#FFCB20";
  if (percentage >= 80) color = "#FFCB20";
  else if (percentage >= 60) color = "#8C59FF";
  else if (percentage >= 40) color = "#E8B620";
  else color = "#6C2BD9";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-body font-bold text-nexus-800 dark:text-white">{label}</span>
        <span className="text-lg font-body font-bold text-nexus-800 dark:text-white">
          {score.toFixed(1)}
          <span className="text-nexus-400 dark:text-cosmic-muted font-body font-normal text-sm">/{maxScore}</span>
        </span>
      </div>
      <div className="relative h-6 bg-light-border dark:bg-cosmic-border overflow-hidden rounded-full">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full shimmer"
          style={{
            width: `${percentage}%`,
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
    </div>
  );
}
