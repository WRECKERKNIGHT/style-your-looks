import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { rangeScore, domainToIndex } from './scoring-curves';
import { getFaceSymmetryAxis, getFacialShape, type StructureProfileType, computeRawGeometry, type Measurement, type RawGeometry } from './face-analyzer';
import type { PhotoQualityReport } from './face-quality';
import { frontalityScore } from './face-quality';
import { scoreToPercentile, computeFaceIQ } from './calibration';

export interface MetricResult {
  score: number | null;
  confidence: number;
  rawValue?: number;
}

export interface FacialMetric {
  label: string;
  score: number;
  weight: number;
  description: string;
  rating: string;
  tip: string;
  value?: string;
  spread?: number;
}

export interface BlendshapeAnalysis {
  emotion: string;
  emotionConfidence: number;
  eyeOpenness: number;
  mouthOpenness: number;
  browRaise: number;
  smileIntensity: number;
  headTilt: number;
}

export interface PercentileRanking {
  overall: number | null;
  symmetry: number | null;
  goldenRatio: number | null;
  jawline: number | null;
  skinClarity: number | null;
  harmony: number | null;
  bracket: string | null;
  comparisonText: string | null;
}

export interface FaceScoreResult {
  overallScore: number | null;
  /** Per-metric 1-10 scores. `null` = the aspect could not be measured
   *  from the supplied photos (e.g. nose projection from a frontal view). */
  symmetry: number | null;
  proportions: number | null;
  jawline: number | null;
  eyeSpacing: number | null;
  skinClarity: number | null;
  facialShape: string;
  faceShapeProbabilities: Record<string, number>;
  goldenRatio: number | null;
  lipFullness: number | null;
  noseProfile: number | null;
  cheekboneDefinition: number | null;
  fwhr: number | null;
  canthalTilt: number | null;
  eyeNoseRatio: number | null;
  noseChinRatio: number | null;
  horizontalFifths: number | null;
  noseProjection: number | null;
  lipWidthRatio: number | null;
  upperLipRatio: number | null;
  noseBridgeAngle: number | null;
  eyeTilt: number | null;
  rawFwhr: number | null;
  rawCanthalTilt: number | null;
  rawEyeNoseRatio: number | null;
  facialHarmony: number | null;
  breakdown: FacialMetric[];
  overallRating: string;
  detailedAnalysis: string;
  strengths: string[];
  improvements: string[];
  styleProfile: string;
  blendshapes: BlendshapeAnalysis | null;
  percentile: PercentileRanking;
  beautyIndex: number | null;
  faceShapeDetails: {
    description: string;
    characteristics: string[];
    idealHairstyles: string[];
    idealGlasses: string[];
  };
  photoQualityScore: number | null;
  consistencyScore?: number;
  analysisConfidence: number;
  metricAvailability: string[];
  photoCount: number;
  /** Pose-aware symmetry axis tilt (degrees from vertical) for overlays. */
  symmetryAxis?: { angleDeg: number };
  /** Population-calibrated Face IQ (0-100). Higher = more rare/attractive.
   *  `null` when no reliable measurement could be made. */
  faceIQ: number | null;
  /** Letter grade from percentile; `null` when nothing was measured. */
  grade: string | null;
  /** Descriptive label for the grade. */
  gradeLabel: string | null;
  /** Human-readable comparison. */
  comparison: string | null;
  /** Structure profile descriptor (Soft/Balanced/Defined/Sharp) or null when
   *  no reliable measurement was possible. */
  structureProfile: StructureProfileType | null;
  /** Youthfulness score (0-100). `null` when not measurable. */
  youthfulness: number | null;
  /** Per-metric percentiles for distribution bars. */
  metricPercentiles: Record<string, number>;
  /** Face Profile — per-domain indices (0-100). */
  faceProfile?: FaceProfile;
  /** Raw geometry measurements (for measurement report). */
  rawGeometry?: RawGeometry;
}

// ─────────────────────────────────────────────────────────────────────────────
// FACE PROFILE — domain-based scoring
//
// Instead of a single beauty number, expose per-domain indices (0-100):
//   Geometry  (25%): facial thirds, fifths, face ratio, FWHR, golden ratio
//   Symmetry  (20%): bilateral structural symmetry
//   Structure (20%): jaw geometry, cheekbone, chin
//   Eyes      (20%): eye spacing, canthal tilt, eye aspect ratio, brow metrics
//   Nasal     (15%): nose width, projection, bridge angle, alar angle
//
// Each domain is scored 0-10 using rangeScore(z) on its constituent
// measurements, then mapped to 0-100 index for display.
// ─────────────────────────────────────────────────────────────────────────────

export interface FaceProfile {
  geometry: number | null;
  symmetry: number | null;
  structure: number | null;
  eyes: number | null;
  nasal: number | null;
  confidence: number;
}

const DOMAIN_WEIGHTS = {
  geometry: 0.25,
  symmetry: 0.2,
  structure: 0.2,
  eyes: 0.2,
  nasal: 0.15,
};

function domainScore(measurements: Measurement[]): number | null {
  const valid = measurements.filter(
    (m) =>
      m.status === 'valid' &&
      m.confidence > 0 &&
      Number.isFinite(m.z) &&
      Number.isFinite(m.raw),
  );
  if (valid.length === 0) return null;
  const avg = valid.reduce((sum, m) => sum + rangeScore(m.z), 0) / valid.length;
  return Math.round(Math.min(10, avg) * 10) / 10;
}

function computeDomainScores(
  geo: RawGeometry,
  skinClarity: number | null,
  _photoQuality: number | null,
): FaceProfile {
  const geometry = domainScore([
    geo.verticalBalance,
    geo.horizontalFifths,
    geo.goldenRatio,
    geo.fwhr,
    geo.faceRatio,
  ]);

  const symmetryScore = domainScore([geo.symmetry, geo.jawSymmetry]);

  const structure = domainScore([
    geo.jawRatio,
    geo.gonialAngle,
    geo.mandibularTaper,
    geo.chinProjection,
    geo.cheekboneDefinition,
  ]);

  const eyes = domainScore([
    geo.eyeSpacing,
    geo.eyeAspectRatio,
    geo.canthalTilt,
    geo.eyeTilt,
    geo.browTilt,
    geo.browLengthRatio,
  ]);

  const nasal = domainScore([
    geo.noseWidthRatio,
    geo.noseChinRatio,
    geo.noseProjection,
    geo.noseBridgeAngle,
    geo.alarAngle,
  ]);

  // Confidence: how many measurements had valid data
  const allMeasurements = [
    geo.verticalBalance,
    geo.horizontalFifths,
    geo.goldenRatio,
    geo.fwhr,
    geo.faceRatio,
    geo.symmetry,
    geo.jawSymmetry,
    geo.jawRatio,
    geo.gonialAngle,
    geo.mandibularTaper,
    geo.chinProjection,
    geo.cheekboneDefinition,
    geo.eyeSpacing,
    geo.eyeAspectRatio,
    geo.canthalTilt,
    geo.eyeTilt,
    geo.browTilt,
    geo.browLengthRatio,
    geo.noseWidthRatio,
    geo.noseChinRatio,
    geo.noseProjection,
    geo.noseBridgeAngle,
    geo.alarAngle,
  ];
  const validCount = allMeasurements.filter((m) => m.status === 'valid' && Number.isFinite(m.z)).length;
  const confidence = Math.round((validCount / allMeasurements.length) * 100);

  return {
    geometry: geometry === null ? null : domainToIndex(geometry),
    symmetry: symmetryScore === null ? null : domainToIndex(symmetryScore),
    structure: structure === null ? null : domainToIndex(structure),
    eyes: eyes === null ? null : domainToIndex(eyes),
    nasal: nasal === null ? null : domainToIndex(nasal),
    confidence,
  };
}

export interface FaceMetricScores {
  symmetry: MetricResult;
  proportions: MetricResult;
  jawline: MetricResult;
  eyeSpacing: MetricResult;
  eyeAspectRatio: MetricResult;
  goldenRatio: MetricResult;
  lipFullness: MetricResult;
  noseProfile: MetricResult;
  cheekboneDefinition: MetricResult;
  fwhr: MetricResult;
  canthalTilt: MetricResult;
  eyeTilt: MetricResult;
  browTilt: MetricResult;
  browLengthRatio: MetricResult;
  eyeNoseRatio: MetricResult;
  noseChinRatio: MetricResult;
  horizontalFifths: MetricResult;
  noseProjection: MetricResult;
  noseBridgeAngle: MetricResult;
  alarAngle: MetricResult;
  lipWidthRatio: MetricResult;
  upperLipRatio: MetricResult;
  facialShape: string;
  faceShapeProbabilities: Record<string, number>;
}

export interface FaceScoreSample {
  metrics: FaceMetricScores;
  skinClarity: number | null;
  quality: PhotoQualityReport;
  sourceResult?: FaceLandmarkerResult;
  youthfulness?: number | null;
  structureProfile?: StructureProfileType | null;
  /** Which pose this sample was captured in ('front' unless a profile photo). */
  view?: 'front' | 'profile';
}

function scoreToRating(score: number): string {
  if (score >= 9.5) return 'Exceptional';
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.5) return 'Very Good';
  if (score >= 6.5) return 'Good';
  if (score >= 5.5) return 'Above Average';
  if (score >= 4.5) return 'Average';
  if (score >= 3.5) return 'Below Average';
  return 'Needs Work';
}

function scoreToDetailedLabel(score: number): string {
  if (score >= 9)
    return `An exceptional ${score.toFixed(1)}/10 result — outstanding structural consistency across every measured zone.`;
  if (score >= 8)
    return `A strong ${score.toFixed(1)}/10 result — well-proportioned and highly consistent across measured zones.`;
  if (score >= 7)
    return `A solid ${score.toFixed(1)}/10 result — above-average geometry with clearly balanced proportions.`;
  if (score >= 6)
    return `A respectable ${score.toFixed(1)}/10 result — good proportions with room to tune individual zones.`;
  if (score >= 5)
    return `A ${score.toFixed(1)}/10 result — average proportions. Targeted grooming can lift specific metrics.`;
  if (score >= 4)
    return `A ${score.toFixed(1)}/10 result — below average. Individual metric tips outline where to focus.`;
  return `A ${score.toFixed(1)}/10 result — the improvements section lists the highest-impact next steps.`;
}

function analyzeBlendshapes(result: FaceLandmarkerResult): BlendshapeAnalysis | null {
  const blendshapes = result.faceBlendshapes?.[0]?.categories;
  if (!blendshapes || blendshapes.length === 0) return null;

  const findShape = (name: string) =>
    blendshapes.find((s) => s.categoryName.toLowerCase().includes(name.toLowerCase()))?.score ?? 0;

  const smileLeft = findShape('smileLeft');
  const smileRight = findShape('smileRight');
  const smileIntensity = (smileLeft + smileRight) / 2;

  const eyeBlinkLeft = findShape('eyeBlinkLeft');
  const eyeBlinkRight = findShape('eyeBlinkRight');
  const eyeOpenness = 1 - (eyeBlinkLeft + eyeBlinkRight) / 2;

  const jawOpen = findShape('jawOpen');
  const mouthPucker = findShape('mouthPucker');
  const mouthOpenness = (jawOpen + mouthPucker) / 2;

  const browInnerUp = findShape('browInnerUp');
  const browOuterUpLeft = findShape('browOuterUpLeft');
  const browOuterUpRight = findShape('browOuterUpRight');
  const browRaise = (browInnerUp + browOuterUpLeft + browOuterUpRight) / 3;

  const eyeSquintLeft = findShape('eyeSquintLeft');
  const eyeSquintRight = findShape('eyeSquintRight');
  const browDownLeft = findShape('browDownLeft');
  const browDownRight = findShape('browDownRight');
  const cheekSquint = (eyeSquintLeft + eyeSquintRight) / 2;

  let emotion = 'Neutral';
  let emotionConfidence = 0.4;

  const emotionScores: [string, number][] = [
    ['Happy', smileIntensity * 0.8 + (1 - browDownLeft - browDownRight) * 0.2],
    ['Surprised', browRaise * 0.6 + eyeOpenness * 0.3 + jawOpen * 0.1],
    [
      'Angry',
      ((browDownLeft + browDownRight) / 2) * 0.5 + cheekSquint * 0.3 + (1 - smileIntensity) * 0.2,
    ],
    ['Sad', browInnerUp * 0.4 + (1 - smileIntensity) * 0.3 + (1 - eyeOpenness) * 0.3],
    ['Fearful', browRaise * 0.4 + eyeOpenness * 0.3 + jawOpen * 0.3],
    [
      'Disgusted',
      ((browDownLeft + browDownRight) / 2) * 0.3 + mouthPucker * 0.4 + cheekSquint * 0.3,
    ],
  ];

  const sorted = emotionScores.sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] > 0.3) {
    emotion = sorted[0][0];
    emotionConfidence = Math.min(0.95, sorted[0][1]);
  }

  const headRotation = result.facialTransformationMatrixes?.[0];
  let headTilt = 0;
  if (headRotation && headRotation.data) {
    const cols = headRotation.columns || 3;
    headTilt = Math.asin(-headRotation.data[2 * cols + 0]) * (180 / Math.PI);
  }

  return {
    emotion,
    emotionConfidence,
    eyeOpenness: Math.round(eyeOpenness * 100) / 100,
    mouthOpenness: Math.round(mouthOpenness * 100) / 100,
    browRaise: Math.round(browRaise * 100) / 100,
    smileIntensity: Math.round(smileIntensity * 100) / 100,
    headTilt: Math.round(headTilt * 10) / 10,
  };
}

/**
 * Maps a 1-10 score to a 0-100 index for display. This is a direct linear
 * rescale of the measured score — NOT a population percentile. ZERVEY does
 * not yet hold a large enough analysed dataset to report real percentiles,
 * and any number labelled a percentile would be fabricated.
 */
function calculateScoreIndex(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 10)));
}

function getScoreBand(index: number): string {
  const score = index / 10;
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Above Average';
  if (score >= 4) return 'Average';
  if (score >= 3) return 'Below Average';
  return 'Needs Work';
}

const WEIGHTS = {
  symmetry: 0.13,
  goldenRatio: 0.11,
  jawline: 0.11,
  proportions: 0.06,
  horizontalFifths: 0.03,
  skinClarity: 0.1,
  eyeSpacing: 0.07,
  cheekboneDefinition: 0.08,
  lipFullness: 0.05,
  noseProfile: 0.05,
  fwhr: 0.06,
  canthalTilt: 0.05,
  eyeNoseRatio: 0.04,
  noseChinRatio: 0.02,
  noseProjection: 0.03,
  lipWidthRatio: 0.02,
  upperLipRatio: 0.02,
  noseBridgeAngle: 0.02,
  eyeTilt: 0.02,
};

export type AnalysisProfile = 'masculine' | 'feminine' | 'neutral';

const WEIGHTS_MASCULINE: typeof WEIGHTS = {
  ...WEIGHTS,
  symmetry: 0.12,
  goldenRatio: 0.1,
  jawline: 0.15,
  lipFullness: 0.03,
  cheekboneDefinition: 0.1,
  fwhr: 0.09,
  canthalTilt: 0.04,
};

const WEIGHTS_FEMININE: typeof WEIGHTS = {
  ...WEIGHTS,
  symmetry: 0.14,
  goldenRatio: 0.12,
  jawline: 0.08,
  eyeSpacing: 0.06,
  cheekboneDefinition: 0.09,
  lipFullness: 0.08,
  noseProfile: 0.04,
  fwhr: 0.04,
  canthalTilt: 0.07,
};

function normalizeWeights(weights: typeof WEIGHTS): typeof WEIGHTS {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total]),
  ) as typeof WEIGHTS;
}

function weightsForProfile(profile: AnalysisProfile): typeof WEIGHTS {
  if (profile === 'masculine') return normalizeWeights(WEIGHTS_MASCULINE);
  if (profile === 'feminine') return normalizeWeights(WEIGHTS_FEMININE);
  return WEIGHTS;
}

const FACE_SHAPE_INFO: Record<
  string,
  {
    description: string;
    characteristics: string[];
    idealHairstyles: string[];
    idealGlasses: string[];
  }
> = {
  Oval: {
    description:
      'Your face is slightly longer than it is wide, with a gently rounded jawline and forehead. This is considered the most versatile face shape.',
    characteristics: [
      'Balanced proportions',
      'Slightly longer than wide',
      'Gentle jawline curve',
      'Forehead slightly wider than chin',
    ],
    idealHairstyles: ['Side part', 'Textured crop', 'Medium-length layers', 'Slicked back'],
    idealGlasses: ['Most frame shapes', 'Aviators', 'Wayfarers', 'Round frames'],
  },
  Round: {
    description:
      'Your face is approximately as wide as it is long, with full cheeks and a rounded jawline. Soft, approachable features.',
    characteristics: ['Equal width and length', 'Full cheeks', 'Rounded jawline', 'Soft features'],
    idealHairstyles: ['Textured top with short sides', 'Quiff', 'Angular fringe', 'High fade'],
    idealGlasses: ['Angular frames', 'Rectangle', 'Square', 'Browline'],
  },
  Square: {
    description:
      'Your face has a strong, angular jawline with roughly equal width at the forehead and jaw. Powerful, defined bone structure.',
    characteristics: ['Strong jawline', 'Wide forehead', 'Angular features', 'Defined cheekbones'],
    idealHairstyles: ['Textured crop', 'Side part', 'Quiff', 'Pompadour'],
    idealGlasses: ['Round frames', 'Aviators', 'Oval', 'Rimless'],
  },
  Heart: {
    description:
      'Your face is wider at the forehead with a narrower, pointed chin. Romantic, youthful appearance.',
    characteristics: ['Wide forehead', 'Narrow chin', 'High cheekbones', 'Pointed jaw'],
    idealHairstyles: [
      'Side-swept fringe',
      'Medium length with texture',
      'Textured waves',
      'Low taper fade',
    ],
    idealGlasses: ['Bottom-heavy frames', 'Round', 'Light-colored', 'Rimless'],
  },
  Oblong: {
    description:
      'Your face is noticeably longer than it is wide, with a straight cheek line. Elegant, elongated features.',
    characteristics: [
      'Longer than wide',
      'Straight cheek line',
      'Narrow jaw and forehead',
      'High forehead',
    ],
    idealHairstyles: [
      'Volume on sides',
      'Fringe/bangs',
      'Textured medium length',
      'Crops with width',
    ],
    idealGlasses: ['Oversized', 'Round', 'Square', 'Decorative temples'],
  },
  Diamond: {
    description:
      'Your face is widest at the cheekbones with a narrow forehead and chin. Striking, angular features.',
    characteristics: ['Narrow forehead', 'Wide cheekbones', 'Narrow chin', 'Angular jaw'],
    idealHairstyles: ['Fringe/side-swept', 'Textured crop', 'Medium length', 'Messy styles'],
    idealGlasses: ['Oval frames', 'Rimless', 'Cat-eye', 'Aviators'],
  },
  Triangle: {
    description: 'Your face is wider at the jaw than at the forehead. Strong, grounded features.',
    characteristics: ['Narrow forehead', 'Wide jaw', 'Strong chin', 'Prominent lower face'],
    idealHairstyles: ['Volume on top', 'Quiff', 'Pompadour', 'Side part with height'],
    idealGlasses: ['Top-heavy frames', 'Browline', 'Cat-eye', 'Colorful frames'],
  },
};

function getStyleProfile(
  shape: string,
  scores: { symmetry: number | null; jawline: number | null; cheekbone: number | null },
): string {
  const { symmetry, jawline, cheekbone } = scores;

  // Each branch only fires on measured values — an unavailable metric never
  // fabricates a profile, it falls through to the neutral descriptor.
  if (jawline != null && cheekbone != null && jawline >= 8 && cheekbone >= 8)
    return 'Rugged Elegance';
  if (symmetry != null && jawline != null && symmetry >= 8.5 && jawline >= 7)
    return 'Classic Handsome';
  if (cheekbone != null && symmetry != null && cheekbone >= 8 && symmetry >= 7)
    return 'Editorial Sharp';
  if (jawline != null && symmetry != null && jawline >= 7 && symmetry >= 6)
    return 'Strong Structured';
  if (shape === 'Heart' && symmetry != null && symmetry >= 7) return 'Romantic Lead';
  if (shape === 'Oval' && symmetry != null && symmetry >= 7.5) return 'Versatile Classic';
  if (shape === 'Square') return 'Bold Masculine';
  if (shape === 'Diamond') return 'Angular Maverick';
  return 'Everyman Appeal';
}

const nullResult = (): MetricResult => ({ score: null, confidence: 0 });

export function computeFaceMetrics(
  result: FaceLandmarkerResult,
  view: 'front' | 'profile' = 'front',
): FaceMetricScores {
  const shapeResult = getFacialShape(result);

  // Try raw geometry engine first (single source of truth)
  const rawGeo = computeRawGeometry(result, view);

  const measurementToResult = (
    meas: import('./face-analyzer').Measurement | undefined,
  ): MetricResult => {
    if (!meas || meas.confidence <= 0 || meas.status !== 'valid')
      return { score: null, confidence: 0, rawValue: meas?.raw };
    if (!Number.isFinite(meas.z)) return { score: null, confidence: 0, rawValue: meas?.raw };
    // Convert z-score to 0-10 scale using rangeScore
    const score = rangeScore(meas.z);
    return { score: Math.round(score * 10) / 10, confidence: meas.confidence, rawValue: meas.raw };
  };

  if (rawGeo) {
    return {
      symmetry: measurementToResult(rawGeo.symmetry),
      proportions: measurementToResult(rawGeo.verticalBalance),
      jawline: measurementToResult(rawGeo.jawRatio),
      eyeSpacing: measurementToResult(rawGeo.eyeSpacing),
      eyeAspectRatio: measurementToResult(rawGeo.eyeAspectRatio),
      goldenRatio: measurementToResult(rawGeo.goldenRatio),
      lipFullness: measurementToResult(rawGeo.lipFullness),
      noseProfile: measurementToResult(rawGeo.noseWidthRatio),
      cheekboneDefinition: measurementToResult(rawGeo.cheekboneDefinition),
      fwhr: measurementToResult(rawGeo.fwhr),
      canthalTilt: measurementToResult(rawGeo.canthalTilt),
      eyeTilt: measurementToResult(rawGeo.eyeTilt),
      browTilt: measurementToResult(rawGeo.browTilt),
      browLengthRatio: measurementToResult(rawGeo.browLengthRatio),
      eyeNoseRatio: measurementToResult(rawGeo.eyeNoseRatio),
      noseChinRatio: measurementToResult(rawGeo.noseChinRatio),
      horizontalFifths: measurementToResult(rawGeo.horizontalFifths),
      noseProjection: measurementToResult(rawGeo.noseProjection),
      noseBridgeAngle: measurementToResult(rawGeo.noseBridgeAngle),
      alarAngle: measurementToResult(rawGeo.alarAngle),
      lipWidthRatio: measurementToResult(rawGeo.lipWidthRatio),
      upperLipRatio: measurementToResult(rawGeo.upperLipRatio),
      facialShape: rawGeo?.faceShape.primary ?? shapeResult.primary,
      faceShapeProbabilities: rawGeo?.faceShape.probabilities ?? shapeResult.probabilities,
    };
  }
  return {
    symmetry: nullResult(),
    proportions: nullResult(),
    jawline: nullResult(),
    eyeSpacing: nullResult(),
    eyeAspectRatio: nullResult(),
    goldenRatio: nullResult(),
    lipFullness: nullResult(),
    noseProfile: nullResult(),
    cheekboneDefinition: nullResult(),
    fwhr: nullResult(),
    canthalTilt: nullResult(),
    eyeTilt: nullResult(),
    browTilt: nullResult(),
    browLengthRatio: nullResult(),
    eyeNoseRatio: nullResult(),
    noseChinRatio: nullResult(),
    horizontalFifths: nullResult(),
    noseProjection: nullResult(),
    noseBridgeAngle: nullResult(),
    alarAngle: nullResult(),
    lipWidthRatio: nullResult(),
    upperLipRatio: nullResult(),
    facialShape: shapeResult.primary,
    faceShapeProbabilities: shapeResult.probabilities,
  };
}

export interface BuildOptions {
  photoQualityScore?: number | null;
  consistencyScore?: number;
  analysisConfidence?: number;
  photoCount?: number;
  /**
   * Precomputed raw geometry to use verbatim. Supplied by mergeFaceScores when
   * a multi-photo session merges a frontal sample with a side-profile sample —
   * the merged geometry replaces frontal values with the profile nasal
   * measurements so nasal metrics become measurable from a profile shot.
   */
  rawGeometry?: RawGeometry;
}

export function buildFaceScoreFromMetrics(
  metrics: FaceMetricScores,
  skinClarityScore: number | null,
  options: BuildOptions = {},
  sourceResult?: FaceLandmarkerResult,
  profile: AnalysisProfile = 'neutral',
  youthfulnessOverride?: number | null,
  structureProfileOverride?: StructureProfileType | null,
): FaceScoreResult {
  const {
    photoQualityScore,
    consistencyScore: consistencyScoreIn,
    analysisConfidence: analysisConfidenceIn,
    photoCount = 1,
    rawGeometry: rawGeometryIn,
  } = options;

  const weights = weightsForProfile(profile);

  const {
    symmetry,
    proportions,
    jawline,
    eyeSpacing,
    goldenRatio,
    lipFullness,
    noseProfile,
    cheekboneDefinition,
    fwhr,
    canthalTilt,
    eyeNoseRatio,
    noseChinRatio,
    horizontalFifths,
    noseProjection,
    lipWidthRatio,
    upperLipRatio,
    noseBridgeAngle,
    eyeTilt,
    facialShape,
    faceShapeProbabilities,
  } = metrics;

  // Compute raw geometry from landmarks (single source of truth). This must
  // happen before we derive the display raws below so we never fall back to
  // the legacy getters (getRawCanthalTilt etc.), which use an inconsistent
  // angle convention that flips one eye into ~90° (the "89.4°" bug). When a
  // merged rawGeometry (frontal base + profile nasal override) is passed in
  // options, use it verbatim.
  const rawGeometry =
    rawGeometryIn ?? (sourceResult ? computeRawGeometry(sourceResult) : undefined);

  // Raw geometry for display is gated on the measurement being VALID: an
  // unavailable metric (e.g. every frontal metric on a profile-only run, where
  // computeRawGeometry sets raw:0/conf:0) used to display "Ratio 0.00" as if
  // that were a real reading. Show the raw number only when we actually made
  // the measurement.
  const rawFwhr =
    rawGeometry && rawGeometry.fwhr.status === 'valid' ? rawGeometry.fwhr.raw : undefined;
  const rawCanthalTilt =
    rawGeometry && rawGeometry.canthalTilt.status === 'valid'
      ? rawGeometry.canthalTilt.raw
      : undefined;
  const rawEyeNoseRatio =
    rawGeometry && rawGeometry.eyeNoseRatio.status === 'valid'
      ? rawGeometry.eyeNoseRatio.raw
      : undefined;

  const rawMetricScores: Record<string, MetricResult> = {
    symmetry,
    proportions,
    jawline,
    eyeSpacing,
    goldenRatio,
    lipFullness,
    noseProfile,
    cheekboneDefinition,
    fwhr,
    canthalTilt,
    eyeNoseRatio,
    noseChinRatio,
    horizontalFifths,
    noseProjection,
    lipWidthRatio,
    upperLipRatio,
    noseBridgeAngle,
    eyeTilt,
  };

  const LABEL_TO_KEY: Record<string, string> = {
    'Facial Symmetry': 'symmetry',
    'Golden Ratio Adherence': 'goldenRatio',
    'Jawline Definition': 'jawline',
    'Proportional Harmony': 'proportions',
    'Eye Spacing': 'eyeSpacing',
    'Texture Uniformity': 'skinClarity',
    'Cheekbone Definition': 'cheekboneDefinition',
    'FWHR (Facial Width-to-Height)': 'fwhr',
    'Canthal Tilt': 'canthalTilt',
    'Horizontal Fifths': 'horizontalFifths',
    'Eye–Nose Ratio': 'eyeNoseRatio',
    'Nose–Chin Balance': 'noseChinRatio',
    'Lip Proportion': 'lipFullness',
    'Nose Profile': 'noseProfile',
    'Nose Projection': 'noseProjection',
    'Lip Width Ratio': 'lipWidthRatio',
    'Upper Lip Ratio': 'upperLipRatio',
    'Nose Bridge Angle': 'noseBridgeAngle',
    'Eye Tilt': 'eyeTilt',
  };

  const KEY_TO_LABEL: Record<string, string> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    KEY_TO_LABEL[key] = label;
  }

  // Only measured metrics contribute percentiles and weights. An unavailable
  // aspect (score === null) is omitted entirely — it never gets a synthetic
  // "50th percentile" placeholder.
  const metricPercentiles: Record<string, number> = {};
  const weightMap: Record<string, number> = {};
  const metricScores: Record<string, number | null> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    const score =
      key === 'skinClarity' ? skinClarityScore : ((rawMetricScores[key] as MetricResult)?.score ?? null);
    if (score == null) continue;
    metricPercentiles[label] = scoreToPercentile(score);
    metricScores[label] = Math.round(score * 10) / 10;
    weightMap[label] =
      key === 'skinClarity' ? weights.skinClarity : ((weights as Record<string, number>)[key] ?? 0);
  }

  let availableWeight = 0;
  let weightedSum = 0;
  const availableMetrics: string[] = [];

  for (const [label, pct] of Object.entries(metricPercentiles)) {
    const w = weightMap[label] ?? 0;
    if (w <= 0) continue;
    weightedSum += pct * w;
    availableWeight += w;
    availableMetrics.push(label);
  }

  // ── Face Profile ──
  // (rawGeometry is computed above — single source of truth)

  // Compute domain scores from raw geometry
  const faceProfile = rawGeometry
    ? computeDomainScores(rawGeometry, skinClarityScore, photoQualityScore ?? null)
    : undefined;

  // Overall score: weighted average of measured domains only. A domain with no
  // valid measurement is excluded (never counted as a shameful 0), and when
  // nothing at all could be measured the Face IQ is `null` — the UI renders it
  // as "not measured" instead of a fabricated middle number.
  const domainEntries: { value: number; weight: number }[] = [];
  if (faceProfile) {
    const domains: [keyof typeof DOMAIN_WEIGHTS, number | null][] = [
      ['geometry', faceProfile.geometry],
      ['symmetry', faceProfile.symmetry],
      ['structure', faceProfile.structure],
      ['eyes', faceProfile.eyes],
      ['nasal', faceProfile.nasal],
    ];
    for (const [key, value] of domains) {
      if (value != null) domainEntries.push({ value, weight: DOMAIN_WEIGHTS[key] });
    }
  } else if (availableWeight > 0) {
    domainEntries.push({
      value: weightedSum / availableWeight,
      weight: 1,
    });
  }
  const faceIQ =
    domainEntries.length === 0
      ? null
      : Math.round(
          Math.max(
            0,
            Math.min(
              100,
              domainEntries.reduce((sum, d) => sum + d.value * d.weight, 0) /
                domainEntries.reduce((sum, d) => sum + d.weight, 0),
            ),
          ),
        );

  const { grade, label: gradeLabel, comparison } = computeFaceIQ(metricPercentiles, weightMap);

  // Confidence reflects how many of the measurable aspects actually resolved.
  const totalMetrics = Object.keys(LABEL_TO_KEY).length;
  const computedMetrics = availableMetrics.length;
  const analysisConfidence =
    analysisConfidenceIn ?? Math.round((computedMetrics / totalMetrics) * 100);

  const structureProfile = structureProfileOverride ?? null;
  const youthfulness = youthfulnessOverride ?? null;

  const facialHarmony = (() => {
    const harmonyComponents: number[] = [];
    if (goldenRatio.score !== null) harmonyComponents.push(goldenRatio.score);
    if (horizontalFifths.score !== null) harmonyComponents.push(horizontalFifths.score);
    if (proportions.score !== null) harmonyComponents.push(proportions.score);
    if (noseProjection.score !== null && upperLipRatio.score !== null) {
      harmonyComponents.push((noseProjection.score + upperLipRatio.score) / 2);
    }
    if (eyeNoseRatio.score !== null && noseChinRatio.score !== null) {
      harmonyComponents.push((eyeNoseRatio.score + noseChinRatio.score) / 2);
    }
    // No measurable harmony component → null (displayed as "not measured"),
    // never a fabricated middle score.
    return harmonyComponents.length > 0
      ? harmonyComponents.reduce((a, b) => a + b, 0) / harmonyComponents.length
      : null;
  })();

  const highTip = (m: MetricResult, good: string, bad: string): string =>
    m.score != null && m.score >= 7 ? good : bad;

  const metricDefs: Omit<FacialMetric, 'score' | 'rating' | 'spread'>[] = [
    {
      label: 'Facial Symmetry',
      weight: weights.symmetry,
      description:
        'Balance between left and right sides of your face. Measured by comparing 10 bilateral landmark pairs against the nose centerline.',
      tip: highTip(
        symmetry,
        'Your symmetry is a major asset — highlight it with centered hairstyles.',
        'Strategic eyebrow grooming and asymmetric hairstyles can enhance perceived balance.',
      ),
    },
    {
      label: 'Golden Ratio Adherence',
      weight: weights.goldenRatio,
      description:
        'How closely your facial proportions match the φ (1.618) ideal. Measures face width-to-length and mouth-to-face-width ratios.',
      tip: highTip(
        goldenRatio,
        'Your proportions are mathematically harmonious — a rare trait.',
        'Most faces deviate from φ. Your unique ratios give character — lean into it.',
      ),
    },
    {
      label: 'Jawline Definition',
      weight: weights.jawline,
      description:
        'Multi-factor jawline analysis: jaw-to-face ratio, gonial angle sharpness, mandibular taper, chin projection, and jaw symmetry.',
      tip: highTip(
        jawline,
        'Your jawline is a defining feature. Keep it clean and well-groomed.',
        'Angular beard styles (Van Dyke, Anchor) can create the illusion of a sharper jawline.',
      ),
    },
    {
      label: 'Proportional Harmony',
      weight: weights.proportions,
      description:
        'How evenly your face divides into upper, middle, and lower thirds. The ideal is equal thirds.',
      tip: highTip(
        proportions,
        'Your thirds are well-balanced — most hairstyles will suit you.',
        'Hairstyles that add volume to underrepresented thirds can create better visual balance.',
      ),
    },
    {
      label: 'Horizontal Fifths',
      weight: weights.horizontalFifths,
      description:
        'The face ideally divides into five equal widths: two eye bands, the intercanthal gap, and two outer bands.',
      tip: highTip(
        horizontalFifths,
        'Your eye placement is balanced across the face width.',
        'Strategic eye makeup/eyebrow shaping can optically adjust perceived eye band widths.',
      ),
    },
    {
      label: 'Eye Spacing',
      weight: weights.eyeSpacing,
      description:
        'Interpupillary distance relative to eye width. Ideal spacing is approximately one eye-width apart.',
      tip: highTip(
        eyeSpacing,
        'Your eye spacing is ideal for most eyewear and makeup styles.',
        'Glasses with wider frames can create the illusion of more balanced spacing.',
      ),
    },
    {
      label: 'Texture Uniformity',
      weight: weights.skinClarity,
      description:
        'Surface smoothness and evenness of skin tone. Measured by brightness variance across 7 facial zones.',
      tip:
        skinClarityScore != null && skinClarityScore >= 7
          ? 'Your skin texture is smooth — maintain with SPF and hydration.'
          : skinClarityScore != null
            ? 'A consistent skincare routine (cleanser, exfoliant, moisturizer, SPF) can significantly improve this.'
            : 'Skin clarity could not be assessed from this photo.',
      },
    {
      label: 'Cheekbone Definition',
      weight: weights.cheekboneDefinition,
      description:
        'Prominence of cheekbones relative to jaw width. Higher cheek-to-jaw ratios create more angular, editorial features.',
      tip: highTip(
        cheekboneDefinition,
        'Your cheekbones are a standout feature — contour and lighting will love them.',
        'Highlighting techniques and angular hairstyles can enhance perceived cheekbone height.',
      ),
    },
    {
      label: 'FWHR (Facial Width-to-Height)',
      weight: weights.fwhr,
      description:
        'Bizygomatic width over upper-lip-to-brow height. Research links a higher FWHR to perceived dominance and attractiveness in men.',
      value: rawFwhr !== undefined ? `Ratio ${rawFwhr.toFixed(2)} (ideal ≈ 1.95)` : undefined,
      tip: highTip(
        fwhr,
        'Your facial width-to-height ratio is in the researched attractive range.',
        'The ratio is partly structural; hairstyle volume and beard width subtly affect the look.',
      ),
    },
    {
      label: 'Canthal Tilt',
      weight: weights.canthalTilt,
      description:
        'Angle of the line between inner and outer eye corners. A positive tilt (outer corner slightly raised) reads as alert and attractive.',
      value:
        rawCanthalTilt !== undefined ? `${rawCanthalTilt.toFixed(1)}° (ideal ≈ +5°)` : undefined,
      tip: highTip(
        canthalTilt,
        'Your positive canthal tilt gives a naturally alert, youthful look.',
        'Eye-cream hydration and gentle brow grooming help keep the eye area looking lifted.',
      ),
    },
    {
      label: 'Eye–Nose Ratio',
      weight: weights.eyeNoseRatio,
      description:
        'Average eye width relative to nose (alar) width. Typical faces sit near ≈ 0.9; you are measured against the population distribution.',
      value: rawEyeNoseRatio !== undefined ? `Ratio ${rawEyeNoseRatio.toFixed(2)}` : undefined,
      tip: highTip(
        eyeNoseRatio,
        'Your eye-to-nose proportions are mathematically harmonious.',
        'Features work together as a whole — small deviations here read as character.',
      ),
    },
    {
      label: 'Nose–Chin Balance',
      weight: weights.noseChinRatio,
      description:
        'Nose length over facial height. The ideal nasofacial proportion centers the nose within the lower face.',
      tip: highTip(
        noseChinRatio,
        'Your nose sits in strong proportion to your face length.',
        'The nose–chin balance is structural; contouring can refine its perceived length.',
      ),
    },
    {
      label: 'Lip Proportion',
      weight: weights.lipFullness,
      description:
        'Upper-to-lower lip ratio and fullness relative to facial area. Balanced lips contribute to overall facial harmony.',
      tip: 'Your lip proportions contribute to your overall facial balance.',
    },
    {
      label: 'Nose Profile',
      weight: weights.noseProfile,
      description:
        'Nose width relative to face width, measured from the frontal view. Typical noses sit near a nose-to-face ratio of ≈ 0.26.',
      tip: 'Your nose proportions work with your facial structure for a cohesive look.',
    },
    {
      label: 'Nose Projection',
      weight: weights.noseProjection,
      description:
        'How far the nose tip protrudes. This is a 3D/profile quantity and cannot be measured from a frontal photo — it is only reported when a clear side view is supplied.',
      tip: 'Nose projection requires a profile view. From a front-facing photo it is not measured.',
    },
    {
      label: 'Lip Width Ratio',
      weight: weights.lipWidthRatio,
      description:
        'Mouth width relative to face width. A wider mouth is associated with perceived attractiveness.',
      tip: highTip(
        lipWidthRatio,
        'Your mouth width complements your facial proportions.',
        'Lip liner techniques can subtly enhance perceived mouth width.',
      ),
    },
    {
      label: 'Upper Lip Ratio',
      weight: weights.upperLipRatio,
      description:
        'Upper lip height relative to total lip height. The ideal is approximately 1/3 of total lip height.',
      tip: highTip(
        upperLipRatio,
        'Your upper lip proportion is well-balanced.',
        'Subtle lip liner on the upper lip can enhance perceived proportion.',
      ),
    },
    {
      label: 'Nose Bridge Angle',
      weight: weights.noseBridgeAngle,
      description:
        'Straightness of the nasal bridge. A reliable bridge-angle measurement needs a profile view; from a frontal photo it is not scored.',
      tip: 'Bridge straightness is best read from a profile view — good for photos.',
    },
    {
      label: 'Eye Tilt',
      weight: weights.eyeTilt,
      description:
        "Angle of the eye's long axis. A slight positive tilt (outer corner raised) reads as alert and attractive.",
      tip: highTip(
        eyeTilt,
        'Your eye tilt gives a naturally alert, youthful appearance.',
        'Upward-sweeping eyeliner can enhance perceived eye tilt.',
      ),
    },
  ];

  const breakdown: FacialMetric[] = metricDefs
    .filter((m) => {
      const key = LABEL_TO_KEY[m.label];
      return key !== 'skinClarity' && (rawMetricScores[key]?.score ?? null) != null;
    })
    .map((m) => {
      const score = metricScores[m.label];
      return {
        ...m,
        score: Math.round((score as number) * 10) / 10,
        rating: scoreToRating(metricPercentiles[m.label] / 10),
        tip: m.tip,
      };
    });

  const roundedScore =
    faceIQ == null ? null : Math.round(((faceIQ / 100) * 8 + 2) * 10) / 10;

  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const m of breakdown) {
    const pct = metricPercentiles[m.label];
    if (pct == null) continue;
    if (pct >= 80)
      strengths.push(`${m.label} (${m.score.toFixed(1)}/10) — ${scoreToRating(pct / 10)}`);
    if (pct < 40) improvements.push(`${m.label} (${m.score.toFixed(1)}/10) — ${m.tip}`);
  }

  const styleProfile = getStyleProfile(facialShape, {
    symmetry: symmetry.score,
    jawline: jawline.score,
    cheekbone: cheekboneDefinition.score,
  });

  const detailedAnalysis =
    roundedScore == null
      ? 'Could not be estimated — no reliable measurements from these photos.'
      : scoreToDetailedLabel(roundedScore);
  const blendshapes = sourceResult
    ? analyzeBlendshapes(sourceResult)
    : {
        emotion: 'Neutral',
        emotionConfidence: 0.5,
        eyeOpenness: 0.5,
        mouthOpenness: 0.3,
        browRaise: 0.5,
        smileIntensity: 0,
        headTilt: 0,
      };
  const percentile = {
    overall: faceIQ,
    symmetry: metricPercentiles['Facial Symmetry'] ?? null,
    goldenRatio: metricPercentiles['Golden Ratio Adherence'] ?? null,
    jawline: metricPercentiles['Jawline Definition'] ?? null,
    skinClarity: metricPercentiles['Texture Uniformity'] ?? null,
    harmony: metricPercentiles['Proportional Harmony'] ?? null,
    bracket: grade,
    comparisonText: comparison,
  };
  const beautyIndex = faceIQ;
  const faceShapeDetails = FACE_SHAPE_INFO[facialShape] || FACE_SHAPE_INFO.Oval;

  const roundOrNull = (v: number | null): number | null =>
    v == null ? null : Math.round(v * 10) / 10;

  return {
    overallScore: roundedScore,
    symmetry: roundOrNull(symmetry.score),
    proportions: roundOrNull(proportions.score),
    jawline: roundOrNull(jawline.score),
    eyeSpacing: roundOrNull(eyeSpacing.score),
    skinClarity: skinClarityScore == null ? null : Math.round(skinClarityScore * 10) / 10,
    facialShape,
    faceShapeProbabilities,
    goldenRatio: roundOrNull(goldenRatio.score),
    lipFullness: roundOrNull(lipFullness.score),
    noseProfile: roundOrNull(noseProfile.score),
    cheekboneDefinition: roundOrNull(cheekboneDefinition.score),
    fwhr: roundOrNull(fwhr.score),
    canthalTilt: roundOrNull(canthalTilt.score),
    eyeNoseRatio: roundOrNull(eyeNoseRatio.score),
    noseChinRatio: roundOrNull(noseChinRatio.score),
    horizontalFifths: roundOrNull(horizontalFifths.score),
    noseProjection: roundOrNull(noseProjection.score),
    lipWidthRatio: roundOrNull(lipWidthRatio.score),
    upperLipRatio: roundOrNull(upperLipRatio.score),
    noseBridgeAngle: roundOrNull(noseBridgeAngle.score),
    eyeTilt: roundOrNull(eyeTilt.score),
    rawFwhr: rawFwhr ?? null,
    rawCanthalTilt: rawCanthalTilt ?? null,
    rawEyeNoseRatio: rawEyeNoseRatio ?? null,
    facialHarmony: facialHarmony == null ? null : Math.round(facialHarmony * 10) / 10,
    breakdown,
    overallRating: gradeLabel ?? 'Not Measured',
    detailedAnalysis,
    strengths,
    improvements,
    styleProfile,
    blendshapes,
    percentile,
    beautyIndex,
    faceShapeDetails,
    photoQualityScore:
      photoQualityScore == null ? null : Math.round(photoQualityScore * 10) / 10,
    consistencyScore:
      consistencyScoreIn !== undefined ? Math.round(consistencyScoreIn * 10) / 10 : undefined,
    analysisConfidence: Math.round(analysisConfidence),
    metricAvailability: availableMetrics,
    photoCount,
    symmetryAxis: (() => {
      const axis = sourceResult ? getFaceSymmetryAxis(sourceResult) : null;
      return axis ? { angleDeg: axis.angleDeg } : undefined;
    })(),
    faceIQ,
    grade,
    gradeLabel,
    comparison,
    structureProfile,
    youthfulness,
    metricPercentiles,
    faceProfile,
    rawGeometry: rawGeometry ?? undefined,
  };
}

export function calculateFaceScore(
  result: FaceLandmarkerResult,
  skinClarityScore: number | null,
): FaceScoreResult {
  const metrics = computeFaceMetrics(result);
  return buildFaceScoreFromMetrics(metrics, skinClarityScore, {}, result);
}

/**
 * Recomputes the Face IQ aggregate from stored per-metric scores using the
 * same population kernel as the live pipeline. Used only to backfill legacy
 * history entries that predate the FaceIQ field. Never fabricates: metrics
 * that are missing or unmeasured are omitted from the weighted average, and
 * the mean across the neutral weight table matches buildFaceScoreFromMetrics.
 */
export function recomputeFaceIQFromScores(metrics: {
  symmetry: number | null;
  goldenRatio: number | null;
  jawline: number | null;
  proportions: number | null;
  horizontalFifths: number | null;
  skinClarity: number | null;
  eyeSpacing: number | null;
  cheekboneDefinition: number | null;
  lipFullness: number | null;
  noseProfile: number | null;
  fwhr: number | null;
  canthalTilt: number | null;
  eyeNoseRatio: number | null;
  noseChinRatio: number | null;
  noseProjection: number | null;
  lipWidthRatio: number | null;
  upperLipRatio: number | null;
  noseBridgeAngle: number | null;
  eyeTilt: number | null;
}): number | null {
  const entries: [string, number | null][] = [
    ['symmetry', metrics.symmetry],
    ['goldenRatio', metrics.goldenRatio],
    ['jawline', metrics.jawline],
    ['proportions', metrics.proportions],
    ['horizontalFifths', metrics.horizontalFifths],
    ['skinClarity', metrics.skinClarity],
    ['eyeSpacing', metrics.eyeSpacing],
    ['cheekboneDefinition', metrics.cheekboneDefinition],
    ['lipFullness', metrics.lipFullness],
    ['noseProfile', metrics.noseProfile],
    ['fwhr', metrics.fwhr],
    ['canthalTilt', metrics.canthalTilt],
    ['eyeNoseRatio', metrics.eyeNoseRatio],
    ['noseChinRatio', metrics.noseChinRatio],
    ['noseProjection', metrics.noseProjection],
    ['lipWidthRatio', metrics.lipWidthRatio],
    ['upperLipRatio', metrics.upperLipRatio],
    ['noseBridgeAngle', metrics.noseBridgeAngle],
    ['eyeTilt', metrics.eyeTilt],
  ];
  let weightedSum = 0;
  let availableWeight = 0;
  for (const [key, score] of entries) {
    if (score == null || !Number.isFinite(score)) continue;
    const w = (WEIGHTS as Record<string, number>)[key] ?? 0;
    if (w <= 0) continue;
    weightedSum += scoreToPercentile(score) * w;
    availableWeight += w;
  }
  return availableWeight > 0
    ? Math.round(Math.max(0, Math.min(100, weightedSum / availableWeight)))
    : null;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - m) * (v - m), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

const MERGE_KEYS: (keyof Omit<FaceMetricScores, 'facialShape' | 'faceShapeProbabilities'>)[] = [
  'symmetry',
  'proportions',
  'jawline',
  'eyeSpacing',
  'eyeAspectRatio',
  'goldenRatio',
  'lipFullness',
  'noseProfile',
  'cheekboneDefinition',
  'fwhr',
  'canthalTilt',
  'eyeTilt',
  'browTilt',
  'browLengthRatio',
  'eyeNoseRatio',
  'noseChinRatio',
  'horizontalFifths',
  'noseProjection',
  'noseBridgeAngle',
  'alarAngle',
  'lipWidthRatio',
  'upperLipRatio',
];

/**
 * Merges per-photo metric samples into a single robust result.
 * - Each metric is the median across photos (robust to outliers).
 * - consistencyScore reflects how tightly the photos agree (lower CV = higher consistency).
 * - analysisConfidence combines photo quality and cross-photo consistency.
 */

function bestSampleOf(
  samples: FaceScoreSample[],
  wantProfile: boolean,
): FaceScoreSample | undefined {
  return [...samples]
    .filter((s) => ((s.view ?? 'front') === 'profile') === wantProfile)
    .sort((a, b) => (b.quality.score ?? -1) - (a.quality.score ?? -1))[0];
}

/**
 * Builds the merged raw geometry across views. The profile sample contributes
 * the three 3D nasal measurements (unavailable in any frontal capture); the
 * best frontal sample contributes everything else. When no frontal sample
 * exists the profile geometry is the base and only its nasal metrics survive.
 */
function buildMergedGeometry(samples: FaceScoreSample[]): RawGeometry | undefined {
  const frontal = bestSampleOf(samples, false);
  const profile = bestSampleOf(samples, true);
  const base = frontal?.sourceResult
    ? computeRawGeometry(frontal.sourceResult)
    : profile?.sourceResult
      ? computeRawGeometry(profile.sourceResult, 'profile')
      : undefined;
  if (!base) return undefined;
  const gated: RawGeometry = { ...base };
  if (profile?.sourceResult) {
    const prof = computeRawGeometry(profile.sourceResult, 'profile');
    if (prof) {
      gated.noseProjection = prof.noseProjection;
      gated.noseBridgeAngle = prof.noseBridgeAngle;
      gated.alarAngle = prof.alarAngle;
    }
  }
  return gated;
}

export function mergeFaceScores(
  samples: FaceScoreSample[],
  profile: AnalysisProfile = 'neutral',
): {
  result: FaceScoreResult;
  metricSpread: Record<string, number | null>;
} {
  const merged = {} as FaceMetricScores;
  const metricSpread: Record<string, number | null> = {};

  for (const key of MERGE_KEYS) {
    const vals = samples
      .map((s) => {
        const m = s.metrics[key];
        return m && typeof m === 'object' && 'score' in m
          ? (m as MetricResult).score
          : (m as number);
      })
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    merged[key] =
      vals.length > 0
        ? { score: median(vals), confidence: vals.length / samples.length, rawValue: undefined }
        : { score: null, confidence: 0 };
    // Spread is only meaningful with 2+ measurements to compare. The old 0
    // made a single profile-only reading (e.g. nasal metrics) look like it
    // "perfectly agreed" with itself; null is honest.
    metricSpread[key as string] = vals.length > 1 ? stddev(vals) : null;
  }

  const shapeCounts = new Map<string, number>();
  for (const s of samples) {
    // A profile photo cannot classify face shape (returns 'Unknown') and must
    // not dilute the vote.
    if ((s.view ?? 'front') === 'profile') continue;
    shapeCounts.set(s.metrics.facialShape, (shapeCounts.get(s.metrics.facialShape) || 0) + 1);
  }
  let bestShape = samples[0]?.metrics.facialShape || 'Oval';
  let bestCount = 0;
  for (const [shape, count] of shapeCounts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestShape = shape;
    }
  }
  merged.facialShape = bestShape;

  // Merge face shape probabilities: average across samples
  const mergedProbabilities: Record<string, number> = {};
  for (const s of samples) {
    for (const [shape, prob] of Object.entries(s.metrics.faceShapeProbabilities)) {
      mergedProbabilities[shape] = (mergedProbabilities[shape] || 0) + prob / samples.length;
    }
  }
  merged.faceShapeProbabilities = mergedProbabilities;

  const skinClarityValues = samples
    .map((s) => s.skinClarity)
    .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
  const skinClarity = skinClarityValues.length > 0 ? median(skinClarityValues) : null;
  const photoQualityValues = samples
    .map((s) => s.quality.score)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const photoQuality = photoQualityValues.length > 0 ? median(photoQualityValues) : null;

  const cvList = MERGE_KEYS.map((key) => {
    const vals = samples
      .map((s) => {
        const m = s.metrics[key];
        return m && typeof m === 'object' && 'score' in m
          ? (m as MetricResult).score
          : (m as number);
      })
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    // A metric measured in only one photo says nothing about consistency; a
    // metric present in NO photo must not quietly count as zero agreement.
    // Only metrics with 2+ independent readings contribute CVs, so front+profile
    // runs (which share no overlapping measurements) no longer report a
    // fabricated 10/10 cross-photo agreement.
    if (vals.length < 2) return null;
    const m = mean(vals);
    if (m === 0) return null;
    return stddev(vals) / m;
  });
  const cvValues = cvList.filter((v): v is number => v !== null);
  const consistencyScore =
    samples.length === 1 || cvValues.length < 2
      ? undefined
      : Math.round(Math.max(1, Math.min(10, 10 - mean(cvValues) * 14)) * 10) / 10;

  // Confidence = capture quality + cross-photo agreement + how frontal the
  // best captures were. A turned head makes bilateral numbers unreliable even
  // when the photo is crisp and bright — confidence has to say so. Profile
  // captures are evaluated on pitch/roll only (their yaw is the point).
  const frontality = mean(samples.map((s) => frontalityScore(s.quality, s.view ?? 'front')));
  const qualityComponent = photoQuality ?? 0;
  const analysisConfidence =
    samples.length === 1
      ? Math.round((qualityComponent * 0.6 + frontality * 0.4) * 10)
      // Multiple photos were captured, but consistencyScore stays undefined
      // when they share no 2+ measured metrics (e.g. front + profile) — fall
      // back to capture quality + frontality instead of a forced agreement.
      : consistencyScore === undefined
        ? Math.round((qualityComponent * 0.6 + frontality * 0.4) * 10)
        : Math.round(
            Math.max(
              1,
              Math.min(
                10,
                consistencyScore * 0.45 + qualityComponent * 0.35 + frontality * 0.2,
              ),
            ) * 10,
          );

  const bestSample = [...samples].sort(
    (a, b) => (b.quality.score ?? -1) - (a.quality.score ?? -1),
  )[0];

  // Merge youthfulness and structure profile across samples. If no sample
  // produced a measurement, the result stays null (rendered as "not measured")
  // instead of defaulting to a fabricated middle value. Youthfulness is a
  // frontal assessment (skin smoothness/pigmentation brightness sampled on a
  // 2D canvas): a side-profile sample is edge-lit and foreshortened, so its
  // number would drag the average toward a biased value — excluded like
  // structureProfile below.
  const youthfulnessValues = samples
    .filter((s) => (s.view ?? 'front') !== 'profile')
    .map((s) => s.youthfulness)
    .filter((v): v is number => typeof v === 'number');
  const youthfulness =
    youthfulnessValues.length > 0
      ? Math.round(youthfulnessValues.reduce((a, b) => a + b, 0) / youthfulnessValues.length)
      : null;

  const structureProfiles = samples
    .filter((s) => (s.view ?? 'front') !== 'profile')
    .map((s) => s.structureProfile)
    .filter((v): v is StructureProfileType => typeof v === 'string');
  const structureProfile =
    structureProfiles.length > 0
      ? structureProfiles.sort((a, b) => {
          const order = { Sharp: 4, Defined: 3, Balanced: 2, Soft: 1 };
          return (order[b] ?? 2) - (order[a] ?? 2);
        })[0]
      : null;

  const result = buildFaceScoreFromMetrics(
    merged,
    skinClarity,
    {
      photoQualityScore: photoQuality,
      consistencyScore,
      analysisConfidence,
      photoCount: samples.length,
      rawGeometry: buildMergedGeometry(samples),
    },
    bestSample?.sourceResult,
    profile,
    youthfulness,
    structureProfile,
  );

  result.breakdown = result.breakdown.map((m) => {
    const spreadKey = MERGE_KEYS.find((key) => {
      const label = labelForKey(key);
      return label === m.label;
    });
    if (!spreadKey) return m;
    const spread = metricSpread[spreadKey];
    if (spread === null || !Number.isFinite(spread)) return m;
    return { ...m, spread: Math.round(spread * 10) / 10 };
  });

  return { result, metricSpread };
}

function labelForKey(key: keyof FaceMetricScores): string {
  const map: Record<string, string> = {
    symmetry: 'Facial Symmetry',
    proportions: 'Proportional Harmony',
    jawline: 'Jawline Definition',
    eyeSpacing: 'Eye Spacing',
    goldenRatio: 'Golden Ratio Adherence',
    lipFullness: 'Lip Proportion',
    noseProfile: 'Nose Profile',
    cheekboneDefinition: 'Cheekbone Definition',
    fwhr: 'FWHR (Facial Width-to-Height)',
    canthalTilt: 'Canthal Tilt',
    eyeNoseRatio: 'Eye–Nose Ratio',
    noseChinRatio: 'Nose–Chin Balance',
    horizontalFifths: 'Horizontal Fifths',
    noseProjection: 'Nose Projection',
    lipWidthRatio: 'Lip Width Ratio',
    upperLipRatio: 'Upper Lip Ratio',
    noseBridgeAngle: 'Nose Bridge Angle',
    eyeTilt: 'Eye Tilt',
  };
  return map[key] || key;
}

export function getGroomingSuggestions(
  facialShape: string,
  score: FaceScoreResult,
  profile: AnalysisProfile = 'neutral',
): string[] {
  const suggestions: string[] = [];

  if (profile === 'feminine') {
    switch (facialShape) {
      case 'Round':
        suggestions.push(
          'Longer layers or a side-swept part elongate a soft face — add height at the crown',
        );
        suggestions.push('Angular or browline glasses add definition beside a rounded jawline');
        suggestions.push('Contour under the cheekbones and jaw for gentle definition');
        break;
      case 'Square':
        suggestions.push('Soft waves and textured layers soften an angular jaw beautifully');
        suggestions.push('Rounded or oval frames balance strong facial angles');
        suggestions.push(
          'Highlight the center of the face to draw the eye inward and soften edges',
        );
        break;
      case 'Heart':
        suggestions.push('Chin-length bobs and side-swept bangs balance a wider forehead');
        suggestions.push('Bottom-heavy frames (round, cat-eye) add width to a narrow chin');
        suggestions.push('Contour the temples lightly to soften forehead width');
        break;
      case 'Oval':
        suggestions.push(
          'Your balanced proportions suit most cuts — curls, sleek, or straight all work',
        );
        suggestions.push('Almost any frame shape works; experiment freely');
        suggestions.push('Keep brow arches natural — they frame your symmetry well');
        break;
      case 'Oblong':
        suggestions.push(
          'Add width with volume at the sides and soft fringe to shorten the face visually',
        );
        suggestions.push('Oversized or round frames break up vertical length elegantly');
        suggestions.push('Keep cheek contour soft and horizontal for a fuller midface');
        break;
      case 'Diamond':
        suggestions.push('Side-swept styles and textured layers soften prominent cheekbones');
        suggestions.push('Oval and rimless frames sit best beside angular features');
        suggestions.push('Highlight the brow bone and soften the cheekbone hollow');
        break;
      default:
        suggestions.push(
          'A consistent haircare routine (mask + leave-in) keeps your hair as polished as your face',
        );
        suggestions.push('Keep brows shaped and defined — the frame of the face');
    }
  } else {
    switch (facialShape) {
      case 'Round':
        suggestions.push('Van Dyke or Anchor beard — adds angular definition to soft jawline');
        suggestions.push('Short sides + textured top hairstyle adds vertical length');
        suggestions.push(
          'Avoid chin curtains and full rounded beards that emphasize circular shape',
        );
        suggestions.push(
          'Clean-shaven or light stubble on cheeks with defined chin hair works best',
        );
        break;
      case 'Square':
        suggestions.push('Short, well-groomed stubble complements your naturally strong jaw');
        suggestions.push('Textured crop or classic side part enhances angular bone structure');
        suggestions.push('Avoid overly long beards — they mask your best feature (the jaw)');
        suggestions.push('A light goatee or soul patch adds character without hiding structure');
        break;
      case 'Heart':
        suggestions.push('Chin-focused styles (goatee, circle beard) balance your wider forehead');
        suggestions.push('Side-swept fringe or textured bangs soften the forehead line');
        suggestions.push('Fuller lower-face beards create visual balance with your forehead');
        suggestions.push('Avoid heavy sideburns that widen the upper face further');
        break;
      case 'Oval':
        suggestions.push(
          'Most styles work with your balanced proportions — you have freedom to experiment',
        );
        suggestions.push('Classic full beard or well-maintained stubble both suit you');
        suggestions.push('Side parts and swept-back styles maintain your natural symmetry');
        suggestions.push('This is the most versatile face shape — use it to try trending styles');
        break;
      case 'Oblong':
        suggestions.push('Fuller beards on the sides add width and shorten the face visually');
        suggestions.push('Avoid height in hairstyles — opt for volume on the sides');
        suggestions.push('Cheek-focused beards and sideburns balance facial length');
        suggestions.push('Medium-length styles with horizontal lines work well');
        break;
      case 'Diamond':
        suggestions.push('Chin straps and goatees complement a narrow chin');
        suggestions.push('Fringe or side-swept styles soften wider cheekbones');
        suggestions.push(
          'Full beards add volume to the chin area, balancing the cheekbone prominence',
        );
        suggestions.push('Textured, messy styles work better than slick, tight ones');
        break;
      default:
        suggestions.push('Maintain regular grooming routine for best appearance');
        suggestions.push('Keep beard edges clean and defined for a polished look');
    }
  }

  if (score.skinClarity != null && score.skinClarity < 6) {
    suggestions.push('Skincare priority: Start with a daily cleanser + SPF 30 moisturizer');
    suggestions.push('Exfoliate 2x/week. Drink 2-3L water daily. Sleep 7+ hours.');
    suggestions.push('Consider niacinamide for pore refinement and vitamin C for brightening');
  } else if (score.skinClarity != null && score.skinClarity < 7.5) {
    suggestions.push('Good skin foundation — add retinol 2x/week for texture refinement');
  }

  if (score.symmetry != null && score.symmetry < 7) {
    suggestions.push('Eyebrow shaping can dramatically improve perceived facial symmetry');
    suggestions.push('Consider professional eyebrow threading or mapping for optimal arch');
  }

  if (score.jawline != null && score.jawline < 6) {
    if (profile === 'feminine') {
      suggestions.push(
        'Facial massage and chin-tuck exercises can subtly refine jawline definition',
      );
      suggestions.push('A soft highlight above the cheekbone lifts the whole lower face visually');
    } else {
      suggestions.push('Chew gum daily to strengthen masseter muscles and define jawline');
      suggestions.push('Neck exercises (chin tucks, jaw juts) can improve jawline visibility');
    }
  }

  if (score.canthalTilt != null && score.canthalTilt < 6) {
    suggestions.push(
      'Eye-area hydration and gentle under-eye massage help keep the eye area looking lifted',
    );
    suggestions.push('Winged liner or subtle eyeshadow can optically increase canthal tilt');
  }

  if (profile !== 'feminine') {
    suggestions.push('Trim beard edges every 2-3 weeks for maintained sharpness');
    suggestions.push('Use beard oil daily — argan or jojoba base for healthy, conditioned hair');
    suggestions.push('Match beard length to face shape: shorter for round, longer for long faces');
  }

  return suggestions;
}
