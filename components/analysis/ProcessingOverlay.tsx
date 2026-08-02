"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Fingerprint,
  BarChart3,
  Palette,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

const phases = [
  { id: "detect", icon: Scan, label: "DETECTING", detail: "Initialising MediaPipe and locating your face", threshold: 15, color: "#A0764E" },
  { id: "landmarks", icon: Fingerprint, label: "LANDMARKS", detail: "Mapping 478 facial landmarks", threshold: 40, color: "#8A5F3D" },
  { id: "scoring", icon: BarChart3, label: "SCORING", detail: "Computing symmetry, ratios and harmony", threshold: 65, color: "#9C7142" },
  { id: "matching", icon: Palette, label: "MATCHING", detail: "Matching skin tone, palette and body typing", threshold: 85, color: "#CCA066" },
  { id: "finalizing", icon: Sparkles, label: "FINALIZING", detail: "Generating your style profile", threshold: 100, color: "#B98B56" },
];

export function ProcessingOverlay({
  title = "ANALYSING YOUR PHOTO",
}: {
  title?: string;
}) {
  const isAnalyzing = useAnalysisStore((s) => s.isAnalyzing);
  const progress = useAnalysisStore((s) => s.analysisProgress);

  const currentPhase = useMemo(
    () => phases.find((p) => progress < p.threshold) ?? phases[phases.length - 1],
    [progress]
  );

  const completedPhases = useMemo(
    () => phases.filter((p) => progress >= p.threshold),
    [progress]
  );

  return (
    <AnimatePresence mode="wait">
      {isAnalyzing && (
        <motion.div
          key="processing"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden glass-card rounded-xl"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[color-mix(in_srgb,var(--accent-caramel)_12%,transparent)] blur-[90px]" />
          </div>

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5"
              >
                <Loader2 className="w-5 h-5 text-[var(--accent-aurum)]" />
              </motion.div>
              <span className="type-label text-[var(--text-primary)]">{title}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--border-primary)] to-transparent" />
              <span className="type-mono text-sm font-bold text-gradient-aurum">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              <Radar visualProgress={progress} phaseColor={currentPhase.color} />

              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-4 min-h-[3.5rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPhase.id}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: `${currentPhase.color}1f`,
                          border: `1px solid ${currentPhase.color}55`,
                          boxShadow: `0 0 20px ${currentPhase.color}33`,
                        }}
                      >
                        <currentPhase.icon
                          className="w-5 h-5"
                          style={{ color: currentPhase.color }}
                        />
                      </div>
                      <div>
                        <div
                          className="type-mono text-[0.7rem] tracking-[0.25em]"
                          style={{ color: currentPhase.color }}
                        >
                          {currentPhase.label}
                        </div>
                        <div className="text-sm text-[var(--text-muted)] font-body mt-1">
                          {currentPhase.detail}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="h-[3px] bg-[var(--bg-tertiary)] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #8A5F3D, #B98B56, #CCA066)",
                      boxShadow: "0 0 12px rgba(185,139,86,0.5)",
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {phases.map((phase) => {
                    const done = progress >= phase.threshold;
                    const active = currentPhase.id === phase.id;
                    return (
                      <div
                        key={phase.id}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all duration-500 ${
                          done
                            ? "border-[color-mix(in_srgb,var(--accent-mocha)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-mocha)_8%,transparent)]"
                            : active
                            ? "border-[var(--border-primary)] bg-[color-mix(in_srgb,var(--bg-tertiary)_40%,transparent)]"
                            : "border-[var(--border-muted)] opacity-40"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            done ? "bg-[color-mix(in_srgb,var(--accent-mocha)_20%,transparent)]" : active ? "animate-pulse bg-[color-mix(in_srgb,var(--accent-caramel)_20%,transparent)]" : ""
                          }`}
                        >
                          {done ? (
                            <Check className="w-3 h-3 text-[var(--accent-mocha)]" />
                          ) : active ? (
                            <phase.icon className="w-3 h-3 text-[var(--accent-caramel)]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-muted)]" />
                          )}
                        </div>
                        <span
                          className={`type-mono text-[0.6rem] tracking-widest ${
                            done ? "text-[var(--accent-mocha)]" : active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                          }`}
                        >
                          {phase.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Radar({
  visualProgress,
  phaseColor,
}: {
  visualProgress: number;
  phaseColor: string;
}) {
  return (
    <div className="relative w-44 h-44 md:w-52 md:h-52 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${phaseColor}33` }}
      />
      <div
        className="absolute inset-5 rounded-full"
        style={{ border: `1px dashed ${phaseColor}40` }}
      />
      <div className="absolute inset-10 rounded-full border border-[color-mix(in_srgb,var(--border-muted)_40%,transparent)]" />

      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid transparent`,
          borderTopColor: phaseColor,
          borderRightColor: phaseColor,
          boxShadow: `0 0 24px ${phaseColor}40`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px solid transparent`,
          borderBottomColor: phaseColor,
          borderLeftColor: phaseColor,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 w-px h-1/2 origin-bottom"
        style={{
          background: `linear-gradient(to top, transparent, ${phaseColor})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: phaseColor, boxShadow: `0 0 16px ${phaseColor}` }}
        />
      </div>

      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="rgba(185,139,86,0.15)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={phaseColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="301.6"
          animate={{ strokeDashoffset: 301.6 - (visualProgress / 100) * 301.6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${phaseColor})` }}
        />
      </svg>
    </div>
  );
}
