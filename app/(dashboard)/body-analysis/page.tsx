"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, AlertCircle, Shirt, Droplets } from "lucide-react";

export default function BodyAnalysisPage() {
  const {
    fullBodyImage,
    setFullBodyImage,
    bodyResult,
    outfitRecommendations,
    isAnalyzing,
    analysisProgress,
  } = useAnalysisStore();
  const { analyzeBodyFromImage } = useMediaPipe();
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(
    async (imageData: string) => {
      setFullBodyImage(imageData);
      setError(null);

      const img = new Image();
      img.onload = async () => {
        try {
          await analyzeBodyFromImage(img);
        } catch (err) {
          setError("Failed to analyze body. Please try a clearer full-body photo.");
        }
      };
      img.src = imageData;
    },
    [setFullBodyImage, analyzeBodyFromImage]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Layers className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">Body & Skin Tone</h1>
        </div>
        <p className="text-[#8B7D6B]">
          Upload a full-body photo to detect your body type and skin undertone.
        </p>
      </div>

      {!bodyResult && (
        <div className="space-y-4">
          <ImageUploader
            onImageUpload={handleImageUpload}
            label="Upload a full-body photo"
            accept="full-body"
          />

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
                  <span className="font-medium text-[#3C2A21]">Analyzing body and skin tone...</span>
                </div>
                <div className="h-2 bg-[#F4EFEA] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C89D7C] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {bodyResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {fullBodyImage && (
            <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullBodyImage}
                alt="Analyzed body"
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Body Type */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="w-5 h-5 text-[#C89D7C]" />
              <h3 className="font-semibold text-[#3C2A21]">Body Type Detection</h3>
            </div>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[#C89D7C]/10 mb-4">
                <Shirt className="w-10 h-10 text-[#C89D7C]" />
              </div>
              <h2 className="text-3xl font-bold text-[#3C2A21]">{bodyResult.bodyType}</h2>
              <p className="text-[#8B7D6B] mt-2">Your detected body silhouette type</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[#FDFBF7] rounded-xl p-4 text-center">
                <span className="text-xs text-[#8B7D6B]">Shoulder</span>
                <p className="font-bold text-[#3C2A21]">
                  {(bodyResult.shoulderWidth * 100).toFixed(0)}
                </p>
              </div>
              <div className="bg-[#FDFBF7] rounded-xl p-4 text-center">
                <span className="text-xs text-[#8B7D6B]">Waist</span>
                <p className="font-bold text-[#3C2A21]">
                  {(bodyResult.waistWidth * 100).toFixed(0)}
                </p>
              </div>
              <div className="bg-[#FDFBF7] rounded-xl p-4 text-center">
                <span className="text-xs text-[#8B7D6B]">Hip</span>
                <p className="font-bold text-[#3C2A21]">
                  {(bodyResult.hipWidth * 100).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Skin Tone */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Droplets className="w-5 h-5 text-[#C89D7C]" />
              <h3 className="font-semibold text-[#3C2A21]">Skin Tone Analysis</h3>
            </div>
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-2xl border-2 border-[#E8E0D8]"
                style={{ backgroundColor: bodyResult.skinToneValue }}
              />
              <div>
                <h3 className="text-xl font-bold text-[#3C2A21]">
                  {bodyResult.skinToneScale}
                </h3>
                <p className="text-[#8B7D6B]">
                  Undertone: <span className="font-medium text-[#3C2A21]">{bodyResult.undertone}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Outfit Recommendations */}
          {outfitRecommendations.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
              <h3 className="font-semibold text-[#3C2A21] mb-6">Recommended Outfits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outfitRecommendations.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-[#FDFBF7] rounded-xl p-5 border border-[#E8E0D8]"
                  >
                    <h4 className="font-medium text-[#3C2A21] mb-1">{rec.name}</h4>
                    <p className="text-xs text-[#8B7D6B] mb-3">{rec.description}</p>
                    <div className="flex gap-1.5">
                      {rec.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-lg border border-[#E8E0D8]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setError(null);
            }}
            className="w-full py-3 bg-[#F4EFEA] hover:bg-[#EDE5DC] text-[#3C2A21] rounded-xl font-medium transition-colors"
          >
            Analyze Another Photo
          </button>
        </motion.div>
      )}
    </div>
  );
}
