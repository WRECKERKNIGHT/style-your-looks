"use client";

import { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Calendar, Shield, ScanFace, ArrowRight, History } from "lucide-react";
import { getHistory, type AnalysisEntry } from "@/lib/history";

function scoreColor(score: number): string {
  if (score >= 8.5) return "#CCA066";
  if (score >= 7.5) return "#B98B56";
  if (score >= 6.5) return "#A0764E";
  if (score >= 5.5) return "#8A5F3D";
  return "#6F4A30";
}

function TimelineNode({
  entry,
  index,
  isLast,
  delta,
  isHovered,
  onHover,
}: {
  entry: AnalysisEntry;
  index: number;
  isLast: boolean;
  delta: number | null;
  isHovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const score = entry.faceResult?.overallScore ?? 0;
  const color = scoreColor(score);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-6 group"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 cursor-pointer"
          style={{ borderColor: color }}
          animate={
            isHovered
              ? { scale: 1.15, boxShadow: `0 0 24px ${color}40` }
              : { scale: 1, boxShadow: "0 0 0px transparent" }
          }
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: color }} />
          <Shield className="w-4 h-4" style={{ color }} />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}40`, `0 0 0px ${color}00`] }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          />
        </motion.div>

        {!isLast && (
          <div className="w-[2px] flex-1 my-1 relative overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, ${color}, transparent)`, transformOrigin: "top" }}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.12 + 0.3 }}
            />
          </div>
        )}
      </div>

      <motion.div
        className="flex-1 pb-8"
        animate={isHovered ? { x: 4 } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <span className="type-mono" style={{ color }}>
            {entry.date}
          </span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
          <motion.span
            className="type-mono font-bold"
            style={{ color }}
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          >
            {score.toFixed(1)}
          </motion.span>
        </div>
        <h3 className="type-label text-[var(--text-primary)] mb-1">{entry.label}</h3>
        {delta !== null && (
          <p className={`text-xs font-mono mb-1 ${delta > 0 ? "text-[var(--accent-honey)]" : delta < 0 ? "text-red-400" : "text-[var(--text-muted)]"}`}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta).toFixed(1)} vs previous
          </p>
        )}
        <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
          {entry.faceResult?.detailedAnalysis || `${entry.faceResult?.overallRating} — ${entry.faceResult?.facialShape} face shape.`}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function StyleTimeline() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [entries, setEntries] = useState<AnalysisEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-40px" });

  useEffect(() => {
    setEntries(
      getHistory()
        .filter((e) => e.faceResult)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-5)
    );
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper p-6"
    >
      <div className="flex items-center gap-2 mb-8">
        <Calendar className="w-4 h-4 text-[var(--accent-caramel)]" />
        <span className="type-label text-[var(--accent-mocha)]">STYLE EVOLUTION TIMELINE</span>
        <span className="type-mono text-[var(--accent-mocha)] ml-auto">
          {entries.length > 0 ? `${entries.length} saved analys${entries.length === 1 ? "is" : "es"}` : ""}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-12 h-12 rounded-sm border border-[var(--border-primary)] bg-[color-mix(in_srgb,var(--accent-caramel)_6%,transparent)] flex items-center justify-center mb-4">
            <History className="w-5 h-5 text-[var(--accent-caramel)]" />
          </div>
          <h3 className="type-label text-[var(--text-primary)] mb-2">NO SAVED ANALYSES YET</h3>
          <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed max-w-md">
            Your real progress will appear here as you run Face IQ scans and save them to history.
          </p>
          <Link
            href="/dashboard/face-analysis"
            className="mt-5 inline-flex items-center gap-2 btn-nexus !py-2.5 !px-5 text-xs"
          >
            <ScanFace className="w-4 h-4" />
            RUN YOUR FIRST SCAN
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry, i) => {
            const prev = entries[i - 1]?.faceResult?.overallScore;
            const curr = entry.faceResult?.overallScore;
            return (
              <TimelineNode
                key={entry.id}
                entry={entry}
                index={i}
                isLast={i === entries.length - 1}
                delta={prev != null && curr != null ? curr - prev : null}
                isHovered={hoveredIndex === i}
                onHover={(v) => setHoveredIndex(v ? i : null)}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
