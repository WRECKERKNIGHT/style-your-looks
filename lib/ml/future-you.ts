/**
 * Future You — habit-driven projection engine.
 *
 * Bounded and honest by construction: habits can only move soft-tissue and
 * presentation metrics (skin quality, definition visibility, expression
 * energy), never bone. Every gain is capped, decays toward zero headroom,
 * and the combined effect cannot exceed what a consistent 6-month routine
 * realistically delivers (~+1.5 overall).
 */

export interface HabitState {
  /** 0–100 consistency of 7–9h sleep. */
  sleep: number;
  /** 0–100 daily water intake consistency. */
  hydration: number;
  /** 0–100 skincare routine adherence (cleanse/actives/SPF). */
  skincare: number;
  /** 0–100 grooming upkeep (brows, beard/hair, brows shaping). */
  grooming: number;
  /** 0–100 fitness & nutrition consistency. */
  fitness: number;
}

export interface FutureYouInput {
  skinClarity: number;
  jawline: number;
  symmetry: number;
  proportions: number;
  facialHarmony: number;
  overallScore: number;
  analysisConfidence: number;
}

export interface FutureYouProjection {
  current: number;
  projected: number;
  gain: number;
  /** Per-metric projected values after 24 weeks of stated consistency. */
  metrics: {
    label: string;
    current: number;
    projected: number;
  }[];
  /** Confidence in the projection itself (inherits measurement confidence). */
  confidence: number;
  headline: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Fraction of full headroom a habit axis converts at 100% consistency. */
const CONVERSION = {
  skin: 0.55, // skincare + hydration + sleep → skin clarity
  jaw: 0.35, // fitness + sleep → visible definition
  symmetryPerception: 0.25, // grooming → brow/eye-area presentation
  vitality: 0.45, // sleep + hydration → eye energy
};

export function projectFutureYou(
  input: FutureYouInput,
  habits: HabitState
): FutureYouProjection {
  const h = (v: number) => clamp(v, 0, 100) / 100;

  const skinPressure =
    h(habits.skincare) * 0.45 + h(habits.hydration) * 0.3 + h(habits.sleep) * 0.25;
  const jawPressure = h(habits.fitness) * 0.6 + h(habits.sleep) * 0.4;
  const groomPressure = h(habits.grooming);
  const vitalityPressure = h(habits.sleep) * 0.55 + h(habits.hydration) * 0.45;

  const dSkin = (10 - input.skinClarity) * CONVERSION.skin * skinPressure;
  const dJaw = (10 - input.jawline) * CONVERSION.jaw * jawPressure;
  const dSymmetry = (10 - input.symmetry) * CONVERSION.symmetryPerception * groomPressure;

  const projectedSkin = clamp(input.skinClarity + dSkin, 0, 10);
  const projectedJaw = clamp(input.jawline + dJaw, 0, 10);
  const projectedSymmetry = clamp(input.symmetry + dSymmetry, 0, 10);
  const projectedHarmony = clamp(
    (projectedJaw + input.proportions + projectedSkin + input.facialHarmony) /
      ((input.jawline + input.proportions + input.skinClarity + input.facialHarmony) || 1) *
      input.facialHarmony,
    0,
    10
  );

  // Overall shift uses the same weights as the scoring engine's dominant axes.
  const dOverall =
    dSkin * 0.1 + dJaw * 0.11 + dSymmetry * 0.13 + (projectedHarmony - input.facialHarmony) * 0.05;
  const projected = clamp(input.overallScore + dOverall, 0, 10);
  const gain = Math.round((projected - input.overallScore) * 100) / 100;

  const confidence = Math.round(clamp(55 + input.analysisConfidence * 0.4, 50, 92));

  let headline: string;
  if (gain >= 1)
    headline = "Committing to this routine could visibly reshape your profile within 6 months.";
  else if (gain >= 0.4)
    headline = "Consistent execution here delivers a clear, photographable upgrade.";
  else if (gain >= 0.15)
    headline = "Modest but real gains — the compounding kind that show up in photos by week 12.";
  else
    headline = "Your habits are already near ceiling — maintain and protect what you have.";

  return {
    current: input.overallScore,
    projected: Math.round(projected * 10) / 10,
    gain,
    metrics: [
      { label: "Skin Clarity", current: input.skinClarity, projected: Math.round(projectedSkin * 10) / 10 },
      { label: "Jawline", current: input.jawline, projected: Math.round(projectedJaw * 10) / 10 },
      { label: "Symmetry", current: input.symmetry, projected: Math.round(projectedSymmetry * 10) / 10 },
      { label: "Harmony", current: input.facialHarmony, projected: Math.round(projectedHarmony * 10) / 10 },
    ],
    confidence,
    headline,
  };
}
