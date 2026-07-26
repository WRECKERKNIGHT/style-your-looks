import { create } from "zustand";

export interface FacialMetric {
  label: string;
  score: number;
  weight: number;
  description: string;
  rating: string;
  tip: string;
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
  emotionDetected: string;
  groomingSuggestions: string[];
  landmarks: number[][];

  goldenRatio: number;
  lipFullness: number;
  noseProfile: number;
  foreheadBalance: number;
  cheekboneDefinition: number;
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

interface AnalysisState {
  faceResult: FaceAnalysisResult | null;
  bodyResult: BodyAnalysisResult | null;
  outfitRecommendations: OutfitRecommendation[];
  colorAnalysis: ColorAnalysisResult | null;
  uploadedImage: string | null;
  fullBodyImage: string | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  selectedBeardStyle: string;
  selectedMustacheStyle: string;

  setFaceResult: (result: FaceAnalysisResult) => void;
  setBodyResult: (result: BodyAnalysisResult) => void;
  setOutfitRecommendations: (recs: OutfitRecommendation[]) => void;
  setColorAnalysis: (analysis: ColorAnalysisResult | null) => void;
  setUploadedImage: (image: string | null) => void;
  setFullBodyImage: (image: string | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  setAnalysisProgress: (val: number) => void;
  setSelectedBeardStyle: (style: string) => void;
  setSelectedMustacheStyle: (style: string) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  faceResult: null,
  bodyResult: null,
  outfitRecommendations: [],
  colorAnalysis: null,
  uploadedImage: null,
  fullBodyImage: null,
  isAnalyzing: false,
  analysisProgress: 0,
  selectedBeardStyle: "clean-shaven",
  selectedMustacheStyle: "none",

  setFaceResult: (result) => set({ faceResult: result }),
  setBodyResult: (result) => set({ bodyResult: result }),
  setOutfitRecommendations: (recs) => set({ outfitRecommendations: recs }),
  setColorAnalysis: (analysis) => set({ colorAnalysis: analysis }),
  setUploadedImage: (image) => set({ uploadedImage: image }),
  setFullBodyImage: (image) => set({ fullBodyImage: image }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  setAnalysisProgress: (val) => set({ analysisProgress: val }),
  setSelectedBeardStyle: (style) => set({ selectedBeardStyle: style }),
  setSelectedMustacheStyle: (style) => set({ selectedMustacheStyle: style }),
  reset: () =>
    set({
      faceResult: null,
      bodyResult: null,
      outfitRecommendations: [],
      colorAnalysis: null,
      uploadedImage: null,
      fullBodyImage: null,
      isAnalyzing: false,
      analysisProgress: 0,
      selectedBeardStyle: "clean-shaven",
      selectedMustacheStyle: "none",
    }),
}));
