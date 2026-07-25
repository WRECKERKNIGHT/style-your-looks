"use client";

import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "./ScoreGauge";
import { MetricBar } from "./MetricBar";
import { SCORE_METRICS } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  Sparkles,
  Scissors,
  Heart,
  ScanFace,
  Crown,
  TrendingUp,
  AlertTriangle,
  Palette,
  Target,
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AnalysisResults() {
  const { faceResult } = useAnalysisStore();

  if (!faceResult) return null;

  const metrics = SCORE_METRICS.face;
  const topMetrics = [...metrics].sort((a, b) => b.weight - a.weight);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* ═══════════════ OVERALL SCORE + RATING ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <ScoreGauge score={faceResult.overallScore} size="lg" label="Overall FaceIQ" />
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-3">
              <ScanFace className="w-6 h-6 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">FACIAL ANALYSIS</h3>
            </div>

            <div className="bg-parchment p-5 border border-tan rounded-sm">
              <span className="text-amber font-display font-bold text-sm tracking-widest uppercase">
                {faceResult.overallRating}
              </span>
              <p className="text-espresso font-body text-base mt-1 leading-relaxed">
                {faceResult.detailedAnalysis}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-parchment p-4 border border-tan rounded-sm">
                <span className="text-coffee text-xs font-body tracking-wider uppercase">Face Shape</span>
                <p className="font-body font-bold text-espresso text-lg mt-1">{faceResult.facialShape}</p>
              </div>
              <div className="bg-parchment p-4 border border-tan rounded-sm">
                <span className="text-coffee text-xs font-body tracking-wider uppercase">Style Profile</span>
                <p className="font-body font-bold text-espresso text-lg mt-1">{faceResult.styleProfile}</p>
              </div>
              <div className="bg-parchment p-4 border border-tan rounded-sm">
                <span className="text-coffee text-xs font-body tracking-wider uppercase">Skin Tone</span>
                <p className="font-body font-bold text-espresso text-lg mt-1">{faceResult.skinTone}</p>
              </div>
              <div className="bg-parchment p-4 border border-tan rounded-sm">
                <span className="text-coffee text-xs font-body tracking-wider uppercase">Undertone</span>
                <p className="font-body font-bold text-espresso text-lg mt-1">{faceResult.undertone}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════ FACIAL HARMONY INDEX ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">FACIAL HARMONY INDEX</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-8 leading-relaxed">
          Your composite harmony score combining golden ratio adherence, lip proportion, nose profile,
          forehead balance, and cheekbone definition. This measures how well your features work together as a unified whole.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={faceResult.facialHarmony} size="md" label="Harmony Score" />
          <div className="grid grid-cols-1 gap-4 flex-1 w-full">
            <div className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body text-espresso">Golden Ratio Adherence</span>
              <span className="font-display font-bold text-amber">{faceResult.goldenRatio.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body text-espresso">Lip Proportion</span>
              <span className="font-display font-bold text-amber">{faceResult.lipFullness.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body text-espresso">Nose Profile</span>
              <span className="font-display font-bold text-amber">{faceResult.noseProfile.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body text-espresso">Forehead Balance</span>
              <span className="font-display font-bold text-amber">{faceResult.foreheadBalance.toFixed(1)}/10</span>
            </div>
            <div className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body text-espresso">Cheekbone Definition</span>
              <span className="font-display font-bold text-amber">{faceResult.cheekboneDefinition.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════ DETAILED METRICS ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">DETAILED METRICS</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-8">
          Each metric is computed from MediaPipe 478-landmark facial geometry. Weights reflect research-backed impact on perceived attractiveness.
        </p>
        <div className="space-y-8">
          {topMetrics.map((metric) => {
            const scoreMap: Record<string, number> = {
              symmetry: faceResult.symmetry,
              goldenRatio: faceResult.goldenRatio,
              jawline: faceResult.jawline,
              proportions: faceResult.proportions,
              skinClarity: faceResult.skinClarity,
              eyeSpacing: faceResult.eyeSpacing,
              cheekboneDefinition: faceResult.cheekboneDefinition,
              lipFullness: faceResult.lipFullness,
              noseProfile: faceResult.noseProfile,
            };
            return (
              <MetricBar
                key={metric.key}
                label={metric.label}
                score={scoreMap[metric.key] || 0}
                description={metric.description}
              />
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════ SCORE GAUGES ROW ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">CORE SCORES</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <ScoreGauge score={faceResult.symmetry} size="sm" label="Symmetry" />
          <ScoreGauge score={faceResult.goldenRatio} size="sm" label="Golden Ratio" />
          <ScoreGauge score={faceResult.jawline} size="sm" label="Jawline" />
          <ScoreGauge score={faceResult.proportions} size="sm" label="Proportions" />
          <ScoreGauge score={faceResult.skinClarity} size="sm" label="Skin" />
          <ScoreGauge score={faceResult.facialHarmony} size="sm" label="Harmony" />
        </div>
      </motion.div>

      {/* ═══════════════ STRENGTHS ═══════════════ */}
      {faceResult.strengths.length > 0 && (
        <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-5 h-5 text-amber" />
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider">YOUR STRENGTHS</h3>
          </div>
          <div className="space-y-4">
            {faceResult.strengths.map((strength, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-parchment p-5 border border-amber/20 rounded-sm"
              >
                <div className="w-8 h-8 bg-amber/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-amber/30">
                  <TrendingUp className="w-4 h-4 text-amber" />
                </div>
                <p className="text-base text-espresso font-body leading-relaxed">{strength}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════════════ AREAS FOR IMPROVEMENT ═══════════════ */}
      {faceResult.improvements.length > 0 && (
        <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-5 h-5 text-amber" />
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider">AREAS FOR IMPROVEMENT</h3>
          </div>
          <div className="space-y-4">
            {faceResult.improvements.map((improvement, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-parchment p-5 border border-tan rounded-sm card-hover"
              >
                <div className="w-8 h-8 bg-burgundy/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-burgundy/30">
                  <span className="text-sm font-display font-bold text-burgundy">{i + 1}</span>
                </div>
                <p className="text-base text-espresso font-body leading-relaxed">{improvement}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════════════ GROOMING SUGGESTIONS ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-3">
          <Scissors className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">GROOMING SUGGESTIONS</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-8">
          Tailored to your {faceResult.facialShape} face shape, {faceResult.styleProfile} style profile,
          and current skin clarity score of {faceResult.skinClarity.toFixed(1)}/10.
        </p>
        <div className="space-y-4">
          {faceResult.groomingSuggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-parchment p-5 border border-tan rounded-sm card-hover"
            >
              <div className="w-8 h-8 bg-amber/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-amber/30">
                <span className="text-sm font-display font-bold text-amber">{i + 1}</span>
              </div>
              <p className="text-base text-espresso font-body leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════ SCORE METHODOLOGY ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">HOW WE SCORED YOU</h3>
        </div>
        <div className="space-y-4 text-sm text-coffee font-body leading-relaxed">
          <p>
            Your overall FaceIQ score is a weighted composite of 9 facial metrics, each computed from
            478 MediaPipe facial landmarks. Weights are based on attractiveness perception research.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMetrics.map((m) => (
              <div key={m.key} className="flex justify-between items-center bg-parchment p-3 border border-tan rounded-sm">
                <span className="text-espresso font-body">{m.label}</span>
                <span className="text-amber font-mono font-bold">{Math.round(m.weight * 100)}%</span>
              </div>
            ))}
          </div>
          <p>
            The Facial Harmony Index is a separate composite of your golden ratio, lip, nose, forehead,
            and cheekbone scores — measuring how well your features work together as a unified whole.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
