"use client";

import { useState, useCallback, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { useWebcam } from "@/hooks/useWebcam";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, Loader2, AlertCircle } from "lucide-react";

export default function FaceAnalysisPage() {
  const { uploadedImage, setUploadedImage, isAnalyzing, analysisProgress, faceResult } =
    useAnalysisStore();
  const { analyzeFaceFromImage } = useMediaPipe();
  const { videoRef, isStreaming, startWebcam, stopWebcam, captureFrame } = useWebcam();
  const [error, setError] = useState<string | null>(null);
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
          setError("Failed to analyze face. Please try a clearer photo.");
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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ScanFace className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">FaceIQ Analysis</h1>
        </div>
        <p className="text-[#8B7D6B]">
          Upload a front-facing photo for detailed facial geometry analysis and scoring.
        </p>
      </div>

      {!faceResult && (
        <div className="space-y-4">
          <ImageUploader
            onImageUpload={handleImageUpload}
            onWebcamCapture={handleWebcamCapture}
            label="Upload a face photo"
            accept="face"
          />

          {/* Hidden webcam video */}
          <video
            ref={videoRef}
            className={isStreaming ? "w-full rounded-2xl" : "hidden"}
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />

          {isStreaming && (
            <button
              onClick={handleWebcamCapture}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#3C2A21] hover:bg-[#2B1E16] text-white rounded-xl font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          )}

          {/* Progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl p-6 border border-[#E8E0D8]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-[#C89D7C] animate-spin" />
                  <span className="font-medium text-[#3C2A21]">Analyzing your face...</span>
                </div>
                <div className="h-2 bg-[#F4EFEA] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C89D7C] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-[#8B7D6B] mt-2">
                  Mapping 478 facial landmarks and computing scores
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {faceResult && (
        <div className="space-y-6">
          {uploadedImage && (
            <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadedImage}
                alt="Analyzed face"
                className="w-full max-h-[400px] object-cover"
              />
            </div>
          )}

          <AnalysisResults />

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setError(null);
            }}
            className="w-full py-3 bg-[#F4EFEA] hover:bg-[#EDE5DC] text-[#3C2A21] rounded-xl font-medium transition-colors"
          >
            Analyze Another Photo
          </button>
        </div>
      )}
    </div>
  );
}
