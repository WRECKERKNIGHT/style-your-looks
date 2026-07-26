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
  Percent,
  Smile,
  Fingerprint,
  BarChart3,
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

function PercentileBar({ label, percentile }: { label: string; percentile: number }) {
  const color =
    percentile >= 85 ? "#B8860B" :
    percentile >= 70 ? "#556B2F" :
    percentile >= 50 ? "#C4A882" :
    "#722F37";
  return (
    <div className="flex items-center gap-4 bg-parchment p-4 border border-tan rounded-sm">
      <span className="text-sm font-body text-espresso min-w-[140px]">{label}</span>
      <div className="flex-1 h-3 bg-[#E8E0D8] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentile}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-mono font-bold text-espresso min-w-[50px] text-right">
        {percentile}th
      </span>
    </div>
  );
}

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

            {/* Percentile Badge */}
            <div className="bg-amber/10 p-5 border border-amber/20 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-amber" />
                <span className="text-sm font-display font-bold text-amber tracking-wider">POPULATION RANKING</span>
              </div>
              <p className="text-espresso font-body text-base leading-relaxed">
                {faceResult.percentile.comparisonText}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-amber text-cream text-xs font-mono tracking-wider rounded-full">
                {faceResult.percentile.bracket}
              </span>
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

      {/* ═══════════════ BEAUTY INDEX ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">BEAUTY INDEX</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-display font-bold text-gradient-gold">{faceResult.beautyIndex}</div>
            <span className="type-mono text-[0.6rem] text-coffee/50 tracking-widest">/100 COMPOSITE</span>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-coffee font-body leading-relaxed">
              The Beauty Index combines all 10 facial metrics into a single composite score (0-100),
              weighted by research-backed attractiveness perception studies. It represents your overall
              facial aesthetic harmony.
            </p>
            <div className="h-4 bg-[#E8E0D8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${faceResult.beautyIndex}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber via-amber-light to-amber"
              />
            </div>
            <p className="text-xs text-coffee font-mono">
              {faceResult.beautyIndex >= 85 ? "Exceptional — top-tier facial aesthetics" :
               faceResult.beautyIndex >= 70 ? "Strong — above-average facial harmony" :
               faceResult.beautyIndex >= 55 ? "Good — solid facial proportions" :
               "Average — typical facial proportions with room to enhance"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════ BLENDSHAPE ANALYSIS ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Smile className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">EXPRESSION ANALYSIS</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-8 leading-relaxed">
          Detected from 478-point facial blendshapes. This captures your expression state during analysis.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Detected Emotion</span>
            <p className="font-body font-bold text-amber text-xl mt-1">{faceResult.blendshapes.emotion}</p>
            <span className="text-xs text-coffee font-mono">{Math.round(faceResult.blendshapes.emotionConfidence * 100)}% confidence</span>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Smile Intensity</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{Math.round(faceResult.blendshapes.smileIntensity * 100)}%</p>
            <div className="h-2 bg-[#E8E0D8] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber rounded-full" style={{ width: `${faceResult.blendshapes.smileIntensity * 100}%` }} />
            </div>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Eye Openness</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{Math.round(faceResult.blendshapes.eyeOpenness * 100)}%</p>
            <div className="h-2 bg-[#E8E0D8] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-olive rounded-full" style={{ width: `${faceResult.blendshapes.eyeOpenness * 100}%` }} />
            </div>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Brow Raise</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{Math.round(faceResult.blendshapes.browRaise * 100)}%</p>
            <div className="h-2 bg-[#E8E0D8] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-burgundy rounded-full" style={{ width: `${faceResult.blendshapes.browRaise * 100}%` }} />
            </div>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Mouth Openness</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{Math.round(faceResult.blendshapes.mouthOpenness * 100)}%</p>
            <div className="h-2 bg-[#E8E0D8] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-coffee rounded-full" style={{ width: `${faceResult.blendshapes.mouthOpenness * 100}%` }} />
            </div>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Head Tilt</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{faceResult.blendshapes.headTilt}deg</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════ PERCENTILE RANKINGS ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Percent className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">PERCENTILE RANKINGS</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-8 leading-relaxed">
          How your scores compare to the general population distribution. Based on attractiveness perception research data.
        </p>
        <div className="space-y-3">
          <PercentileBar label="Overall" percentile={faceResult.percentile.overall} />
          <PercentileBar label="Symmetry" percentile={faceResult.percentile.symmetry} />
          <PercentileBar label="Golden Ratio" percentile={faceResult.percentile.goldenRatio} />
          <PercentileBar label="Jawline" percentile={faceResult.percentile.jawline} />
          <PercentileBar label="Skin Clarity" percentile={faceResult.percentile.skinClarity} />
          <PercentileBar label="Harmony" percentile={faceResult.percentile.harmony} />
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

      {/* ═══════════════ FACE SHAPE DETAILS ═══════════════ */}
      <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Fingerprint className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">FACE SHAPE PROFILE</h3>
        </div>
        <p className="text-coffee font-body text-sm mb-6 leading-relaxed">
          {faceResult.faceShapeDetails.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <h4 className="text-xs font-display font-bold text-amber tracking-wider mb-3">CHARACTERISTICS</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.characteristics.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-espresso font-body">
                  <div className="w-1.5 h-1.5 bg-amber rounded-full flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <h4 className="text-xs font-display font-bold text-amber tracking-wider mb-3">IDEAL HAIRSTYLES</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.idealHairstyles.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-espresso font-body">
                  <div className="w-1.5 h-1.5 bg-olive rounded-full flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <h4 className="text-xs font-display font-bold text-amber tracking-wider mb-3">IDEAL GLASSES</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.idealGlasses.map((g, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-espresso font-body">
                  <div className="w-1.5 h-1.5 bg-burgundy rounded-full flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
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
          <p>
            The Beauty Index is a comprehensive 0-100 score combining all 10 metrics, while the
            Percentile Ranking shows how you compare to the general population distribution.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
