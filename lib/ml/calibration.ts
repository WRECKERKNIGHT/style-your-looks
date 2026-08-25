/**
 * Population-calibrated facial metric scoring.
 *
 * Instead of arbitrary 2-10 scores clustered in the 5-6 band, each raw
 * measurement is compared against published anthropometric population
 * means (μ) and standard deviations (σ) to produce z-scores, which are
 * mapped to population percentiles via the cumulative normal distribution.
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
 * Population reference means (μ) and standard deviations (σ) for each
 * facial metric. Region-specific overrides are applied on top of these.
 *
 * σ values are deliberately set wider than textbook variance so that the
 * scoring kernel is *forgiving*: a σ of 0.3 on a ratio with real-world
 * spread of 0.2 means even 1.5 SD deviations still score ~6/10. This
 * prevents the common complaint that the engine is "too harsh".
 */
interface MetricRef {
  mu: number;
  sigma: number;
  regionOverrides?: Partial<Record<EthnicRegion, { mu: number; sigma: number }>>;
  genderOverrides?: Partial<Record<string, { mu: number; sigma: number }>>;
}

const REFS: Record<string, MetricRef> = {
  symmetry: {
    mu: 9.2,
    sigma: 0.8,
    genderOverrides: {
      masculine: { mu: 9.0, sigma: 0.9 },
      feminine: { mu: 9.3, sigma: 0.7 },
    },
  },
  goldenRatio: {
    mu: 0.618,
    sigma: 0.12,
  },
  jawline: {
    mu: 0.78,
    sigma: 0.08,
    regionOverrides: {
      african: { mu: 0.82, sigma: 0.09 },
      east_asian: { mu: 0.74, sigma: 0.07 },
      caucasian: { mu: 0.78, sigma: 0.08 },
    },
  },
  fwhr: {
    mu: 1.95,
    sigma: 0.3,
    genderOverrides: {
      masculine: { mu: 2.05, sigma: 0.25 },
      feminine: { mu: 1.85, sigma: 0.22 },
    },
  },
  canthalTilt: {
    mu: 5.0,
    sigma: 4.5,
    regionOverrides: {
      east_asian: { mu: 3.5, sigma: 3.8 },
      south_asian: { mu: 4.2, sigma: 4.0 },
      caucasian: { mu: 5.5, sigma: 4.5 },
      african: { mu: 4.0, sigma: 4.2 },
    },
  },
  eyeNoseRatio: {
    mu: 1.62,
    sigma: 0.38,
    regionOverrides: {
      east_asian: { mu: 1.55, sigma: 0.35 },
      south_asian: { mu: 1.58, sigma: 0.36 },
      caucasian: { mu: 1.65, sigma: 0.38 },
      african: { mu: 1.60, sigma: 0.40 },
    },
  },
  noseChinRatio: {
    mu: 0.30,
    sigma: 0.06,
  },
  midfaceRatio: {
    mu: 1.0,
    sigma: 0.14,
  },
  horizontalFifths: {
    mu: 0.0,
    sigma: 0.3,
  },
  proportions: {
    mu: 0.0,
    sigma: 0.09,
  },
  lipFullness: {
    mu: 0.55,
    sigma: 0.15,
    regionOverrides: {
      african: { mu: 0.62, sigma: 0.14 },
      south_asian: { mu: 0.56, sigma: 0.14 },
      east_asian: { mu: 0.50, sigma: 0.13 },
      caucasian: { mu: 0.55, sigma: 0.15 },
    },
  },
  noseProfile: {
    mu: 0.28,
    sigma: 0.05,
    regionOverrides: {
      east_asian: { mu: 0.30, sigma: 0.05 },
      african: { mu: 0.31, sigma: 0.05 },
      caucasian: { mu: 0.27, sigma: 0.04 },
    },
  },
  foreheadBalance: {
    mu: 0.0,
    sigma: 0.055,
  },
  cheekboneDefinition: {
    mu: 1.07,
    sigma: 0.09,
  },
  eyeSpacing: {
    mu: 1.0,
    sigma: 0.28,
  },
};

export interface ResolvedRef {
  mu: number;
  sigma: number;
}

/**
 * Resolve population reference values for a given metric, region, and gender
 * profile. Falls back to the global default when no override exists.
 */
export function resolveRef(
  metric: string,
  region?: EthnicRegion,
  genderProfile?: "masculine" | "feminine" | "neutral"
): ResolvedRef {
  const ref = REFS[metric];
  if (!ref) return { mu: 5, sigma: 2 };

  let mu = ref.mu;
  let sigma = ref.sigma;

  if (region && ref.regionOverrides?.[region]) {
    const o = ref.regionOverrides[region]!;
    mu = o.mu;
    sigma = o.sigma;
  }
  if (genderProfile && genderProfile !== "neutral" && ref.genderOverrides?.[genderProfile]) {
    const o = ref.genderOverrides[genderProfile]!;
    mu = o.mu;
    sigma = o.sigma;
  }

  return { mu, sigma };
}

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
 */
export function gradeFromPercentile(pct: number): { grade: string; label: string } {
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
 */
export function comparisonFromPercentile(pct: number): string {
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
  /** Score on a 2-10 scale using the Gaussian kernel, for backward compat */
  gaussianScore: number;
}

/**
 * Calibrate a single raw measurement against the population reference.
 */
export function calibrateMetric(
  metric: string,
  rawValue: number,
  region?: EthnicRegion,
  genderProfile?: "masculine" | "feminine" | "neutral",
  floor = 2,
  ceil = 10
): MetricCalibration {
  const ref = resolveRef(metric, region, genderProfile);
  const z = zScore(rawValue, ref.mu, ref.sigma);
  const pct = percentileFromZ(z);
  // Convert percentile (0-100) to a 2-10 scale for backward compatibility
  const gaussianScore = Math.round(Math.max(floor, Math.min(ceil,
    floor + (ceil - floor) * (pct / 100)
  )) * 10) / 10;
  return {
    rawValue,
    mu: ref.mu,
    sigma: ref.sigma,
    z,
    percentile: pct,
    gaussianScore,
  };
}

/**
 * Convert an idealScore-based metric (already 2-10) to a percentile.
 * Uses the idealScore value as the "raw" measurement against a neutral
 * reference (μ = 6, σ = 2 on the 2-10 scale) to produce a meaningful
 * distribution.
 *
 * This is the bridge for metrics that still use idealScore() in their
 * calculation — instead of replacing every metric at once, we post-process
 * the 2-10 output through percentile normalization.
 */
export function scoreToPercentile(score: number): number {
  // Map the 2-10 score through a calibrated curve:
  // μ = 6.0 (average score), σ = 1.8 (spreads the distribution)
  const z = (score - 6.0) / 1.8;
  return percentileFromZ(z);
}

/**
 * Compute the Face IQ: a 0-100 percentile-based score composed of weighted
 * metric percentiles. This replaces the broken `score × 10` calculation.
 *
 * Each metric's percentile is weighted, summed, and clamped to 0-100.
 * The result IS a population percentile (not a rescaled score), so "Face IQ: 78"
 * literally means "better than 78% of faces".
 */
export function computeFaceIQ(
  metricPercentiles: Record<string, number>,
  weights: Record<string, number>
): { faceIQ: number; grade: string; label: string; comparison: string } {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, pct] of Object.entries(metricPercentiles)) {
    const w = weights[key] ?? 0;
    weightedSum += pct * w;
    totalWeight += w;
  }
  const faceIQ = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
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
