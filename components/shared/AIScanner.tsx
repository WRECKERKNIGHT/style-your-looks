"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scan, CheckCircle2, Loader2 } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

interface AIScannerProps {
  /** Title shown while scanning. Defaults to the store-aware copy. */
  title?: string;
  /**
   * Controlled mode: pass these to drive the scanner from local async state
   * (e.g. a try-on pipeline). When omitted the scanner reads the global
   * analysis store (isAnalyzing / analysisProgress / results).
   */
  active?: boolean;
  progress?: number;
  done?: boolean;
  compact?: boolean;
}

type Phase = "idle" | "scanning" | "processing" | "complete";

export function AIScanner({ title, active, progress, done, compact = false }: AIScannerProps) {
  const storeAnalyzing = useAnalysisStore((s) => s.isAnalyzing);
  const storeProgress = useAnalysisStore((s) => s.analysisProgress);
  const storeHasResult = useAnalysisStore(
    (s) => s.faceResult !== null || s.bodyResult !== null || s.colorAnalysis !== null
  );

  const analyzing = active ?? storeAnalyzing;
  const value = progress ?? storeProgress;
  const finished = done ?? (storeHasResult && !analyzing);

  const phase: Phase =
    analyzing && value < 60
      ? "scanning"
      : analyzing
      ? "processing"
      : finished
      ? "complete"
      : "idle";

  const scanPct = Math.min(100, Math.max(0, value));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper"
    >
      <div className={compact ? "p-5 flex flex-col items-center gap-4" : "p-8 flex flex-col items-center gap-6"}>
        {/* Scanner frame */}
        <div className={compact ? "relative w-24 h-24" : "relative w-40 h-40"}>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute top-0 left-0 w-[2px] h-8 bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute top-0 right-0 w-8 h-[2px] bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute top-0 right-0 w-[2px] h-8 bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute bottom-0 right-0 w-8 h-[2px] bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />
          <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-[var(--accent-caramel)] shadow-[0_0_8px_var(--accent-caramel)]" />

          <div className="absolute inset-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === "idle" || phase === "scanning" ? (
                <motion.div
                  key="scan-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Scan className="w-10 h-10 text-[var(--accent-caramel)] mx-auto mb-2" />
                </motion.div>
              ) : phase === "processing" ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Loader2 className="w-10 h-10 text-[var(--accent-honey)] animate-spin mx-auto mb-2" />
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-[var(--accent-honey)] mx-auto mb-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan line — sweeps only while scanning, paced by real progress */}
          {phase === "scanning" && (
            <motion.div
              className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-caramel)] to-transparent shadow-[0_0_12px_var(--accent-caramel)]"
              style={{ top: `${4 + (scanPct / 100) * 80}%` }}
            />
          )}

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(185,139,86,1) 1px, transparent 1px), linear-gradient(90deg, rgba(185,139,86,1) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
        </div>

        {/* Status text */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="type-mono text-[var(--accent-mocha)]"
              >
                READY
              </motion.span>
            )}
            {phase === "scanning" && (
              <motion.span
                key="scanning"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[var(--accent-caramel)] flex items-center justify-center gap-2"
              >
                <span>{title ?? "SCANNING"}</span>
                <motion.span
                  className="inline-flex gap-0.5"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-caramel)]" />
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-caramel)]" />
                  <span className="w-1 h-1 rounded-full bg-[var(--accent-caramel)]" />
                </motion.span>
              </motion.span>
            )}
            {phase === "processing" && (
              <motion.span
                key="processing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[var(--accent-honey)]"
              >
                PROCESSING...
              </motion.span>
            )}
            {phase === "complete" && (
              <motion.span
                key="complete"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="type-mono text-[var(--accent-honey)]"
              >
                ANALYSIS COMPLETE
              </motion.span>
            )}
          </AnimatePresence>

          {/* Progress bar — mirrors real progress from the driving pipeline */}
          <div className="mt-3 w-48 h-[2px] bg-[color-mix(in_srgb,var(--accent-caramel)_20%,transparent)] rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-caramel)]"
              style={{ width: `${phase === "complete" ? 100 : phase === "idle" ? 0 : scanPct}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Processing dots */}
        {phase === "processing" && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--accent-honey)]"
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
