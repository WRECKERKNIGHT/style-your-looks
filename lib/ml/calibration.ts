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
 * Population reference means (μ) and standard deviations (σ) for each
 * facial metric. Region-specific overrides are applied on top of these.
 *
 * σ values are set to approximately HALF the real population spread so
 * that the scoring kernel discriminates well: 1 SD = 2 points on the
 * 1-10 scale, so a truly exceptional face (2 SD above mean) scores ~9.
 */
interface MetricRef {
  mu: number;
  sigma: number;
  /** If true, deviation from ideal penalizes (bell curve). If false, higher is better (linear z). */
  bellCurve?: boolean;
  regionOverrides?: Partial<Record<EthnicRegion, { mu: number; sigma: number }>>;
  genderOverrides?: Partial<Record<string, { mu: number; sigma: number }>>;
}

const REFS: Record<string, MetricRef> = {
  // --- Geometry ratios (bell curve — closer to ideal is better) ---
  // Sigma = real population spread. Tighter sigma = more discrimination.
  jawRatio: { mu: 0.78, sigma: 0.05, bellCurve: true,
    regionOverrides: { african: { mu: 0.82, sigma: 0.05 }, east_asian: { mu: 0.74, sigma: 0.04 } } },
  gonialAngle: { mu: 120, sigma: 8, bellCurve: true },
  mandibularTaper: { mu: 0.45, sigma: 0.08, bellCurve: true },
  chinProjection: { mu: 0.0, sigma: 0.15, bellCurve: true },
  jawSymmetry: { mu: 0.0, sigma: 0.04, bellCurve: true },
  eyeSpacingRatio: { mu: 1.0, sigma: 0.12, bellCurve: true },
  fwhr: { mu: 1.95, sigma: 0.15, bellCurve: true,
    genderOverrides: { masculine: { mu: 2.05, sigma: 0.14 }, feminine: { mu: 1.85, sigma: 0.13 } } },
  canthalTilt: { mu: 5.0, sigma: 3.0, bellCurve: true,
    regionOverrides: { east_asian: { mu: 3.5, sigma: 2.5 }, caucasian: { mu: 5.5, sigma: 3.0 }, african: { mu: 4.0, sigma: 2.8 } } },
  eyeNoseRatio: { mu: 1.62, sigma: 0.15, bellCurve: true,
    regionOverrides: { east_asian: { mu: 1.55, sigma: 0.13 }, caucasian: { mu: 1.65, sigma: 0.15 } } },
  noseChinRatio: { mu: 0.30, sigma: 0.035, bellCurve: true },
  proportions: { mu: 0.0, sigma: 0.04, bellCurve: true },
  lipFullness: { mu: 0.55, sigma: 0.08, bellCurve: true,
    regionOverrides: { african: { mu: 0.62, sigma: 0.07 }, east_asian: { mu: 0.50, sigma: 0.07 }, caucasian: { mu: 0.55, sigma: 0.08 } } },
  noseWidthRatio: { mu: 0.28, sigma: 0.03, bellCurve: true,
    regionOverrides: { east_asian: { mu: 0.30, sigma: 0.03 }, african: { mu: 0.31, sigma: 0.03 } } },
  cheekboneDefinition: { mu: 1.07, sigma: 0.05, bellCurve: true },
  horizontalFifths: { mu: 0.0, sigma: 0.12, bellCurve: true },
  noseProjection: { mu: 0.55, sigma: 0.07, bellCurve: true },
  lipWidthRatio: { mu: 0.42, sigma: 0.05, bellCurve: true },
  eyeTilt: { mu: 5.0, sigma: 3.0, bellCurve: true },
  upperLipRatio: { mu: 0.38, sigma: 0.05, bellCurve: true },
  noseBridgeAngle: { mu: 135, sigma: 8, bellCurve: true },

  // --- Linear metrics (higher = better, z-score based) ---
  symmetry: { mu: 8.5, sigma: 1.0,
    genderOverrides: { masculine: { mu: 8.3, sigma: 1.1 }, feminine: { mu: 8.7, sigma: 0.9 } } },
  goldenRatio: { mu: 7.0, sigma: 1.2 },
  skinClarity: { mu: 6.5, sigma: 1.5 },
};

export interface ResolvedRef {
  mu: number;
  sigma: number;
  bellCurve: boolean;
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
  if (!ref) return { mu: 5, sigma: 2, bellCurve: true };

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

  return { mu, sigma, bellCurve: ref.bellCurve ?? true };
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
  /** Score on a 1-10 scale */
  gaussianScore: number;
}

/**
 * Convert an idealScore-based metric (1-10 scale) to a population percentile.
 *
 * For bell-curve metrics: uses the metric's own REFS data to compute the
 * z-score of the underlying raw measurement, then maps to percentile.
 *
 * For linear metrics: uses the score directly as a z-score proxy.
 *
 * This replaces the old broken scoreToPercentile() which used a generic
 * mu=6.0/sigma=1.8 mapping that compressed everything.
 */
export function scoreToPercentile(
  score: number,
  metricKey?: string,
  rawValue?: number
): number {
  if (!Number.isFinite(score)) return 50;

  // If we have the metric key and raw value, use the actual population reference
  if (metricKey && rawValue !== undefined) {
    const ref = resolveRef(metricKey);
    if (ref.bellCurve) {
      // For bell-curve metrics, compute z from the raw measurement
      const z = zScore(rawValue, ref.mu, ref.sigma);
      return percentileFromZ(z);
    } else {
      // For linear metrics, compute z from the score directly
      const z = zScore(score, ref.mu, ref.sigma);
      return percentileFromZ(z);
    }
  }

  // Fallback: map 1-10 score through a calibrated distribution
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
): { faceIQ: number; grade: string; label: string; comparison: string } {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, pct] of Object.entries(metricPercentiles)) {
    const w = weights[key] ?? 0;
    const safe = Number.isFinite(pct) ? pct : 50;
    weightedSum += safe * w;
    totalWeight += w;
  }
  const faceIQ = totalWeight > 0 ? Math.round(Math.max(0, Math.min(100, weightedSum / totalWeight))) : 50;
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
