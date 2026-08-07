import type { FaceAnalysisResult, BodyAnalysisResult, ColorAnalysisResult, OutfitRecommendation } from "@/store/analysis-store";
import type { AnalysisSource } from "@/store/analysis-store";
import { isDemoPhoto } from "@/lib/demo/demo-analysis";

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
    return JSON.parse(raw);
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
