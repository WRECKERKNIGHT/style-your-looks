"use client";

import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "./ScoreGauge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, Crown } from "lucide-react";

function plainVerdict(score: number): string {
  if (score >= 8.5) return "Outstanding bone structure — your strongest traits carry the whole face.";
  if (score >= 7.5) return "Very strong geometry. A few styling moves push this into striking territory.";
  if (score >= 6.5) return "Solid, well-proportioned foundation. The right grooming lifts it further.";
  if (score >= 5.5) return "Balanced features with clear upside. Your action plan targets it directly.";
  return "Plenty of character to work with — your lowest sectors rise fastest with grooming.";
}

export function InstantSnapshot() {
  const { faceResult } = useAnalysisStore();
  if (!faceResult) return null;

  const top3 = [...faceResult.breakdown].sort((a, b) => b.score - a.score).slice(0, 3);
  const opportunity = [...faceResult.breakdown].sort((a, b) => a.score - b.score)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border rounded-sm card-nexus overflow-hidden"
    >
      <div className="px-6 py-3 border-b border-light-border dark:border-cosmic-border flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-aurum-500" />
        <span className="type-mono text-[0.6rem] text-aurum-500 tracking-[0.3em]">
          INSTANT SNAPSHOT
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-6 p-6 items-center">
        <div className="flex items-center gap-5">
          <ScoreGauge score={faceResult.overallScore} size="sm" label="FaceIQ" />
          <div className="space-y-2">
            <span className="block text-xs font-body font-bold text-aurum-500 tracking-wider uppercase">
              {faceResult.overallRating}
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 border border-aurum-500/30 bg-aurum-500/5 text-xs font-mono tracking-wider text-[var(--text-primary)]">
                {faceResult.facialShape.toUpperCase()} FACE
              </span>
              <span className="inline-flex items-center px-2.5 py-1 border border-[var(--border-primary)] bg-[var(--bg-base)]/40 text-xs font-mono tracking-wider text-[var(--text-muted)]">
                {faceResult.styleProfile.toUpperCase()}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border-primary)] bg-[var(--bg-base)]/40 text-xs font-mono tracking-wider text-[var(--text-muted)]"
                title={`Derived from ${faceResult.ageBasis ?? "skin texture signals"}. Confidence ${Math.round((faceResult.ageConfidence ?? 0) * 100)}%.`}
              >
                ~{faceResult.ageEstimation} YRS
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-[0.25em] block mb-2">
            THE VERDICT
          </span>
          <p className="text-sm md:text-base text-[var(--text-primary)] font-body leading-relaxed">
            {plainVerdict(faceResult.overallScore)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <span className="type-mono text-[0.55rem] text-aurum-500 tracking-[0.25em] block mb-1.5">
              TOP 3 TRAITS
            </span>
            <div className="space-y-1">
              {top3.map((m, i) => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-mono font-bold text-aurum-500 w-3">
                    {["A", "B", "C"][i]}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-body truncate flex-1">
                    {m.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {m.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {opportunity && (
            <div className="flex items-center gap-2 bg-red-500/[0.06] border border-red-500/20 px-3 py-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <div className="min-w-0">
                <span className="block text-[0.55rem] font-mono text-red-400/80 tracking-widest uppercase">
                  Biggest opportunity
                </span>
                <span className="block text-xs text-[var(--text-secondary)] font-body truncate">
                  {opportunity.label} · {opportunity.score.toFixed(1)}/10
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-5 flex items-center gap-2">
        <Crown className="w-3.5 h-3.5 text-aurum-500" />
        <AnimatedCounter
          target={faceResult.beautyIndex}
          duration={1.4}
          decimals={1}
          className="text-sm font-bold text-gradient-aurum"
        />
        <span className="text-xs text-[var(--text-muted)] font-mono">BEAUTY INDEX · TOP {faceResult.percentile.bracket.toUpperCase()}</span>
      </div>
    </motion.div>
  );
}
