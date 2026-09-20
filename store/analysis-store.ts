import { create } from "zustand";
import { saveToHistory, type AnalysisEntry } from "@/lib/history";
import type { AnalysisProfile } from "@/lib/ml/scoring";
import type { StructureProfileType } from "@/lib/ml/face-analyzer";
import type { RawGeometry } from "@/lib/ml/face-analyzer";
import type { EthnicRegion } from "@/lib/ml/calibration";

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

export interface PhotoQualityGate {
  brightness: number | null;
  sharpness: number | null;
  faceSizeRatio: number;
  headYaw: number;
  headRoll: number;
  headPitch: number;
  issues: string[];
  warnings: string[];
}

export interface FaceAnalysisResult {
  overallScore: number | null;
  /** Per-metric 1-10 scores; `null` = not measurable from the supplied photos. */
  symmetry: number | null;
  proportions: number | null;
  jawline: number | null;
  eyeSpacing: number | null;
  skinClarity: number | null;
  facialShape: string;
  faceShapeProbabilities: Record<string, number>;
  skinTone: string;
  skinToneValue?: string;
  skinToneScaleId?: number;
  skinToneITA?: number;
  undertone: string;
  ageEstimation: number | null;
  ageConfidence?: number;
  ageBasis?: string;
  genderEstimation: string;
  genderProfile: AnalysisProfile;
  emotionDetected: string | null;
  groomingSuggestions: string[];
  landmarks: number[][];

  goldenRatio: number | null;
  lipFullness: number | null;
  noseProfile: number | null;
  noseProjection: number | null;
  lipWidthRatio: number | null;
  upperLipRatio: number | null;
  noseBridgeAngle: number | null;
  eyeTilt: number | null;
  cheekboneDefinition: number | null;
  fwhr: number | null;
  canthalTilt: number | null;
  eyeNoseRatio: number | null;
  noseChinRatio: number | null;
  horizontalFifths: number | null;
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
  faceShapeDetails: { description: string; characteristics: string[]; idealHairstyles: string[]; idealGlasses: string[] };
  photoQualityScore: number | null;
  consistencyScore?: number;
  /** Metrics that could not be scored, with the honest reason why. `undefined`
   *  hides the panel entirely; an empty array is not used. */
  notMeasured?: { label: string; reason: string }[];
  analysisConfidence: number;
  metricAvailability: string[];
  photoCount: number;
  qualityGate?: PhotoQualityGate;
  /** Pose-aware symmetry axis tilt (degrees from vertical) for overlays. */
  symmetryAxis?: { angleDeg: number };
  /** Population-calibrated Face IQ (0-100); `null` when no measurable data. */
  faceIQ: number | null;
  /** Letter grade from percentile. */
  grade: string | null;
  /** Descriptive label for the grade. */
  gradeLabel: string | null;
  /** Human-readable comparison. */
  comparison: string | null;
  /** Structure profile descriptor (Soft/Balanced/Defined/Sharp) or null when not measurable. */
  structureProfile: StructureProfileType | null;
  /** Youthfulness score (0-100); `null` when not measurable. */
  youthfulness: number | null;
  /** Per-metric percentiles for distribution bars. */
  metricPercentiles: Record<string, number>;
  /** Raw geometry measurements (for measurement debugger). */
  rawGeometry?: RawGeometry;
  /** Domain-level scores. */
  faceProfile?: {
    geometry: number | null;
    symmetry: number | null;
    structure: number | null;
    eyes: number | null;
    nasal: number | null;
    confidence: number;
  };
}

export interface IntakeProfile {
  region: EthnicRegion;
  ageBand: string;
  genderProfile: AnalysisProfile;
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
  /** Pre-analysis intake profile for calibration. */
  intakeProfile: IntakeProfile | null;

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
  setIntakeProfile: (profile: IntakeProfile | null) => void;
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
  intakeProfile: null,

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
  setIntakeProfile: (intakeProfile) => set({ intakeProfile }),

  setPhoto: (photo, kind) =>
    set((state) => ({
      ...(kind === "body"
        ? { fullBodyImage: photo }
        : { uploadedImage: photo }),
      pipelineRev: state.pipelineRev + 1,
      photoDirty: true,
    })),

  markAnalyzed: () => set({ photoDirty: false }),

  saveCurrentAnalysis: (label?: string) => {    const state = get();
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
    } catch (err) {
      console.warn("Could not save analysis to history:", err);
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

/** Best available photo for face-based tools: full-body shot falls back to face upload.
 *  Use as a zustand selector — a getter property on the state object would be
 *  baked stale by zustand v5's Object.assign-based setState. */
export function selectCurrentPhoto(state: AnalysisState): string | null {
  return state.fullBodyImage ?? state.uploadedImage;
}
