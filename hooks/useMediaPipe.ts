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

        const scoreResult = calculateFaceScore(faceResult, 7);
        const skinTone = analyzeSkinTone(canvas, faceResult);
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

        setBodyResult({
          bodyType,
          skinToneScale: skinTone?.monkScale.label || "Unknown",
          skinToneValue: skinTone?.monkScale.hex || "#C08E62",
          undertone: skinTone?.undertone || "Neutral",
          shoulderWidth: measurements?.shoulderWidth || 0,
          waistWidth: measurements?.waistWidth || 0,
          hipWidth: measurements?.hipWidth || 0,
          recommendations: [],
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
