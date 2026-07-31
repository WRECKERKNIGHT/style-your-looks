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
      <div className="bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border rounded-sm overflow-hidden card-nexus">
        <button
          onClick={() => setOpen(!open)}
          className="w-full p-6 text-left hover:bg-light-base/30 dark:hover:bg-cosmic-elevated/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-aurum-500" />
              <h3 className="text-lg font-body font-bold text-nexus-800 dark:text-white tracking-wider">{title}</h3>
              {badge && (
                <span className="text-[0.6rem] font-mono tracking-widest uppercase px-2 py-0.5 bg-nexus-400/10 text-aurum-500 border border-aurum-500/25 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-5 h-5 text-nexus-400 dark:text-cosmic-muted" />
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
                <div className="section-divider mb-6" />
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
    percentile >= 85 ? "#FFCB20" :
    percentile >= 70 ? "#8C59FF" :
    percentile >= 50 ? "#6C2BD9" :
    "#4A1A96";
  return (
    <div className="flex items-center gap-4 bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
      <span className="text-sm font-body text-nexus-800 dark:text-white min-w-[140px]">{label}</span>
      <div className="flex-1 h-3 bg-light-border dark:bg-cosmic-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentile}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-mono font-bold text-nexus-800 dark:text-white min-w-[50px] text-right">
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
      <ScrollReveal>
        <div className="bg-light-surface dark:bg-cosmic-surface p-10 border border-light-border dark:border-cosmic-border rounded-sm card-nexus">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <ScoreGauge score={faceResult.overallScore} size="lg" label="Overall FaceIQ" />
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-3">
                <ScanFace className="w-6 h-6 text-aurum-500" />
                <h3 className="text-lg font-body font-bold text-nexus-800 dark:text-white tracking-wider">FACIAL ANALYSIS</h3>
              </div>

              <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
                <span className="text-aurum-500 font-body font-bold text-sm tracking-widest uppercase">
                  {faceResult.overallRating}
                </span>
                <p className="text-nexus-800 dark:text-white font-body text-base mt-1 leading-relaxed">
                  {faceResult.detailedAnalysis}
                </p>
              </div>

              <div className="bg-nexus-400/10 p-5 border border-aurum-500/20 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-aurum-500" />
                  <span className="text-sm font-body font-bold text-aurum-500 tracking-wider">POPULATION RANKING</span>
                </div>
                <p className="text-nexus-800 dark:text-white font-body text-base leading-relaxed">
                  {faceResult.percentile.comparisonText}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-aurum-500 text-white text-xs font-mono tracking-wider rounded-full">
                  {faceResult.percentile.bracket}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                  <span className="text-nexus-400 dark:text-cosmic-muted text-xs font-body tracking-wider uppercase">Face Shape</span>
                  <p className="font-body font-bold text-nexus-800 dark:text-white text-lg mt-1">{faceResult.facialShape}</p>
                </div>
                <div className="bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                  <span className="text-nexus-400 dark:text-cosmic-muted text-xs font-body tracking-wider uppercase">Style Profile</span>
                  <p className="font-body font-bold text-nexus-800 dark:text-white text-lg mt-1">{faceResult.styleProfile}</p>
                </div>
                <div className="bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                  <span className="text-nexus-400 dark:text-cosmic-muted text-xs font-body tracking-wider uppercase">Skin Tone</span>
                  <p className="font-body font-bold text-nexus-800 dark:text-white text-lg mt-1">{faceResult.skinTone}</p>
                </div>
                <div className="bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                  <span className="text-nexus-400 dark:text-cosmic-muted text-xs font-body tracking-wider uppercase">Undertone</span>
                  <p className="font-body font-bold text-nexus-800 dark:text-white text-lg mt-1">{faceResult.undertone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <CollapsibleSection icon={BarChart3} title="BEAUTY INDEX" defaultOpen badge={`${faceResult.beautyIndex}/100`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <div className="text-6xl font-body font-bold text-gradient-aurum">{faceResult.beautyIndex}</div>
            <span className="type-mono text-[0.6rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-widest">/100 COMPOSITE</span>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
              The Beauty Index combines all 10 facial metrics into a single composite score (0-100),
              weighted by research-backed attractiveness perception studies.
            </p>
            <div className="h-4 bg-light-border dark:bg-cosmic-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${faceResult.beautyIndex}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-aurum-500 via-aurum-400 to-aurum-500"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Smile} title="EXPRESSION ANALYSIS" badge={faceResult.blendshapes.emotion}>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
          Detected from 478-point facial blendshapes during analysis.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">Emotion</span>
            <p className="font-body font-bold text-aurum-500 text-xl mt-1">{faceResult.blendshapes.emotion}</p>
            <span className="text-xs text-nexus-400 dark:text-cosmic-muted font-mono">{Math.round(faceResult.blendshapes.emotionConfidence * 100)}% confidence</span>
          </div>
          {[
            { label: "Smile", value: faceResult.blendshapes.smileIntensity, color: "bg-aurum-500" },
            { label: "Eye Openness", value: faceResult.blendshapes.eyeOpenness, color: "bg-nexus-400" },
            { label: "Brow Raise", value: faceResult.blendshapes.browRaise, color: "bg-aurum-600" },
            { label: "Mouth Openness", value: faceResult.blendshapes.mouthOpenness, color: "bg-nexus-500" },
          ].map((item) => (
            <div key={item.label} className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
              <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">{item.label}</span>
              <p className="font-body font-bold text-nexus-800 dark:text-white text-xl mt-1">{Math.round(item.value * 100)}%</p>
              <div className="h-2 bg-light-border dark:bg-cosmic-border rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">Head Tilt</span>
            <p className="font-body font-bold text-nexus-800 dark:text-white text-xl mt-1">{faceResult.blendshapes.headTilt}deg</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Eye} title="PERCENTILE RANKINGS" defaultOpen>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
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

      <CollapsibleSection icon={Crown} title="FACIAL HARMONY INDEX" badge={`${faceResult.facialHarmony}/10`}>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
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
              <div key={item.label} className="flex justify-between items-center bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                <span className="text-sm font-body text-nexus-800 dark:text-white">{item.label}</span>
                <span className="font-body font-bold text-aurum-500">{item.value.toFixed(1)}/10</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Fingerprint} title="FACE SHAPE PROFILE">
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
          {faceResult.faceShapeDetails.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <h4 className="text-xs font-body font-bold text-aurum-500 tracking-wider mb-3">CHARACTERISTICS</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.characteristics.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-nexus-800 dark:text-white font-body">
                  <div className="w-1.5 h-1.5 bg-aurum-500 rounded-full flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <h4 className="text-xs font-body font-bold text-nexus-400 tracking-wider mb-3">IDEAL HAIRSTYLES</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.idealHairstyles.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-nexus-800 dark:text-white font-body">
                  <div className="w-1.5 h-1.5 bg-nexus-400 rounded-full flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <h4 className="text-xs font-body font-bold text-aurum-600 tracking-wider mb-3">IDEAL GLASSES</h4>
            <ul className="space-y-2">
              {faceResult.faceShapeDetails.idealGlasses.map((g, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-nexus-800 dark:text-white font-body">
                  <div className="w-1.5 h-1.5 bg-aurum-600 rounded-full flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Sparkles} title="DETAILED METRICS" defaultOpen>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6">
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

      {faceResult.strengths.length > 0 && (
        <CollapsibleSection icon={TrendingUp} title="YOUR STRENGTHS" badge={`${faceResult.strengths.length} found`}>
          <div className="space-y-3">
            {faceResult.strengths.map((strength, i) => (
              <div key={i} className="flex items-start gap-4 bg-light-base dark:bg-cosmic-elevated p-5 border border-aurum-500/20 rounded-sm">
                <div className="w-8 h-8 bg-aurum-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-aurum-500/30">
                  <TrendingUp className="w-4 h-4 text-aurum-500" />
                </div>
                <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">{strength}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {faceResult.improvements.length > 0 && (
        <CollapsibleSection icon={AlertTriangle} title="AREAS FOR IMPROVEMENT" badge={`${faceResult.improvements.length} found`}>
          <div className="space-y-3">
            {faceResult.improvements.map((improvement, i) => (
              <div key={i} className="flex items-start gap-4 bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm card-nexus">
                <div className="w-8 h-8 bg-nexus-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-nexus-500/30">
                  <span className="text-sm font-body font-bold text-nexus-400">{i + 1}</span>
                </div>
                <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">{improvement}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection icon={Scissors} title="GROOMING SUGGESTIONS">
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6">
          Tailored to your {faceResult.facialShape} face shape and {faceResult.styleProfile} style profile.
        </p>
        <div className="space-y-3">
          {faceResult.groomingSuggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-4 bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm card-nexus">
              <div className="w-8 h-8 bg-aurum-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-aurum-500/30">
                <span className="text-sm font-body font-bold text-aurum-500">{i + 1}</span>
              </div>
              <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Target} title="HOW WE SCORED YOU">
        <div className="space-y-4 text-sm text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
          <p>
            Your overall FaceIQ score is a weighted composite of 9 facial metrics, each computed from
            478 MediaPipe facial landmarks. Weights are based on attractiveness perception research.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topMetrics.map((m) => (
              <div key={m.key} className="flex justify-between items-center bg-light-base dark:bg-cosmic-elevated p-3 border border-light-border dark:border-cosmic-border rounded-sm">
                <span className="text-nexus-800 dark:text-white font-body">{m.label}</span>
                <span className="text-aurum-500 font-mono font-bold">{Math.round(m.weight * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
