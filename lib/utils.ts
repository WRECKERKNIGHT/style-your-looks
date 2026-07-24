import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function scoreToColor(score: number): string {
  if (score >= 8) return "#4CAF50";
  if (score >= 6) return "#C89D7C";
  if (score >= 4) return "#FF9800";
  return "#F44336";
}

export function scoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  if (score >= 6) return "Good";
  if (score >= 5) return "Average";
  if (score >= 4) return "Below Average";
  return "Needs Improvement";
}
