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
  undertone: string;
  ageEstimation: number;
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

  setFaceResult: (result: FaceAnalysisResult) => void;
  setBodyResult: (result: BodyAnalysisResult) => void;
  setOutfitRecommendations: (recs: OutfitRecommendation[]) => void;
  setColorAnalysis: (analysis: ColorAnalysisResult | null) => void;
  setUploadedImage: (image: string | null) => void;
  setFullBodyImage: (image: string | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  setAnalysisProgress: (val: number) => void;
  setProcessingPreview: (preview: { image: string; landmarks: number[][] } | null) => void;
  setGenderProfile: (profile: AnalysisProfile) => void;
  setSelectedBeardStyle: (style: string) => void;
  setSelectedMustacheStyle: (style: string) => void;
  setSource: (source: AnalysisSource) => void;
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
    set({
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
    }),
}));
