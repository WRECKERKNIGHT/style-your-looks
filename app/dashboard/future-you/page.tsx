"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { projectFutureYou, type HabitState } from "@/lib/ml/future-you";
import { motion } from "framer-motion";
import { ScrollReveal, ScrollRevealItem } from "@/components/shared/ScrollReveal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { ArrowRight, Moon, Droplets, Sparkles, Scissors, Dumbbell, TrendingUp, Info } from "lucide-react";

const HABIT_META: {
  key: keyof HabitState;
  label: string;
  detail: string;
  icon: typeof Moon;
}[] = [
  { key: "sleep", label: "SLEEP", detail: "7–9 hours, consistent schedule", icon: Moon },
  { key: "hydration", label: "HYDRATION", detail: "2–3L water daily", icon: Droplets },
  { key: "skincare", label: "SKINCARE", detail: "Cleanse · actives · SPF every day", icon: Sparkles },
  { key: "grooming", label: "GROOMING", detail: "Brows, hairline, beard upkeep", icon: Scissors },
  { key: "fitness", label: "FITNESS", detail: "Training + nutrition consistency", icon: Dumbbell },
];

const DEFAULT_HABITS: HabitState = {
  sleep: 50,
  hydration: 50,
  skincare: 50,
  grooming: 50,
  fitness: 50,
};

export default function FutureYouPage() {
  const faceResult = useAnalysisStore((s) => s.faceResult);
  const [habits, setHabits] = useState<HabitState>(DEFAULT_HABITS);

  const projection = useMemo(() => {
    if (!faceResult) return null;
    return projectFutureYou(
      {
        skinClarity: faceResult.skinClarity,
        jawline: faceResult.jawline,
        symmetry: faceResult.symmetry,
        proportions: faceResult.proportions,
        facialHarmony: faceResult.facialHarmony,
        overallScore: faceResult.overallScore,
        analysisConfidence: faceResult.analysisConfidence,
      },
      habits
    );
  }, [faceResult, habits]);

  if (!faceResult) {
    return (
      <div className="space-y-8">
        <ScrollReveal>
          <span className="section-number">EST. MMXXIV // FUTURE YOU</span>
          <h1 className="type-display text-[var(--text-primary)] tracking-tight mt-3">
            FUTURE <span className="text-gradient-aurum">YOU.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-12 text-center">
            <TrendingUp className="w-16 h-16 text-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)] mx-auto mb-4" />
            <h2 className="type-heading text-[var(--text-primary)] mb-2">NO BASELINE YET</h2>
            <p className="text-[var(--text-muted)] font-body mb-6">
              Run a FaceIQ scan first — Future You projects from your real measured baseline.
            </p>
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
        <span className="section-number">EST. MMXXIV // FUTURE YOU</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <TrendingUp className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            FUTURE <span className="text-gradient-aurum">YOU.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Set the routine you can actually keep. The projection moves only what habits
          genuinely move — skin, definition visibility and expression energy.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-8">
            <div className="text-center md:text-left">
              <p className="type-label text-[var(--text-muted)] mb-1">TODAY</p>
              <p className="text-4xl font-display font-bold text-[var(--text-primary)]">{projection!.current.toFixed(1)}</p>
            </div>

            <div className="space-y-3">
              <div className="relative h-4 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border-primary)] overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]"
                  initial={{ width: `${projection!.current * 10}%` }}
                  animate={{ width: `${projection!.projected * 10}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.div
                  className="absolute inset-y-0 w-0.5 bg-white"
                  initial={{ left: `${projection!.current * 10}%` }}
                  animate={{ left: `${projection!.projected * 10}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="text-sm font-body text-[var(--text-muted)] italic">“{projection!.headline}”</p>
            </div>

            <div className="text-center md:text-right">
              <p className="type-label text-[var(--accent-aurum)] mb-1">24 WEEKS</p>
              <p className="text-5xl font-display font-bold text-gradient-aurum">
                <AnimatedCounter target={projection!.projected} decimals={1} duration={1.2} />
              </p>
              {projection!.gain > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 type-mono text-[0.55rem] tracking-widest rounded-full border border-[color-mix(in_srgb,var(--accent-aurum)_35%,transparent)] text-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]">
                  +{projection!.gain.toFixed(2)} POSSIBLE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {projection!.metrics.map((m) => (
              <div key={m.label} className="bg-[var(--bg-tertiary)] p-4 border border-[var(--border-primary)] rounded-[var(--radius-xs)]">
                <p className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">{m.label.toUpperCase()}</p>
                <p className="font-display font-bold text-lg text-[var(--text-primary)] mt-1">
                  {m.current.toFixed(1)} <span className="text-[var(--text-muted)] text-sm">→</span>{" "}
                  <span className={m.projected > m.current ? "text-[var(--accent-aurum)]" : ""}>{m.projected.toFixed(1)}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6 type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            PROJECTION CONFIDENCE {projection!.confidence}% · BOUNDED MODEL — HABITS CANNOT MOVE BONE. MEASURED FROM YOUR REAL BASELINE.
          </div>
        </div>
      </ScrollReveal>

      <div>
        <ScrollReveal>
          <h2 className="type-heading text-[var(--text-primary)] tracking-tight mb-6">
            SET YOUR <span className="text-gradient-aurum">ROUTINE.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal stagger staggerChildren={0.06}>
          <div className="space-y-4">
            {HABIT_META.map(({ key, label, detail, icon: Icon }) => (
              <ScrollRevealItem key={key}>
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-aurum)_25%,transparent)] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[var(--accent-aurum)]" />
                      </div>
                      <div>
                        <span className="type-label text-[var(--text-primary)]">{label}</span>
                        <p className="text-xs text-[var(--text-muted)] font-body">{detail}</p>
                      </div>
                    </div>
                    <span className="type-mono text-xs font-bold text-[var(--accent-aurum)]">{habits[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={habits[key]}
                    aria-label={`${label} consistency`}
                    onChange={(e) =>
                      setHabits((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="w-full accent-[var(--accent-aurum)] cursor-pointer"
                  />
                </div>
              </ScrollRevealItem>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
