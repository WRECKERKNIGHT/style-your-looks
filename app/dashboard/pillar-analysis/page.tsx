"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { calculatePillarAnalysis } from "@/lib/ml/pillars";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import { Target, TrendingUp, ArrowRight, Sparkles, Dumbbell, Scissors, Droplets, Shirt, Zap, ChevronDown, CheckCircle2 } from "lucide-react";

const impactColors: Record<string, string> = { high: "text-[var(--accent-aurum)]", medium: "text-[var(--accent-nexus)]", low: "text-[var(--text-muted)]" };
const impactBg: Record<string, string> = { high: "bg-[var(--accent-aurum)]/10 border-[var(--accent-aurum)]/25", medium: "bg-[var(--accent-nexus)]/10 border-[var(--accent-nexus)]/25", low: "bg-[var(--bg-tertiary)] border-[var(--border-primary)]" };
const effortLabels: Record<string, string> = { easy: "Quick Win", moderate: "Moderate Effort", significant: "Major Change" };
const categoryIcons: Record<string, any> = { grooming: Scissors, skincare: Droplets, style: Shirt, fitness: Dumbbell, "non-surgical": Zap };

function PillarCard({ pillar, index }: { pillar: { name: string; score: number; rating: string; description: string; metrics: { label: string; score: number }[] }; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ScrollReveal>
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-6 text-left transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent-aurum)]/10 border border-[var(--accent-aurum)]/25 flex items-center justify-center rounded-full">
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
                <div className="h-px bg-gradient-to-r from-[var(--accent-nexus)]/50 to-transparent" />
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
      </div>
    </ScrollReveal>
  );
}

export default function PillarAnalysisPage() {
  const { faceResult } = useAnalysisStore();

  const analysis = useMemo(() => {
    if (!faceResult) return null;
    return calculatePillarAnalysis(faceResult);
  }, [faceResult]);

  if (!faceResult || !analysis) {
    return (
      <div className="space-y-8">
        <ScrollReveal>
          <span className="section-number">EST. MMXXIV // PILLARS</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Target className="w-7 h-7 text-[var(--accent-aurum)]" />
            <h1 className="type-display text-[var(--text-primary)] tracking-tight">
              4-PILLAR <span className="text-gradient-aurum">ANALYSIS.</span>
            </h1>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-12 text-center">
            <Target className="w-16 h-16 text-[var(--accent-aurum)]/30 mx-auto mb-4" />
            <h2 className="type-heading text-[var(--text-primary)] mb-2">NO ANALYSIS YET</h2>
            <p className="text-[var(--text-muted)] font-body mb-6">Complete a face analysis first to unlock your 4-pillar breakdown.</p>
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
        <span className="section-number">EST. MMXXIV // PILLARS</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Target className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            4-PILLAR <span className="text-gradient-aurum">ANALYSIS.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Your face scored across four structural dimensions. Inspired by clinical facial analysis methodologies.
        </p>
      </ScrollReveal>

      <ScrollProgress />

      <ScrollReveal>
        <div className="glass-card p-10 text-center">
          <p className="type-label text-[var(--text-muted)] mb-2">OVERALL PILLAR SCORE</p>
          <div className="type-massive text-gradient-aurum mb-2">{analysis.overall}</div>
          <p className="text-sm text-[var(--text-muted)] font-body mb-8">out of 10</p>
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="bg-[var(--bg-tertiary)] p-4 border border-[var(--border-primary)]">
              <p className="type-label text-[var(--text-muted)] mb-1">CURRENT</p>
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{analysis.projection.current}</p>
            </div>
            <div className="bg-[var(--accent-aurum)]/10 p-4 border border-[var(--accent-aurum)]/25">
              <p className="type-label text-[var(--accent-aurum)] mb-1">POTENTIAL</p>
              <p className="text-2xl font-display font-bold text-[var(--accent-aurum)]">{analysis.projection.potential}</p>
            </div>
            <div className="bg-[var(--bg-tertiary)] p-4 border border-[var(--border-primary)]">
              <p className="type-label text-[var(--text-muted)] mb-1">TIMELINE</p>
              <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{analysis.projection.months}<span className="text-sm text-[var(--text-muted)]">mo</span></p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">
              YOUR <span className="text-gradient-aurum">PILLARS.</span>
            </h2>
          </div>
          <p className="text-[var(--text-muted)] font-body mb-6">Tap any pillar to expand the detailed breakdown.</p>
        </ScrollReveal>
        <div className="space-y-4">
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
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[var(--bg-secondary)] flex items-center justify-center rounded-full border border-[var(--border-primary)] shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-[var(--accent-aurum)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="type-label text-[var(--text-primary)]">{item.title}</h4>
                          <span className={`type-label ${impactColors[item.impact]}`}>
                            {item.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                          <span>{effortLabels[item.effort]}</span>
                          <span className="text-[var(--border-primary)]">|</span>
                          <span>{item.timeframe}</span>
                          <span className="text-[var(--border-primary)]">|</span>
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
