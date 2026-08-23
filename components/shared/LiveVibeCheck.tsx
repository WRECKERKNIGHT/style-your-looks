"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const moods = ["CONFIDENT", "RADIANT", "BOLD", "ELEGANT", "POWERFUL"];

function buildBars(metrics: number[] | undefined, tick: number): number[] {
  const base = metrics && metrics.length > 0 ? metrics : [0.5];
  return Array.from({ length: 24 }, (_, i) => {
    const pos = (i / 23) * (base.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, base.length - 1);
    const t = pos - lo;
    const interpolated = base[lo] * (1 - t) + base[hi] * t;
    const shimmer = Math.sin(tick * 0.35 + i * 0.45) * 0.05;
    return Math.max(0.08, Math.min(1, interpolated + shimmer));
  });
}

export function LiveVibeCheck({ score, metrics }: { score?: number; metrics?: number[] }) {
  const [bars, setBars] = useState<number[]>([]);
  const tickRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const hasScore = typeof score === "number" && score > 0;
  const vibeIndex = hasScore ? Math.round(score * 10) / 10 : null;
  // Mood is derived purely from the user's measured score — no idle rotation
  // pretending something is happening before any analysis exists.
  const moodIndex = hasScore
    ? score >= 85 ? 0 : score >= 72 ? 1 : score >= 60 ? 2 : score >= 45 ? 3 : 4
    : -1;

  useEffect(() => {
    if (!hasScore) {
      setBars([]);
      return;
    }
    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      setBars(buildBars(metrics, tickRef.current));
    }, 400);

    return () => clearInterval(intervalRef.current);
  }, [metrics, hasScore]);

  const moodColors = [
    "from-[#B98B56] to-[#8A5F3D]",
    "from-[#CCA066] to-[#C8963E]",
    "from-[#A0764E] to-[#6F4A30]",
    "from-[#9C7142] to-[#7A5734]",
    "from-[#C07A5A] to-[#A13B2F]",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[var(--radius-xs)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--accent-caramel)_6%,transparent)] to-transparent pointer-events-none" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-caramel)]" />
            <span className="type-label text-[var(--accent-mocha)]">LIVE VIBE CHECK</span>
          </div>
          <div className="flex items-center gap-2">
            {hasScore && (
              <>
                <motion.span
                  className="w-2 h-2 rounded-full bg-[var(--accent-honey)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="type-mono text-[var(--accent-honey)]">LIVE</span>
              </>
            )}
            {!hasScore && (
              <span className="type-mono text-[var(--text-muted)] opacity-70">STANDBY</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-center gap-[3px] h-32 mb-6">
          {hasScore &&
            bars.map((height, i) => {
              const isCenterBar = i >= 10 && i <= 13;
              return (
                <motion.div
                  key={i}
                  className={`w-full rounded-t-sm ${
                    isCenterBar
                      ? "bg-gradient-to-t from-[#B98B56] to-[#CCA066]"
                      : "bg-gradient-to-t from-[color-mix(in_srgb,var(--accent-nexus)_55%,transparent)] to-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)]"
                  }`}
                  style={{ height: "100%" }}
                  animate={{
                    height: `${Math.max(8, height * 100)}%`,
                    opacity: isCenterBar ? 1 : 0.6 + height * 0.4,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          {!hasScore &&
            Array.from({ length: 24 }, (_, i) => (
              <div
                key={`idle-${i}`}
                className="w-full h-[8%] rounded-t-sm bg-[color-mix(in_srgb,var(--accent-nexus)_25%,transparent)] opacity-50"
              />
            ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <motion.span
            key={moodIndex >= 0 ? moods[moodIndex] : "awaiting"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`type-heading font-display font-bold bg-gradient-to-r ${
              moodIndex >= 0 ? moodColors[moodIndex] : "from-[#9C8470] to-[#6F5B4A]"
            } bg-clip-text text-transparent tracking-tight`}
          >
            {moodIndex >= 0 ? moods[moodIndex] : "AWAITING ANALYSIS"}
          </motion.span>

          <span className="type-mono text-[var(--accent-mocha)]">
            vibe index &middot; {vibeIndex !== null ? `${vibeIndex}/10` : "--/10"}
          </span>
          {!hasScore && (
            <span className="text-xs font-body text-[var(--text-muted)] opacity-70">
              Run a Face IQ scan to light this up with your real metrics
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
