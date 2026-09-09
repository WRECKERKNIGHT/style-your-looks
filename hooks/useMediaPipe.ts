"use client";

import { useCallback, useRef, useEffect } from "react";
import { analyzeFace } from "@/lib/ml/face-analyzer";
import { preprocessImage, quickQualityGate, prepareCanvas } from "@/lib/ml/preprocessing";
import { useToastStore } from "@/components/shared/Toast";
import { analyzeBody, extractBodyMeasurements, classifyBodyType } from "@/lib/ml/body-analyzer";
import { analyzeSkinTone, analyzeSkinToneFromImage } from "@/lib/ml/skin-tone";
import { estimateAgeFromFace } from "@/lib/ml/age-estimator";
import {
  calculateFaceScore,
  computeFaceMetrics,
  mergeFaceScores,
  getGroomingSuggestions,
  type FaceScoreResult,
  type FaceScoreSample,
  type AnalysisProfile,
} from "@/lib/ml/scoring";
import { getYouthfulness, getStructureProfile } from "@/lib/ml/face-analyzer";
import { assessPhotoQuality, type PhotoQualityReport } from "@/lib/ml/face-quality";
import { generateRecommendations } from "@/lib/ml/outfit-recommender";
import { useAnalysisStore } from "@/store/analysis-store";

export class AnalysisCancelledError extends Error {
  constructor() {
    super("Analysis cancelled");
    this.name = "AnalysisCancelledError";
  }
}

/**
 * Options controlling how an analysis run persists its outcome.
 * Demo mode runs the exact same MediaPipe + scoring pipeline as a real
 * upload but never saves to history and keeps the store source as "demo"
 * so the UI can label the result as a preview and the save button is blocked.
 */
export interface AnalysisRunOptions {
  /** When true, the store source stays "demo" and the result is NOT persisted. */
  demoMode?: boolean;
}

function computeSkinClarityScore(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  numFaces: number
): number | null {
  if (numFaces === 0) return null;

  const zones = [
    { x: 0.3, y: 0.25, r: 0.08 },
    { x: 0.7, y: 0.25, r: 0.08 },
    { x: 0.5, y: 0.35, r: 0.06 },
    { x: 0.35, y: 0.5, r: 0.07 },
    { x: 0.65, y: 0.5, r: 0.07 },
    { x: 0.5, y: 0.6, r: 0.06 },
    { x: 0.5, y: 0.45, r: 0.05 },
  ];

  let totalVariance = 0;
  let validZones = 0;

  for (const zone of zones) {
    try {
      const cx = Math.floor(zone.x * canvas.width);
      const cy = Math.floor(zone.y * canvas.height);
      const radius = Math.floor(zone.r * Math.min(canvas.width, canvas.height));
      const imageData = ctx.getImageData(
        Math.max(0, cx - radius),
        Math.max(0, cy - radius),
        radius * 2,
        radius * 2
      );
      const data = imageData.data;
      let sum = 0;
      let sumSq = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        sum += brightness;
        sumSq += brightness * brightness;
        count++;
      }

      if (count > 0) {
        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        totalVariance += Math.sqrt(variance);
        validZones++;
      }
    } catch {
      // skip zone
    }
  }

  if (validZones === 0) return null;

  const avgVariance = totalVariance / validZones;
  const clarityScore = Math.max(1, Math.min(10, 10 - avgVariance / 12));
  return Math.round(clarityScore * 10) / 10;
}

function buildStoreFaceResult(
  scoreResult: FaceScoreResult,
  landmarks: number[][],
  skinTone: ReturnType<typeof analyzeSkinTone>,
  quality: PhotoQualityReport | null,
  genderProfile: AnalysisProfile = "neutral",
  age: ReturnType<typeof estimateAgeFromFace> = {
    age: null,
    confidence: 0,
    basis: "Not measurable — no landmarks detected",
  }
) {
  return {
    overallScore: scoreResult.overallScore,
    symmetry: scoreResult.symmetry,
    proportions: scoreResult.proportions,
    jawline: scoreResult.jawline,
    eyeSpacing: scoreResult.eyeSpacing,
    skinClarity: scoreResult.skinClarity,
    facialShape: scoreResult.facialShape,
    faceShapeProbabilities: scoreResult.faceShapeProbabilities,
    skinTone: skinTone?.monkScale.label || "Unknown",
    skinToneValue: skinTone?.monkScale.hex,
    skinToneScaleId: skinTone?.monkScale.id,
    skinToneITA: skinTone?.ita,
    undertone: skinTone?.undertone || "Neutral",
    ageEstimation: age.age,
    ageConfidence: age.confidence,
    ageBasis: age.basis,
    genderEstimation: genderProfile === "neutral" ? "Neutral" : genderProfile,
    genderProfile,
    emotionDetected: scoreResult.blendshapes?.emotion ?? null,
    groomingSuggestions: getGroomingSuggestions(
      scoreResult.facialShape,
      scoreResult,
      genderProfile
    ),
    landmarks,
    goldenRatio: scoreResult.goldenRatio,
    lipFullness: scoreResult.lipFullness,
    noseProfile: scoreResult.noseProfile,
    noseProjection: scoreResult.noseProjection,
    lipWidthRatio: scoreResult.lipWidthRatio,
    upperLipRatio: scoreResult.upperLipRatio,
    noseBridgeAngle: scoreResult.noseBridgeAngle,
    eyeTilt: scoreResult.eyeTilt,
    cheekboneDefinition: scoreResult.cheekboneDefinition,
    fwhr: scoreResult.fwhr,
    canthalTilt: scoreResult.canthalTilt,
    eyeNoseRatio: scoreResult.eyeNoseRatio,
    noseChinRatio: scoreResult.noseChinRatio,
    horizontalFifths: scoreResult.horizontalFifths,
    rawFwhr: scoreResult.rawFwhr,
    rawCanthalTilt: scoreResult.rawCanthalTilt,
    rawEyeNoseRatio: scoreResult.rawEyeNoseRatio,
    facialHarmony: scoreResult.facialHarmony,
    breakdown: scoreResult.breakdown,
    overallRating: scoreResult.overallRating,
    detailedAnalysis: scoreResult.detailedAnalysis,
    strengths: scoreResult.strengths,
    improvements: scoreResult.improvements,
    styleProfile: scoreResult.styleProfile,
    blendshapes: scoreResult.blendshapes,
    percentile: scoreResult.percentile,
    beautyIndex: scoreResult.beautyIndex,
    faceShapeDetails: scoreResult.faceShapeDetails,
    photoQualityScore: scoreResult.photoQualityScore,
    consistencyScore: scoreResult.consistencyScore,
    analysisConfidence: scoreResult.analysisConfidence,
    metricAvailability: scoreResult.metricAvailability,
    photoCount: scoreResult.photoCount,
    symmetryAxis: scoreResult.symmetryAxis,
    faceIQ: scoreResult.faceIQ,
    grade: scoreResult.grade,
    gradeLabel: scoreResult.gradeLabel,
    comparison: scoreResult.comparison,
    structureProfile: scoreResult.structureProfile,
    youthfulness: scoreResult.youthfulness,
    metricPercentiles: scoreResult.metricPercentiles,
    rawGeometry: scoreResult.rawGeometry,
    faceProfile: scoreResult.faceProfile,
    qualityGate: quality
      ? {
          brightness: quality.brightness,
          sharpness: quality.sharpness,
          faceSizeRatio: quality.faceSizeRatio,
          headYaw: quality.headYaw,
          headRoll: quality.headRoll,
          headPitch: quality.headPitch,
          issues: quality.issues,
          warnings: quality.warnings,
        }
      : undefined,
  };
}

export function useMediaPipe() {
  const {
    setFaceResult,
    setBodyResult,
    setOutfitRecommendations,
    setIsAnalyzing,
    setAnalysisProgress,
    saveCurrentAnalysis,
  } = useAnalysisStore();

  const cancelledRef = useRef(false);

  useEffect(() => {
    const ref = cancelledRef;
    return () => {
      ref.current = true;
    };
  }, []);

  const cancelAnalysis = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const throwIfCancelled = useCallback(() => {
    if (cancelledRef.current) throw new AnalysisCancelledError();
  }, []);

  const analyzeFaceFromImage = useCallback(
    async (
      imageElement: HTMLImageElement,
      genderProfile: AnalysisProfile = "neutral",
      onPreview?: (landmarks: number[][]) => void,
      options?: AnalysisRunOptions
    ) => {
      cancelledRef.current = false;
      useAnalysisStore.getState().setSource(options?.demoMode ? "demo" : "real");
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        if (!imageElement.naturalWidth || !imageElement.naturalHeight) {
          throw new Error("Could not load the photo. Try re-uploading it.");
        }

        const pre = preprocessImage(imageElement);
        const canvas = pre.canvas;
        if (pre.gammaApplied !== null) {
          // Tell the user the engine corrected their lighting instead of
          // silently scoring a dark photo — builds trust in the numbers.
          useToastStore.getState().addToast(
            "Low light detected — auto-corrected before analysis for a cleaner read",
            "info"
          );
        }
        const ctx = canvas.getContext("2d")!;

        const gate = quickQualityGate(canvas);
        if (!gate.usable) {
          throw new Error(
            `Could not analyse this photo: ${gate.issues.join("; ")}. Use a clearer, front-facing photo.`
          );
        }

        setAnalysisProgress(10);
        // analyzeFace reports its own 0→100 milestones through onProgress; if
        // we passed setAnalysisProgress straight through, its final 100 fired
        // and then the hard-set 60 below yanked the bar BACKWARD to 60. Scale
        // the engine's milestones into the preprocessing→detection window
        // (10→60) so the bar only ever moves forward.
        const faceResult = await analyzeFace(canvas, (raw) =>
          setAnalysisProgress(Math.min(60, 10 + Math.round((raw / 100) * 50)))
        );
        throwIfCancelled();
        setAnalysisProgress(60);

        const skinTone = analyzeSkinTone(canvas, faceResult);
        const numFaces = faceResult.faceLandmarks?.length || 0;
        const skinClarityScore = computeSkinClarityScore(canvas, ctx, numFaces);
        const quality = assessPhotoQuality(canvas, faceResult, numFaces);
        if (!quality.usable) {
          throw new Error(
            `Could not analyse this photo: ${quality.issues.join("; ")}. Use a clearer, front-facing photo.`
          );
        }
        const metrics = computeFaceMetrics(faceResult);
        const blendshapes = faceResult.faceBlendshapes?.[0]?.categories;
        const eyeOpenness = blendshapes ? 1 - ((blendshapes.find(s => s.categoryName === "eyeBlinkLeft")?.score ?? 0) + (blendshapes.find(s => s.categoryName === "eyeBlinkRight")?.score ?? 0)) / 2 : 0.5;
        const smileIntensity = blendshapes ? ((blendshapes.find(s => s.categoryName === "smileLeft")?.score ?? 0) + (blendshapes.find(s => s.categoryName === "smileRight")?.score ?? 0)) / 2 : 0;
        const youthfulness = getYouthfulness(canvas, faceResult, { eyeOpenness, smileIntensity });
        const structureProfile = getStructureProfile(faceResult);
        const scoreResult = mergeFaceScores(
          [{ metrics, skinClarity: skinClarityScore, quality, youthfulness, structureProfile: structureProfile?.label ?? null }],
          genderProfile
        ).result;

        onPreview?.(
          faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || []
        );
        setFaceResult(
          buildStoreFaceResult(
            scoreResult,
            faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [],
            skinTone,
            quality,
            genderProfile,
            estimateAgeFromFace(canvas, faceResult, skinClarityScore)
          )
        );

        setAnalysisProgress(100);
        if (!options?.demoMode) saveCurrentAnalysis();
        return { faceResult, skinTone, scoreResult };
      } catch (err) {
        console.error("Face analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setFaceResult, setIsAnalyzing, setAnalysisProgress, saveCurrentAnalysis]
  );

  const analyzeFacePhotos = useCallback(
    async (
      imageElements: HTMLImageElement[],
      genderProfile: AnalysisProfile = "neutral",
      onPreview?: (index: number, landmarks: number[][]) => void,
      options?: AnalysisRunOptions,
      views?: Array<"front" | "profile">
    ) => {
      cancelledRef.current = false;
      useAnalysisStore.getState().setSource(options?.demoMode ? "demo" : "real");
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        const samples: FaceScoreSample[] = [];
        const rejected: { index: number; issues: string[] }[] = [];
        let bestQuality = -1;
        // The displayed overlay/readouts (landmarks, pose guidance, skin tone,
        // age, quality report) must come from a frontal capture: a profile shot
        // cannot measure frontal metrics, so letting a high-scoring profile
        // photo win the display slot showed a sideways face for 'symmetry' and
        // pitched frontal-pose guidance at the user. The best frontal wins;
        // the best profile is only a fallback when no frontal sample is usable.
        // The profile still contributes its nasal measurements via the merge.
        type SamplePick = {
          quality: number;
          result: Awaited<ReturnType<typeof analyzeFace>> | null;
          canvas: HTMLCanvasElement | null;
          report: PhotoQualityReport | null;
          skinTone: ReturnType<typeof analyzeSkinTone>;
          index: number;
        };
        const emptyPick = (): SamplePick => ({
          quality: -1,
          result: null,
          canvas: null,
          report: null,
          skinTone: null,
          index: 0,
        });
        const pickFrontal = emptyPick();
        const pickProfile = emptyPick();

        for (let i = 0; i < imageElements.length; i++) {
          setAnalysisProgress(Math.round((i / imageElements.length) * 75));
          const image = imageElements[i];
          // Slot 0 = normal frontal portrait, slot 1 = side profile (when a
          // profile photo is supplied), everything else = frontal.
          const view: "front" | "profile" = views?.[i] ?? "front";

          if (!image.naturalWidth || !image.naturalHeight) {
            rejected.push({ index: i, issues: ["Could not load the photo"] });
            continue;
          }

          const { canvas } = preprocessImage(image);
          const ctx = canvas.getContext("2d")!;

          const gate = quickQualityGate(canvas);
          if (!gate.usable) {
            rejected.push({ index: i, issues: gate.issues });
            continue;
          }

          const faceResult = await analyzeFace(canvas);
          throwIfCancelled();
          const numFaces = faceResult.faceLandmarks?.length || 0;
          const quality = assessPhotoQuality(canvas, faceResult, numFaces, view);

          if (!quality.usable) {
            rejected.push({ index: i, issues: quality.issues });
            continue;
          }

          onPreview?.(
            i,
            faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || []
          );
          const skinClarityScore = computeSkinClarityScore(canvas, ctx, numFaces);
          const metrics = computeFaceMetrics(faceResult, view);
          const blendshapes = faceResult.faceBlendshapes?.[0]?.categories;
          const eyeOpenness = blendshapes ? 1 - ((blendshapes.find(s => s.categoryName === "eyeBlinkLeft")?.score ?? 0) + (blendshapes.find(s => s.categoryName === "eyeBlinkRight")?.score ?? 0)) / 2 : 0.5;
          const smileIntensity = blendshapes ? ((blendshapes.find(s => s.categoryName === "smileLeft")?.score ?? 0) + (blendshapes.find(s => s.categoryName === "smileRight")?.score ?? 0)) / 2 : 0;
          const youthfulness = getYouthfulness(canvas, faceResult, { eyeOpenness, smileIntensity });
          const structureProfile = getStructureProfile(faceResult);
          samples.push({ metrics, skinClarity: skinClarityScore, quality, sourceResult: faceResult, youthfulness, structureProfile: structureProfile?.label ?? null, view });

          const qScore = quality.score ?? -1;
          const skinTone = analyzeSkinTone(canvas, faceResult);
          const pick = view === "front" ? pickFrontal : pickProfile;
          if (qScore > pick.quality) {
            pick.quality = qScore;
            pick.result = faceResult;
            pick.canvas = canvas;
            pick.report = quality;
            pick.skinTone = skinTone;
            pick.index = i;
          }
          if (qScore > bestQuality) bestQuality = qScore;
        }

        if (samples.length === 0) {
          const details = rejected.map((r) => r.issues.join("; ")).join(" | ");
          throw new Error(
            `We couldn't analyze any photo.${details ? ` ${details}` : ""} Use a clearer, front-facing photo with your face centered and well-lit.`
          );
        }

        setAnalysisProgress(88);
        const { result: scoreResult } = mergeFaceScores(samples, genderProfile);
        throwIfCancelled();
        const displayBest = pickFrontal.result ? pickFrontal : pickProfile;
        const landmarks =
          displayBest.result?.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];

        setFaceResult(
          buildStoreFaceResult(
            scoreResult,
            landmarks,
            displayBest.skinTone,
            displayBest.report,
            genderProfile,
            displayBest.canvas && displayBest.result
              ? estimateAgeFromFace(
                  displayBest.canvas,
                  displayBest.result,
                  samples[displayBest.index]?.skinClarity ?? null
                )
              : undefined
          )
        );

        setAnalysisProgress(100);
        if (!options?.demoMode) saveCurrentAnalysis();
        return { scoreResult, samples, rejected, photoCount: samples.length, bestIndex: displayBest.index };
      } catch (err) {
        console.error("Multi-photo face analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setFaceResult, setIsAnalyzing, setAnalysisProgress, saveCurrentAnalysis]
  );

  const analyzeBodyFromImage = useCallback(
    async (imageElement: HTMLImageElement) => {
      cancelledRef.current = false;
      useAnalysisStore.getState().setSource("real");
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        setAnalysisProgress(10);
        // Same forward-only scaling as the face path: analyzeBody's internal
        // onProgress(100) used to race past the hard-set 50 and then regress
        // back down to 50 once the await resolved.
        const bodyResult = await analyzeBody(imageElement, (raw) =>
          setAnalysisProgress(Math.min(50, 10 + Math.round((raw / 100) * 40)))
        );
        throwIfCancelled();
        setAnalysisProgress(50);

        const canvas = prepareCanvas(imageElement);
        const skinTone = analyzeSkinToneFromImage(canvas);

        const measurements = extractBodyMeasurements(bodyResult);

        let bodyType = "Unknown";
        if (measurements) {
          bodyType = classifyBodyType(measurements);
        }

        const shoulderWidth = measurements?.shoulderWidth || 0;
        const waistWidth = measurements?.waistWidth || 0;
        const hipWidth = measurements?.hipWidth || 0;

        const shoulderToWaistRatio =
          waistWidth > 0 ? Math.round((shoulderWidth / waistWidth) * 100) / 100 : undefined;
        const waistToHipRatio =
          hipWidth > 0 ? Math.round((waistWidth / hipWidth) * 100) / 100 : undefined;

        const bodyProportionScore = (() => {
          if (!shoulderToWaistRatio || !waistToHipRatio) return undefined;
          const idealSWR = bodyType === "Inverted Triangle" ? 1.6 : 1.4;
          const idealWHR = 0.85;
          const swrDev = Math.abs(shoulderToWaistRatio - idealSWR) / idealSWR;
          const whrDev = Math.abs(waistToHipRatio - idealWHR) / idealWHR;
          return Math.round(Math.max(1, Math.min(10, 10 - (swrDev + whrDev) * 15)) * 10) / 10;
        })();

        setBodyResult({
          bodyType,
          skinToneScale: skinTone?.monkScale.label || "Unknown",
          skinToneValue: skinTone?.monkScale.hex || "#C08E62",
          undertone: skinTone?.undertone || "Neutral",
          shoulderWidth,
          waistWidth,
          hipWidth,
          recommendations: [],
          shoulderToWaistRatio,
          waistToHipRatio,
          bodyProportionScore,
          bodySymmetry: bodyProportionScore,
        });

        if (skinTone?.undertone) {
          // Feed the saved face shape into the scorer so face-shape matching
          // contributes to outfit ranking instead of sitting at a flat
          // neutral score for everyone.
          const faceShape = useAnalysisStore.getState().faceResult?.facialShape;
          const colorAnalysis = useAnalysisStore.getState().colorAnalysis;
          const recs = generateRecommendations(
            skinTone.undertone,
            bodyType,
            undefined,
            skinTone.monkScale.hex,
            faceShape,
            colorAnalysis?.bestColors,
            colorAnalysis?.worstColors
          );
          setOutfitRecommendations(
            recs.map((r) => ({
              ...r,
              mannequinPreview: r.colors,
            }))
          );
        }

        setAnalysisProgress(100);
        saveCurrentAnalysis();
        return { bodyType, skinTone, measurements };
      } catch (err) {
        console.error("Body analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setBodyResult, setOutfitRecommendations, setIsAnalyzing, setAnalysisProgress, saveCurrentAnalysis]
  );

  return {
    analyzeFaceFromImage,
    analyzeFacePhotos,
    analyzeBodyFromImage,
    cancelAnalysis,
  };
}
