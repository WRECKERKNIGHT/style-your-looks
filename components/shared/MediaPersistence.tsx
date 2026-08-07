"use client";

import { useEffect, useRef } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  loadMediaSnapshot,
  saveMediaSnapshot,
  mediaSignature,
  MEDIA_SIGNAL_KEY,
  type MediaSnapshot,
} from "@/lib/media-persistence";

function buildSnapshot(): MediaSnapshot {
  const s = useAnalysisStore.getState();
  return {
    uploadedImage: s.uploadedImage,
    fullBodyImage: s.fullBodyImage,
    source: s.source,
    genderProfile: s.genderProfile,
    faceResult: s.faceResult,
    bodyResult: s.bodyResult,
    colorAnalysis: s.colorAnalysis,
    outfitRecommendations: s.outfitRecommendations,
    savedAt: Date.now(),
  };
}

function applySnapshot(snap: MediaSnapshot) {
  const s = useAnalysisStore.getState();
  s.setUploadedImage(snap.uploadedImage ?? null);
  s.setFullBodyImage(snap.fullBodyImage ?? null);
  if (snap.source) s.setSource(snap.source);
  if (snap.genderProfile) s.setGenderProfile(snap.genderProfile);
  if (snap.faceResult) s.setFaceResult(snap.faceResult);
  if (snap.bodyResult) s.setBodyResult(snap.bodyResult);
  if (snap.colorAnalysis) s.setColorAnalysis(snap.colorAnalysis);
  if (snap.outfitRecommendations) s.setOutfitRecommendations(snap.outfitRecommendations);
}

export function MediaPersistence() {
  const lastSig = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const persist = () => {
      const snap = buildSnapshot();
      const sig = mediaSignature(snap);
      void saveMediaSnapshot(snap);
      if (sig !== lastSig.current) {
        lastSig.current = sig;
        try {
          localStorage.setItem(MEDIA_SIGNAL_KEY, sig);
        } catch {
          // Non-fatal: storage may be full or blocked.
        }
      }
    };

    const schedulePersist = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(persist, 700);
    };

    const hydrate = async () => {
      const snap = await loadMediaSnapshot();
      if (!snap) return;
      lastSig.current = mediaSignature(snap);
      applySnapshot(snap);
    };

    void hydrate();

    const onStorage = (e: StorageEvent) => {
      if (e.key !== MEDIA_SIGNAL_KEY) return;
      const snap = loadMediaSnapshot();
      void snap.then((loaded) => {
        if (!loaded) return;
        const sig = mediaSignature(loaded);
        if (sig === lastSig.current) return;
        lastSig.current = sig;
        applySnapshot(loaded);
      });
    };

    const onFocus = () => {
      void hydrate();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    const unsub = useAnalysisStore.subscribe(schedulePersist);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      unsub();
    };
  }, []);

  return null;
}
