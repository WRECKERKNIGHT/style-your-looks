"use client";

import { useState, useCallback, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { LandmarkOverlay } from "@/components/analysis/LandmarkOverlay";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useWebcam } from "@/hooks/useWebcam";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, Loader2, AlertCircle, Eye, Save, CheckCircle } from "lucide-react";

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, isAnalyzing, analysisProgress, faceResult } =
    useAnalysisStore();
  const { analyzeFaceFromImage } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame } = useWebcam();
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
      <div>
        <span className="section-number">EST. MMXXIV // FACE</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <ScanFace className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            FACE <span className="text-gradient-gold">IQ.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Upload a front-facing photo for 478-landmark facial geometry analysis, golden ratio scoring,
          and detailed grooming recommendations.
        </p>
      </div>

      {!faceResult && (
        <div className="space-y-5">
          <ImageUploader
            onImageUpload={handleImageUpload}
            onWebcamCapture={handleWebcamCapture}
            label="Upload a face photo"
            accept="face"
          />

          <video
            ref={videoRef}
            className={isStreaming ? "w-full rounded-sm" : "hidden"}
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />

          {isStreaming && (
            <button
              onClick={handleWebcamCapture}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-amber hover:bg-amber-light text-cream font-body text-base tracking-wider uppercase transition-colors rounded-sm shadow-gold"
            >
              <Camera className="w-5 h-5" />
              CAPTURE PHOTO
            </button>
          )}

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-cream p-8 border border-tan rounded-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Loader2 className="w-5 h-5 text-amber animate-spin" />
                  <span className="text-base font-display font-bold text-espresso tracking-wider">ANALYSING YOUR FACE...</span>
                </div>
                <div className="h-4 bg-[#E8E0D8] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-amber rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-4 space-y-1">
                  {analysisProgress < 20 && (
                    <p className="text-sm text-coffee font-body">Detecting face and initialising MediaPipe...</p>
                  )}
                  {analysisProgress >= 20 && analysisProgress < 50 && (
                    <p className="text-sm text-coffee font-body">Mapping 478 facial landmarks...</p>
                  )}
                  {analysisProgress >= 50 && analysisProgress < 80 && (
                    <p className="text-sm text-coffee font-body">Computing golden ratio, symmetry, and harmony metrics...</p>
                  )}
                  {analysisProgress >= 80 && (
                    <p className="text-sm text-coffee font-body">Generating grooming suggestions and style profile...</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="flex items-center gap-3 bg-burgundy/10 border border-burgundy/30 p-5 rounded-sm">
              <AlertCircle className="w-5 h-5 text-burgundy flex-shrink-0" />
              <p className="text-sm text-burgundy font-body">{error}</p>
            </div>
          )}
        </div>
      )}

      {faceResult && (
        <div className="space-y-8">
          {/* Save / Share Bar */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                useAnalysisStore.getState().saveCurrentAnalysis();
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className={`flex items-center gap-2 py-3 px-6 font-body text-base tracking-wider uppercase transition-all rounded-sm ${
                saved
                  ? "bg-olive text-cream"
                  : "bg-amber hover:bg-amber-light text-cream shadow-gold"
              }`}
            >
              {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? "SAVED TO HISTORY" : "SAVE ANALYSIS"}
            </button>
          </div>

          {uploadedImage && (
            <div className="bg-cream border border-tan overflow-hidden rounded-sm relative">
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
                className="absolute top-4 right-4 flex items-center gap-2 bg-espresso/70 hover:bg-espresso/90 text-cream px-3 py-1.5 rounded-sm text-xs font-body tracking-wider transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {showLandmarks ? "HIDE" : "SHOW"} LANDMARKS
              </button>
            </div>
          )}

          <AnalysisResults />

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setError(null);
            }}
            className="w-full py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors border border-tan rounded-sm"
          >
            Analyse Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
