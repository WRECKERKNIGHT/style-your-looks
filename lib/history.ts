import type { FaceAnalysisResult, BodyAnalysisResult, ColorAnalysisResult, OutfitRecommendation } from "@/store/analysis-store";
import type { AnalysisSource } from "@/store/analysis-store";
import { isDemoPhoto } from "@/lib/demo/demo-analysis";
import { scoreToPercentile, gradeFromPercentile, comparisonFromPercentile } from "@/lib/ml/calibration";
import { recomputeFaceIQFromScores } from "@/lib/ml/scoring";

/**
 * Type-normalizes a stored history entry into the current shape.
 *
 * This is a migration shim, not a data factory: numeric measurements that
 * surface as `undefined` from older builds become `null` (never an invented
 * middle score), and the aggregate fields (faceIQ / grade / percentiles)
 * that predate their introduction are re-derived from the real stored
 * scalars through the exact population kernel the live pipeline uses.
 */
function normalizeFaceResult(r: FaceAnalysisResult): FaceAnalysisResult {
  if (!r) return r;

  const measured = {
    symmetry: r.symmetry ?? null,
    proportions: r.proportions ?? null,
    jawline: r.jawline ?? null,
    eyeSpacing: r.eyeSpacing ?? null,
    skinClarity: r.skinClarity ?? null,
    goldenRatio: r.goldenRatio ?? null,
    lipFullness: r.lipFullness ?? null,
    noseProfile: r.noseProfile ?? null,
    cheekboneDefinition: r.cheekboneDefinition ?? null,
    fwhr: r.fwhr ?? null,
    canthalTilt: r.canthalTilt ?? null,
    eyeNoseRatio: r.eyeNoseRatio ?? null,
    noseChinRatio: r.noseChinRatio ?? null,
    horizontalFifths: r.horizontalFifths ?? null,
    noseProjection: r.noseProjection ?? null,
    lipWidthRatio: r.lipWidthRatio ?? null,
    upperLipRatio: r.upperLipRatio ?? null,
    noseBridgeAngle: r.noseBridgeAngle ?? null,
    eyeTilt: r.eyeTilt ?? null,
  };

  const LABELS: [string, keyof typeof measured][] = [
    ["Facial Symmetry", "symmetry"],
    ["Golden Ratio Adherence", "goldenRatio"],
    ["Jawline Definition", "jawline"],
    ["Proportional Harmony", "proportions"],
    ["Eye Spacing", "eyeSpacing"],
    ["Texture Uniformity", "skinClarity"],
    ["Cheekbone Definition", "cheekboneDefinition"],
    ["FWHR (Facial Width-to-Height)", "fwhr"],
    ["Canthal Tilt", "canthalTilt"],
    ["Horizontal Fifths", "horizontalFifths"],
    ["Eye–Nose Ratio", "eyeNoseRatio"],
    ["Nose–Chin Balance", "noseChinRatio"],
    ["Lip Proportion", "lipFullness"],
    ["Nose Profile", "noseProfile"],
    ["Nose Projection", "noseProjection"],
    ["Lip Width Ratio", "lipWidthRatio"],
    ["Upper Lip Ratio", "upperLipRatio"],
    ["Nose Bridge Angle", "noseBridgeAngle"],
    ["Eye Tilt", "eyeTilt"],
  ];

  const metricPercentiles: Record<string, number> = {};
  for (const [label, key] of LABELS) {
    if (key === "skinClarity") {
      if (measured.skinClarity != null) metricPercentiles[label] = scoreToPercentile(measured.skinClarity);
    } else if (measured[key] != null) {
      metricPercentiles[label] = scoreToPercentile(measured[key] as number);
    }
  }

  // Face IQ: take the stored value when present; otherwise backfill it from
  // the genuinely measured scalars (only measured metrics contribute).
  const faceIQ = r.faceIQ ?? recomputeFaceIQFromScores(measured);
  const { grade, label } = gradeFromPercentile(faceIQ);

  return {
    ...r,
    overallScore: r.overallScore,
    symmetry: measured.symmetry,
    proportions: measured.proportions,
    jawline: measured.jawline,
    eyeSpacing: measured.eyeSpacing,
    skinClarity: measured.skinClarity,
    facialShape: r.facialShape,
    faceShapeProbabilities: r.faceShapeProbabilities,
    goldenRatio: measured.goldenRatio,
    lipFullness: measured.lipFullness,
    noseProfile: measured.noseProfile,
    noseProjection: measured.noseProjection,
    lipWidthRatio: measured.lipWidthRatio,
    upperLipRatio: measured.upperLipRatio,
    noseBridgeAngle: measured.noseBridgeAngle,
    eyeTilt: measured.eyeTilt,
    cheekboneDefinition: measured.cheekboneDefinition,
    fwhr: measured.fwhr,
    canthalTilt: measured.canthalTilt,
    eyeNoseRatio: measured.eyeNoseRatio,
    noseChinRatio: measured.noseChinRatio,
    horizontalFifths: measured.horizontalFifths,
    rawFwhr: r.rawFwhr ?? null,
    rawCanthalTilt: r.rawCanthalTilt ?? null,
    rawEyeNoseRatio: r.rawEyeNoseRatio ?? null,
    facialHarmony: r.facialHarmony ?? null,
    breakdown: r.breakdown ?? [],
    overallRating: r.overallRating ?? label,
    detailedAnalysis: r.detailedAnalysis ?? `Your Face IQ is ${faceIQ}.`,
    strengths: r.strengths ?? [],
    improvements: r.improvements ?? [],
    styleProfile: r.styleProfile ?? "Everyman Appeal",
    blendshapes: r.blendshapes ?? { emotion: "Neutral", emotionConfidence: 0.5, eyeOpenness: 0.5, mouthOpenness: 0.3, browRaise: 0.5, smileIntensity: 0, headTilt: 0 },
    percentile: r.percentile ?? {
      overall: faceIQ,
      symmetry: metricPercentiles["Facial Symmetry"] ?? null,
      goldenRatio: metricPercentiles["Golden Ratio Adherence"] ?? null,
      jawline: metricPercentiles["Jawline Definition"] ?? null,
      skinClarity: metricPercentiles["Texture Uniformity"] ?? null,
      harmony: metricPercentiles["Proportional Harmony"] ?? null,
      bracket: grade,
      comparisonText: comparisonFromPercentile(faceIQ),
    },
    beautyIndex: r.beautyIndex ?? faceIQ,
    faceShapeDetails: r.faceShapeDetails ?? { description: "Your face shape is being analysed.", characteristics: [], idealHairstyles: [], idealGlasses: [] },
    photoQualityScore: r.photoQualityScore,
    consistencyScore: r.consistencyScore,
    analysisConfidence: r.analysisConfidence,
    metricAvailability: r.metricAvailability ?? Object.keys(metricPercentiles),
    photoCount: r.photoCount ?? 1,
    qualityGate: r.qualityGate,
    symmetryAxis: r.symmetryAxis,
    faceIQ,
    grade: r.grade ?? grade,
    gradeLabel: r.gradeLabel ?? label,
    comparison: r.comparison ?? comparisonFromPercentile(faceIQ),
    structureProfile: r.structureProfile ?? null,
    youthfulness: r.youthfulness ?? null,
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
  /** Per-metric trend values; `null` when that aspect was not measured in a given session. */
  symmetry: number | null;
  proportions: number | null;
  jawline: number | null;
  skinClarity: number | null;
  goldenRatio: number | null;
  harmony: number | null;
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
