import type { FaceAnalysisResult, BodyAnalysisResult, ColorAnalysisResult, OutfitRecommendation } from "@/store/analysis-store";
import type { AnalysisSource } from "@/store/analysis-store";
import type { StructureProfileType } from "@/lib/ml/face-analyzer";
import { isDemoPhoto } from "@/lib/demo/demo-analysis";
import { scoreToPercentile, gradeFromPercentile, comparisonFromPercentile } from "@/lib/ml/calibration";

function normalizeFaceResult(r: FaceAnalysisResult): FaceAnalysisResult {
  if (!r) return r;
  const faceIQ = r.faceIQ ?? (r.overallScore != null ? Math.round(r.overallScore * 10) : 50);
  const { grade, label } = gradeFromPercentile(faceIQ);
  const metricPercentiles = r.metricPercentiles ?? {
    "Facial Symmetry": scoreToPercentile(r.symmetry),
    "Golden Ratio Adherence": scoreToPercentile(r.goldenRatio),
    "Jawline Definition": scoreToPercentile(r.jawline),
    "Proportional Harmony": scoreToPercentile(r.proportions),
    "Eye Spacing": scoreToPercentile(r.eyeSpacing),
    "Skin Clarity": scoreToPercentile(r.skinClarity),
    "Cheekbone Definition": scoreToPercentile(r.cheekboneDefinition),
    "FWHR (Facial Width-to-Height)": scoreToPercentile(r.fwhr),
    "Canthal Tilt": scoreToPercentile(r.canthalTilt),
    "Horizontal Fifths": scoreToPercentile(r.horizontalFifths),
    "Eye–Nose Ratio": scoreToPercentile(r.eyeNoseRatio),
    "Nose–Chin Balance": scoreToPercentile(r.noseChinRatio),
    "Lip Proportion": scoreToPercentile(r.lipFullness),
    "Nose Profile": scoreToPercentile(r.noseProfile),
    "Nose Projection": scoreToPercentile(r.noseProjection),
    "Lip Width Ratio": scoreToPercentile(r.lipWidthRatio),
    "Upper Lip Ratio": scoreToPercentile(r.upperLipRatio),
    "Nose Bridge Angle": scoreToPercentile(r.noseBridgeAngle),
    "Eye Tilt": scoreToPercentile(r.eyeTilt),
  };
  const gradeValue = grade;
  const gradeLabelValue = label;
  return {
    ...r,
    overallScore: r.overallScore ?? 5,
    symmetry: r.symmetry ?? 5,
    proportions: r.proportions ?? 5,
    jawline: r.jawline ?? 5,
    eyeSpacing: r.eyeSpacing ?? 5,
    skinClarity: r.skinClarity ?? 5,
    facialShape: r.facialShape ?? "Oval",
    faceShapeProbabilities: r.faceShapeProbabilities ?? { Oval: 0.35, Round: 0.2, Square: 0.15 },
    goldenRatio: r.goldenRatio ?? 5,
    lipFullness: r.lipFullness ?? 5,
    noseProfile: r.noseProfile ?? 5,
    noseProjection: r.noseProjection ?? 5,
    lipWidthRatio: r.lipWidthRatio ?? 5,
    upperLipRatio: r.upperLipRatio ?? 5,
    noseBridgeAngle: r.noseBridgeAngle ?? 5,
    eyeTilt: r.eyeTilt ?? 5,
    cheekboneDefinition: r.cheekboneDefinition ?? 5,
    fwhr: r.fwhr ?? 5,
    canthalTilt: r.canthalTilt ?? 5,
    eyeNoseRatio: r.eyeNoseRatio ?? 5,
    noseChinRatio: r.noseChinRatio ?? 5,
    horizontalFifths: r.horizontalFifths ?? 5,
    rawFwhr: r.rawFwhr ?? 0,
    rawCanthalTilt: r.rawCanthalTilt ?? 0,
    rawEyeNoseRatio: r.rawEyeNoseRatio ?? 0,
    facialHarmony: r.facialHarmony ?? 5,
    breakdown: r.breakdown ?? [],
    overallRating: r.overallRating ?? gradeLabelValue,
    detailedAnalysis: r.detailedAnalysis ?? `Your Face IQ is ${faceIQ}.`,
    strengths: r.strengths ?? [],
    improvements: r.improvements ?? [],
    styleProfile: r.styleProfile ?? "Everyman Appeal",
    blendshapes: r.blendshapes ?? { emotion: "Neutral", emotionConfidence: 0.5, eyeOpenness: 0.5, mouthOpenness: 0.3, browRaise: 0.5, smileIntensity: 0, headTilt: 0 },
    percentile: r.percentile ?? { overall: faceIQ, symmetry: 50, goldenRatio: 50, jawline: 50, skinClarity: 50, harmony: 50, bracket: gradeValue, comparisonText: comparisonFromPercentile(faceIQ) },
    beautyIndex: r.beautyIndex ?? faceIQ,
    faceShapeDetails: r.faceShapeDetails ?? { description: "Your face shape is being analysed.", characteristics: [], idealHairstyles: [], idealGlasses: [] },
    photoQualityScore: r.photoQualityScore ?? 8,
    consistencyScore: r.consistencyScore ?? 8,
    analysisConfidence: r.analysisConfidence ?? 80,
    metricAvailability: r.metricAvailability ?? ["Facial Symmetry", "Golden Ratio Adherence", "Jawline Definition", "Proportional Harmony", "Eye Spacing", "Cheekbone Definition", "FWHR (Facial Width-to-Height)", "Canthal Tilt", "Horizontal Fifths", "Eye–Nose Ratio", "Nose–Chin Balance", "Lip Proportion", "Nose Profile"],
    photoCount: r.photoCount ?? 1,
    qualityGate: r.qualityGate,
    symmetryAxis: r.symmetryAxis,
    faceIQ,
    grade: r.grade ?? gradeValue,
    gradeLabel: r.gradeLabel ?? gradeLabelValue,
    comparison: r.comparison ?? comparisonFromPercentile(faceIQ),
    structureProfile: r.structureProfile ?? ("Balanced" as StructureProfileType),
    youthfulness: r.youthfulness ?? 50,
    metricPercentiles,
  };
}

export interface AnalysisEntry {
  id: string;
  timestamp: number;
  date: string;
  source?: AnalysisSource;
  faceResult: FaceAnalysisResult | null;
  bodyResult: BodyAnalysisResult | null;
  colorAnalysis: ColorAnalysisResult | null;
  outfitRecommendations: OutfitRecommendation[];
  thumbnailUrl: string | null;
  label: string;
}

const STORAGE_KEY = "zervey_history";
const MAX_ENTRIES = 50;

export function getHistory(): AnalysisEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((e: AnalysisEntry) => ({
      ...e,
      faceResult: e.faceResult ? normalizeFaceResult(e.faceResult) : null,
    }));
  } catch {
    return [];
  }
}

function fingerprint(e: Pick<AnalysisEntry, "faceResult" | "bodyResult" | "colorAnalysis" | "thumbnailUrl" | "label">): string {
  const f = e.faceResult;
  const b = e.bodyResult;
  const c = e.colorAnalysis;
  const face = f ? `${f.overallScore}|${f.symmetry}|${f.jawline}|${f.facialShape}|${f.photoCount}` : "";
  const body = b ? `${b.bodyType}|${b.bodyProportionScore ?? 0}` : "";
  const color = c ? `${c.subType}|${c.seasonalType}` : "";
  return `${face}#${body}#${color}#${e.thumbnailUrl ?? ""}#${e.label}`;
}

export function saveToHistory(entry: Omit<AnalysisEntry, "id" | "timestamp" | "date">): AnalysisEntry | null {
  // Demo previews are never real data — refuse to persist them so they can never
  // appear in profile stats, feeds, or trend lines (defense in depth).
  if (entry.source === "demo" || isDemoPhoto(entry.thumbnailUrl)) {
    return null;
  }

  const history = getHistory();
  const newEntry: AnalysisEntry = {
    ...entry,
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const fingerprintOf = fingerprint(newEntry);
  const top = history[0];
  const deduped =
    top && fingerprint(top) === fingerprintOf
      ? [{ ...top, ...newEntry, id: top.id }, ...history.slice(1)]
      : [newEntry, ...history];
  const trimmed = deduped.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full — remove oldest entries
    const reduced = trimmed.slice(0, Math.floor(MAX_ENTRIES / 2));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
    } catch {
      throw new Error("Could not save to history — browser storage is full.");
    }
  }

  return newEntry;
}

export function deleteFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getHistoryEntry(id: string): AnalysisEntry | undefined {
  return getHistory().find((e) => e.id === id);
}

export interface ScoreTrendPoint {
  date: string;
  timestamp: number;
  overall: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  skinClarity: number;
  goldenRatio: number;
  harmony: number;
}

export function isDemoEntry(entry: AnalysisEntry): boolean {
  return (
    entry.source === "demo" ||
    isDemoPhoto(entry.thumbnailUrl)
  );
}

export function getScoreTrends(): ScoreTrendPoint[] {
  return getHistory()
    .filter((e) => e.faceResult && !isDemoEntry(e))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => ({
      date: e.date,
      timestamp: e.timestamp,
      overall: e.faceResult!.overallScore,
      symmetry: e.faceResult!.symmetry,
      proportions: e.faceResult!.proportions,
      jawline: e.faceResult!.jawline,
      skinClarity: e.faceResult!.skinClarity,
      goldenRatio: e.faceResult!.goldenRatio,
      harmony: e.faceResult!.facialHarmony,
    }));
}

export interface BodyTrendPoint {
  date: string;
  timestamp: number;
  shoulderToWaist: number;
  waistToHip: number;
  proportionScore: number;
}

export function getBodyTrends(): BodyTrendPoint[] {
  return getHistory()
    .filter((e) => e.bodyResult && !isDemoEntry(e))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => ({
      date: e.date,
      timestamp: e.timestamp,
      shoulderToWaist: e.bodyResult!.shoulderToWaistRatio ?? 0,
      waistToHip: e.bodyResult!.waistToHipRatio ?? 0,
      proportionScore: e.bodyResult!.bodyProportionScore ?? 0,
    }));
}
