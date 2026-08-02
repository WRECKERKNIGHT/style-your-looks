"use client";

import { useState, useCallback, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { FaceSkeletonOverlay } from "@/components/analysis/FaceSkeletonOverlay";
import { ProcessingOverlay } from "@/components/analysis/ProcessingOverlay";
import { PhotoGuidelines } from "@/components/analysis/PhotoGuidelines";
import { PhotoReviewPanel, type RejectedPhoto } from "@/components/analysis/PhotoReviewPanel";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useWebcam } from "@/hooks/useWebcam";
import { useToast } from "@/components/shared/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, AlertCircle, Eye, Save, CheckCircle, X, ShieldCheck, Copy, Check } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const MAX_PHOTOS = 3;
const MIN_PHOTOS = 2;

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, faceResult, isAnalyzing, genderProfile, setGenderProfile } =
    useAnalysisStore();
  const { analyzeFacePhotos } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame } = useWebcam();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rejectedPhotos, setRejectedPhotos] = useState<RejectedPhoto[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  const buildReport = useCallback(() => {
    if (!faceResult) return "";
    return [
      "AURAYA — FACEIQ ANALYSIS REPORT",
      "=================================",
      `FaceIQ Score:  ${faceResult.overallScore.toFixed(1)}/10  (${faceResult.overallRating})`,
      `Beauty Index:  ${faceResult.beautyIndex}/100`,
      `Face Shape:    ${faceResult.facialShape}`,
      `Style Profile: ${faceResult.styleProfile}`,
      `Confidence:    ${faceResult.analysisConfidence}%  (${faceResult.photoCount} photo(s))`,
      "",
      "METRIC BREAKDOWN",
      faceResult.breakdown
        .map((m) => `  - ${m.label}: ${m.score.toFixed(1)}/10${m.value ? `  [${m.value}]` : ""}`)
        .join("\n"),
      "",
      "STRENGTHS",
      faceResult.strengths.map((s) => `  + ${s}`).join("\n"),
      "",
      "IMPROVEMENTS",
      faceResult.improvements.map((s) => `  - ${s}`).join("\n"),
      "",
      "GROOMING TIPS",
      faceResult.groomingSuggestions.map((s) => `  > ${s}`).join("\n"),
    ].join("\n");
  }, [faceResult]);

  const copyReport = useCallback(async () => {
    if (!faceResult) return;
    try {
      await navigator.clipboard.writeText(buildReport());
      setCopied(true);
      addToast("Report copied to clipboard", "success");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      addToast("Could not copy report", "error");
    }
  }, [faceResult, addToast, buildReport]);

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
      setRejectedPhotos([]);
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
    setRejectedPhotos([]);
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

      const { photoCount, rejected } = await analyzeFacePhotos(images, genderProfile);
      setRejectedPhotos(rejected);
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
  }, [photos, setUploadedImage, analyzeFacePhotos, addToast, genderProfile]);

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

            <div className="mt-2 mb-6">
              <span className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-widest block mb-2">
                ANALYSIS PROFILE
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["masculine", "feminine", "neutral"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setGenderProfile(p)}
                    className={`border px-3 py-2.5 text-left transition-all ${
                      genderProfile === p
                        ? "border-aurum-500/70 bg-aurum-500/[0.07]"
                        : "border-[var(--border-primary)] hover:border-aurum-500/40"
                    }`}
                  >
                    <span
                      className={`block text-xs font-bold font-body uppercase tracking-wider ${
                        genderProfile === p
                          ? "text-[var(--accent-aurum)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {p}
                    </span>
                    <span className="block text-[0.6rem] font-body text-[var(--text-muted)] mt-0.5 leading-snug">
                      {p === "masculine"
                        ? "Jaw & FWHR weighted"
                        : p === "feminine"
                        ? "Lips, tilt & cheeks weighted"
                        : "Balanced standards"}
                    </span>
                  </button>
                ))}
              </div>
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
                {photos.map((photo, i) => {
                  const issues = rejectedPhotos.find((r) => r.index === i)?.issues;
                  const isRejected = !!issues;
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square overflow-hidden border ${
                        isRejected ? "border-red-500/40" : "border-[var(--border-primary)]"
                      } bg-[var(--bg-base)]`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className={`w-full h-full object-cover ${isRejected ? "opacity-40 grayscale" : ""}`}
                      />
                      <span className="absolute top-2 left-2 w-6 h-6 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] border border-[var(--border-primary)] text-[0.6rem] font-mono flex items-center justify-center">
                        {i + 1}
                      </span>
                      {isRejected && (
                        <div className="absolute top-2 left-10 right-9 bg-red-500/90 text-white text-[0.55rem] font-mono uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Rejected
                        </div>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 w-6 h-6 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] border border-[var(--border-primary)] flex items-center justify-center hover:border-red-500/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {isRejected && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-2 py-1.5">
                          {issues.map((issue) => (
                            <p key={issue} className="text-[0.6rem] text-red-200 font-body leading-snug">
                              {issue}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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

          <PhotoGuidelines />

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
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap items-center gap-3">
            <span className="type-mono text-[0.6rem] tracking-[0.25em] uppercase px-3 py-1.5 border border-aurum-500/40 text-[var(--accent-aurum)] bg-aurum-500/[0.06]">
              {faceResult.genderProfile.toUpperCase()} PROFILE
            </span>
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
            <button
              onClick={copyReport}
              className={`flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all border ${
                copied
                  ? "bg-[var(--accent-aurum)] text-[var(--bg-primary)] border-transparent"
                  : "btn-outline"
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? "COPIED" : "COPY REPORT"}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all btn-outline"
            >
              <ScanFace className="w-5 h-5" />
              VIEW FULL REPORT
            </button>
          </motion.div>

          {rejectedPhotos.length > 0 && (
            <PhotoReviewPanel photos={photos} rejected={rejectedPhotos} />
          )}

          {uploadedImage && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="glass-card overflow-hidden relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Analysed face"
                className="w-full max-h-[480px] object-cover"
              />
              <motion.div
                className="absolute inset-x-0 h-24 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(232,200,138,0.18) 50%, rgba(200,150,62,0.35) 100%)",
                }}
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
              {showLandmarks && faceResult.landmarks.length > 0 && (
                <FaceSkeletonOverlay
                  landmarks={faceResult.landmarks}
                  width={imageRef.current?.clientWidth || 600}
                  height={imageRef.current?.clientHeight || 480}
                  facialShape={faceResult.facialShape}
                  measurements={{
                    fwhr: faceResult.rawFwhr || undefined,
                    canthalTilt: faceResult.rawCanthalTilt || undefined,
                    eyeNoseRatio: faceResult.rawEyeNoseRatio || undefined,
                  }}
                />
              )}
              <button
                onClick={() => setShowLandmarks(!showLandmarks)}
                className="absolute top-4 right-4 flex items-center gap-2 bg-[color-mix(in_srgb,var(--bg-primary)_80%,transparent)] text-[var(--text-primary)] px-3 py-1.5 text-xs font-body tracking-wider transition-colors border border-[var(--border-primary)]"
              >
                <Eye className="w-3.5 h-3.5" />
                {showLandmarks ? "HIDE" : "SHOW"} SKELETON
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
              setRejectedPhotos([]);
              setError(null);
            }}
            className="btn-outline w-full justify-center"
          >
            Analyse Another Set of Photos
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {reportOpen && faceResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setReportOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] flex flex-col border border-[var(--border-primary)] bg-[var(--bg-primary)]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
                <div>
                  <p className="font-body font-bold text-[var(--text-primary)] tracking-wider text-sm">
                    AURAYA — FULL ANALYSIS REPORT
                  </p>
                  <p className="text-xs font-mono text-aurum-500 mt-0.5">
                    FaceIQ {faceResult.overallScore.toFixed(1)}/10 · Beauty Index {faceResult.beautyIndex}/100
                  </p>
                </div>
                <button
                  onClick={() => setReportOpen(false)}
                  className="p-2 border border-[var(--border-primary)] text-[var(--text-primary)] transition-colors hover:text-aurum-500"
                  aria-label="Close report"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-primary)] leading-relaxed">
                  {buildReport()}
                </pre>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-primary)]">
                <button onClick={() => setReportOpen(false)} className="btn-outline">
                  Close
                </button>
                <button onClick={copyReport} className="btn-nexus">
                  {copied ? "Copied!" : "Copy Report"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
