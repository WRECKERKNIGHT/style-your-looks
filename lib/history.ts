import type { FaceAnalysisResult, BodyAnalysisResult, ColorAnalysisResult, OutfitRecommendation } from "@/store/analysis-store";

export interface AnalysisEntry {
  id: string;
  timestamp: number;
  date: string;
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

export function saveToHistory(entry: Omit<AnalysisEntry, "id" | "timestamp" | "date">): AnalysisEntry {
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

  history.unshift(newEntry);
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full — remove oldest entries
    history.length = Math.floor(MAX_ENTRIES / 2);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
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

export function getScoreTrends(): ScoreTrendPoint[] {
  return getHistory()
    .filter((e) => e.faceResult)
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
    .filter((e) => e.bodyResult)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => ({
      date: e.date,
      timestamp: e.timestamp,
      shoulderToWaist: e.bodyResult!.shoulderToWaistRatio ?? 0,
      waistToHip: e.bodyResult!.waistToHipRatio ?? 0,
      proportionScore: e.bodyResult!.bodyProportionScore ?? 0,
    }));
}
