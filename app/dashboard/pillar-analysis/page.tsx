"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { calculatePillarAnalysis } from "@/lib/ml/pillars";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import { Target, TrendingUp, ArrowRight, Sparkles, Dumbbell, Scissors, Droplets, Shirt, Zap, ChevronDown } from "lucide-react";

const impactColors: Record<string, string> = { high: "text-[var(--accent-aurum)]", medium: "text-[var(--accent-nexus)]", low: "text-[var(--text-muted)]" };
const impactBg: Record<string, string> = { high: "bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border-[color-mix(in_srgb,var(--accent-aurum)_25%,transparent)]", medium: "bg-[color-mix(in_srgb,var(--accent-nexus)_10%,transparent)] border-[color-mix(in_srgb,var(--accent-nexus)_25%,transparent)]", low: "bg-[var(--bg-tertiary)] border-[var(--border-primary)]" };
const effortLabels: Record<string, string> = { easy: "Quick Win", moderate: "Moderate Effort", significant: "Major Change" };
const categoryIcons: Record<string, any> = { grooming: Scissors, skincare: Droplets, style: Shirt, fitness: Dumbbell, "non-surgical": Zap };

function PillarCard({ pillar, index }: { pillar: { name: string; score: number; rating: string; potential: number; description: string; metrics: { label: string; score: number }[] }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const headroom = Math.max(0, Math.round((pillar.potential - pillar.score) * 10) / 10);

  return (
    <ScrollReveal>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card overflow-hidden"
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-aurum)_25%,transparent)] flex items-center justify-center rounded-full">
                <span className="text-lg font-display font-bold text-[var(--accent-aurum)]">{index + 1}</span>
              </div>
              <div>
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                  {pillar.name.toUpperCase()}
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-body mt-0.5">{pillar.rating}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {headroom > 0 && (
                <span className="hidden sm:inline-flex type-mono text-[0.55rem] tracking-widest px-2 py-1 rounded-[var(--radius-xs)] border border-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)] text-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_8%,transparent)]">
                  +{headroom.toFixed(1)} POSSIBLE
                </span>
              )}
              <span className="text-3xl font-display font-bold text-gradient-aurum">{pillar.score}</span>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
              </motion.div>
            </div>
          </div>

          <div className="mt-4 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pillar.score * 10}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-nexus)] via-[var(--accent-aurum)] to-[var(--accent-nexus)]"
            />
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-4">
                <div className="h-px bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-nexus)_50%,transparent)] to-transparent" />
                <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">{pillar.description}</p>
                <div className="space-y-3">
                  {pillar.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-body text-[var(--text-muted)]">{m.label}</span>
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{m.score.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.score * 10}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ScrollReveal>
  );
}

export default function PillarAnalysisPage() {
  const { faceResult } = useAnalysisStore();

  useEffect(() => { document.title = "4 Pillars | ZERVEY"; }, []);

  const analysis = useMemo(() => {
    if (!faceResult) return null;
    return calculatePillarAnalysis(faceResult);
  }, [faceResult]);

  if (!faceResult || !analysis) {
    return (
      <div className="space-y-8">
        <ScrollReveal>
          <span className="section-number">EST. MMXXIV // BEAUTY FRAMEWORK</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Target className="w-7 h-7 text-[var(--accent-aurum)]" />
            <h1 className="type-display text-[var(--text-primary)] tracking-tight">
              BEAUTY <span className="text-gradient-aurum">FRAMEWORK.</span>
            </h1>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-12 text-center">
            <Target className="w-16 h-16 text-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)] mx-auto mb-4" />
            <h2 className="type-heading text-[var(--text-primary)] mb-2">NO ANALYSIS YET</h2>
            <p className="text-[var(--text-muted)] font-body mb-6">Complete a face analysis first to unlock your Beauty Framework breakdown.</p>
            <Link href="/dashboard/face-analysis" className="btn-nexus inline-flex">
              START FACE ANALYSIS <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <ScrollReveal>
        <span className="section-number">EST. MMXXIV // BEAUTY FRAMEWORK</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Target className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            BEAUTY <span className="text-gradient-aurum">FRAMEWORK.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Four pillars — Harmony, Structure, Identity, Vitality. Each one expands into the exact measurements behind your score.
        </p>
      </ScrollReveal>

      <ScrollProgress />

      <ScrollProgress />

      <ScrollReveal>
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="type-label text-[var(--text-muted)] mb-2">YOUR FACIAL ARCHETYPE</p>
              <h2 className="type-heading text-gradient-aurum tracking-tight mb-1">{analysis.identity.archetype}</h2>
              <p className="text-sm text-[var(--text-muted)] font-body italic">“{analysis.identity.archetypeTagline}”</p>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">MASCULINE</span>
                <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">{analysis.identity.spectrumLabel.toUpperCase()}</span>
                <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">FEMININE</span>
              </div>
              <div className="relative h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden border border-[var(--border-primary)]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${100 - analysis.identity.spectrum}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]"
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-[var(--text-primary)]"
                  style={{ left: `${100 - analysis.identity.spectrum}%` }}
                />
              </div>
              <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-2 text-right">
                GEOMETRY-DERIVED SPECTRUM · {analysis.identity.spectrum}/100 MASCULINE LEAN
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <div className="glass-card p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="type-label text-[var(--text-muted)]">FRAMEWORK SCORE</p>
                <p className="text-3xl font-display font-bold text-gradient-aurum">{analysis.overall}<span className="text-sm text-[var(--text-muted)] font-body">/10</span></p>
              </div>
              <div className="h-10 w-px bg-[var(--border-primary)]" />
              <div>
                <p className="type-label text-[var(--text-muted)]">6-MONTH POTENTIAL</p>
                <p className="text-xl font-display font-bold text-[var(--text-primary)]">{analysis.projection.potential}</p>
              </div>
            </div>
            <p className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)] max-w-xs">
              POTENTIAL ASSUMES HIGH-IMPACT ROADMAP ITEMS BELOW ARE COMPLETED CONSISTENTLY.
            </p>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">
              YOUR <span className="text-gradient-aurum">PILLARS.</span>
            </h2>
          </div>
          <p className="text-[var(--text-muted)] font-body mb-6">Tap any pillar to expand the detailed breakdown.</p>
        </ScrollReveal>        <div className="space-y-4">
          {analysis.pillars.map((pillar, i) => (
            <PillarCard key={pillar.name} pillar={pillar} index={i} />
          ))}
        </div>
      </div>

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">
              IMPROVEMENT <span className="text-gradient-aurum">ROADMAP.</span>
            </h2>
          </div>
          <p className="text-[var(--text-muted)] font-body mb-6">
            Prioritized by potential impact. Start with high-impact, low-effort changes for the fastest results.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger staggerChildren={0.08}>
          <div className="space-y-4">
            {analysis.improvements.map((item, i) => {
              const Icon = categoryIcons[item.category] || Sparkles;
              return (
                <ScrollRevealItem key={item.id}>
                  <div className={`p-5 border ${impactBg[item.impact]} card-nexus`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--bg-secondary)] flex items-center justify-center rounded-full border border-[var(--border-primary)] shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-aurum)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                      <h4 className="type-label text-[var(--text-primary)]">{item.title}</h4>
                      <span className={`type-label ${impactColors[item.impact]}`}>
                        {item.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed mb-2">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-4 text-xs font-mono text-[var(--text-muted)]">
                      <span>{effortLabels[item.effort]}</span>
                      <span className="text-[var(--border-primary)] hidden sm:inline">|</span>
                      <span>{item.timeframe}</span>
                      <span className="text-[var(--border-primary)] hidden sm:inline">|</span>
                      <span className="uppercase">{item.pillar}</span>
                    </div>
                  </div>
                </div>
                  </div>
                </ScrollRevealItem>
              );
            })}
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div className="glass-card p-8">
          <h3 className="type-label text-[var(--text-primary)] mb-4">EXPLORE MORE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/skin-health" className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] card-nexus">
              <Droplets className="w-5 h-5 text-[var(--accent-aurum)]" />
              <span className="text-sm font-body font-bold text-[var(--text-primary)]">SKIN HEALTH</span>
            </Link>
            <Link href="/dashboard/grooming" className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] card-nexus">
              <Scissors className="w-5 h-5 text-[var(--accent-aurum)]" />
              <span className="text-sm font-body font-bold text-[var(--text-primary)]">GROOMING</span>
            </Link>
            <Link href="/dashboard/style-dna" className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] card-nexus">
              <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
              <span className="text-sm font-body font-bold text-[var(--text-primary)]">STYLE DNA</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
