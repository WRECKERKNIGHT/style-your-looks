"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { calculatePillarAnalysis } from "@/lib/ml/pillars";
import { motion } from "framer-motion";
import { Target, TrendingUp, ArrowRight, Sparkles, Dumbbell, Scissors, Droplets, Shirt, Zap } from "lucide-react";

const impactColors = { high: "text-amber", medium: "text-olive", low: "text-coffee" };
const impactBg = { high: "bg-amber/10 border-amber/25", medium: "bg-olive/10 border-olive/25", low: "bg-parchment border-tan" };
const effortLabels = { easy: "Quick Win", moderate: "Moderate Effort", significant: "Major Change" };
const categoryIcons = { grooming: Scissors, skincare: Droplets, style: Shirt, fitness: Dumbbell, "non-surgical": Zap };

export default function PillarAnalysisPage() {
  const { faceResult } = useAnalysisStore();

  const analysis = useMemo(() => {
    if (!faceResult) return null;
    return calculatePillarAnalysis(faceResult);
  }, [faceResult]);

  if (!faceResult || !analysis) {
    return (
      <div className="space-y-8">
        <div>
          <span className="section-number">EST. MMXXIV // PILLARS</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Target className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              4-PILLAR <span className="text-gradient-gold">ANALYSIS.</span>
            </h1>
          </div>
        </div>
        <div className="bg-cream p-12 border border-tan rounded-sm text-center vintage-border">
          <Target className="w-16 h-16 text-amber/30 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-espresso mb-2">NO ANALYSIS YET</h2>
          <p className="text-coffee font-body mb-6">Complete a face analysis first to unlock your 4-pillar breakdown.</p>
          <Link href="/dashboard/face-analysis" className="btn-gold inline-flex">
            START FACE ANALYSIS <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
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
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream p-8 border border-tan vintage-border rounded-sm text-center"
      >
        <p className="text-xs font-mono text-coffee tracking-widest mb-2">OVERALL PILLAR SCORE</p>
        <div className="text-6xl font-display font-bold text-gradient-gold mb-2">{analysis.overall}</div>
        <p className="text-sm text-coffee font-body">out of 10</p>
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-xs font-mono text-coffee tracking-widest">CURRENT</p>
            <p className="text-lg font-display font-bold text-espresso">{analysis.projection.current}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono text-coffee tracking-widest">POTENTIAL</p>
            <p className="text-lg font-display font-bold text-amber">{analysis.projection.potential}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-mono text-coffee tracking-widest">TIMELINE</p>
            <p className="text-lg font-display font-bold text-espresso">{analysis.projection.months}mo</p>
          </div>
        </div>
      </motion.div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.pillars.map((pillar, i) => (
          <motion.div
            key={pillar.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-cream p-6 border border-tan rounded-sm vintage-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                PILLAR {i + 1}: {pillar.name.toUpperCase()}
              </h3>
              <span className="text-2xl font-display font-bold text-gradient-gold">{pillar.score}</span>
            </div>
            <p className="text-sm text-coffee font-body mb-4">{pillar.description}</p>

            <div className="space-y-3">
              {pillar.metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-body text-coffee">{m.label}</span>
                    <span className="text-xs font-mono text-espresso">{m.score.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-parchment rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.score * 10}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #B8860B, ${m.score >= 7 ? "#DAA520" : m.score >= 5 ? "#C4A882" : "#C08E62"})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-tan">
              <span className="text-xs font-mono text-coffee tracking-widest">RATING: </span>
              <span className="text-xs font-body font-bold text-espresso">{pillar.rating}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Improvement Roadmap */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-amber" />
          <h2 className="text-2xl font-display font-bold text-espresso tracking-tight">
            IMPROVEMENT <span className="text-gradient-gold">ROADMAP.</span>
          </h2>
        </div>
        <p className="text-coffee font-body mb-6">
          Prioritized by potential impact. Start with high-impact, low-effort changes for the fastest results.
        </p>

        <div className="space-y-4">
          {analysis.improvements.map((item, i) => {
            const Icon = categoryIcons[item.category] || Sparkles;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`p-5 border rounded-sm ${impactBg[item.impact]} vintage-border`}
              >
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
