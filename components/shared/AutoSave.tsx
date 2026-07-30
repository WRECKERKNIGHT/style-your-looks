"use client";

import { useEffect, useRef } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import { useToast } from "@/components/shared/Toast";

export function AutoSave() {
  const { faceResult, bodyResult, colorAnalysis, outfitRecommendations, uploadedImage } =
    useAnalysisStore();
  const { addToast } = useToast();
  const lastSaveRef = useRef(0);
  const TIMEOUT = 30000;

  useEffect(() => {
    const hasData = faceResult || bodyResult || colorAnalysis || outfitRecommendations.length > 0;
    if (!hasData) return;

    const now = Date.now();
    if (now - lastSaveRef.current < TIMEOUT) return;

    lastSaveRef.current = now;
    const entry = useAnalysisStore.getState().saveCurrentAnalysis("Auto-saved");
    if (entry) addToast("Analysis auto-saved", "success");
  }, [faceResult, bodyResult, colorAnalysis, outfitRecommendations, uploadedImage, addToast]);
  return null;
}
