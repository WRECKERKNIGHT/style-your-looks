"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Activity } from "lucide-react";

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
  const [currentMoodIndex, setCurrentMoodIndex] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const tickRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const hasScore = typeof score === "number" && score > 0;
  const vibeIndex = hasScore ? Math.round(score * 10) / 10 : null;
  const moodIndex = hasScore
    ? score >= 85 ? 0 : score >= 72 ? 1 : score >= 60 ? 2 : score >= 45 ? 3 : 4
    : currentMoodIndex;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tickRef.current += 1;
      setBars(buildBars(metrics, tickRef.current));
    }, 400);

    return () => clearInterval(intervalRef.current);
  }, [metrics]);

  useEffect(() => {
    const moodInterval = setInterval(() => {
      setCurrentMoodIndex((prev) => (prev + 1) % moods.length);
    }, 2400);

    return () => clearInterval(moodInterval);
  }, []);

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
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--accent-caramel)_6%,transparent)] to-transparent pointer-events-none" />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-caramel)]" />
            <span className="type-label text-[var(--accent-mocha)]">LIVE VIBE CHECK</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              className="w-2 h-2 rounded-full bg-[var(--accent-honey)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="type-mono text-[var(--accent-honey)]">LIVE</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-[3px] h-32 mb-6">
          {bars.map((height, i) => {
            const isCenterBar = i >= 10 && i <= 13;
            return (
              <motion.div
                key={`${currentMoodIndex}-${i}`}
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
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[color-mix(in_srgb,var(--accent-nexus)_20%,transparent)] to-[color-mix(in_srgb,var(--accent-honey)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] flex items-center justify-center">
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B98B56] to-[#CCA066] flex items-center justify-center"
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 20px rgba(185, 139, 86, 0.3)",
                    "0 0 40px rgba(200, 150, 62, 0.4)",
                    "0 0 20px rgba(185, 139, 86, 0.3)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Music className="w-6 h-6 text-[#241812]" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <span className="block w-full h-full rounded-full bg-[var(--accent-honey)] shadow-[0_0_12px_var(--accent-honey)]" />
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.span
              key={hasScore ? `real-${moodIndex}` : "awaiting"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className={`type-heading font-display font-bold bg-gradient-to-r ${moodColors[moodIndex]} bg-clip-text text-transparent tracking-tight`}
            >
              {hasScore ? moods[moodIndex] : "AWAITING ANALYSIS"}
            </motion.span>
          </AnimatePresence>

          <span className="type-mono text-[var(--accent-mocha)]">
            vibe index &middot; {vibeIndex !== null ? `${vibeIndex}/10` : "--/10"}
          </span>
        </div>

        <div className="flex gap-1.5 justify-center mt-5">
          {moods.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentMoodIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentMoodIndex
                  ? "w-5 bg-[var(--accent-caramel)]"
                  : "w-1.5 bg-[color-mix(in_srgb,var(--accent-caramel)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent-caramel)_50%,transparent)]"
              }`}
              aria-label={`Switch to ${moods[i]} mood`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
