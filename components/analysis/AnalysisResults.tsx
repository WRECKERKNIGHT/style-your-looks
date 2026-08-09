"use client";

import { useState } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "./ScoreGauge";
import { MetricBar } from "./MetricBar";
import { MetricRadar } from "./MetricRadar";
import { FaceShapeDiagram } from "./FaceShapeDiagram";
import { InstantSnapshot } from "./InstantSnapshot";
import { CategoryCards } from "./CategoryCards";
import { ActionPlan } from "./ActionPlan";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { SCORE_METRICS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { MONK_SCALE } from "@/lib/ml/skin-tone";
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
  Radar,
  Award,
  Palette,
  Check,
  X,
  ShieldCheck,
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
    percentile >= 85 ? "#C8963E" :
    percentile >= 70 ? "#B98B56" :
    percentile >= 50 ? "#8A5F3D" :
    "#6F4A30";
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
        {percentile}/100
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
      <InstantSnapshot />

      <CategoryCards />

      <ScrollReveal>
        <div className="bg-light-surface dark:bg-cosmic-surface p-10 border border-light-border dark:border-cosmic-border rounded-sm card-nexus">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <ScoreGauge score={faceResult.overallScore} size="lg" label="Overall FaceIQ" />
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-3">
                <ScanFace className="w-6 h-6 text-aurum-500" />
                <h3 className="text-lg font-body font-bold text-nexus-800 dark:text-white tracking-wider">FACIAL ANALYSIS</h3>
              </div>
              <div className="relative h-px mt-3 mb-1 overflow-hidden bg-light-border dark:bg-cosmic-border">
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-aurum-500 to-transparent"
                  initial={{ left: "-35%" }}
                  animate={{ left: "105%" }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                />
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
                  <span className="text-sm font-body font-bold text-aurum-500 tracking-wider">SCORE INDEX</span>
                </div>
                <p className="text-nexus-800 dark:text-white font-body text-base leading-relaxed">
                  {faceResult.percentile.comparisonText}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-aurum-500 text-white text-xs font-mono tracking-wider rounded-full">
                  {faceResult.percentile.bracket}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Face Shape", value: faceResult.facialShape, icon: ScanFace },
                  { label: "Style Profile", value: faceResult.styleProfile, icon: Sparkles },
                  { label: "Skin Tone", value: faceResult.skinTone, icon: Palette },
                  { label: "Undertone", value: faceResult.undertone, icon: Fingerprint },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm"
                  >
                    <item.icon className="w-4 h-4 text-aurum-500 mb-1.5" />
                    <span className="text-nexus-400 dark:text-cosmic-muted text-xs font-body tracking-wider uppercase">{item.label}</span>
                    <p className="font-body font-bold text-nexus-800 dark:text-white text-lg mt-1">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-aurum-500/30 bg-aurum-500/5 text-aurum-500 text-xs font-mono tracking-wider rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurum-500 animate-pulse" />
                  VERIFIED GEOMETRY
                </span>
                <span className="inline-flex items-center px-3 py-1 border border-light-border dark:border-cosmic-border bg-light-base dark:bg-cosmic-elevated text-nexus-400 dark:text-cosmic-muted text-xs font-mono tracking-wider rounded-full">
                  {faceResult.analysisConfidence}% CONFIDENCE
                </span>
                <span className="inline-flex items-center px-3 py-1 border border-light-border dark:border-cosmic-border bg-light-base dark:bg-cosmic-elevated text-nexus-400 dark:text-cosmic-muted text-xs font-mono tracking-wider rounded-full">
                  {faceResult.photoCount} {faceResult.photoCount === 1 ? "PHOTO" : "PHOTOS"} ANALYSED
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.6rem] font-mono tracking-widest text-nexus-400/60 dark:text-cosmic-muted/60">
                    DETECTED SKIN TONE — MONK SCALE {MONK_SCALE.length}/10
                  </span>
                  <span className="text-[0.6rem] font-mono text-aurum-500">
                    {faceResult.skinToneScaleId ? `LEVEL ${faceResult.skinToneScaleId}` : faceResult.skinTone}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {MONK_SCALE.map((level, i) => {
                    const detected = level.id === faceResult.skinToneScaleId;
                    return (
                      <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1"
                        title={`${level.label} (Level ${level.id})`}
                      >
                        <div
                          className="h-9 rounded-sm border transition-all duration-300"
                          style={{
                            background: level.hex,
                            borderColor: detected ? "var(--color-aurum, #C9A227)" : "rgba(255,255,255,0.15)",
                            boxShadow: detected
                              ? "0 0 0 2px var(--color-aurum, #C9A227), 0 0 14px rgba(201,162,39,0.45)"
                              : "inset 0 1px 0 rgba(255,255,255,0.15)",
                            transform: detected ? "scale(1.08)" : "none",
                          }}
                        />
                        <p
                          className={`text-[0.55rem] font-mono text-center mt-1 tracking-wider ${detected ? "text-aurum-500 font-bold" : "text-nexus-400/50 dark:text-cosmic-muted/50"}`}
                        >
                          {i + 1}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-[0.6rem] text-nexus-400/60 dark:text-cosmic-muted/60 font-mono mt-2">
                  {faceResult.skinTone.toUpperCase()} · {faceResult.undertone.toUpperCase()} UNDERTONE · ITA-MEASURED SCALE
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <CollapsibleSection icon={BarChart3} title="BEAUTY INDEX" defaultOpen badge={`${faceResult.beautyIndex}/100`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <AnimatedCounter
              target={faceResult.beautyIndex}
              duration={1.6}
              decimals={1}
              className="text-6xl font-body font-bold text-gradient-aurum"
            />
            <span className="type-mono text-[0.6rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-widest">/100 COMPOSITE</span>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
              The Beauty Index combines all 15 facial metrics into a single composite score (0-100),
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
          Detected live from 478-point facial blendshapes during analysis.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-aurum-500/20 rounded-sm relative overflow-hidden">
            <span className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-aurum-500 animate-pulse" />
              <span className="text-[0.55rem] font-mono text-aurum-500 tracking-widest">LIVE</span>
            </span>
            <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">Emotion</span>
            <p className="font-body font-bold text-aurum-500 text-xl mt-1">{faceResult.blendshapes.emotion}</p>
            <div className="h-2 bg-light-border dark:bg-cosmic-border rounded-full mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${faceResult.blendshapes.emotionConfidence * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-aurum-600 to-aurum-400"
              />
            </div>
            <span className="text-xs text-nexus-400 dark:text-cosmic-muted font-mono">
              {Math.round(faceResult.blendshapes.emotionConfidence * 100)}% confidence
            </span>
          </div>
          {[
            { label: "Smile", value: faceResult.blendshapes.smileIntensity, color: "bg-aurum-500" },
            { label: "Eye Openness", value: faceResult.blendshapes.eyeOpenness, color: "bg-nexus-400" },
            { label: "Brow Raise", value: faceResult.blendshapes.browRaise, color: "bg-aurum-600" },
            { label: "Mouth Openness", value: faceResult.blendshapes.mouthOpenness, color: "bg-nexus-500" },
          ].map((item, i) => (
            <div key={item.label} className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
              <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">{item.label}</span>
              <p className="font-body font-bold text-nexus-800 dark:text-white text-xl mt-1">{Math.round(item.value * 100)}%</p>
              <div className="h-2 bg-light-border dark:bg-cosmic-border rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.value * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">Head Tilt</span>
            <p className="font-body font-bold text-nexus-800 dark:text-white text-xl mt-1">{faceResult.blendshapes.headTilt}deg</p>
            <span className="text-xs text-nexus-400 dark:text-cosmic-muted font-mono">pose correction applied</span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Eye} title="SCORE INDEX" defaultOpen>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="text-center shrink-0">
            <div className="flex items-baseline justify-center gap-1">
              <AnimatedCounter
                target={faceResult.percentile.overall}
                duration={1.4}
                decimals={0}
                className="text-5xl font-body font-bold text-gradient-aurum"
              />
              <span className="text-3xl font-body font-bold text-aurum-500">
                /100
              </span>
            </div>
            <span className="type-mono text-[0.6rem] text-nexus-400/50 dark:text-cosmic-muted/50 tracking-widest block mt-1">SCORE INDEX</span>
            <span className="inline-block mt-2 px-3 py-1 bg-aurum-500 text-white text-xs font-mono tracking-wider rounded-full">
              {faceResult.percentile.bracket}
            </span>
          </div>
          <div className="flex-1 text-sm text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
            {faceResult.percentile.comparisonText}
          </div>
        </div>
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
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex justify-between items-center bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm"
              >
                <span className="text-sm font-body text-nexus-800 dark:text-white">{item.label}</span>
                <span className="font-body font-bold text-aurum-500">
                  <AnimatedCounter
                    target={item.value}
                    duration={1.1}
                    decimals={1}
                    className="inline-block"
                  />
                  /10
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Fingerprint} title="ANALYSIS QUALITY & CONFIDENCE" badge={`${faceResult.analysisConfidence}%`}>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
          {faceResult.photoCount > 1
            ? `Your result aggregates ${faceResult.photoCount} photos. Confidence rises with photo quality and how consistently your geometry scores across shots.`
            : "A single photo was analysed. For the most reliable score, upload 2-3 photos and retry."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Photo Quality", value: faceResult.photoQualityScore, hint: "/10", decimals: 1 },
            { label: "Cross-Photo Consistency", value: faceResult.consistencyScore, hint: "/10", decimals: 1 },
            { label: "Analysis Confidence", value: faceResult.analysisConfidence, hint: "%", decimals: 0 },
          ].map((item) => (
            <div key={item.label} className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
              <span className="text-xs font-body text-nexus-400 dark:text-cosmic-muted tracking-wider uppercase">{item.label}</span>
              <div className="flex items-baseline gap-1 mt-1">
                <AnimatedCounter
                  target={item.value}
                  duration={1.2}
                  decimals={item.decimals}
                  className="font-body font-bold text-aurum-500 text-3xl"
                />
                <span className="text-xs text-nexus-400 dark:text-cosmic-muted font-mono">{item.hint}</span>
              </div>
              <div className="h-2 bg-light-border dark:bg-cosmic-border rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(100, item.value / (item.hint === "%" ? 1 : 10) * 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-aurum-600 to-aurum-400"
                />
              </div>
            </div>
          ))}
        </div>
        {faceResult.photoCount > 1 && (
          <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body mt-4">
            Metrics marked with &quot;±x across photos&quot; are the spread (standard deviation) between your photos.
            Lower spread means more reliable scoring for that feature.
          </p>
        )}
        <div className="mt-5 bg-aurum-500/5 border border-aurum-500/20 p-4 rounded-sm">
          <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
            Scores are estimates from 2D geometry and are sensitive to pose, lens distortion, and lighting.
            They describe facial proportions for styling guidance — not a measure of worth.
          </p>
        </div>
      </CollapsibleSection>

      {faceResult.qualityGate && (
        <CollapsibleSection icon={ShieldCheck} title="PHOTO QUALITY GATE" badge={faceResult.qualityGate.issues.length === 0 ? "PASSED" : "FLAGGED"}>
          <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
            Automated checks run on your best photo before scoring. Flags warn when geometry accuracy may be reduced.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: "Brightness",
                ok: faceResult.qualityGate.brightness >= 6,
                warn: faceResult.qualityGate.brightness >= 4 && faceResult.qualityGate.brightness < 6,
                value: `${faceResult.qualityGate.brightness.toFixed(1)}/10`,
              },
              {
                label: "Sharpness",
                ok: faceResult.qualityGate.sharpness >= 6,
                warn: faceResult.qualityGate.sharpness >= 4 && faceResult.qualityGate.sharpness < 6,
                value: `${faceResult.qualityGate.sharpness.toFixed(1)}/10`,
              },
              {
                label: "Face Size in Frame",
                ok: faceResult.qualityGate.faceSizeRatio >= 0.2 && faceResult.qualityGate.faceSizeRatio <= 0.6,
                warn: (faceResult.qualityGate.faceSizeRatio >= 0.12 && faceResult.qualityGate.faceSizeRatio < 0.2) || (faceResult.qualityGate.faceSizeRatio > 0.6 && faceResult.qualityGate.faceSizeRatio <= 0.95),
                value: `${(faceResult.qualityGate.faceSizeRatio * 100).toFixed(0)}%`,
              },
              {
                label: "Head Pose",
                ok: Math.abs(faceResult.qualityGate.headRoll) < 15 && Math.abs(faceResult.qualityGate.headPitch) < 20,
                warn: false,
                value: `roll ${faceResult.qualityGate.headRoll.toFixed(1)}° · pitch ${faceResult.qualityGate.headPitch.toFixed(1)}°`,
              },
            ].map((check) => {
              const status = check.ok ? "pass" : check.warn ? "warn" : "fail";
              return (
                <div key={check.label} className="flex items-center gap-4 bg-light-base dark:bg-cosmic-elevated p-4 border border-light-border dark:border-cosmic-border rounded-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                      status === "pass"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                        : status === "warn"
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                          : "bg-red-500/10 border-red-500/40 text-red-500"
                    }`}
                  >
                    {status === "pass" ? (
                      <Check className="w-4 h-4" />
                    ) : status === "warn" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-bold text-nexus-800 dark:text-white">{check.label}</p>
                    <p className="text-xs font-mono text-nexus-400 dark:text-cosmic-muted mt-0.5">{check.value}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[0.6rem] font-mono tracking-widest px-2 py-0.5 rounded-sm border ${
                      status === "pass"
                        ? "text-emerald-500 border-emerald-500/30"
                        : status === "warn"
                          ? "text-amber-500 border-amber-500/30"
                          : "text-red-500 border-red-500/30"
                    }`}
                  >
                    {status === "pass" ? "PASS" : status === "warn" ? "WARN" : "FLAG"}
                  </span>
                </div>
              );
            })}
          </div>
          {faceResult.qualityGate.warnings.length + faceResult.qualityGate.issues.length > 0 && (
            <div className="mt-4 space-y-2">
              {faceResult.qualityGate.warnings.map((w) => (
                <p key={w} className="flex items-center gap-2 text-xs text-amber-500/90 font-body">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {w}
                </p>
              ))}
              {faceResult.qualityGate.issues.map((w) => (
                <p key={w} className="flex items-center gap-2 text-xs text-red-500/90 font-body">
                  <X className="w-3.5 h-3.5 shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      <CollapsibleSection icon={Fingerprint} title="FACE SHAPE PROFILE">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-6">
          <div className="md:col-span-1 flex justify-center">
            <FaceShapeDiagram
              landmarks={faceResult.landmarks}
              facialShape={faceResult.facialShape}
              width={240}
              height={280}
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm leading-relaxed">
              {faceResult.faceShapeDetails.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {faceResult.faceShapeDetails.characteristics.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-nexus-800 dark:text-white font-body bg-light-base dark:bg-cosmic-elevated p-3 border border-light-border dark:border-cosmic-border rounded-sm">
                  <div className="w-1.5 h-1.5 bg-aurum-500 rounded-full flex-shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
            <h4 className="text-xs font-body font-bold text-aurum-500 tracking-wider mb-3">IDEAL HAIRSTYLES</h4>
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
          {faceResult.photoCount > 1 && " Scores are the median across your uploaded photos."}
        </p>
        <div className="space-y-6">
          {[...faceResult.breakdown]
            .sort((a, b) => b.weight - a.weight)
            .map((metric) => (
              <MetricBar
                key={metric.label}
                label={metric.label}
                score={metric.score}
                description={metric.description}
                value={metric.value}
                spread={metric.spread}
              />
            ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Radar} title="GEOMETRY RADAR" defaultOpen>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
          Your complete 15-metric profile plotted at once. The larger the polygon, the more balanced
          and harmonious your facial geometry.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <MetricRadar
              metrics={faceResult.breakdown.map((m) => ({ label: m.label, score: m.score }))}
              size={430}
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-aurum-500/20 rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-aurum-500" />
                <span className="text-xs font-body font-bold text-aurum-500 tracking-wider">SIGNATURE STRENGTHS</span>
              </div>
              <div className="space-y-3">
                {[...faceResult.breakdown]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((m, i) => (
                    <div key={m.label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-body text-nexus-800 dark:text-white min-w-0">
                        <span className="text-aurum-500 font-mono text-xs">{["A", "B", "C"][i]}</span>
                        <span className="truncate">{m.label}</span>
                      </span>
                      <span className="font-mono font-bold text-aurum-500 shrink-0">{m.score.toFixed(1)}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-nexus-400" />
                <span className="text-xs font-body font-bold text-nexus-400 tracking-wider">FOCUS AREAS</span>
              </div>
              <div className="space-y-3">
                {[...faceResult.breakdown]
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 3)
                  .map((m, i) => (
                    <div key={m.label} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-body text-nexus-800 dark:text-white min-w-0">
                        <span className="text-nexus-400 font-mono text-xs">0{i + 1}</span>
                        <span className="truncate">{m.label}</span>
                      </span>
                      <span className="font-mono font-bold text-nexus-400 shrink-0">{m.score.toFixed(1)}</span>
                    </div>
                  ))}
              </div>
            </div>
            <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed px-1">
              {faceResult.beautyIndex >= 70
                ? "A large, well-rounded radar polygon — rare and striking geometry."
                : "Every face has shape. Targeted styling can lift your lowest sectors fastest."}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon={Award} title="METRIC SPOTLIGHT" defaultOpen>
        <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6 leading-relaxed">
          The most heavily weighted metrics behind your score, with the raw measurements detected
          from your geometry.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...faceResult.breakdown]
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 6)
            .map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm card-nexus"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-body font-bold text-nexus-800 dark:text-white tracking-wider uppercase truncate">
                    {m.label}
                  </span>
                  <span
                    className={`shrink-0 text-[0.6rem] font-mono tracking-widest px-2 py-0.5 rounded-sm ${
                      m.score >= 70
                        ? "bg-aurum-500 text-white"
                        : m.score >= 50
                          ? "bg-nexus-400/20 text-nexus-400"
                          : "bg-light-border dark:bg-cosmic-border text-nexus-400 dark:text-cosmic-muted"
                    }`}
                  >
                    {m.rating}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-mono font-bold text-2xl text-gradient-aurum">
                    {m.value ?? m.score.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs text-nexus-400 dark:text-cosmic-muted">
                    {m.score.toFixed(1)}/10
                  </span>
                  <span className="ml-auto font-mono text-[0.6rem] text-nexus-400/60 dark:text-cosmic-muted/60">
                    {(m.weight * 100).toFixed(0)}% weight
                  </span>
                </div>
                <div className="h-1.5 bg-light-border dark:bg-cosmic-border rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.score * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-aurum-600 to-aurum-400"
                  />
                </div>
                {m.tip && (
                  <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed mt-3">
                    {m.tip}
                  </p>
                )}
              </motion.div>
            ))}
        </div>
      </CollapsibleSection>

      {faceResult.strengths.length > 0 && (
        <CollapsibleSection icon={TrendingUp} title="YOUR STRENGTHS" badge={`${faceResult.strengths.length} found`}>
          <div className="space-y-3">
            {faceResult.strengths.map((strength, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-start gap-4 p-5 rounded-sm border ${
                  i === 0
                    ? "bg-aurum-500/[0.06] border-aurum-500/30 card-nexus"
                    : "bg-light-base dark:bg-cosmic-elevated border-aurum-500/20"
                }`}
              >
                <div className="w-8 h-8 bg-aurum-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-aurum-500/30">
                  {i === 0 ? (
                    <Crown className="w-4 h-4 text-aurum-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-aurum-500" />
                  )}
                </div>
                <div>
                  <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">{strength}</p>
                  {i === 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-aurum-500 text-white text-[0.6rem] font-mono tracking-widest rounded-sm">
                      SIGNATURE TRAIT
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {faceResult.improvements.length > 0 && (
        <CollapsibleSection icon={AlertTriangle} title="AREAS FOR IMPROVEMENT" badge={`${faceResult.improvements.length} found`}>
          <div className="space-y-3">
            {faceResult.improvements.map((improvement, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4 bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm card-nexus"
              >
                <div className="w-8 h-8 bg-nexus-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-nexus-500/30">
                  <span className="text-sm font-body font-bold text-nexus-400">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">{improvement}</p>
                  <div className="mt-2 h-1.5 bg-light-border dark:bg-cosmic-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(10, 100 - i * 20)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-nexus-400 to-aurum-500"
                    />
                  </div>
                </div>
              </motion.div>
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4 bg-light-base dark:bg-cosmic-elevated p-5 border border-light-border dark:border-cosmic-border rounded-sm card-nexus"
            >
              <div className="w-8 h-8 bg-aurum-500/15 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border border-aurum-500/30">
                <Scissors className="w-4 h-4 text-aurum-500" />
              </div>
              <p className="text-base text-nexus-800 dark:text-white font-body leading-relaxed">
                <span className="font-mono text-aurum-500 text-xs mr-2">{String(i + 1).padStart(2, "0")}</span>
                {suggestion}
              </p>
            </motion.div>
          ))}
        </div>
      </CollapsibleSection>

      <ActionPlan />

      <CollapsibleSection icon={Target} title="HOW WE SCORED YOU">
        <div className="space-y-4 text-sm text-nexus-400 dark:text-cosmic-muted font-body leading-relaxed">
          <p>
            Your overall FaceIQ score is a weighted composite of 15 facial metrics, each computed from
            478 MediaPipe facial landmarks. Weights are based on attractiveness perception research.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topMetrics.map((m, i) => (
              <div key={m.key} className="flex items-center gap-3 bg-light-base dark:bg-cosmic-elevated p-3 border border-light-border dark:border-cosmic-border rounded-sm">
                <span className="flex-1 text-nexus-800 dark:text-white font-body truncate">{m.label}</span>
                <div className="flex-1 h-1.5 bg-light-border dark:bg-cosmic-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.weight * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-aurum-600 to-aurum-400"
                  />
                </div>
                <span className="text-aurum-500 font-mono font-bold min-w-[42px] text-right">
                  {Math.round(m.weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
