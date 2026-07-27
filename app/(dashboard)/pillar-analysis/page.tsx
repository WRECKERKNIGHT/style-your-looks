"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { calculatePillarAnalysis } from "@/lib/ml/pillars";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import { Target, TrendingUp, ArrowRight, Sparkles, Dumbbell, Scissors, Droplets, Shirt, Zap, ChevronDown, CheckCircle2 } from "lucide-react";

const impactColors = { high: "text-amber", medium: "text-olive", low: "text-coffee" };
const impactBg = { high: "bg-amber/10 border-amber/25", medium: "bg-olive/10 border-olive/25", low: "bg-parchment border-tan" };
const effortLabels = { easy: "Quick Win", moderate: "Moderate Effort", significant: "Major Change" };
const categoryIcons = { grooming: Scissors, skincare: Droplets, style: Shirt, fitness: Dumbbell, "non-surgical": Zap };

function PillarCard({ pillar, index }: { pillar: { name: string; score: number; rating: string; description: string; metrics: { label: string; score: number }[] }; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ScrollReveal>
      <div className="bg-cream border border-tan rounded-sm vintage-border overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-6 text-left hover:bg-parchment/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber/10 border border-amber/25 flex items-center justify-center rounded-full">
                <span className="text-lg font-display font-bold text-amber">{index + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                  {pillar.name.toUpperCase()}
                </h3>
                <p className="text-sm text-coffee font-body mt-0.5">{pillar.rating}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-display font-bold text-gradient-gold">{pillar.score}</span>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-coffee" />
              </motion.div>
            </div>
          </div>

          {/* Score bar always visible */}
          <div className="mt-4 h-2.5 bg-parchment rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pillar.score * 10}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-amber via-amber-light to-amber"
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
                <div className="hr-ornamental" />
                <p className="text-sm text-coffee font-body leading-relaxed">{pillar.description}</p>
                <div className="space-y-3">
                  {pillar.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-body text-coffee">{m.label}</span>
                        <span className="text-xs font-mono font-bold text-espresso">{m.score.toFixed(1)}/10</span>
                      </div>
                      <div className="h-2 bg-parchment rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.score * 10}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-amber"
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
            <Target className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              4-PILLAR <span className="text-gradient-gold">ANALYSIS.</span>
            </h1>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="bg-cream p-12 border border-tan rounded-sm text-center vintage-border">
            <Target className="w-16 h-16 text-amber/30 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-espresso mb-2">NO ANALYSIS YET</h2>
            <p className="text-coffee font-body mb-6">Complete a face analysis first to unlock your 4-pillar breakdown.</p>
            <Link href="/dashboard/face-analysis" className="btn-gold inline-flex">
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
          <Target className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            4-PILLAR <span className="text-gradient-gold">ANALYSIS.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl">
          Your face scored across four structural dimensions. Inspired by clinical facial analysis methodologies.
        </p>
      </ScrollReveal>

      <ScrollProgress />

      {/* Overall Score */}
      <ScrollReveal>
        <div className="bg-cream p-10 border border-tan vintage-border rounded-sm text-center">
          <p className="text-xs font-mono text-coffee tracking-widest mb-2">OVERALL PILLAR SCORE</p>
          <div className="text-7xl font-display font-bold text-gradient-gold mb-2">{analysis.overall}</div>
          <p className="text-sm text-coffee font-body mb-8">out of 10</p>
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="bg-parchment p-4 border border-tan rounded-sm">
              <p className="text-xs font-mono text-coffee tracking-widest mb-1">CURRENT</p>
              <p className="text-2xl font-display font-bold text-espresso">{analysis.projection.current}</p>
            </div>
            <div className="bg-amber/10 p-4 border border-amber/25 rounded-sm">
              <p className="text-xs font-mono text-amber tracking-widest mb-1">POTENTIAL</p>
              <p className="text-2xl font-display font-bold text-amber">{analysis.projection.potential}</p>
            </div>
            <div className="bg-parchment p-4 border border-tan rounded-sm">
              <p className="text-xs font-mono text-coffee tracking-widest mb-1">TIMELINE</p>
              <p className="text-2xl font-display font-bold text-espresso">{analysis.projection.months}<span className="text-sm text-coffee">mo</span></p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      {/* 4 Pillars - Interactive cards */}
      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-amber" />
            <h2 className="text-2xl font-display font-bold text-espresso tracking-tight">
              YOUR <span className="text-gradient-gold">PILLARS.</span>
            </h2>
          </div>
          <p className="text-coffee font-body mb-6">Tap any pillar to expand the detailed breakdown.</p>
        </ScrollReveal>
        <div className="space-y-4">
          {analysis.pillars.map((pillar, i) => (
            <PillarCard key={pillar.name} pillar={pillar} index={i} />
          ))}
        </div>
      </div>

      <ScrollProgress />

      {/* Improvement Roadmap */}
      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-amber" />
            <h2 className="text-2xl font-display font-bold text-espresso tracking-tight">
              IMPROVEMENT <span className="text-gradient-gold">ROADMAP.</span>
            </h2>
          </div>
          <p className="text-coffee font-body mb-6">
            Prioritized by potential impact. Start with high-impact, low-effort changes for the fastest results.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger staggerChildren={0.08}>
          <div className="space-y-4">
            {analysis.improvements.map((item, i) => {
              const Icon = categoryIcons[item.category] || Sparkles;
              return (
                <ScrollRevealItem key={item.id}>
                  <div className={`p-5 border rounded-sm ${impactBg[item.impact]} vintage-border card-hover`}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-cream flex items-center justify-center rounded-full border border-tan shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-amber" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-base font-display font-bold text-espresso tracking-wider">{item.title}</h4>
                          <span className={`text-[0.6rem] font-mono tracking-widest uppercase ${impactColors[item.impact]}`}>
                            {item.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-coffee font-body leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs font-mono text-coffee">
                          <span>{effortLabels[item.effort]}</span>
                          <span className="text-tan">|</span>
                          <span>{item.timeframe}</span>
                          <span className="text-tan">|</span>
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

      {/* Quick Links */}
      <ScrollReveal>
        <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
          <h3 className="text-sm font-display font-bold text-espresso tracking-widest mb-4">EXPLORE MORE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/dashboard/skin-health" className="flex items-center gap-3 p-4 bg-parchment border border-tan rounded-sm hover:border-amber/40 transition-colors card-hover">
              <Droplets className="w-5 h-5 text-amber" />
              <span className="text-sm font-body font-bold text-espresso">SKIN HEALTH</span>
            </Link>
            <Link href="/dashboard/grooming" className="flex items-center gap-3 p-4 bg-parchment border border-tan rounded-sm hover:border-amber/40 transition-colors card-hover">
              <Scissors className="w-5 h-5 text-amber" />
              <span className="text-sm font-body font-bold text-espresso">GROOMING</span>
            </Link>
            <Link href="/dashboard/style-dna" className="flex items-center gap-3 p-4 bg-parchment border border-tan rounded-sm hover:border-amber/40 transition-colors card-hover">
              <Sparkles className="w-5 h-5 text-amber" />
              <span className="text-sm font-body font-bold text-espresso">STYLE DNA</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
