"use client";

import { useState, useCallback, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { LandmarkOverlay } from "@/components/analysis/LandmarkOverlay";
import { ProcessingOverlay } from "@/components/analysis/ProcessingOverlay";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useWebcam } from "@/hooks/useWebcam";
import { useToast } from "@/components/shared/Toast";
import { motion } from "framer-motion";
import { ScanFace, Camera, AlertCircle, Eye, Save, CheckCircle, X, ShieldCheck } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const MAX_PHOTOS = 3;
const MIN_PHOTOS = 2;

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, faceResult, isAnalyzing } =
    useAnalysisStore();
  const { analyzeFacePhotos } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame } = useWebcam();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setPhotos((prev) => {
        if (prev.length >= MAX_PHOTOS) {
          addToast(`Maximum ${MAX_PHOTOS} photos`, "error");
          return prev;
        }
        return [...prev, imageData];
      });
      setError(null);
    },
    [addToast]
  );

  const handleWebcamCapture = useCallback(async () => {
    if (isStreaming) {
      const canvas = captureFrame();
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        handleImageUpload(dataUrl);
      }
      stopWebcam();
    } else {
      await startWebcam();
    }
  }, [isStreaming, captureFrame, startWebcam, stopWebcam, handleImageUpload]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (photos.length < MIN_PHOTOS) {
      setError(`Add at least ${MIN_PHOTOS} photos for a reliable result.`);
      return;
    }

    setError(null);
    setUploadedImage(photos[0]);

    try {
      const images = await Promise.all(
        photos.map(
          (dataUrl) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error("Could not load a photo"));
              img.src = dataUrl;
            })
        )
      );

      const { photoCount, rejected } = await analyzeFacePhotos(images);
      if (rejected.length > 0) {
        addToast(
          `${rejected.length} photo(s) skipped: ${rejected.map((r) => r.issues.join(", ")).join(" | ")}`,
          "info"
        );
      }
      if (photoCount === 1) {
        addToast("Only one usable photo — results will be less reliable", "info");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyse face. Please try clearer photos."
      );
    }
  }, [photos, setUploadedImage, analyzeFacePhotos, addToast]);

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // FACE</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <ScanFace className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            FACE <span className="text-gradient-aurum">IQ.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Upload 2–3 front-facing photos for 478-landmark facial geometry analysis, golden ratio scoring,
          and detailed grooming recommendations.
        </p>
      </motion.div>

      {!faceResult && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="type-subhead text-[var(--text-primary)] tracking-wider">
                UPLOAD {MIN_PHOTOS}–{MAX_PHOTOS} PHOTOS
              </h2>
              <span className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-widest">
                {photos.length}/{MAX_PHOTOS} ADDED
              </span>
            </div>

            {photos.length < MAX_PHOTOS && (
              <ImageUploader
                key={photos.length}
                onImageUpload={handleImageUpload}
                onWebcamCapture={handleWebcamCapture}
                label="Upload a face photo"
                accept="face"
              />
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-base)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 w-6 h-6 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] border border-[var(--border-primary)] text-[0.6rem] font-mono flex items-center justify-center">
                      {i + 1}
                    </span>
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] border border-[var(--border-primary)] flex items-center justify-center hover:border-red-500/50 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length > 0 && photos.length < MIN_PHOTOS && (
              <p className="text-sm text-[var(--text-muted)] font-body mt-4">
                Add {MIN_PHOTOS - photos.length} more photo(s) — a second photo makes the result far more reliable.
              </p>
            )}

            {photos.length >= MIN_PHOTOS && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn-nexus w-full justify-center mt-5 disabled:opacity-50"
              >
                <ScanFace className="w-5 h-5" />
                {isAnalyzing ? "ANALYSING..." : `ANALYSE ${photos.length} PHOTOS`}
              </motion.button>
            )}
          </div>

          <div className="glass-card p-5 border border-[var(--border-primary)]/50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
                <span className="font-bold text-[var(--text-primary)]">Privacy: </span>
                analysis runs entirely in your browser via MediaPipe — no photo is uploaded or stored
                on a server.
              </p>
            </div>
            <div className="flex items-start gap-3 mt-3">
              <Eye className="w-5 h-5 text-[var(--accent-aurum)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
                <span className="font-bold text-[var(--text-primary)]">Accuracy: </span>
                scores come from 2D geometry and are sensitive to pose, lens distortion, and lighting.
                Use multiple photos, face the camera directly, and take photos at eye level. Scores are
                styling guidance — not a measure of worth.
              </p>
            </div>
          </div>

          <video
            ref={videoRef}
            className={isStreaming ? "w-full glass-card" : "hidden"}
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />

          {isStreaming && (
            <button
              onClick={handleWebcamCapture}
              className="btn-nexus w-full justify-center"
            >
              <Camera className="w-5 h-5" />
              CAPTURE PHOTO
            </button>
          )}

          <ProcessingOverlay title="ANALYSING YOUR FACE..." />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-5"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-body">{error}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {faceResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex gap-4">
            <button
              onClick={() => {
                useAnalysisStore.getState().saveCurrentAnalysis();
                setSaved(true);
                addToast("Analysis saved to history", "success");
                setTimeout(() => setSaved(false), 3000);
              }}
              className={`flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all ${
                saved
                  ? "bg-[var(--accent-nexus)] text-white"
                  : "btn-nexus"
              }`}
            >
              {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? "SAVED TO HISTORY" : "SAVE ANALYSIS"}
            </button>
          </motion.div>

          {uploadedImage && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Analysed face"
                className="w-full max-h-[480px] object-cover"
              />
              {showLandmarks && faceResult.landmarks.length > 0 && (
                <LandmarkOverlay
                  landmarks={faceResult.landmarks}
                  width={imageRef.current?.clientWidth || 600}
                  height={imageRef.current?.clientHeight || 480}
                />
              )}
              <button
                onClick={() => setShowLandmarks(!showLandmarks)}
                className="absolute top-4 right-4 flex items-center gap-2 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] text-[var(--text-primary)] px-3 py-1.5 text-xs font-body tracking-wider transition-colors border border-[var(--border-primary)]"
              >
                <Eye className="w-3.5 h-3.5" />
                {showLandmarks ? "HIDE" : "SHOW"} LANDMARKS
              </button>
            </motion.div>
          )}

          <div className="glass-card p-8">
            <AnalysisResults />
          </div>

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setPhotos([]);
              setError(null);
            }}
            className="btn-outline w-full justify-center"
          >
            Analyse Another Set of Photos
          </button>
        </motion.div>
      )}
    </div>
  );
}
