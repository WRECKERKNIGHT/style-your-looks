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

  let color = "#B8860B";
  if (percentage >= 80) color = "#B8860B";
  else if (percentage >= 60) color = "#556B2F";
  else if (percentage >= 40) color = "#722F37";
  else color = "#2C1810";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-body font-bold text-espresso">{label}</span>
        <span className="text-lg font-display font-bold text-espresso">
          {score.toFixed(1)}
          <span className="text-coffee font-body font-normal text-sm">/{maxScore}</span>
        </span>
      </div>
      <div className="relative h-6 bg-[#E8E0D8] overflow-hidden rounded-full">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        {percentage > 15 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cream mix-blend-difference">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-coffee font-body">{description}</p>
      )}
    </div>
  );
}
