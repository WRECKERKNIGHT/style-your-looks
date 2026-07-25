"use client";

import { useState, useCallback } from "react";
import { analyzeFace } from "@/lib/ml/face-analyzer";
import { analyzeBody } from "@/lib/ml/body-analyzer";
import { analyzeSkinTone } from "@/lib/ml/skin-tone";
import { calculateFaceScore, getGroomingSuggestions } from "@/lib/ml/scoring";
import { generateRecommendations } from "@/lib/ml/outfit-recommender";
import { useAnalysisStore } from "@/store/analysis-store";

export function useMediaPipe() {
  const {
    setFaceResult,
    setBodyResult,
    setOutfitRecommendations,
    setIsAnalyzing,
    setAnalysisProgress,
  } = useAnalysisStore();

  const analyzeFaceFromImage = useCallback(
    async (imageElement: HTMLImageElement) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(imageElement, 0, 0);

        setAnalysisProgress(10);
        const faceResult = await analyzeFace(imageElement, setAnalysisProgress);
        setAnalysisProgress(60);

        const skinTone = analyzeSkinTone(canvas, faceResult);

        const skinClarityScore = (() => {
          const landmarks = faceResult.faceLandmarks?.[0];
          if (!landmarks || !ctx) return 7;

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
        })();

        const scoreResult = calculateFaceScore(faceResult, skinClarityScore);
        const groomingSuggestions = getGroomingSuggestions(
          scoreResult.facialShape,
          scoreResult
        );

        setFaceResult({
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
          genderEstimation: "Unknown",
          emotionDetected: "Neutral",
          groomingSuggestions,
          landmarks: faceResult.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [],
          goldenRatio: scoreResult.goldenRatio,
          lipFullness: scoreResult.lipFullness,
          noseProfile: scoreResult.noseProfile,
          foreheadBalance: scoreResult.foreheadBalance,
          cheekboneDefinition: scoreResult.cheekboneDefinition,
          facialHarmony: scoreResult.facialHarmony,
          breakdown: scoreResult.breakdown,
          overallRating: scoreResult.overallRating,
          detailedAnalysis: scoreResult.detailedAnalysis,
          strengths: scoreResult.strengths,
          improvements: scoreResult.improvements,
          styleProfile: scoreResult.styleProfile,
        });

        setAnalysisProgress(100);
        return { faceResult, skinTone, scoreResult };
      } catch (err) {
        console.error("Face analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setFaceResult, setIsAnalyzing, setAnalysisProgress]
  );

  const analyzeBodyFromImage = useCallback(
    async (imageElement: HTMLImageElement) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      try {
        setAnalysisProgress(10);
        const bodyResult = await analyzeBody(imageElement, setAnalysisProgress);
        setAnalysisProgress(50);

        const canvas = document.createElement("canvas");
        canvas.width = imageElement.naturalWidth;
        canvas.height = imageElement.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(imageElement, 0, 0);

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
          const recs = generateRecommendations(skinTone.undertone, bodyType);
          setOutfitRecommendations(
            recs.map((r) => ({
              ...r,
              mannequinPreview: r.colors,
            }))
          );
        }

        setAnalysisProgress(100);
        return { bodyType, skinTone, measurements };
      } catch (err) {
        console.error("Body analysis error:", err);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [setBodyResult, setOutfitRecommendations, setIsAnalyzing, setAnalysisProgress]
  );

  return {
    analyzeFaceFromImage,
    analyzeBodyFromImage,
  };
}
