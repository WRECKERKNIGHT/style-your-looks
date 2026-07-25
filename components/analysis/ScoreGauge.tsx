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
  sm: { width: 120, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-sm" },
  md: { width: 180, strokeWidth: 10, fontSize: "text-4xl", labelSize: "text-base" },
  lg: { width: 240, strokeWidth: 12, fontSize: "text-5xl", labelSize: "text-lg" },
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
    const radius = (width - strokeWidth * 2 - 12) / 2;

    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const totalAngle = endAngle - startAngle;

    let currentAngle = startAngle;
    const scoreAngle = startAngle + (score / maxScore) * totalAngle;
    const duration = 1200;
    const startTime = performance.now();

    const scorePercent = score / maxScore;
    let fillColor = "#B8860B";
    if (scorePercent >= 0.8) fillColor = "#B8860B";
    else if (scorePercent >= 0.6) fillColor = "#556B2F";
    else if (scorePercent >= 0.4) fillColor = "#722F37";
    else fillColor = "#2C1810";

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      currentAngle = startAngle + (scoreAngle - startAngle) * eased;

      ctx.clearRect(0, 0, width, width);

      // Track arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = "#E8E0D8";
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Decorative ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + strokeWidth / 2 + 6, startAngle, endAngle);
      ctx.strokeStyle = "#C4A882";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Fill arc
      if (progress > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, maxScore, width, strokeWidth]);

  const scorePercent = score / maxScore;
  const glowClass = scorePercent >= 0.8 ? "shadow-gold-lg" : "";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn("relative rounded-full", glowClass)}
        style={{ width, height: width }}
      >
        <canvas
          ref={canvasRef}
          style={{ width, height: width }}
          className="rotate-0"
        />
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-display font-bold text-espresso", fontSize)}>
              {score.toFixed(1)}
            </span>
            <span className={cn("text-coffee font-body", labelSize)}>/ {maxScore}</span>
          </div>
        )}
      </div>
      {label && (
        <p className={cn("mt-3 font-body font-semibold text-espresso text-center", labelSize)}>
          {label}
        </p>
      )}
    </div>
  );
}
