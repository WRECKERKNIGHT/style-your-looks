"use client";

import { useCallback } from "react";
import { analyzeFace, prepareCanvas } from "@/lib/ml/face-analyzer";
import { analyzeBody } from "@/lib/ml/body-analyzer";
import { analyzeSkinTone } from "@/lib/ml/skin-tone";
import {
  calculateFaceScore,
  computeFaceMetrics,
  mergeFaceScores,
  getGroomingSuggestions,
  type FaceScoreResult,
  type FaceScoreSample,
  type AnalysisProfile,
} from "@/lib/ml/scoring";
import { assessPhotoQuality, type PhotoQualityReport } from "@/lib/ml/face-quality";
import { generateRecommendations } from "@/lib/ml/outfit-recommender";
import { useAnalysisStore } from "@/store/analysis-store";

function computeSkinClarityScore(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  numFaces: number
): number {
  if (numFaces === 0) return 7;

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

  if (validZones === 0) return 7;

  const avgVariance = totalVariance / validZones;
  const clarityScore = Math.max(1, Math.min(10, 10 - avgVariance / 12));
  return Math.round(clarityScore * 10) / 10;
}

function buildStoreFaceResult(
  scoreResult: FaceScoreResult,
  landmarks: number[][],
  skinTone: ReturnType<typeof analyzeSkinTone>,
  quality: PhotoQualityReport | null,
  genderProfile: AnalysisProfile = "neutral"
) {
  return {
    overallScore: scoreResult.overallScore,
    symmetry: scoreResult.symmetry,
    proportions: scoreResult.proportions,
    jawline: scoreResult.jawline,
    eyeSpacing: scoreResult.eyeSpacing,
    skinClarity: scoreResult.skinClarity,
    facialShape: scoreResult.facialShape,
    skinTone: skinTone?.monkScale.label || "Unknown",
    undertone: skinTone?.undertone || "Neutral",
    ageEstimation: 25,
    genderEstimation: genderProfile === "neutral" ? "Neutral" : genderProfile,
    genderProfile,
    emotionDetected: scoreResult.blendshapes.emotion,
    groomingSuggestions: getGroomingSuggestions(
      scoreResult.facialShape,
      scoreResult,
      genderProfile
    ),
    landmarks,
    goldenRatio: scoreResult.goldenRatio,
    lipFullness: scoreResult.lipFullness,
    noseProfile: scoreResult.noseProfile,
    foreheadBalance: scoreResult.foreheadBalance,
    cheekboneDefinition: scoreResult.cheekboneDefinition,
    fwhr: scoreResult.fwhr,
    canthalTilt: scoreResult.canthalTilt,
    eyeNoseRatio: scoreResult.eyeNoseRatio,
    noseChinRatio: scoreResult.noseChinRatio,
    midfaceRatio: scoreResult.midfaceRatio,
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
    photoCount: scoreResult.photoCount,
    qualityGate: quality
      ? {
          brightness: quality.brightness,
          sharpness: quality.sharpness,
          faceSizeRatio: quality.faceSizeRatio,
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

  const analyzeFaceFromImage = useCallback(
    async (
      imageElement: HTMLImageElement,
      genderProfile: AnalysisProfile = "neutral",
      onPreview?: (landmarks: number[][]) => void
    ) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        if (!imageElement.naturalWidth || !imageElement.naturalHeight) {
          throw new Error("Could not load the photo. Try re-uploading it.");
        }

        const canvas = prepareCanvas(imageElement);
        const ctx = canvas.getContext("2d")!;

        setAnalysisProgress(10);
        const faceResult = await analyzeFace(canvas, setAnalysisProgress);
        onPreview?.(
          faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || []
        );
        setAnalysisProgress(60);

        const skinTone = analyzeSkinTone(canvas, faceResult);
        const numFaces = faceResult.faceLandmarks?.length || 0;
        const skinClarityScore = computeSkinClarityScore(canvas, ctx, numFaces);
        const quality = assessPhotoQuality(canvas, faceResult, numFaces);
        const metrics = computeFaceMetrics(faceResult);
        const scoreResult = mergeFaceScores(
          [{ metrics, skinClarity: skinClarityScore, quality }],
          genderProfile
        ).result;

        setFaceResult(
          buildStoreFaceResult(
            scoreResult,
            faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [],
            skinTone,
            quality,
            genderProfile
          )
        );

        setAnalysisProgress(100);
        saveCurrentAnalysis();
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
      onPreview?: (index: number, landmarks: number[][]) => void
    ) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        const samples: FaceScoreSample[] = [];
        const rejected: { index: number; issues: string[] }[] = [];
        let bestResult: Awaited<ReturnType<typeof analyzeFace>> | null = null;
        let bestQuality = -1;
        let bestQualityReport: PhotoQualityReport | null = null;
        let bestSkinTone: ReturnType<typeof analyzeSkinTone> = null;

        for (let i = 0; i < imageElements.length; i++) {
          setAnalysisProgress(Math.round((i / imageElements.length) * 75));
          const image = imageElements[i];

          if (!image.naturalWidth || !image.naturalHeight) {
            rejected.push({ index: i, issues: ["Could not load the photo"] });
            continue;
          }

          const canvas = prepareCanvas(image);
          const ctx = canvas.getContext("2d")!;

          const faceResult = await analyzeFace(canvas);
          onPreview?.(
            i,
            faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || []
          );
          const numFaces = faceResult.faceLandmarks?.length || 0;
          const quality = assessPhotoQuality(canvas, faceResult, numFaces);

          if (!quality.usable) {
            rejected.push({ index: i, issues: quality.issues });
            continue;
          }

          const skinClarityScore = computeSkinClarityScore(canvas, ctx, numFaces);
          const metrics = computeFaceMetrics(faceResult);
          samples.push({ metrics, skinClarity: skinClarityScore, quality, sourceResult: faceResult });

          if (quality.score > bestQuality) {
            bestQuality = quality.score;
            bestResult = faceResult;
            bestQualityReport = quality;
            bestSkinTone = analyzeSkinTone(canvas, faceResult);
          }
        }

        if (samples.length === 0) {
          const details = rejected.map((r) => r.issues.join("; ")).join(" | ");
          throw new Error(
            `We couldn't analyze any photo.${details ? ` ${details}` : ""} Use a clearer, front-facing photo with your face centered and well-lit.`
          );
        }

        setAnalysisProgress(88);
        const { result: scoreResult } = mergeFaceScores(samples, genderProfile);
        const landmarks =
          bestResult?.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];

        setFaceResult(
          buildStoreFaceResult(
            scoreResult,
            landmarks,
            bestSkinTone,
            bestQualityReport,
            genderProfile
          )
        );

        setAnalysisProgress(100);
        saveCurrentAnalysis();
        return { scoreResult, samples, rejected, photoCount: samples.length };
      } catch (err) {
        console.error("Multi-photo face analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setFaceResult, setIsAnalyzing, setAnalysisProgress, saveCurrentAnalysis]
  );

  const analyzeBodyFromImage = useCallback(    async (imageElement: HTMLImageElement) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        setAnalysisProgress(10);
        const bodyResult = await analyzeBody(imageElement, setAnalysisProgress);
        setAnalysisProgress(50);

        const canvas = prepareCanvas(imageElement);

        const faceResult = await analyzeFace(imageElement);
        const skinTone = analyzeSkinTone(canvas, faceResult);

        const { extractBodyMeasurements, classifyBodyType } = await import(
          "@/lib/ml/body-analyzer"
        );
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
          const recs = generateRecommendations(skinTone.undertone, bodyType, undefined, skinTone.monkScale.hex);
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
  };
}
