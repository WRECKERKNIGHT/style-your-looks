import { create } from "zustand";

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
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  colors: string[];
  occasion: string;
  mannequinPreview: string[];
  reasoning: string;
}

interface AnalysisState {
  faceResult: FaceAnalysisResult | null;
  bodyResult: BodyAnalysisResult | null;
  outfitRecommendations: OutfitRecommendation[];
  uploadedImage: string | null;
  fullBodyImage: string | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  selectedBeardStyle: string;
  selectedMustacheStyle: string;

  setFaceResult: (result: FaceAnalysisResult) => void;
  setBodyResult: (result: BodyAnalysisResult) => void;
  setOutfitRecommendations: (recs: OutfitRecommendation[]) => void;
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
  uploadedImage: null,
  fullBodyImage: null,
  isAnalyzing: false,
  analysisProgress: 0,
  selectedBeardStyle: "clean-shaven",
  selectedMustacheStyle: "none",

  setFaceResult: (result) => set({ faceResult: result }),
  setBodyResult: (result) => set({ bodyResult: result }),
  setOutfitRecommendations: (recs) => set({ outfitRecommendations: recs }),
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
      uploadedImage: null,
      fullBodyImage: null,
      isAnalyzing: false,
      analysisProgress: 0,
      selectedBeardStyle: "clean-shaven",
      selectedMustacheStyle: "none",
    }),
}));
