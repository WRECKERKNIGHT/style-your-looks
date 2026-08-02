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
import { ScanFace, Camera, AlertCircle, Eye, Save, CheckCircle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, faceResult } =
    useAnalysisStore();
  const { analyzeFaceFromImage } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame } = useWebcam();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [saved, setSaved] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = useCallback(
    async (imageData: string) => {
      setUploadedImage(imageData);
      setError(null);

      const img = new Image();
      img.onload = async () => {
        try {
          await analyzeFaceFromImage(img);
        } catch (err) {
          setError("Failed to analyse face. Please try a clearer photo.");
        }
      };
      img.src = imageData;
    },
    [setUploadedImage, analyzeFaceFromImage]
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
          Upload a front-facing photo for 478-landmark facial geometry analysis, golden ratio scoring,
          and detailed grooming recommendations.
        </p>
      </motion.div>

      {!faceResult && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
          <div className="glass-card p-8">
            <ImageUploader
              onImageUpload={handleImageUpload}
              onWebcamCapture={handleWebcamCapture}
              label="Upload a face photo"
              accept="face"
            />
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
                className="absolute top-4 right-4 flex items-center gap-2 bg-[var(--bg-primary)]/80 text-[var(--text-primary)] px-3 py-1.5 text-xs font-body tracking-wider transition-colors border border-[var(--border-primary)]"
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
              setError(null);
            }}
            className="btn-outline w-full justify-center"
          >
            Analyse Another Photo
          </button>
        </motion.div>
      )}
    </div>
  );
}
