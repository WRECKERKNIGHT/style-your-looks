"use client";

import { useState, useCallback, useRef, Fragment, useMemo, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { FaceSkeletonOverlay } from "@/components/analysis/FaceSkeletonOverlay";
import { ProcessingOverlay } from "@/components/analysis/ProcessingOverlay";
import { PhotoGuidelines } from "@/components/analysis/PhotoGuidelines";
import { PhotoReviewPanel, type RejectedPhoto } from "@/components/analysis/PhotoReviewPanel";
import { FaceCalibration } from "@/components/analysis/FaceCalibration";
import { CalibrationModal, type CalibrationProfile } from "@/components/analysis/CalibrationModal";
import { FaceView3D } from "@/components/analysis/FaceView3D";
import { DemoCarousel } from "@/components/demo/DemoCarousel";
import { DemoBadge } from "@/components/demo/DemoBadge";
import { DEMO_FACE_PHOTO, buildDemoFaceResult, generateDemoLandmarks, isDemoPhoto } from "@/lib/demo/demo-analysis";
import { detectFaceLandmarksOnly } from "@/lib/ml/face-analyzer";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe, AnalysisCancelledError } from "@/hooks/useMediaPipe";
import { useWebcam } from "@/hooks/useWebcam";
import { useToast } from "@/components/shared/Toast";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, AlertCircle, Eye, Save, CheckCircle, X, ShieldCheck, Copy, Check, Ruler, Gauge, AlertTriangle, GitCompareArrows, Box, Share2, RefreshCw } from "lucide-react";
import { SymmetrySplit } from "@/components/analysis/SymmetrySplit";
import { LaserScanOverlay } from "@/components/analysis/LaserScanOverlay";
import { ShareCardModal, type ShareCardData } from "@/components/shared/ShareCardModal";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const MAX_PHOTOS = 3;
const MIN_PHOTOS = 2;

function DiagnosticStrip({
  photoQuality,
  consistency,
  confidence,
  headRoll,
  headPitch,
  axisAngle,
  landmarks,
}: {
  photoQuality: number;
  consistency: number;
  confidence: number;
  headRoll?: number;
  headPitch?: number;
  axisAngle?: number;
  landmarks: number[][];
}) {
  const irisScale = (() => {
    if (landmarks.length < 478) return null;
    const dist = (a: number[], b: number[]) =>
      Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
    const maxPair = (idxs: number[]) => {
      let max = 0;
      for (let i = 0; i < idxs.length; i++) {
        for (let j = i + 1; j < idxs.length; j++) {
          max = Math.max(max, dist(landmarks[idxs[i]], landmarks[idxs[j]]));
        }
      }
      return max;
    };
    const leftIris = maxPair([468, 469, 470, 471, 472]);
    const rightIris = maxPair([473, 474, 475, 476, 477]);
    const leftEyeW = dist(landmarks[33], landmarks[133]);
    const rightEyeW = dist(landmarks[362], landmarks[263]);
    const eyeW = (leftEyeW + rightEyeW) / 2;
    const irisD = (leftIris + rightIris) / 2;
    if (!eyeW || !irisD) return null;
    const ratio = irisD / eyeW;
    const mm = (ratio / 0.33) * 11.7;
    return { ratio, mm };
  })();

  const poseOff =
    (typeof headRoll === "number" && Math.abs(headRoll) > 15) ||
    (typeof headPitch === "number" && Math.abs(headPitch) > 15);

  const items = [
    { label: "PHOTO QUALITY", value: `${photoQuality.toFixed(1)}/10`, warn: photoQuality < 5 },
    { label: "CROSS-PHOTO CONSISTENCY", value: `${consistency.toFixed(1)}/10`, warn: consistency < 5 },
    { label: "CONFIDENCE", value: `${confidence}%`, warn: confidence < 60 },
    {
      label: "HEAD ROLL",
      value: typeof headRoll === "number" ? `${headRoll > 0 ? "+" : ""}${headRoll.toFixed(1)}°` : "—",
      warn: typeof headRoll === "number" && Math.abs(headRoll) > 15,
    },
    {
      label: "HEAD PITCH",
      value: typeof headPitch === "number" ? `${headPitch > 0 ? "+" : ""}${headPitch.toFixed(1)}°` : "—",
      warn: typeof headPitch === "number" && Math.abs(headPitch) > 15,
    },
    {
      label: "SYMMETRY AXIS",
      value: typeof axisAngle === "number" ? `${axisAngle > 0 ? "+" : ""}${axisAngle.toFixed(1)}°` : "—",
      warn: typeof axisAngle === "number" && Math.abs(axisAngle) > 10,
    },
    {
      label: "IRIS CALIBRATION",
      value: irisScale ? `≈ ${irisScale.mm.toFixed(1)} mm` : "—",
      warn: false,
    },
  ];

  return (
    <div className="space-y-5">
      {poseOff && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-300 font-body">Pose out of range</p>
            <p className="text-xs text-amber-200/80 font-body leading-relaxed mt-0.5">
              A head tilt or camera angle above 15° distorts the 2D geometry and lowers symmetry accuracy.
              Re-take the photo facing the camera directly at eye level.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`bg-[var(--bg-tertiary)] p-4 border text-center ${
              item.warn ? "border-amber-500/40" : "border-[var(--border-primary)]"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {item.label === "IRIS CALIBRATION" ? (
                <Ruler className="w-3 h-3 text-[var(--accent-aurum)]" />
              ) : (
                <Gauge className={`w-3 h-3 ${item.warn ? "text-amber-400" : "text-[var(--accent-aurum)]"}`} />
              )}
              <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">{item.label}</span>
            </div>
            <span className={`font-display font-bold text-lg ${item.warn ? "text-amber-400" : "text-[var(--text-primary)]"}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest">
        IRIS CALIBRATION USES THE MEDIAPIPE IRIS TRACKER (468–477) AGAINST A NOMINAL 11.7 MM AVERAGE HUMAN IRIS TO ESTIMATE
        PHYSICAL SCALE FROM YOUR PHOTO — AN APPROXIMATION, NOT A MEDICAL MEASUREMENT.
      </p>
    </div>
  );
}

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, setPhoto, markAnalyzed, photoDirty, faceResult, isAnalyzing, genderProfile, setGenderProfile, setProcessingPreview, setFaceResult } =
    useAnalysisStore();
  const { analyzeFacePhotos, cancelAnalysis } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame, error: webcamError } = useWebcam();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [rejectedPhotos, setRejectedPhotos] = useState<RejectedPhoto[]>([]);
  const [step, setStep] = useState<"calibrate" | "capture">("calibrate");
  const [calibOpen, setCalibOpen] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationProfile | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDims, setImageDims] = useState<{ w: number; h: number; aspect?: number } | null>(null);

  // Demo previews are session-local: they must be forgotten the moment the
  // user leaves this page, so they never persist across tabs or come back on
  // a reload. Real results stay in-memory so the rest of the dashboard
  // (hair-preview, accessories, studio...) can reuse the photo + analysis, and
  // only the explicit "SAVE ANALYSIS" button writes to history.
  useEffect(() => {
    return () => {
      if (useAnalysisStore.getState().source === "demo") {
        useAnalysisStore.getState().reset();
      }
    };
  }, []);

  const buildReport = useCallback(() => {
    if (!faceResult) return "";
    return [
      "ZERVEY — FACEIQ ANALYSIS REPORT",
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
    setRejectedPhotos((prev) =>
      prev
        .filter((r) => r.index !== index)
        .map((r) => ({ ...r, index: r.index > index ? r.index - 1 : r.index }))
    );
    setError(null);
  }, []);

  const runDemo = useCallback(async () => {
    useAnalysisStore.getState().reset();
    useAnalysisStore.getState().setSource("demo");
    useAnalysisStore.getState().setIsAnalyzing(true);
    setPhotos([DEMO_FACE_PHOTO]);
    setPhoto(DEMO_FACE_PHOTO, "face");
    setError(null);
    setRejectedPhotos([]);
    setProcessingPreview({ image: DEMO_FACE_PHOTO, landmarks: [] });
    try {
      await new Promise((r) => setTimeout(r, 1100));
      const img = new Image();
      img.src = DEMO_FACE_PHOTO;
      await new Promise((r) => { img.onload = r; });
      let landmarks: number[][] = generateDemoLandmarks();
      try {
        landmarks = await detectFaceLandmarksOnly(img);
      } catch {
        // Real detection unavailable — fall back to the synthetic demo mesh.
      }
      setProcessingPreview({ image: DEMO_FACE_PHOTO, landmarks });
      await new Promise((r) => setTimeout(r, 1100));
      setProcessingPreview(null);
      setFaceResult(buildDemoFaceResult(landmarks));
      markAnalyzed();
    } finally {
      useAnalysisStore.getState().setIsAnalyzing(false);
    }
  }, [setPhoto, setProcessingPreview, setFaceResult, markAnalyzed]);

  const shareData = useMemo<ShareCardData | null>(() => {
    if (!faceResult) return null;
    return {
      photo: uploadedImage,
      brand: "ZERVEY",
      brandTag: "Measured like a tailor",
      title: `${faceResult.facialShape} Face`,
      subtitle: faceResult.styleProfile,
      overview: [
        { label: "Face Shape", value: faceResult.facialShape },
        { label: "Style Profile", value: faceResult.styleProfile },
        { label: "Skin Tone", value: faceResult.skinTone },
        { label: "Undertone", value: faceResult.undertone },
        { label: "Symmetry", value: `${faceResult.symmetry.toFixed(1)}/10` },
        { label: "Confidence", value: `${faceResult.analysisConfidence}%` },
      ],
      scoreLabel: `${faceResult.overallRating} · FACEIQ`,
      score: faceResult.overallScore.toFixed(1),
      scoreSuffix: "/10 · TOP " + faceResult.percentile.bracket,
      footer: "zervey.app · computed on-device",
      fileName: `zervey-faceiq-${faceResult.overallScore.toFixed(1)}.png`,
      shareText: `My ZERVEY FaceIQ: ${faceResult.overallScore.toFixed(1)}/10 (${faceResult.overallRating}) · ${faceResult.facialShape} face · ${faceResult.styleProfile}`,
      demo: isDemoPhoto(uploadedImage),
    };
  }, [faceResult, uploadedImage]);

  const handleAnalyze = useCallback(async () => {
    if (photos.length < MIN_PHOTOS) {
      setError(`Add at least ${MIN_PHOTOS} photos for a reliable result.`);
      return;
    }

    setError(null);
    useAnalysisStore.getState().reset();
    setPhoto(photos[0], "face");
    setProcessingPreview({ image: photos[0], landmarks: [] });

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

      const { photoCount, rejected } = await analyzeFacePhotos(
        images,
        genderProfile,
        (index, landmarks) =>
          setProcessingPreview({ image: photos[index], landmarks })
      );
      markAnalyzed();
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
      if (err instanceof AnalysisCancelledError) return;
      setError(
        err instanceof Error ? err.message : "Failed to analyse face. Please try clearer photos."
      );
    } finally {
      setProcessingPreview(null);
    }
  }, [photos, setPhoto, setProcessingPreview, analyzeFacePhotos, addToast, genderProfile, markAnalyzed]);

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
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
      </ScrollParallax>

      {!faceResult && (
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { id: "calibrate", label: "CALIBRATE" },
              { id: "capture", label: "CAPTURE" },
              { id: "results", label: "RESULTS" },
            ].map((s, i) => {
              const isCurrent =
                s.id === "results"
                  ? false
                  : step === s.id;
              const isDone =
                s.id === "calibrate"
                  ? step === "capture"
                  : s.id === "capture"
                  ? step === "capture"
                  : false;
              return (
                <Fragment key={s.id}>
                  {i > 0 && (
                    <div className={`flex-1 h-px max-w-16 ${isDone || (i === 1 && step === "capture") ? "bg-[var(--accent-aurum)]" : "bg-[var(--border-primary)]"}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full border text-[0.55rem] font-mono transition-all ${
                        isDone
                          ? "bg-[var(--accent-aurum)] border-[var(--accent-aurum)] text-[var(--bg-primary)]"
                          : isCurrent
                          ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                          : "border-[var(--border-primary)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span
                      className={`type-mono text-[0.55rem] tracking-widest ${
                        isCurrent || isDone
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === "calibrate" ? (
              <motion.div
                key="calibrate"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <FaceCalibration onBegin={() => setCalibOpen(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCalibOpen(true)}
                    className="flex items-center gap-1.5 text-xs type-mono tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    &larr; RECALIBRATE
                  </button>
                  <span className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-widest">
                    STEP 2/3 &middot; CAPTURE
                  </span>
                </div>

                {calibration && (
                  <div className="glass-card p-4 flex flex-wrap items-center gap-2 mt-5">
                    <span className="type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.25em] uppercase mr-1">
                      CALIBRATED
                    </span>
                    <span className="type-mono text-[0.55rem] text-[var(--text-primary)] tracking-widest border border-[var(--border-primary)] px-2.5 py-1.5 bg-[var(--bg-tertiary)]">
                      ~{calibration.lensDistanceCm}CM &middot; LENS
                    </span>
                    <span className="type-mono text-[0.55rem] text-[var(--text-primary)] tracking-widest border border-[var(--border-primary)] px-2.5 py-1.5 bg-[var(--bg-tertiary)]">
                      {calibration.gender.toUpperCase()}
                    </span>
                    <span className="type-mono text-[0.55rem] text-[var(--text-primary)] tracking-widest border border-[var(--border-primary)] px-2.5 py-1.5 bg-[var(--bg-tertiary)]">
                      AGE {calibration.ageRange}
                    </span>
                    <span className="type-mono text-[0.55rem] text-[var(--text-primary)] tracking-widest border border-[var(--border-primary)] px-2.5 py-1.5 bg-[var(--bg-tertiary)]">
                      {calibration.symmetryExpected ? "SYMMETRIC FACE" : "ASYMMETRIC OK"}
                    </span>
                    <button
                      onClick={() => setCalibOpen(true)}
                      className="ml-auto type-mono text-[0.55rem] text-[var(--accent-aurum)] tracking-widest hover:underline uppercase"
                    >
                      Edit
                    </button>
                  </div>
                )}

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

            <DemoCarousel
              slides={[
                {
                  photo: DEMO_FACE_PHOTO,
                  title: "Run the full FaceIQ scan on a sample photo.",
                  detail:
                    "Watch the live 478-point mesh track the face — then see golden-ratio scoring and a shareable result card. No camera or upload required.",
                  onRun: runDemo,
                  detect: detectFaceLandmarksOnly,
                },
              ]}
            />

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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWebcamCapture}
                className="btn-nexus flex-1 justify-center"
              >
                <Camera className="w-5 h-5" />
                CAPTURE PHOTO
              </button>
              <button
                onClick={stopWebcam}
                aria-label="Close camera"
                className="btn-outline justify-center"
              >
                <X className="w-4 h-4" />
                CLOSE CAMERA
              </button>
            </div>
          )}

          {webcamError && !isStreaming && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-body">
                Could not start the camera: {webcamError}. Try allowing camera permission, or upload a
                photo instead.
              </p>
            </div>
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

          {photoDirty && faceResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-aurum-400/10 border border-aurum-400/40 p-5"
            >
              <RefreshCw className="w-5 h-5 text-[var(--accent-aurum)] flex-shrink-0" />
              <p className="text-sm text-[var(--text-primary)] font-body">
                A new photo was loaded — the results below are from an older photo.
                Run analysis again for up-to-date scores.
              </p>
            </motion.div>
          )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {faceResult && (
        <ScrollBlur blur={0} minOpacity={0.9}>
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
            {isDemoPhoto(uploadedImage) && <DemoBadge />}
            <button
              onClick={() => {
                if (useAnalysisStore.getState().source === "demo") {
                  addToast(
                    "Demo results are previews only — upload a real photo to save to history.",
                    "error"
                  );
                  return;
                }
                const entry = useAnalysisStore.getState().saveCurrentAnalysis();
                if (entry) {
                  setSaved(true);
                  addToast("Analysis saved to history", "success");
                  setTimeout(() => setSaved(false), 3000);
                } else {
                  addToast("Could not save to history — browser storage is full", "error");
                }
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
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share result card"
              className="flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all btn-outline"
            >
              <Share2 className="w-5 h-5" />
              SHARE CARD
            </button>
            <button
              onClick={() => {
                useAnalysisStore.getState().reset();
                setPhotos([]);
                setRejectedPhotos([]);
                setError(null);
                setCalibration(null);
                setStep("calibrate");
                cancelAnalysis();
              }}
              className="flex items-center gap-2 px-6 py-3 font-body text-sm tracking-wider uppercase transition-all btn-outline"
            >
              <Camera className="w-5 h-5" />
              NEW SCAN
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
                onLoad={(e) => {
                  const el = e.currentTarget;
                  setImageDims({
                    w: el.clientWidth,
                    h: el.clientHeight,
                    aspect: el.naturalWidth > 0 ? el.naturalWidth / el.naturalHeight : undefined,
                  });
                }}
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
              {faceResult.landmarks.length > 0 && (
                <LaserScanOverlay
                  landmarks={faceResult.landmarks}
                  width={imageDims?.w || imageRef.current?.clientWidth || 600}
                  height={imageDims?.h || imageRef.current?.clientHeight || 480}
                  imageAspect={imageDims?.aspect}
                />
              )}
              {showLandmarks && faceResult.landmarks.length > 0 && (
                <FaceSkeletonOverlay
                  landmarks={faceResult.landmarks}
                  width={imageDims?.w || imageRef.current?.clientWidth || 600}
                  height={imageDims?.h || imageRef.current?.clientHeight || 480}
                  imageAspect={imageDims?.aspect}
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

          {faceResult.landmarks.length > 0 && uploadedImage && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <GitCompareArrows className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">SYMMETRY SPLIT</h3>
              </div>
              <SymmetrySplit
                image={uploadedImage}
                centerX={faceResult.landmarks[1]?.[0] ?? 0.5}
                imageAspect={imageDims?.aspect}
                symmetryScore={faceResult.symmetry}
                axisAngleDeg={faceResult.symmetryAxis?.angleDeg ?? 0}
              />
            </motion.div>
          )}

          {faceResult.landmarks.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Box className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">3D FACE VIEW</h3>
              </div>
              <FaceView3D landmarks={faceResult.landmarks} />
            </motion.div>
          )}

          {faceResult && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Gauge className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">DIAGNOSTIC READOUT</h3>
              </div>

              <DiagnosticStrip
                photoQuality={faceResult.photoQualityScore}
                consistency={faceResult.consistencyScore}
                confidence={faceResult.analysisConfidence}
                headRoll={faceResult.qualityGate?.headRoll}
                headPitch={faceResult.qualityGate?.headPitch}
                axisAngle={faceResult.symmetryAxis?.angleDeg}
                landmarks={faceResult.landmarks}
              />
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
              setStep("calibrate");
              cancelAnalysis();
            }}
            className="btn-outline w-full justify-center"
          >
            Analyse Another Set of Photos
          </button>
        </motion.div>
        </ScrollBlur>
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
                    ZERVEY — FULL ANALYSIS REPORT
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
              <div data-lenis-prevent className="flex-1 overflow-y-auto p-6">
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

      <CalibrationModal
        open={calibOpen}
        onClose={() => setCalibOpen(false)}
        onComplete={(profile) => {
          setCalibration(profile);
          setGenderProfile(profile.gender);
          setStep("capture");
        }}
      />

      <ShareCardModal open={shareOpen} onClose={() => setShareOpen(false)} data={shareData} />
    </div>
  );
}
