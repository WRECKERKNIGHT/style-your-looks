"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Calendar, User, ChevronRight, Check } from "lucide-react";
import { useAnalysisStore, type IntakeProfile } from "@/store/analysis-store";
import type { EthnicRegion } from "@/lib/ml/calibration";
import type { AnalysisProfile } from "@/lib/ml/scoring";
import { AGE_BANDS } from "@/lib/ml/calibration";

const REGIONS: { value: EthnicRegion; label: string; flag: string }[] = [
  { value: "east_asian", label: "East Asian", flag: "🇨🇳" },
  { value: "south_asian", label: "South Asian", flag: "🇮🇳" },
  { value: "southeast_asian", label: "Southeast Asian", flag: "🇹🇭" },
  { value: "middle_eastern", label: "Middle Eastern", flag: "🇸🇦" },
  { value: "caucasian", label: "European / Caucasian", flag: "🇪🇺" },
  { value: "african", label: "African / Black", flag: "🇳🇬" },
  { value: "latin_american", label: "Latin American", flag: "🇧🇷" },
];

const GENDERS: { value: AnalysisProfile; label: string }[] = [
  { value: "masculine", label: "Male" },
  { value: "feminine", label: "Female" },
  { value: "neutral", label: "Prefer not to say" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function IntakeQuestionnaire({ onComplete }: { onComplete: () => void }) {
  const { setIntakeProfile, setGenderProfile, intakeProfile } = useAnalysisStore();
  const [region, setRegion] = useState<EthnicRegion | null>(intakeProfile?.region ?? null);
  const [ageBand, setAgeBand] = useState<string>(intakeProfile?.ageBand ?? "");
  const [gender, setGender] = useState<AnalysisProfile>(intakeProfile?.genderProfile ?? "neutral");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!region) {
      setError("Select your ethnic background for calibrated scoring");
      return;
    }
    if (!ageBand) {
      setError("Select your age group for calibrated scoring");
      return;
    }

    const profile: IntakeProfile = { region, ageBand, genderProfile: gender };
    setIntakeProfile(profile);
    setGenderProfile(gender);
    onComplete();
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[var(--radius-xs)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-paper-lg p-8 md:p-12"
    >
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />

      <div className="relative z-10 space-y-8">
        <div>
          <span className="type-mono text-[0.5rem] tracking-widest text-[var(--accent-aurum)]">BEFORE WE BEGIN</span>
          <h2 className="type-display text-[var(--text-primary)] mt-2">
            Tell us about you.
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-body mt-2 max-w-lg">
            These details calibrate scoring to population-specific anthropometric data.
            Your face is unique — your results should reflect that.
          </p>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-300">
            {error}
          </div>
        )}

        {/* Region */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-[var(--accent-aurum)]" />
            <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">ETHNIC BACKGROUND</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRegion(r.value); setError(null); }}
                className={`flex items-center gap-2 p-3 border text-left text-sm transition-all ${
                  region === r.value
                    ? "border-[var(--accent-aurum)] bg-[var(--accent-aurum)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/50"
                }`}
              >
                <span className="text-lg">{r.flag}</span>
                <span className="font-body">{r.label}</span>
                {region === r.value && <Check className="w-3 h-3 ml-auto text-[var(--accent-aurum)]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Age Band */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-[var(--accent-aurum)]" />
            <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">AGE GROUP</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AGE_BANDS.map((ab) => (
              <button
                key={ab.label}
                onClick={() => { setAgeBand(ab.label); setError(null); }}
                className={`px-4 py-2 border text-sm font-body transition-all ${
                  ageBand === ab.label
                    ? "border-[var(--accent-aurum)] bg-[var(--accent-aurum)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/50"
                }`}
              >
                {ab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-[var(--accent-aurum)]" />
            <span className="type-mono text-[0.55rem] tracking-widest text-[var(--text-muted)]">GENDER (FOR SCORING WEIGHTS)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                className={`px-4 py-2 border text-sm font-body transition-all ${
                  gender === g.value
                    ? "border-[var(--accent-aurum)] bg-[var(--accent-aurum)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/50"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-aurum)] text-[var(--bg-primary)] font-body font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Continue to Photo Capture
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
