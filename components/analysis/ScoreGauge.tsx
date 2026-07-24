"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 80, strokeWidth: 6, fontSize: "text-lg", labelSize: "text-xs" },
  md: { width: 120, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-sm" },
  lg: { width: 160, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-base" },
};

export function ScoreGauge({
  score,
  maxScore = 10,
  size = "md",
  label,
  showValue = true,
  className,
}: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, strokeWidth, fontSize, labelSize } = sizeMap[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = width * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = width / 2;
    const radius = (width - strokeWidth * 2) / 2;

    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const totalAngle = endAngle - startAngle;
    const scoreAngle = startAngle + (score / maxScore) * totalAngle;

    ctx.clearRect(0, 0, width, width);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = "#F4EFEA";
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    const scorePercent = score / maxScore;
    let color = "#C89D7C";
    if (scorePercent >= 0.8) color = "#4CAF50";
    else if (scorePercent >= 0.6) color = "#C89D7C";
    else if (scorePercent >= 0.4) color = "#FF9800";
    else color = "#F44336";

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [score, maxScore, width, strokeWidth]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width, height: width }}>
        <canvas
          ref={canvasRef}
          style={{ width, height: width }}
          className="rotate-0"
        />
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-bold text-[#3C2A21]", fontSize)}>
              {score.toFixed(1)}
            </span>
            <span className={cn("text-[#8B7D6B]", labelSize)}>/ {maxScore}</span>
          </div>
        )}
      </div>
      {label && (
        <p className={cn("mt-2 font-medium text-[#3C2A21] text-center", labelSize)}>
          {label}
        </p>
      )}
    </div>
  );
}
