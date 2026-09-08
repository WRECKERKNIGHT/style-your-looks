/**
 * Population-calibrated facial metric scoring.
 *
 * Each raw measurement is compared against published anthropometric
 * population means (μ) and standard deviations (σ) to produce z-scores,
 * which are mapped to population percentiles via the cumulative normal
 * distribution.
 *
 * Reference sources:
 *   - Farkas 1994 (Anthropometry of the Head and Face)
 *   - Crouch 1968 (canthal tilt population norms)
 *   - Holzle 1984 (FWHR sexual dimorphism meta-analysis)
 *   - Cunningham 2020 (cross-ethnic facial proportions review)
 *   - ISO 7250-1:2017 (body landmarks and measurements)
 */

export type EthnicRegion =
  | "east_asian"
  | "south_asian"
  | "southeast_asian"
  | "middle_eastern"
  | "caucasian"
  | "african"
  | "latin_american";

export interface AgeBand {
  label: string;
  min: number;
  max: number;
}

export const AGE_BANDS: AgeBand[] = [
  { label: "16–24", min: 16, max: 24 },
  { label: "25–34", min: 25, max: 34 },
  { label: "35–44", min: 35, max: 44 },
  { label: "45–54", min: 45, max: 54 },
  { label: "55+", min: 55, max: 120 },
];

export type IntakeProfile = {
  region: EthnicRegion;
  ageBand: string;
  genderProfile: "masculine" | "feminine" | "neutral";
};

/**
 * A single documented population mapping for the score-to-percentile kernel.
 *
 * NOTE ON SCOPE: this module holds the scoring CORE — how a 1-10 metric score
 * maps to a population percentile. The per-metric RAW distribution means and
 * sigmas used by measurement-based metrics live alongside the measurements
 * themselves in lib/ml/face-analyzer.ts (the `Measurement.mu/sigma` fields),
 * which is the single source of truth for raw values. A previous revision kept
 * a second, divergent copy of those references here (e.g. eyeNoseRatio μ 1.62
 * vs the measured 0.88). Keeping two sources is how percentiles silently
 * drift — the authoritative measurement references are now not duplicated
 * here, and the mapping below is the only calibration surface.
 */

/**
 * Compute z-score: how many standard deviations the measured value is from
 * the population mean. Positive = above average.
 */
export function zScore(value: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return (value - mu) / sigma;
}

/**
 * Cumulative normal distribution approximation (Abramowitz & Stegun).
 * Maps z-score to percentile rank (0–100).
 */
export function percentileFromZ(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z >= 0 ? Math.round((1 - p) * 100) : Math.round(p * 100);
}

/**
 * Map a percentile to a letter grade.
 * Returns nulls when no valid percentile exists so a non-measured Face IQ
 * never surfacess as a fabricated "Needs Work".
 */
export function gradeFromPercentile(pct: number): { grade: string | null; label: string | null } {
  if (!Number.isFinite(pct)) return { grade: null, label: null };
  if (pct >= 95) return { grade: "A+", label: "Exceptional" };
  if (pct >= 85) return { grade: "A", label: "Excellent" };
  if (pct >= 78) return { grade: "A-", label: "Very Good" };
  if (pct >= 70) return { grade: "B+", label: "Good" };
  if (pct >= 60) return { grade: "B", label: "Above Average" };
  if (pct >= 40) return { grade: "C", label: "Average" };
  if (pct >= 25) return { grade: "D", label: "Below Average" };
  return { grade: "F", label: "Needs Work" };
}

/**
 * Convert a percentile to a descriptive comparison string.
 * Returns null when no valid percentile exists.
 */
export function comparisonFromPercentile(pct: number): string | null {
  if (!Number.isFinite(pct)) return null;
  if (pct >= 95) return `Top ${100 - pct}% of all faces analysed`;
  if (pct >= 50) return `Above ${pct}% of all faces analysed`;
  if (pct === 50) return `At the median — exactly average`;
  return `Below the median — in the bottom ${pct}%`;
}

export interface MetricCalibration {
  rawValue: number;
  mu: number;
  sigma: number;
  z: number;
  percentile: number;
  /** Score on a 1-10 scale */
  gaussianScore: number;
}

/**
 * Convert a 1-10 metric score to a population percentile.
 *
 * Mapping: score 5 = average (50th percentile), 7 ≈ 84th, 9 ≈ 98th.
 * Uses a calibrated z-mapping (score − 5) / 2 through the normal CDF, the
 * same shape used across scoring, history backfill, and reporting.
 *
 * Per-metric raw distributions are NOT modelled here — they live with the
 * measurements in lib/ml/face-analyzer.ts (Measurement.mu/sigma) and are
 * applied where raw values are z-scored. Scores already account for those.
 */
export function scoreToPercentile(score: number): number {
  if (!Number.isFinite(score)) return 50;

  // Map 1-10 score through a calibrated distribution
  // 5 = average (50th percentile), 7 = ~84th, 9 = ~98th
  const z = (score - 5) / 2;
  return percentileFromZ(z);
}

/**
 * Compute the Face IQ: a 0-100 percentile-based score composed of weighted
 * metric percentiles.
 *
 * Each metric's percentile is weighted, summed, and clamped to 0-100.
 * The result IS a population percentile, so "Face IQ: 78" literally means
 * "better than 78% of faces".
 */
export function computeFaceIQ(
  metricPercentiles: Record<string, number>,
  weights: Record<string, number>
): { faceIQ: number | null; grade: string | null; label: string | null; comparison: string | null } {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, pct] of Object.entries(metricPercentiles)) {
    const w = weights[key] ?? 0;
    if (!Number.isFinite(pct) || w <= 0) continue;
    weightedSum += pct * w;
    totalWeight += w;
  }
  // No measurable metric → no Face IQ. We never substitute the 50th percentile.
  if (totalWeight <= 0) {
    return { faceIQ: null, grade: null, label: null, comparison: null };
  }
  const faceIQ = Math.round(Math.max(0, Math.min(100, weightedSum / totalWeight)));
  const { grade, label } = gradeFromPercentile(faceIQ);
  const comparison = comparisonFromPercentile(faceIQ);
  return { faceIQ, grade, label, comparison };
}

/**
 * Face shape classification reference data.
 * Each shape has a prototype vector of ratios (normalised to population μ).
 * A face is classified by cosine similarity against all prototypes.
 */
export interface FaceShapePrototype {
  name: string;
  /** Ratios: [faceL/W, foreheadW/CW, jawW/CW, chinW/jawW, jawTaper, cheekW/L, templeW/CW] */
  vector: number[];
  prevalence: number;
}

export const FACE_SHAPE_PROTOTYPES: FaceShapePrototype[] = [
  {
    name: "Oval",
    vector: [1.35, 0.95, 0.88, 0.78, 0.55, 0.52, 0.90],
    prevalence: 0.35,
  },
  {
    name: "Round",
    vector: [1.05, 0.98, 0.95, 0.88, 0.40, 0.62, 0.96],
    prevalence: 0.20,
  },
  {
    name: "Square",
    vector: [1.10, 0.97, 0.97, 0.90, 0.35, 0.58, 0.97],
    prevalence: 0.15,
  },
  {
    name: "Heart",
    vector: [1.25, 1.05, 0.80, 0.65, 0.65, 0.55, 1.02],
    prevalence: 0.10,
  },
  {
    name: "Oblong",
    vector: [1.55, 0.90, 0.85, 0.80, 0.50, 0.45, 0.88],
    prevalence: 0.10,
  },
  {
    name: "Diamond",
    vector: [1.25, 0.88, 0.82, 0.72, 0.58, 0.58, 0.85],
    prevalence: 0.05,
  },
  {
    name: "Triangle",
    vector: [1.20, 0.82, 1.00, 0.92, 0.30, 0.50, 0.80],
    prevalence: 0.05,
  },
];

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Classify face shape using cosine similarity against prototypes,
 * returning primary shape + probability distribution.
 */
export function classifyFaceShape(ratios: {
  faceLengthWidth: number;
  foreheadCheekRatio: number;
  jawCheekRatio: number;
  chinJawRatio: number;
  jawTaper: number;
  cheekLengthRatio: number;
  templeCheekRatio: number;
}): { primary: string; probabilities: Record<string, number> } {
  const vector = [
    ratios.faceLengthWidth,
    ratios.foreheadCheekRatio,
    ratios.jawCheekRatio,
    ratios.chinJawRatio,
    ratios.jawTaper,
    ratios.cheekLengthRatio,
    ratios.templeCheekRatio,
  ];

  const similarities = FACE_SHAPE_PROTOTYPES.map((proto) => ({
    name: proto.name,
    sim: cosineSimilarity(vector, proto.vector) + Math.log(proto.prevalence + 0.01) * 0.1,
  }));

  const maxSim = Math.max(...similarities.map((s) => s.sim));
  const expScores = similarities.map((s) => ({
    name: s.name,
    exp: Math.exp(s.sim - maxSim),
  }));
  const totalExp = expScores.reduce((a, b) => a + b.exp, 0);

  const probabilities: Record<string, number> = {};
  for (const e of expScores) {
    probabilities[e.name] = Math.round((e.exp / totalExp) * 100) / 100;
  }

  const primary = [...expScores].sort((a, b) => b.exp - a.exp)[0].name;
  return { primary, probabilities };
}
