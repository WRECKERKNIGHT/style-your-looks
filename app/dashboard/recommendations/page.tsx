"use client";

import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Shirt, ArrowRight, Palette } from "lucide-react";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.06 } },
};

export default function RecommendationsPage() {
  const { faceResult, bodyResult, colorAnalysis, outfitRecommendations } = useAnalysisStore();

  const pillarResult = faceResult || bodyResult || colorAnalysis
    ? {
        face: faceResult?.overallRating || "N/A",
        body: bodyResult?.bodyType || (bodyResult ? "Complete" : "N/A"),
        color: colorAnalysis?.seasonalType || "N/A",
        overall: faceResult ? faceResult.overallScore.toFixed(0) : "N/A",
      }
    : null;

  const unlocked = pillarResult && outfitRecommendations.length > 0;

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // RECOMMENDATIONS</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Sparkles className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            CURATED <span className="text-gradient-aurum">RECOMMENDATIONS.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Data-driven suggestions based on your full analysis profile.
        </p>
      </motion.div>
      </ScrollParallax>

      <ScrollBlur blur={0} minOpacity={0.95}>
      {!unlocked ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[var(--accent-aurum)] mx-auto" />
          <p className="text-[var(--text-muted)] type-body">
            {pillarResult
              ? "Run a Body + Tone analysis first — outfit picks are generated from your real measurements and undertone."
              : "Complete your pillar analysis first to unlock personalized recommendations."}
          </p>
          <Link href="/dashboard/body-analysis" className="btn-nexus inline-flex items-center gap-2">
            {pillarResult ? "RUN BODY ANALYSIS" : "TAKE PILLAR ANALYSIS"} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="type-label text-[var(--text-primary)]">
                OUTFIT PICKS <span className="text-[var(--text-muted)]">({outfitRecommendations.length})</span>
              </h3>
              <span className="type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-widest bg-aurum-400/15 px-2.5 py-1 rounded">
                GENERATED FROM YOUR ANALYSIS
              </span>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              {outfitRecommendations.map((rec, i) => (
                <motion.div key={rec.id} variants={fadeUp}
                  className="p-4 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus group hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="type-mono text-[var(--accent-aurum)] text-xs">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="type-body text-[var(--text-primary)]">{rec.name}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{rec.description}</p>
                        {rec.keyPieces.length > 0 && (
                          <p className="text-xs text-[var(--text-muted)] mt-2">
                            <span className="type-mono text-[0.55rem] tracking-widest text-[var(--accent-mocha)]">KEY PIECES: </span>
                            {rec.keyPieces.join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-[var(--text-muted)] mt-2 italic">{rec.reasoning}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">{rec.occasion.toUpperCase()}</span>
                      <div className="flex items-center gap-1.5">
                        {rec.colors.slice(0, 5).map((c) => (
                          <span key={c} className="w-5 h-5 rounded-full border border-[var(--border-primary)]" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-aurum)] transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-3">ANALYSIS SUMMARY</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "FACE", value: pillarResult.face || "N/A" },
                { label: "BODY", value: pillarResult.body || "N/A" },
                { label: "COLOR", value: pillarResult.color || "N/A" },
                { label: "OVERALL", value: pillarResult.overall || "N/A" },
              ].map(p => (
                <div key={p.label} className="text-center p-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] card-nexus">
                  <p className="type-mono text-[var(--text-muted)]">{p.label}</p>
                  <p className="type-display text-[var(--accent-aurum)] text-lg">{p.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-4">
            <Link href="/dashboard/mannequin" className="btn-nexus flex-1 justify-center">
              <Shirt className="w-4 h-4" /> TRY ON MANNEQUIN
            </Link>
            <Link href="/dashboard/color-analysis" className="btn-nexus flex-1 justify-center">
              <Palette className="w-4 h-4" /> VIEW YOUR PALETTE <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
      </ScrollBlur>
    </div>
  );
}
