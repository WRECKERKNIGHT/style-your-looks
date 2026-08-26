import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { createUprightAccessor } from "./face-geometry";
import { rangeScore, toZScore, idealScore } from "./scoring-curves";
import {
  getFaceSymmetry,
  getFaceSymmetryAxis,
  getFaceProportions,
  getJawlineScore,
  getEyeSpacingScore,
  getFacialShape,
  getFwhrScore,
  getRawFwhr,
  getCanthalTiltScore,
  getRawCanthalTilt,
  getHorizontalFifthsScore,
  getEyeNoseRatioScore,
  getRawEyeNoseRatio,
  getNoseChinRatioScore,
  getStructureProfile,
  getYouthfulness,
  getNoseProjectionScore,
  getLipWidthRatioScore,
  getUpperLipRatioScore,
  getNoseBridgeAngleScore,
  getEyeTiltScore,
  type StructureProfileType,
  computeRawGeometry,
  type Measurement,
  type RawGeometry,
} from "./face-analyzer";
import type { PhotoQualityReport } from "./face-quality";
import { frontalityScore } from "./face-quality";
import {
  scoreToPercentile,
  computeFaceIQ,
  gradeFromPercentile,
  comparisonFromPercentile,
  percentileFromZ,
  zScore,
  resolveRef,
  type EthnicRegion,
} from "./calibration";

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
  overall: number;
  symmetry: number;
  goldenRatio: number;
  jawline: number;
  skinClarity: number;
  harmony: number;
  bracket: string;
  comparisonText: string;
}

export interface FaceScoreResult {
  overallScore: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyeSpacing: number;
  skinClarity: number;
  facialShape: string;
  faceShapeProbabilities: Record<string, number>;
  goldenRatio: number;
  lipFullness: number;
  noseProfile: number;
  cheekboneDefinition: number;
  fwhr: number;
  canthalTilt: number;
  eyeNoseRatio: number;
  noseChinRatio: number;
  horizontalFifths: number;
  noseProjection: number;
  lipWidthRatio: number;
  upperLipRatio: number;
  noseBridgeAngle: number;
  eyeTilt: number;
  rawFwhr: number;
  rawCanthalTilt: number;
  rawEyeNoseRatio: number;
  facialHarmony: number;
  breakdown: FacialMetric[];
  overallRating: string;
  detailedAnalysis: string;
  strengths: string[];
  improvements: string[];
  styleProfile: string;
  blendshapes: BlendshapeAnalysis;
  percentile: PercentileRanking;
  beautyIndex: number;
  faceShapeDetails: { description: string; characteristics: string[]; idealHairstyles: string[]; idealGlasses: string[] };
  photoQualityScore: number;
  consistencyScore?: number;
  analysisConfidence: number;
  metricAvailability: string[];
  photoCount: number;
  /** Pose-aware symmetry axis tilt (degrees from vertical) for overlays. */
  symmetryAxis?: { angleDeg: number };
  /** Population-calibrated Face IQ (0-100). Higher = more rare/attractive. */
  faceIQ: number;
  /** Letter grade from percentile. */
  grade: string;
  /** Descriptive label for the grade. */
  gradeLabel: string;
  /** Human-readable comparison. */
  comparison: string;
  /** Structure profile descriptor (Soft/Balanced/Defined/Sharp). */
  structureProfile: StructureProfileType;
  /** Youthfulness score (0-100). */
  youthfulness: number;
  /** Per-metric percentiles for distribution bars. */
  metricPercentiles: Record<string, number>;
  /** Domain-level scores (new architecture). */
  domainScores?: DomainScores;
  /** Raw geometry measurements (for measurement debugger). */
  rawGeometry?: RawGeometry;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN-BASED SCORING
//
// Instead of averaging 18 overlapping metrics, group into independent domains:
//   Proportion (25%): vertical thirds, horizontal fifths, golden ratio, FWHR
//   Symmetry   (20%): bilateral symmetry
//   Structure  (20%): jaw geometry, cheekbone, chin
//   Features   (20%): eyes, nose, lips (non-overlapping)
//   Quality    (15%): skin clarity, photo quality
//
// Each domain is scored 0-10 using rangeScore(z) on its constituent measurements.
// Face IQ is a weighted average of domain scores.
// ─────────────────────────────────────────────────────────────────────────────

export interface DomainScores {
  proportion: number;
  symmetry: number;
  structure: number;
  features: number;
  quality: number;
  faceIQ: number;
}

const DOMAIN_WEIGHTS = {
  proportion: 0.25,
  symmetry:   0.20,
  structure:  0.20,
  features:   0.20,
  quality:    0.15,
};

function domainScore(measurements: Measurement[]): number {
  const valid = measurements.filter(m => m.confidence > 0 && Number.isFinite(m.z));
  if (valid.length === 0) return 5;
  const avg = valid.reduce((sum, m) => sum + rangeScore(m.z), 0) / valid.length;
  return Math.round(Math.max(0, Math.min(10, avg)) * 10) / 10;
}

function computeDomainScores(
  geo: RawGeometry,
  skinClarity: number,
  photoQuality: number
): DomainScores {
  const proportion = domainScore([
    geo.verticalBalance,
    geo.horizontalFifths,
    geo.goldenRatio,
    geo.fwhr,
  ]);

  const symmetryScore = domainScore([geo.symmetry]);

  const structure = domainScore([
    geo.jawRatio,
    geo.gonialAngle,
    geo.mandibularTaper,
    geo.chinProjection,
    geo.jawSymmetry,
    geo.cheekboneDefinition,
  ]);

  const features = domainScore([
    geo.eyeSpacing,
    geo.canthalTilt,
    geo.eyeTilt,
    geo.noseWidthRatio,
    geo.noseChinRatio,
    geo.noseProjection,
    geo.noseBridgeAngle,
    geo.lipFullness,
    geo.lipWidthRatio,
    geo.upperLipRatio,
  ]);

  // Quality: skin clarity (0-10) + photo quality (0-10), normalized
  const qSkin   = Math.max(0, Math.min(10, skinClarity));
  const qPhoto  = Math.max(0, Math.min(10, photoQuality));
  const quality = Math.round((qSkin * 0.6 + qPhoto * 0.4) * 10) / 10;

  const faceIQ = Math.round(Math.max(0, Math.min(10,
    proportion * DOMAIN_WEIGHTS.proportion +
    symmetryScore * DOMAIN_WEIGHTS.symmetry +
    structure * DOMAIN_WEIGHTS.structure +
    features * DOMAIN_WEIGHTS.features +
    quality * DOMAIN_WEIGHTS.quality
  )) * 10) / 10;

  return { proportion, symmetry: symmetryScore, structure, features, quality, faceIQ };
}

export interface FaceMetricScores {
  symmetry: MetricResult;
  proportions: MetricResult;
  jawline: MetricResult;
  eyeSpacing: MetricResult;
  goldenRatio: MetricResult;
  lipFullness: MetricResult;
  noseProfile: MetricResult;
  cheekboneDefinition: MetricResult;
  fwhr: MetricResult;
  canthalTilt: MetricResult;
  eyeNoseRatio: MetricResult;
  noseChinRatio: MetricResult;
  horizontalFifths: MetricResult;
  noseProjection: MetricResult;
  lipWidthRatio: MetricResult;
  upperLipRatio: MetricResult;
  noseBridgeAngle: MetricResult;
  eyeTilt: MetricResult;
  facialShape: string;
  faceShapeProbabilities: Record<string, number>;
}

export interface FaceScoreSample {
  metrics: FaceMetricScores;
  skinClarity: number;
  quality: PhotoQualityReport;
  sourceResult?: FaceLandmarkerResult;
  youthfulness?: number;
  structureProfile?: StructureProfileType;
}

function scoreToRating(score: number): string {
  if (score >= 9.5) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 7.5) return "Very Good";
  if (score >= 6.5) return "Good";
  if (score >= 5.5) return "Above Average";
  if (score >= 4.5) return "Average";
  if (score >= 3.5) return "Below Average";
  return "Needs Work";
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

function getGoldenRatio(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const U = createUprightAccessor(landmarks);
  const leftEye = U.pt(33);
  const rightEye = U.pt(263);
  const chin = U.pt(152);
  const top = U.pt(10);
  const leftMouth = U.pt(61);
  const rightMouth = U.pt(291);
  if (!leftEye || !rightEye || !chin || !top || !leftMouth || !rightMouth) return 5;

  const faceWidth = Math.abs(rightEye.x - leftEye.x);
  const faceLength = Math.hypot(chin.x - top.x, chin.y - top.y);
  if (faceWidth === 0 || faceLength === 0) return 5;
  const widthToLength = faceWidth / faceLength;

  const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
  const mouthToFaceWidth = mouthWidth / faceWidth;

  const idealRatio = 0.618;
  // φ adherence blends width-to-length (heavily) with mouth-to-width.
  const wtl = idealScore(widthToLength, idealRatio, 0.05, 1, 10);
  const mtw = idealScore(mouthToFaceWidth, 0.6, 0.04, 1, 10);
  return Math.max(1, Math.min(10, Math.round((wtl * 0.65 + mtw * 0.35) * 100) / 100));
}

function getLipFullness(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  // Vertical measurement — upright frame keeps it honest under head tilt.
  const U = createUprightAccessor(landmarks);
  const upperLip = U.pt(13);
  const lowerLip = U.pt(14);
  const mouthTop = U.pt(0);
  const mouthBottom = U.pt(17);
  if (!upperLip || !lowerLip || !mouthTop || !mouthBottom) return 5;

  const lipHeight = Math.abs(lowerLip.y - upperLip.y);
  const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
  if (mouthHeight === 0) return 5;
  const ratio = lipHeight / mouthHeight;

  const idealRatio = 0.55;
  return idealScore(ratio, idealRatio, 0.08, 2, 9.5);
}

function getNoseProfile(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 478) return 5;

  const U = createUprightAccessor(landmarks);
  const ln = U.pt(458);
  const rn = U.pt(468);
  const lc = U.pt(234);
  const rc = U.pt(454);
  if (!ln || !rn || !lc || !rc) return 5;

  const noseWidth = Math.abs(rn.x - ln.x);
  const faceWidth = Math.abs(rc.x - lc.x);
  if (faceWidth === 0 || noseWidth === 0) return 5;
  const noseToFace = noseWidth / faceWidth;

  const idealNoseRatio = 0.28;
  return idealScore(noseToFace, idealNoseRatio, 0.03, 2, 9.5);
}

function getForeheadBalance(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const U = createUprightAccessor(landmarks);
  const hairline = U.pt(10);
  const browLine = U.pt(9);
  const noseBase = U.pt(2);
  const chin = U.pt(152);
  if (!hairline || !browLine || !noseBase || !chin) return 5;

  const upperThird = Math.abs(browLine.y - hairline.y);
  const middleThird = Math.abs(noseBase.y - browLine.y);
  const lowerThird = Math.abs(chin.y - noseBase.y);

  const avg = (upperThird + middleThird + lowerThird) / 3;
  if (avg === 0) return 5;
  const deviation =
    (Math.abs(upperThird - avg) + Math.abs(middleThird - avg) + Math.abs(lowerThird - avg)) /
    (avg * 3);

  return idealScore(deviation, 0, 0.035, 2, 10);
}

function getCheekboneDefinition(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const U = createUprightAccessor(landmarks);
  const leftCheek = U.pt(234);
  const rightCheek = U.pt(454);
  const leftJaw = U.pt(172);
  const rightJaw = U.pt(397);
  if (!leftCheek || !rightCheek || !leftJaw || !rightJaw) return 5;

  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const jawWidth = Math.abs(rightJaw.x - leftJaw.x);
  if (jawWidth === 0 || cheekWidth === 0) return 5;
  const cheekToJaw = cheekWidth / jawWidth;

  // High cheek-to-jaw ratios read angular/editorial; mode ≈ 1.07.
  return idealScore(cheekToJaw, 1.07, 0.05, 2, 9.5);
}

function analyzeBlendshapes(result: FaceLandmarkerResult): BlendshapeAnalysis {
  const blendshapes = result.faceBlendshapes?.[0]?.categories;
  if (!blendshapes || blendshapes.length === 0) {
    return {
      emotion: "Neutral",
      emotionConfidence: 0.5,
      eyeOpenness: 0.5,
      mouthOpenness: 0.3,
      browRaise: 0.5,
      smileIntensity: 0,
      headTilt: 0,
    };
  }

  const findShape = (name: string) =>
    blendshapes.find((s) => s.categoryName.toLowerCase().includes(name.toLowerCase()))?.score ?? 0;

  const smileLeft = findShape("smileLeft");
  const smileRight = findShape("smileRight");
  const smileIntensity = (smileLeft + smileRight) / 2;

  const eyeBlinkLeft = findShape("eyeBlinkLeft");
  const eyeBlinkRight = findShape("eyeBlinkRight");
  const eyeOpenness = 1 - (eyeBlinkLeft + eyeBlinkRight) / 2;

  const jawOpen = findShape("jawOpen");
  const mouthPucker = findShape("mouthPucker");
  const mouthOpenness = (jawOpen + mouthPucker) / 2;

  const browInnerUp = findShape("browInnerUp");
  const browOuterUpLeft = findShape("browOuterUpLeft");
  const browOuterUpRight = findShape("browOuterUpRight");
  const browRaise = (browInnerUp + browOuterUpLeft + browOuterUpRight) / 3;

  const eyeSquintLeft = findShape("eyeSquintLeft");
  const eyeSquintRight = findShape("eyeSquintRight");
  const browDownLeft = findShape("browDownLeft");
  const browDownRight = findShape("browDownRight");
  const cheekSquint = (eyeSquintLeft + eyeSquintRight) / 2;

  let emotion = "Neutral";
  let emotionConfidence = 0.4;

  const emotionScores: [string, number][] = [
    ["Happy", smileIntensity * 0.8 + (1 - browDownLeft - browDownRight) * 0.2],
    ["Surprised", browRaise * 0.6 + eyeOpenness * 0.3 + jawOpen * 0.1],
    ["Angry", ((browDownLeft + browDownRight) / 2) * 0.5 + cheekSquint * 0.3 + (1 - smileIntensity) * 0.2],
    ["Sad", browInnerUp * 0.4 + (1 - smileIntensity) * 0.3 + (1 - eyeOpenness) * 0.3],
    ["Fearful", browRaise * 0.4 + eyeOpenness * 0.3 + jawOpen * 0.3],
    ["Disgusted", ((browDownLeft + browDownRight) / 2) * 0.3 + mouthPucker * 0.4 + cheekSquint * 0.3],
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
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  if (score >= 6) return "Good";
  if (score >= 5) return "Above Average";
  if (score >= 4) return "Average";
  if (score >= 3) return "Below Average";
  return "Needs Work";
}

const WEIGHTS = {
  symmetry: 0.13,
  goldenRatio: 0.11,
  jawline: 0.11,
  proportions: 0.06,
  horizontalFifths: 0.03,
  skinClarity: 0.10,
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

export type AnalysisProfile = "masculine" | "feminine" | "neutral";

const WEIGHTS_MASCULINE: typeof WEIGHTS = {
  ...WEIGHTS,
  symmetry: 0.12,
  goldenRatio: 0.10,
  jawline: 0.15,
  lipFullness: 0.03,
  cheekboneDefinition: 0.10,
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
    Object.entries(weights).map(([k, v]) => [k, v / total])
  ) as typeof WEIGHTS;
}

function weightsForProfile(profile: AnalysisProfile): typeof WEIGHTS {
  if (profile === "masculine") return normalizeWeights(WEIGHTS_MASCULINE);
  if (profile === "feminine") return normalizeWeights(WEIGHTS_FEMININE);
  return WEIGHTS;
}

const WEIGHT_KEYS = Object.keys(WEIGHTS) as Exclude<keyof typeof WEIGHTS, "skinClarity">[];

function calculateBeautyIndex(
  metrics: FaceMetricScores,
  skinClarityScore: number,
  weights: typeof WEIGHTS = WEIGHTS
): number {
  const weighted = WEIGHT_KEYS.reduce(
    (acc, key) => {
      const m = metrics[key];
      const v = (m && typeof m === 'object' && 'score' in m) ? ((m as MetricResult).score ?? 5) : (m as number);
      return acc + v * weights[key];
    },
    0
  );
  const beautyIndex = weighted + skinClarityScore * weights.skinClarity;
  const normalizedScore = Math.max(0, Math.min(100, beautyIndex * 10));
  return Math.round(normalizedScore * 10) / 10;
}

const FACE_SHAPE_INFO: Record<string, { description: string; characteristics: string[]; idealHairstyles: string[]; idealGlasses: string[] }> = {
  Oval: {
    description: "Your face is slightly longer than it is wide, with a gently rounded jawline and forehead. This is considered the most versatile face shape.",
    characteristics: ["Balanced proportions", "Slightly longer than wide", "Gentle jawline curve", "Forehead slightly wider than chin"],
    idealHairstyles: ["Side part", "Textured crop", "Medium-length layers", "Slicked back"],
    idealGlasses: ["Most frame shapes", "Aviators", "Wayfarers", "Round frames"],
  },
  Round: {
    description: "Your face is approximately as wide as it is long, with full cheeks and a rounded jawline. Soft, approachable features.",
    characteristics: ["Equal width and length", "Full cheeks", "Rounded jawline", "Soft features"],
    idealHairstyles: ["Textured top with short sides", "Quiff", "Angular fringe", "High fade"],
    idealGlasses: ["Angular frames", "Rectangle", "Square", "Browline"],
  },
  Square: {
    description: "Your face has a strong, angular jawline with roughly equal width at the forehead and jaw. Powerful, defined bone structure.",
    characteristics: ["Strong jawline", "Wide forehead", "Angular features", "Defined cheekbones"],
    idealHairstyles: ["Textured crop", "Side part", "Quiff", "Pompadour"],
    idealGlasses: ["Round frames", "Aviators", "Oval", "Rimless"],
  },
  Heart: {
    description: "Your face is wider at the forehead with a narrower, pointed chin. Romantic, youthful appearance.",
    characteristics: ["Wide forehead", "Narrow chin", "High cheekbones", "Pointed jaw"],
    idealHairstyles: ["Side-swept fringe", "Medium length with texture", "Textured waves", "Low taper fade"],
    idealGlasses: ["Bottom-heavy frames", "Round", "Light-colored", "Rimless"],
  },
  Oblong: {
    description: "Your face is noticeably longer than it is wide, with a straight cheek line. Elegant, elongated features.",
    characteristics: ["Longer than wide", "Straight cheek line", "Narrow jaw and forehead", "High forehead"],
    idealHairstyles: ["Volume on sides", "Fringe/bangs", "Textured medium length", "Crops with width"],
    idealGlasses: ["Oversized", "Round", "Square", "Decorative temples"],
  },
  Diamond: {
    description: "Your face is widest at the cheekbones with a narrow forehead and chin. Striking, angular features.",
    characteristics: ["Narrow forehead", "Wide cheekbones", "Narrow chin", "Angular jaw"],
    idealHairstyles: ["Fringe/side-swept", "Textured crop", "Medium length", "Messy styles"],
    idealGlasses: ["Oval frames", "Rimless", "Cat-eye", "Aviators"],
  },
  Triangle: {
    description: "Your face is wider at the jaw than at the forehead. Strong, grounded features.",
    characteristics: ["Narrow forehead", "Wide jaw", "Strong chin", "Prominent lower face"],
    idealHairstyles: ["Volume on top", "Quiff", "Pompadour", "Side part with height"],
    idealGlasses: ["Top-heavy frames", "Browline", "Cat-eye", "Colorful frames"],
  },
};

function getStyleProfile(shape: string, scores: { symmetry: number; jawline: number; cheekbone: number }): string {
  const { symmetry, jawline, cheekbone } = scores;

  if (jawline >= 8 && cheekbone >= 8) return "Rugged Elegance";
  if (symmetry >= 8.5 && jawline >= 7) return "Classic Handsome";
  if (cheekbone >= 8 && symmetry >= 7) return "Editorial Sharp";
  if (jawline >= 7 && symmetry >= 6) return "Strong Structured";
  if (shape === "Heart" && symmetry >= 7) return "Romantic Lead";
  if (shape === "Oval" && symmetry >= 7.5) return "Versatile Classic";
  if (shape === "Square") return "Bold Masculine";
  if (shape === "Diamond") return "Angular Maverick";
  return "Everyman Appeal";
}

export function computeFaceMetrics(result: FaceLandmarkerResult): FaceMetricScores {
  const shapeResult = getFacialShape(result);

  // Try raw geometry engine first (single source of truth)
  const rawGeo = computeRawGeometry(result);

  const measurementToResult = (meas: import("./face-analyzer").Measurement | undefined): MetricResult => {
    if (!meas || meas.confidence <= 0) return { score: null, confidence: 0, rawValue: meas?.raw };
    // Convert z-score to 0-10 scale using rangeScore
    const score = rangeScore(meas.z);
    return { score: Math.round(score * 10) / 10, confidence: meas.confidence, rawValue: meas.raw };
  };

  if (rawGeo) {
    return {
      symmetry:       measurementToResult(rawGeo.symmetry),
      proportions:    measurementToResult(rawGeo.verticalBalance),
      jawline:        measurementToResult(rawGeo.jawRatio),
      eyeSpacing:     measurementToResult(rawGeo.eyeSpacing),
      goldenRatio:    measurementToResult(rawGeo.goldenRatio),
      lipFullness:    measurementToResult(rawGeo.lipFullness),
      noseProfile:    measurementToResult(rawGeo.noseWidthRatio),
      cheekboneDefinition: measurementToResult(rawGeo.cheekboneDefinition),
      fwhr:           measurementToResult(rawGeo.fwhr),
      canthalTilt:    measurementToResult(rawGeo.canthalTilt),
      eyeNoseRatio:   measurementToResult(rawGeo.eyeSpacing),  // Closest available
      noseChinRatio:  measurementToResult(rawGeo.noseChinRatio),
      horizontalFifths: measurementToResult(rawGeo.horizontalFifths),
      noseProjection: measurementToResult(rawGeo.noseProjection),
      lipWidthRatio:  measurementToResult(rawGeo.lipWidthRatio),
      upperLipRatio:  measurementToResult(rawGeo.upperLipRatio),
      noseBridgeAngle: measurementToResult(rawGeo.noseBridgeAngle),
      eyeTilt:        measurementToResult(rawGeo.eyeTilt),
      facialShape: shapeResult.primary,
      faceShapeProbabilities: shapeResult.probabilities,
    };
  }

  // Fallback to legacy scorers if raw geometry fails
  const safe = (fn: () => number): MetricResult => {
    try {
      const v = fn();
      if (!Number.isFinite(v)) return { score: null, confidence: 0 };
      return { score: v, confidence: 1 };
    } catch { return { score: null, confidence: 0 }; }
  };
  return {
    symmetry: safe(() => getFaceSymmetry(result)),
    proportions: safe(() => getFaceProportions(result)),
    jawline: safe(() => getJawlineScore(result)),
    eyeSpacing: safe(() => getEyeSpacingScore(result)),
    goldenRatio: safe(() => getGoldenRatio(result)),
    lipFullness: safe(() => getLipFullness(result)),
    noseProfile: safe(() => getNoseProfile(result)),
    cheekboneDefinition: safe(() => getCheekboneDefinition(result)),
    fwhr: safe(() => getFwhrScore(result)),
    canthalTilt: safe(() => getCanthalTiltScore(result)),
    eyeNoseRatio: safe(() => getEyeNoseRatioScore(result)),
    noseChinRatio: safe(() => getNoseChinRatioScore(result)),
    horizontalFifths: safe(() => getHorizontalFifthsScore(result)),
    noseProjection: safe(() => getNoseProjectionScore(result)),
    lipWidthRatio: safe(() => getLipWidthRatioScore(result)),
    upperLipRatio: safe(() => getUpperLipRatioScore(result)),
    noseBridgeAngle: safe(() => getNoseBridgeAngleScore(result)),
    eyeTilt: safe(() => getEyeTiltScore(result)),
    facialShape: shapeResult.primary,
    faceShapeProbabilities: shapeResult.probabilities,
  };
}

export interface BuildOptions {
  photoQualityScore?: number;
  consistencyScore?: number;
  analysisConfidence?: number;
  photoCount?: number;
}

export function buildFaceScoreFromMetrics(
  metrics: FaceMetricScores,
  skinClarityScore: number,
  options: BuildOptions = {},
  sourceResult?: FaceLandmarkerResult,
  profile: AnalysisProfile = "neutral",
  youthfulnessOverride?: number,
  structureProfileOverride?: StructureProfileType
): FaceScoreResult {
  const {
    photoQualityScore = 8,
    consistencyScore: consistencyScoreIn,
    analysisConfidence: analysisConfidenceIn,
    photoCount = 1,
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

  const rawFwhr = sourceResult ? getRawFwhr(sourceResult) : undefined;
  const rawCanthalTilt = sourceResult ? getRawCanthalTilt(sourceResult) : undefined;
  const rawEyeNoseRatio = sourceResult ? getRawEyeNoseRatio(sourceResult) : undefined;

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
    "Facial Symmetry": "symmetry",
    "Golden Ratio Adherence": "goldenRatio",
    "Jawline Definition": "jawline",
    "Proportional Harmony": "proportions",
    "Eye Spacing": "eyeSpacing",
    "Texture Uniformity": "skinClarity",
    "Cheekbone Definition": "cheekboneDefinition",
    "FWHR (Facial Width-to-Height)": "fwhr",
    "Canthal Tilt": "canthalTilt",
    "Horizontal Fifths": "horizontalFifths",
    "Eye–Nose Ratio": "eyeNoseRatio",
    "Nose–Chin Balance": "noseChinRatio",
    "Lip Proportion": "lipFullness",
    "Nose Profile": "noseProfile",
    "Nose Projection": "noseProjection",
    "Lip Width Ratio": "lipWidthRatio",
    "Upper Lip Ratio": "upperLipRatio",
    "Nose Bridge Angle": "noseBridgeAngle",
    "Eye Tilt": "eyeTilt",
  };

  const KEY_TO_LABEL: Record<string, string> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    KEY_TO_LABEL[key] = label;
  }

  const metricPercentiles: Record<string, number> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    if (key === "skinClarity") {
      metricPercentiles[label] = scoreToPercentile(skinClarityScore);
    } else {
      const m = rawMetricScores[key];
      metricPercentiles[label] = m.score !== null ? scoreToPercentile(m.score) : 50;
    }
  }

  const weightMap: Record<string, number> = {};
  for (const [label, key] of Object.entries(LABEL_TO_KEY)) {
    if (key === "skinClarity") {
      weightMap[label] = weights.skinClarity;
    } else {
      const m = rawMetricScores[key];
      weightMap[label] = m.score !== null ? (weights as Record<string, number>)[key] ?? 0 : 0;
    }
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

  // ── Domain-based Face IQ ──
  // Compute raw geometry from landmarks (single source of truth)
  const rawGeometry = sourceResult ? computeRawGeometry(sourceResult) : undefined;

  // Compute domain scores from raw geometry
  const domainScores = rawGeometry
    ? computeDomainScores(rawGeometry, skinClarityScore, photoQualityScore)
    : undefined;

  // Use domain-based faceIQ if available, otherwise fall back to legacy
  const faceIQ = domainScores
    ? Math.round(domainScores.faceIQ * 10)  // Convert 0-10 → 0-100
    : availableWeight > 0
      ? Math.round(Math.max(0, Math.min(100, weightedSum / availableWeight)))
      : 50;

  const { grade, label: gradeLabel, comparison } = computeFaceIQ(metricPercentiles, weightMap);

  const totalMetrics = Object.keys(weightMap).length;
  const computedMetrics = availableMetrics.length;
  const analysisConfidence = analysisConfidenceIn ?? Math.round((computedMetrics / totalMetrics) * 100);

  const structureProfile = structureProfileOverride ?? "Balanced";
  const youthfulness = youthfulnessOverride ?? 50;

  const mScore = (m: MetricResult): number => m.score !== null ? m.score : 5;
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
    return harmonyComponents.length > 0
      ? harmonyComponents.reduce((a, b) => a + b, 0) / harmonyComponents.length
      : 5;
  })();

  const metricDefs: Omit<FacialMetric, "score" | "rating" | "spread">[] = [
    {
      label: "Facial Symmetry",
      weight: weights.symmetry,
      description: "Balance between left and right sides of your face. Measured by comparing 10 bilateral landmark pairs against the nose centerline.",
      tip: mScore(symmetry) >= 7 ? "Your symmetry is a major asset — highlight it with centered hairstyles." : "Strategic eyebrow grooming and asymmetric hairstyles can enhance perceived balance.",
    },
    {
      label: "Golden Ratio Adherence",
      weight: weights.goldenRatio,
      description: "How closely your facial proportions match the φ (1.618) ideal. Measures face width-to-length and mouth-to-face-width ratios.",
      tip: mScore(goldenRatio) >= 7 ? "Your proportions are mathematically harmonious — a rare trait." : "Most faces deviate from φ. Your unique ratios give character — lean into it.",
    },
    {
      label: "Jawline Definition",
      weight: weights.jawline,
      description: "Multi-factor jawline analysis: jaw-to-face ratio, gonial angle sharpness, mandibular taper, chin projection, and jaw symmetry.",
      tip: mScore(jawline) >= 7 ? "Your jawline is a defining feature. Keep it clean and well-groomed." : "Angular beard styles (Van Dyke, Anchor) can create the illusion of a sharper jawline.",
    },
    {
      label: "Proportional Harmony",
      weight: weights.proportions,
      description: "How evenly your face divides into upper, middle, and lower thirds. The ideal is equal thirds.",
      tip: mScore(proportions) >= 7 ? "Your thirds are well-balanced — most hairstyles will suit you." : "Hairstyles that add volume to underrepresented thirds can create better visual balance.",
    },
    {
      label: "Horizontal Fifths",
      weight: weights.horizontalFifths,
      description: "The face ideally divides into five equal widths: two eye bands, the intercanthal gap, and two outer bands.",
      tip: mScore(horizontalFifths) >= 7 ? "Your eye placement is balanced across the face width." : "Strategic eye makeup/eyebrow shaping can optically adjust perceived eye band widths.",
    },
    {
      label: "Eye Spacing",
      weight: weights.eyeSpacing,
      description: "Interpupillary distance relative to eye width. Ideal spacing is approximately one eye-width apart.",
      tip: mScore(eyeSpacing) >= 7 ? "Your eye spacing is ideal for most eyewear and makeup styles." : "Glasses with wider frames can create the illusion of more balanced spacing.",
    },
    {
      label: "Texture Uniformity",
      weight: weights.skinClarity,
      description: "Surface smoothness and evenness of skin tone. Measured by brightness variance across 7 facial zones.",
      tip: skinClarityScore >= 7 ? "Your skin texture is smooth — maintain with SPF and hydration." : "A consistent skincare routine (cleanser, exfoliant, moisturizer, SPF) can significantly improve this.",
    },
    {
      label: "Cheekbone Definition",
      weight: weights.cheekboneDefinition,
      description: "Prominence of cheekbones relative to jaw width. Higher cheek-to-jaw ratios create more angular, editorial features.",
      tip: mScore(cheekboneDefinition) >= 7 ? "Your cheekbones are a standout feature — contour and lighting will love them." : "Highlighting techniques and angular hairstyles can enhance perceived cheekbone height.",
    },
    {
      label: "FWHR (Facial Width-to-Height)",
      weight: weights.fwhr,
      description: "Bizygomatic width over upper-lip-to-brow height. Research links a higher FWHR to perceived dominance and attractiveness in men.",
      value: rawFwhr !== undefined ? `Ratio ${rawFwhr.toFixed(2)} (ideal ≈ 1.95)` : undefined,
      tip: mScore(fwhr) >= 7 ? "Your facial width-to-height ratio is in the researched attractive range." : "The ratio is partly structural; hairstyle volume and beard width subtly affect the look.",
    },
    {
      label: "Canthal Tilt",
      weight: weights.canthalTilt,
      description: "Angle of the line between inner and outer eye corners. A positive tilt (outer corner slightly raised) reads as alert and attractive.",
      value: rawCanthalTilt !== undefined ? `${rawCanthalTilt.toFixed(1)}° (ideal ≈ +5°)` : undefined,
      tip: mScore(canthalTilt) >= 7 ? "Your positive canthal tilt gives a naturally alert, youthful look." : "Eye-cream hydration and gentle brow grooming help keep the eye area looking lifted.",
    },
    {
      label: "Eye–Nose Ratio",
      weight: weights.eyeNoseRatio,
      description: "Eye width relative to nose width. Near the golden ratio ≈ 1.62, eye width is proportionate to the nose.",
      value: rawEyeNoseRatio !== undefined ? `Ratio ${rawEyeNoseRatio.toFixed(2)} (ideal ≈ 1.62)` : undefined,
      tip: mScore(eyeNoseRatio) >= 7 ? "Your eye-to-nose proportions are mathematically harmonious." : "Features work together as a whole — small deviations here read as character.",
    },
    {
      label: "Nose–Chin Balance",
      weight: weights.noseChinRatio,
      description: "Nose length over facial height. The ideal nasofacial proportion centers the nose within the lower face.",
      tip: mScore(noseChinRatio) >= 7 ? "Your nose sits in strong proportion to your face length." : "The nose–chin balance is structural; contouring can refine its perceived length.",
    },
    {
      label: "Lip Proportion",
      weight: weights.lipFullness,
      description: "Upper-to-lower lip ratio and fullness relative to facial area. Balanced lips contribute to overall facial harmony.",
      tip: "Your lip proportions contribute to your overall facial balance.",
    },
    {
      label: "Nose Profile",
      weight: weights.noseProfile,
      description: "Nose width relative to face width. The ideal nose-to-face width ratio is approximately 0.28.",
      tip: "Your nose proportions work with your facial structure for a cohesive look.",
    },
    {
      label: "Nose Projection",
      weight: weights.noseProjection,
      description: "How far the nose tip protrudes relative to nose length. A well-projected nose adds definition to the facial profile.",
      tip: mScore(noseProjection) >= 7 ? "Your nose projection creates a strong profile silhouette." : "Profile lighting and side-angle photos highlight projection — embrace your profile shots.",
    },
    {
      label: "Lip Width Ratio",
      weight: weights.lipWidthRatio,
      description: "Mouth width relative to face width. A wider mouth is associated with perceived attractiveness.",
      tip: mScore(lipWidthRatio) >= 7 ? "Your mouth width complements your facial proportions." : "Lip liner techniques can subtly enhance perceived mouth width.",
    },
    {
      label: "Upper Lip Ratio",
      weight: weights.upperLipRatio,
      description: "Upper lip height relative to total lip height. The ideal is approximately 1/3 of total lip height.",
      tip: mScore(upperLipRatio) >= 7 ? "Your upper lip proportion is well-balanced." : "Subtle lip liner on the upper lip can enhance perceived proportion.",
    },
    {
      label: "Nose Bridge Angle",
      weight: weights.noseBridgeAngle,
      description: "Straightness of the nose bridge. A straighter bridge reads as more defined and refined.",
      tip: mScore(noseBridgeAngle) >= 7 ? "Your nose bridge is well-defined and straight." : "Side-profile lighting highlights bridge definition — good for photos.",
    },
    {
      label: "Eye Tilt",
      weight: weights.eyeTilt,
      description: "Angle of the eye's long axis. A slight positive tilt (outer corner raised) reads as alert and attractive.",
      tip: mScore(eyeTilt) >= 7 ? "Your eye tilt gives a naturally alert, youthful appearance." : "Upward-sweeping eyeliner can enhance perceived eye tilt.",
    },
  ];

  const metricScores: Record<string, number> = {
    "Facial Symmetry": mScore(symmetry),
    "Golden Ratio Adherence": mScore(goldenRatio),
    "Jawline Definition": mScore(jawline),
    "Proportional Harmony": mScore(proportions),
    "Eye Spacing": mScore(eyeSpacing),
    "Texture Uniformity": skinClarityScore,
    "Cheekbone Definition": mScore(cheekboneDefinition),
    "FWHR (Facial Width-to-Height)": mScore(fwhr),
    "Canthal Tilt": mScore(canthalTilt),
    "Horizontal Fifths": mScore(horizontalFifths),
    "Eye–Nose Ratio": mScore(eyeNoseRatio),
    "Nose–Chin Balance": mScore(noseChinRatio),
    "Lip Proportion": mScore(lipFullness),
    "Nose Profile": mScore(noseProfile),
    "Nose Projection": mScore(noseProjection),
    "Lip Width Ratio": mScore(lipWidthRatio),
    "Upper Lip Ratio": mScore(upperLipRatio),
    "Nose Bridge Angle": mScore(noseBridgeAngle),
    "Eye Tilt": mScore(eyeTilt),
  };

  const breakdown: FacialMetric[] = metricDefs.map((m) => ({
    ...m,
    score: Math.round(metricScores[m.label] * 10) / 10,
    rating: scoreToRating(metricPercentiles[m.label] / 10),
    tip: m.tip,
  }));

  const roundedScore = Math.round(((faceIQ / 100) * 8 + 2) * 10) / 10;

  const strengths: string[] = [];
  const improvements: string[] = [];

  breakdown.forEach((m) => {
    const pct = metricPercentiles[m.label] ?? 50;
    if (pct >= 80) strengths.push(`${m.label} (${m.score.toFixed(1)}/10) — ${scoreToRating(pct / 10)}`);
    if (pct < 40) improvements.push(`${m.label} (${m.score.toFixed(1)}/10) — ${m.tip}`);
  });

  const styleProfile = getStyleProfile(facialShape, {
    symmetry: mScore(symmetry),
    jawline: mScore(jawline),
    cheekbone: mScore(cheekboneDefinition),
  });

  const detailedAnalysis = scoreToDetailedLabel(roundedScore);
  const blendshapes = sourceResult ? analyzeBlendshapes(sourceResult) : {
    emotion: "Neutral",
    emotionConfidence: 0.5,
    eyeOpenness: 0.5,
    mouthOpenness: 0.3,
    browRaise: 0.5,
    smileIntensity: 0,
    headTilt: 0,
  };
  const percentile = {
    overall: faceIQ,
    symmetry: metricPercentiles["Facial Symmetry"] ?? 50,
    goldenRatio: metricPercentiles["Golden Ratio Adherence"] ?? 50,
    jawline: metricPercentiles["Jawline Definition"] ?? 50,
    skinClarity: metricPercentiles["Texture Uniformity"] ?? 50,
    harmony: metricPercentiles["Proportional Harmony"] ?? 50,
    bracket: grade,
    comparisonText: comparison,
  };
  const beautyIndex = faceIQ;
  const faceShapeDetails = FACE_SHAPE_INFO[facialShape] || FACE_SHAPE_INFO.Oval;

  return {
    overallScore: roundedScore,
    symmetry: Math.round(mScore(symmetry) * 10) / 10,
    proportions: Math.round(mScore(proportions) * 10) / 10,
    jawline: Math.round(mScore(jawline) * 10) / 10,
    eyeSpacing: Math.round(mScore(eyeSpacing) * 10) / 10,
    skinClarity: Math.round(skinClarityScore * 10) / 10,
    facialShape,
    faceShapeProbabilities,
    goldenRatio: Math.round(mScore(goldenRatio) * 10) / 10,
    lipFullness: Math.round(mScore(lipFullness) * 10) / 10,
    noseProfile: Math.round(mScore(noseProfile) * 10) / 10,
    cheekboneDefinition: Math.round(mScore(cheekboneDefinition) * 10) / 10,
    fwhr: Math.round(mScore(fwhr) * 10) / 10,
    canthalTilt: Math.round(mScore(canthalTilt) * 10) / 10,
    eyeNoseRatio: Math.round(mScore(eyeNoseRatio) * 10) / 10,
    noseChinRatio: Math.round(mScore(noseChinRatio) * 10) / 10,
    horizontalFifths: Math.round(mScore(horizontalFifths) * 10) / 10,
    noseProjection: Math.round(mScore(noseProjection) * 10) / 10,
    lipWidthRatio: Math.round(mScore(lipWidthRatio) * 10) / 10,
    upperLipRatio: Math.round(mScore(upperLipRatio) * 10) / 10,
    noseBridgeAngle: Math.round(mScore(noseBridgeAngle) * 10) / 10,
    eyeTilt: Math.round(mScore(eyeTilt) * 10) / 10,
    rawFwhr: rawFwhr ?? 0,
    rawCanthalTilt: rawCanthalTilt ?? 0,
    rawEyeNoseRatio: rawEyeNoseRatio ?? 0,
    facialHarmony: Math.round(facialHarmony * 10) / 10,
    breakdown,
    overallRating: gradeLabel,
    detailedAnalysis,
    strengths,
    improvements,
    styleProfile,
    blendshapes,
    percentile,
    beautyIndex,
    faceShapeDetails,
    photoQualityScore: Math.round(photoQualityScore * 10) / 10,
    consistencyScore: consistencyScoreIn !== undefined ? Math.round(consistencyScoreIn * 10) / 10 : undefined,
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
    domainScores,
    rawGeometry: rawGeometry ?? undefined,
  };
}

export function calculateFaceScore(
  result: FaceLandmarkerResult,
  skinClarityScore: number
): FaceScoreResult {
  const metrics = computeFaceMetrics(result);
  return buildFaceScoreFromMetrics(metrics, skinClarityScore, {}, result);
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

const MERGE_KEYS: (keyof Omit<FaceMetricScores, "facialShape" | "faceShapeProbabilities">)[] = [
  "symmetry",
  "proportions",
  "jawline",
  "eyeSpacing",
  "goldenRatio",
  "lipFullness",
  "noseProfile",
  "cheekboneDefinition",
  "fwhr",
  "canthalTilt",
  "eyeNoseRatio",
  "noseChinRatio",
  "horizontalFifths",
  "noseProjection",
  "lipWidthRatio",
  "upperLipRatio",
  "noseBridgeAngle",
  "eyeTilt",
];

/**
 * Merges per-photo metric samples into a single robust result.
 * - Each metric is the median across photos (robust to outliers).
 * - consistencyScore reflects how tightly the photos agree (lower CV = higher consistency).
 * - analysisConfidence combines photo quality and cross-photo consistency.
 */
export function mergeFaceScores(
  samples: FaceScoreSample[],
  profile: AnalysisProfile = "neutral"
): {
  result: FaceScoreResult;
  metricSpread: Record<string, number>;
} {
  const merged = {} as FaceMetricScores;
  const metricSpread: Record<string, number> = {};

  for (const key of MERGE_KEYS) {
    const vals = samples.map((s) => {
      const m = s.metrics[key];
      return (m && typeof m === 'object' && 'score' in m) ? (m as MetricResult).score : (m as number);
    }).filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    merged[key] = vals.length > 0
      ? { score: median(vals), confidence: vals.length / samples.length, rawValue: undefined }
      : { score: null, confidence: 0 };
    metricSpread[key as string] = vals.length > 1 ? stddev(vals) : 0;
  }

  const shapeCounts = new Map<string, number>();
  for (const s of samples) {
    shapeCounts.set(s.metrics.facialShape, (shapeCounts.get(s.metrics.facialShape) || 0) + 1);
  }
  let bestShape = samples[0]?.metrics.facialShape || "Oval";
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

  const skinClarity = median(samples.map((s) => s.skinClarity));
  const photoQuality = median(samples.map((s) => s.quality.score));

  const cvList = MERGE_KEYS.map((key) => {
    const vals = samples.map((s) => {
      const m = s.metrics[key];
      return (m && typeof m === 'object' && 'score' in m) ? (m as MetricResult).score : (m as number);
    }).filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    if (vals.length === 0) return 0;
    const m = mean(vals);
    if (m === 0) return 0;
    return stddev(vals) / m;
  });
  const avgCv = mean(cvList);
  const consistencyScore = samples.length === 1
    ? undefined
    : Math.round(Math.max(1, Math.min(10, 10 - avgCv * 14)) * 10) / 10;

  // Confidence = capture quality + cross-photo agreement + how frontal the
  // best captures were. A turned head makes bilateral numbers unreliable even
  // when the photo is crisp and bright — confidence has to say so.
  const frontality = mean(samples.map((s) => frontalityScore(s.quality)));
  const analysisConfidence = samples.length === 1
    ? Math.round((photoQuality * 0.6 + frontality * 0.4) * 10)
    : Math.round(
        ((consistencyScore ?? 7) * 0.45 + photoQuality * 0.35 + frontality * 0.2) * 10
      );

  const bestSample = [...samples].sort((a, b) => b.quality.score - a.quality.score)[0];

  // Merge youthfulness and structure profile across samples
  const youthfulnessValues = samples.map((s) => s.youthfulness).filter((v): v is number => typeof v === "number");
  const youthfulness = youthfulnessValues.length > 0 ? Math.round(youthfulnessValues.reduce((a, b) => a + b, 0) / youthfulnessValues.length) : 50;

  const structureProfiles = samples.map((s) => s.structureProfile).filter((v): v is StructureProfileType => typeof v === "string");
  const structureProfile = structureProfiles.length > 0
    ? structureProfiles.sort((a, b) => {
        const order = { "Sharp": 4, "Defined": 3, "Balanced": 2, "Soft": 1 };
        return (order[b] ?? 2) - (order[a] ?? 2);
      })[0]
    : "Balanced";

  const result = buildFaceScoreFromMetrics(
    merged,
    skinClarity,
    {
      photoQualityScore: photoQuality,
      consistencyScore,
      analysisConfidence,
      photoCount: samples.length,
    },
    bestSample?.sourceResult,
    profile,
    youthfulness,
    structureProfile
  );

  result.breakdown = result.breakdown.map((m) => {
    const spreadKey = MERGE_KEYS.find((key) => {
      const label = labelForKey(key);
      return label === m.label;
    });
    if (!spreadKey) return m;
    return { ...m, spread: Math.round(metricSpread[spreadKey] * 10) / 10 };
  });

  return { result, metricSpread };
}

function labelForKey(key: keyof FaceMetricScores): string {
  const map: Record<string, string> = {
    symmetry: "Facial Symmetry",
    proportions: "Proportional Harmony",
    jawline: "Jawline Definition",
    eyeSpacing: "Eye Spacing",
    goldenRatio: "Golden Ratio Adherence",
    lipFullness: "Lip Proportion",
    noseProfile: "Nose Profile",
    cheekboneDefinition: "Cheekbone Definition",
    fwhr: "FWHR (Facial Width-to-Height)",
    canthalTilt: "Canthal Tilt",
    eyeNoseRatio: "Eye–Nose Ratio",
    noseChinRatio: "Nose–Chin Balance",
    horizontalFifths: "Horizontal Fifths",
    noseProjection: "Nose Projection",
    lipWidthRatio: "Lip Width Ratio",
    upperLipRatio: "Upper Lip Ratio",
    noseBridgeAngle: "Nose Bridge Angle",
    eyeTilt: "Eye Tilt",
  };
  return map[key] || key;
}

export function getGroomingSuggestions(
  facialShape: string,
  score: FaceScoreResult,
  profile: AnalysisProfile = "neutral"
): string[] {
  const suggestions: string[] = [];

  if (profile === "feminine") {
    switch (facialShape) {
      case "Round":
        suggestions.push("Longer layers or a side-swept part elongate a soft face — add height at the crown");
        suggestions.push("Angular or browline glasses add definition beside a rounded jawline");
        suggestions.push("Contour under the cheekbones and jaw for gentle definition");
        break;
      case "Square":
        suggestions.push("Soft waves and textured layers soften an angular jaw beautifully");
        suggestions.push("Rounded or oval frames balance strong facial angles");
        suggestions.push("Highlight the center of the face to draw the eye inward and soften edges");
        break;
      case "Heart":
        suggestions.push("Chin-length bobs and side-swept bangs balance a wider forehead");
        suggestions.push("Bottom-heavy frames (round, cat-eye) add width to a narrow chin");
        suggestions.push("Contour the temples lightly to soften forehead width");
        break;
      case "Oval":
        suggestions.push("Your balanced proportions suit most cuts — curls, sleek, or straight all work");
        suggestions.push("Almost any frame shape works; experiment freely");
        suggestions.push("Keep brow arches natural — they frame your symmetry well");
        break;
      case "Oblong":
        suggestions.push("Add width with volume at the sides and soft fringe to shorten the face visually");
        suggestions.push("Oversized or round frames break up vertical length elegantly");
        suggestions.push("Keep cheek contour soft and horizontal for a fuller midface");
        break;
      case "Diamond":
        suggestions.push("Side-swept styles and textured layers soften prominent cheekbones");
        suggestions.push("Oval and rimless frames sit best beside angular features");
        suggestions.push("Highlight the brow bone and soften the cheekbone hollow");
        break;
      default:
        suggestions.push("A consistent haircare routine (mask + leave-in) keeps your hair as polished as your face");
        suggestions.push("Keep brows shaped and defined — the frame of the face");
    }
  } else {
    switch (facialShape) {
      case "Round":
        suggestions.push("Van Dyke or Anchor beard — adds angular definition to soft jawline");
        suggestions.push("Short sides + textured top hairstyle adds vertical length");
        suggestions.push("Avoid chin curtains and full rounded beards that emphasize circular shape");
        suggestions.push("Clean-shaven or light stubble on cheeks with defined chin hair works best");
        break;
      case "Square":
        suggestions.push("Short, well-groomed stubble complements your naturally strong jaw");
        suggestions.push("Textured crop or classic side part enhances angular bone structure");
        suggestions.push("Avoid overly long beards — they mask your best feature (the jaw)");
        suggestions.push("A light goatee or soul patch adds character without hiding structure");
        break;
      case "Heart":
        suggestions.push("Chin-focused styles (goatee, circle beard) balance your wider forehead");
        suggestions.push("Side-swept fringe or textured bangs soften the forehead line");
        suggestions.push("Fuller lower-face beards create visual balance with your forehead");
        suggestions.push("Avoid heavy sideburns that widen the upper face further");
        break;
      case "Oval":
        suggestions.push("Most styles work with your balanced proportions — you have freedom to experiment");
        suggestions.push("Classic full beard or well-maintained stubble both suit you");
        suggestions.push("Side parts and swept-back styles maintain your natural symmetry");
        suggestions.push("This is the most versatile face shape — use it to try trending styles");
        break;
      case "Oblong":
        suggestions.push("Fuller beards on the sides add width and shorten the face visually");
        suggestions.push("Avoid height in hairstyles — opt for volume on the sides");
        suggestions.push("Cheek-focused beards and sideburns balance facial length");
        suggestions.push("Medium-length styles with horizontal lines work well");
        break;
      case "Diamond":
        suggestions.push("Chin straps and goatees complement a narrow chin");
        suggestions.push("Fringe or side-swept styles soften wider cheekbones");
        suggestions.push("Full beards add volume to the chin area, balancing the cheekbone prominence");
        suggestions.push("Textured, messy styles work better than slick, tight ones");
        break;
      default:
        suggestions.push("Maintain regular grooming routine for best appearance");
        suggestions.push("Keep beard edges clean and defined for a polished look");
    }
  }

  if (score.skinClarity < 6) {
    suggestions.push("Skincare priority: Start with a daily cleanser + SPF 30 moisturizer");
    suggestions.push("Exfoliate 2x/week. Drink 2-3L water daily. Sleep 7+ hours.");
    suggestions.push("Consider niacinamide for pore refinement and vitamin C for brightening");
  } else if (score.skinClarity < 7.5) {
    suggestions.push("Good skin foundation — add retinol 2x/week for texture refinement");
  }

  if (score.symmetry < 7) {
    suggestions.push("Eyebrow shaping can dramatically improve perceived facial symmetry");
    suggestions.push("Consider professional eyebrow threading or mapping for optimal arch");
  }

  if (score.jawline < 6) {
    if (profile === "feminine") {
      suggestions.push("Facial massage and chin-tuck exercises can subtly refine jawline definition");
      suggestions.push("A soft highlight above the cheekbone lifts the whole lower face visually");
    } else {
      suggestions.push("Chew gum daily to strengthen masseter muscles and define jawline");
      suggestions.push("Neck exercises (chin tucks, jaw juts) can improve jawline visibility");
    }
  }

  if (score.canthalTilt < 6) {
    suggestions.push("Eye-area hydration and gentle under-eye massage help keep the eye area looking lifted");
    suggestions.push("Winged liner or subtle eyeshadow can optically increase canthal tilt");
  }

  if (profile !== "feminine") {
    suggestions.push("Trim beard edges every 2-3 weeks for maintained sharpness");
    suggestions.push("Use beard oil daily — argan or jojoba base for healthy, conditioned hair");
    suggestions.push("Match beard length to face shape: shorter for round, longer for long faces");
  }

  return suggestions;
}
