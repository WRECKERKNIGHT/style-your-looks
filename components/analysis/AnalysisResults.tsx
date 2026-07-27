"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "./ScoreGauge";
import { MetricBar } from "./MetricBar";
import { SCORE_METRICS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import {
  Sparkles,
  Scissors,
  Heart,
  ScanFace,
  Crown,
  TrendingUp,
  AlertTriangle,
  Target,
  Percent,
  Smile,
  Fingerprint,
  BarChart3,
  ChevronDown,
  Eye,
} from "lucide-react";

function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ScrollReveal>
      <div className="bg-cream border border-tan vintage-border rounded-sm overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-6 text-left hover:bg-parchment/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">{title}</h3>
              {badge && (
                <span className="text-[0.6rem] font-mono tracking-widest uppercase px-2 py-0.5 bg-amber/10 text-amber border border-amber/25 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-5 h-5 text-coffee" />
            </motion.div>
          </div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className="hr-ornamental mb-6" />
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
}

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
          whileInView={{ width: `${percentile}%` }}
          viewport={{ once: true }}
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
    <div className="space-y-6">
      {/* ═══════════════ OVERALL SCORE + RATING ═══════════════ */}
      <ScrollReveal>
        <div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
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
        </div>
      </ScrollReveal>

      <ScrollProgress />

      {/* ═══════════════ BEAUTY INDEX ═══════════════ */}
      <CollapsibleSection icon={BarChart3} title="BEAUTY INDEX" defaultOpen badge={`${faceResult.beautyIndex}/100`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-display font-bold text-gradient-gold">{faceResult.beautyIndex}</div>
            <span className="type-mono text-[0.6rem] text-coffee/50 tracking-widest">/100 COMPOSITE</span>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-coffee font-body leading-relaxed">
              The Beauty Index combines all 10 facial metrics into a single composite score (0-100),
              weighted by research-backed attractiveness perception studies.
            </p>
            <div className="h-4 bg-[#E8E0D8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${faceResult.beautyIndex}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-amber via-amber-light to-amber"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ═══════════════ BLENDSHAPE ANALYSIS ═══════════════ */}
      <CollapsibleSection icon={Smile} title="EXPRESSION ANALYSIS" badge={faceResult.blendshapes.emotion}>
        <p className="text-coffee font-body text-sm mb-6 leading-relaxed">
          Detected from 478-point facial blendshapes during analysis.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Emotion</span>
            <p className="font-body font-bold text-amber text-xl mt-1">{faceResult.blendshapes.emotion}</p>
            <span className="text-xs text-coffee font-mono">{Math.round(faceResult.blendshapes.emotionConfidence * 100)}% confidence</span>
          </div>
          {[
            { label: "Smile", value: faceResult.blendshapes.smileIntensity, color: "bg-amber" },
            { label: "Eye Openness", value: faceResult.blendshapes.eyeOpenness, color: "bg-olive" },
            { label: "Brow Raise", value: faceResult.blendshapes.browRaise, color: "bg-burgundy" },
            { label: "Mouth Openness", value: faceResult.blendshapes.mouthOpenness, color: "bg-coffee" },
          ].map((item) => (
            <div key={item.label} className="bg-parchment p-5 border border-tan rounded-sm">
              <span className="text-xs font-body text-coffee tracking-wider uppercase">{item.label}</span>
              <p className="font-body font-bold text-espresso text-xl mt-1">{Math.round(item.value * 100)}%</p>
              <div className="h-2 bg-[#E8E0D8] rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="bg-parchment p-5 border border-tan rounded-sm">
            <span className="text-xs font-body text-coffee tracking-wider uppercase">Head Tilt</span>
            <p className="font-body font-bold text-espresso text-xl mt-1">{faceResult.blendshapes.headTilt}deg</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* ═══════════════ PERCENTILE RANKINGS ═══════════════ */}
      <CollapsibleSection icon={Eye} title="PERCENTILE RANKINGS" defaultOpen>
        <p className="text-coffee font-body text-sm mb-6 leading-relaxed">
          How your scores compare to the general population distribution.
        </p>
        <div className="space-y-3">
          <PercentileBar label="Overall" percentile={faceResult.percentile.overall} />
          <PercentileBar label="Symmetry" percentile={faceResult.percentile.symmetry} />
          <PercentileBar label="Golden Ratio" percentile={faceResult.percentile.goldenRatio} />
          <PercentileBar label="Jawline" percentile={faceResult.percentile.jawline} />
          <PercentileBar label="Skin Clarity" percentile={faceResult.percentile.skinClarity} />
          <PercentileBar label="Harmony" percentile={faceResult.percentile.harmony} />
        </div>
      </CollapsibleSection>

      {/* ═══════════════ FACIAL HARMONY INDEX ═══════════════ */}
      <CollapsibleSection icon={Crown} title="FACIAL HARMONY INDEX" badge={`${faceResult.facialHarmony}/10`}>
        <p className="text-coffee font-body text-sm mb-6 leading-relaxed">
          Composite of golden ratio, lip proportion, nose profile, forehead balance, and cheekbone definition.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={faceResult.facialHarmony} size="md" label="Harmony Score" />
          <div className="grid grid-cols-1 gap-3 flex-1 w-full">
            {[
              { label: "Golden Ratio Adherence", value: faceResult.goldenRatio },
              { label: "Lip Proportion", value: faceResult.lipFullness },
              { label: "Nose Profile", value: faceResult.noseProfile },
              { label: "Forehead Balance", value: faceResult.foreheadBalance },
              { label: "Cheekbone Definition", value: faceResult.cheekboneDefinition },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center bg-parchment p-4 border border-tan rounded-sm">
                <span className="text-sm font-body text-espresso">{item.label}</span>
                <span className="font-display font-bold text-amber">{item.value.toFixed(1)}/10</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ═══════════════ FACE SHAPE DETAILS ═══════════════ */}
      <CollapsibleSection icon={Fingerprint} title="FACE SHAPE PROFILE">
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
            <h4 className="text-xs font-display font-bold text-olive tracking-wider mb-3">IDEAL HAIRSTYLES</h4>
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
            <h4 className="text-xs font-display font-bold text-burgundy tracking-wider mb-3">IDEAL GLASSES</h4>
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
      </CollapsibleSection>

      {/* ═══════════════ DETAILED METRICS ═══════════════ */}
      <CollapsibleSection icon={Sparkles} title="DETAILED METRICS" defaultOpen>
        <p className="text-coffee font-body text-sm mb-6">
          Each metric is computed from MediaPipe 478-landmark facial geometry.
        </p>
        <div className="space-y-6">
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
      </CollapsibleSection>

      {/* ═══════════════ STRENGTHS ═══════════════ */}
      {faceResult.strengths.length > 0 && (
        <CollapsibleSection icon={TrendingUp} title="YOUR STRENGTHS" badge={`${faceResult.strengths.length} found`}>
          <div className="space-y-3">
            {faceResult.strengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-4 bg-parchment p-5 border border-amber/20 rounded-sm">
                <div className="w-8 h-8 bg-amber/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-amber/30">
                  <TrendingUp className="w-4 h-4 text-amber" />
                </div>
                <p className="text-base text-espresso font-body leading-relaxed">{strength}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ═══════════════ AREAS FOR IMPROVEMENT ═══════════════ */}
      {faceResult.improvements.length > 0 && (
        <CollapsibleSection icon={AlertTriangle} title="AREAS FOR IMPROVEMENT" badge={`${faceResult.improvements.length} found`}>
          <div className="space-y-3">
            {faceResult.improvements.map((improvement, i) => (
              <div key={i} className="flex items-start gap-4 bg-parchment p-5 border border-tan rounded-sm card-hover">
                <div className="w-8 h-8 bg-burgundy/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-burgundy/30">
                  <span className="text-sm font-display font-bold text-burgundy">{i + 1}</span>
                </div>
                <p className="text-base text-espresso font-body leading-relaxed">{improvement}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ═══════════════ GROOMING SUGGESTIONS ═══════════════ */}
      <CollapsibleSection icon={Scissors} title="GROOMING SUGGESTIONS">
        <p className="text-coffee font-body text-sm mb-6">
          Tailored to your {faceResult.facialShape} face shape and {faceResult.styleProfile} style profile.
        </p>
        <div className="space-y-3">
          {faceResult.groomingSuggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-4 bg-parchment p-5 border border-tan rounded-sm card-hover">
              <div className="w-8 h-8 bg-amber/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-amber/30">
                <span className="text-sm font-display font-bold text-amber">{i + 1}</span>
              </div>
              <p className="text-base text-espresso font-body leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* ═══════════════ SCORE METHODOLOGY ═══════════════ */}
      <CollapsibleSection icon={Target} title="HOW WE SCORED YOU">
        <div className="space-y-4 text-sm text-coffee font-body leading-relaxed">
          <p>
            Your overall FaceIQ score is a weighted composite of 9 facial metrics, each computed from
            478 MediaPipe facial landmarks. Weights are based on attractiveness perception research.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topMetrics.map((m) => (
              <div key={m.key} className="flex justify-between items-center bg-parchment p-3 border border-tan rounded-sm">
                <span className="text-espresso font-body">{m.label}</span>
                <span className="text-amber font-mono font-bold">{Math.round(m.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
