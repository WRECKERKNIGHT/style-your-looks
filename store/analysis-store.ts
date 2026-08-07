import { create } from "zustand";
import { saveToHistory, type AnalysisEntry } from "@/lib/history";
import type { AnalysisProfile } from "@/lib/ml/scoring";

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

export interface PhotoQualityGate {
  brightness: number;
  sharpness: number;
  faceSizeRatio: number;
  headRoll: number;
  headPitch: number;
  issues: string[];
  warnings: string[];
}

export interface FaceAnalysisResult {
  overallScore: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyeSpacing: number;
  skinClarity: number;
  facialShape: string;
  skinTone: string;
  skinToneValue?: string;
  skinToneScaleId?: number;
  skinToneITA?: number;
  undertone: string;
  ageEstimation: number;
  ageConfidence?: number;
  ageBasis?: string;
  genderEstimation: string;
  genderProfile: AnalysisProfile;
  emotionDetected: string;
  groomingSuggestions: string[];
  landmarks: number[][];

  goldenRatio: number;
  lipFullness: number;
  noseProfile: number;
  foreheadBalance: number;
  cheekboneDefinition: number;
  fwhr: number;
  canthalTilt: number;
  eyeNoseRatio: number;
  noseChinRatio: number;
  midfaceRatio: number;
  horizontalFifths: number;
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
  consistencyScore: number;
  analysisConfidence: number;
  photoCount: number;
  qualityGate?: PhotoQualityGate;
  /** Pose-aware symmetry axis tilt (degrees from vertical) for overlays. */
  symmetryAxis?: { angleDeg: number };
}

export interface BodyAnalysisResult {
  bodyType: string;
  skinToneScale: string;
  skinToneValue: string;
  undertone: string;
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  recommendations: string[];
  shoulderToWaistRatio?: number;
  waistToHipRatio?: number;
  bodyProportionScore?: number;
  bodySymmetry?: number;
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  colors: string[];
  occasion: string;
  mannequinPreview: string[];
  reasoning: string;
  keyPieces: string[];
  season?: string;
  styleType?: string;
}

export interface ColorAnalysisResult {
  seasonalType: string;
  subType: string;
  bestColors: string[];
  worstColors: string[];
  neutralColors: string[];
  metalPreference: string;
  patternRecommendation: string;
  description: string;
}

export type AnalysisSource = "real" | "demo";

interface AnalysisState {
  source: AnalysisSource;
  faceResult: FaceAnalysisResult | null;
  bodyResult: BodyAnalysisResult | null;
  outfitRecommendations: OutfitRecommendation[];
  colorAnalysis: ColorAnalysisResult | null;
  uploadedImage: string | null;
  fullBodyImage: string | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  processingPreview: { image: string; landmarks: number[][] } | null;
  genderProfile: AnalysisProfile;
  selectedBeardStyle: string;
  selectedMustacheStyle: string;
  lastSavedEntry: AnalysisEntry | null;
  /** Monotonic revision bumped whenever a new photo enters the store. Consumers
   *  subscribe to this to re-run their derived pipelines when it changes. */
  pipelineRev: number;
  /** True when the active photo is newer than the cached analysis results. */
  photoDirty: boolean;

  setFaceResult: (result: FaceAnalysisResult) => void;
  setBodyResult: (result: BodyAnalysisResult) => void;
  setOutfitRecommendations: (recs: OutfitRecommendation[]) => void;
  setColorAnalysis: (analysis: ColorAnalysisResult | null) => void;
  setUploadedImage: (image: string | null) => void;
  setFullBodyImage: (image: string | null) => void;
  /** Best available photo for face-based tools: the full-body shot falls back to the face upload. */
  readonly currentPhoto: string | null;
  setIsAnalyzing: (val: boolean) => void;
  setAnalysisProgress: (val: number) => void;
  setProcessingPreview: (preview: { image: string; landmarks: number[][] } | null) => void;
  setGenderProfile: (profile: AnalysisProfile) => void;
  setSelectedBeardStyle: (style: string) => void;
  setSelectedMustacheStyle: (style: string) => void;
  setSource: (source: AnalysisSource) => void;
  /**
   * Canonical photo entry point. Sets the face or full-body photo, bumps the
   * pipeline revision so subscribed tools re-derive, and flags results stale.
   */
  setPhoto: (photo: string, kind: "face" | "body") => void;
  /** Marks current results as fresh against the active photo. */
  markAnalyzed: () => void;
  saveCurrentAnalysis: (label?: string) => AnalysisEntry | null;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  source: "real",
  faceResult: null,
  bodyResult: null,
  outfitRecommendations: [],
  colorAnalysis: null,
  uploadedImage: null,
  fullBodyImage: null,
  isAnalyzing: false,
  analysisProgress: 0,
  processingPreview: null,
  genderProfile: "neutral",
  selectedBeardStyle: "clean-shaven",
  selectedMustacheStyle: "none",
  lastSavedEntry: null,
  pipelineRev: 0,
  photoDirty: false,
  get currentPhoto() {
    return get().fullBodyImage ?? get().uploadedImage;
  },

  setFaceResult: (result) => set({ faceResult: result }),
  setBodyResult: (result) => set({ bodyResult: result }),
  setOutfitRecommendations: (recs) => set({ outfitRecommendations: recs }),
  setColorAnalysis: (analysis) => set({ colorAnalysis: analysis }),
  setUploadedImage: (image) => set({ uploadedImage: image }),
  setFullBodyImage: (image) => set({ fullBodyImage: image }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  setAnalysisProgress: (val) => set({ analysisProgress: val }),
  setProcessingPreview: (processingPreview) => set({ processingPreview }),
  setGenderProfile: (genderProfile) => set({ genderProfile }),
  setSelectedBeardStyle: (style) => set({ selectedBeardStyle: style }),
  setSelectedMustacheStyle: (style) => set({ selectedMustacheStyle: style }),
  setSource: (source) => set({ source }),

  setPhoto: (photo, kind) =>
    set((state) => ({
      ...(kind === "body"
        ? { fullBodyImage: photo }
        : { uploadedImage: photo }),
      pipelineRev: state.pipelineRev + 1,
      photoDirty: true,
    })),

  markAnalyzed: () => set({ photoDirty: false }),

  saveCurrentAnalysis: (label?: string) => {
    const state = get();
    if (state.source === "demo") {
      return null;
    }
    const thumbnailUrl = state.bodyResult
      ? state.fullBodyImage
      : state.uploadedImage;
    try {
      const entry = saveToHistory({
        faceResult: state.faceResult,
        bodyResult: state.bodyResult,
        colorAnalysis: state.colorAnalysis,
        outfitRecommendations: state.outfitRecommendations,
        thumbnailUrl,
        label:
          label ||
          (state.faceResult
            ? `${state.faceResult.facialShape} Face — ${state.faceResult.overallRating}`
            : state.bodyResult
            ? `${state.bodyResult.bodyType} Body`
            : state.colorAnalysis
            ? `${state.colorAnalysis.subType} Palette`
            : "Untitled Analysis"),
      });
      set({ lastSavedEntry: entry });
      return entry;
    } catch {
      return null;
    }
  },

  reset: () =>
    set((state) => ({
      source: "real",
      faceResult: null,
      bodyResult: null,
      outfitRecommendations: [],
      colorAnalysis: null,
      uploadedImage: null,
      fullBodyImage: null,
      isAnalyzing: false,
      analysisProgress: 0,
      processingPreview: null,
      selectedBeardStyle: "clean-shaven",
      selectedMustacheStyle: "none",
      lastSavedEntry: null,
      pipelineRev: state.pipelineRev + 1,
      photoDirty: false,
    })),
}));
