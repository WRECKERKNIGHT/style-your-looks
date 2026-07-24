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

  let color = "#C89D7C";
  if (percentage >= 80) color = "#4CAF50";
  else if (percentage >= 60) color = "#C89D7C";
  else if (percentage >= 40) color = "#FF9800";
  else color = "#F44336";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-[#3C2A21]">{label}</span>
        <span className="text-sm font-bold text-[#3C2A21]">
          {score.toFixed(1)}
          <span className="text-[#8B7D6B] font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="h-2 bg-[#F4EFEA] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {description && (
        <p className="text-xs text-[#8B7D6B]">{description}</p>
      )}
    </div>
  );
}
