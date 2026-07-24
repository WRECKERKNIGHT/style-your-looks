"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { BEARD_STYLES, MUSTACHE_STYLES } from "@/lib/constants";
import { initializeFaceLandmarker } from "@/lib/ml/face-analyzer";
import { drawFacialHair, detectHairColor } from "@/lib/ml/facial-hair";
import { motion } from "framer-motion";
import { Scissors, Check } from "lucide-react";

export default function GroomingPage() {
  const {
    uploadedImage,
    setUploadedImage,
    selectedBeardStyle,
    setSelectedBeardStyle,
    selectedMustacheStyle,
    setSelectedMustacheStyle,
  } = useAnalysisStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hairColor, setHairColor] = useState("#3C2A21");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceResult, setFaceResult] = useState<any>(null);

  const handleImageUpload = useCallback(async (imageData: string) => {
    setUploadedImage(imageData);
    setIsAnalyzing(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const landmarker = await initializeFaceLandmarker();
        const result = landmarker.detect(img);
        setFaceResult(result);

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const color = detectHairColor(canvas, result);
        setHairColor(color);

        setIsAnalyzing(false);
      };
      img.src = imageData;
    } catch {
      setIsAnalyzing(false);
    }
  }, [setUploadedImage]);

  useEffect(() => {
    if (!faceResult || !uploadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      if (selectedBeardStyle !== "clean-shaven") {
        drawFacialHair(ctx, faceResult, selectedBeardStyle, "beard", hairColor, 0.75, canvas.width, canvas.height);
      }
      if (selectedMustacheStyle !== "none") {
        drawFacialHair(ctx, faceResult, selectedMustacheStyle, "mustache", hairColor, 0.8, canvas.width, canvas.height);
      }
    };
    img.src = uploadedImage;
  }, [faceResult, uploadedImage, selectedBeardStyle, selectedMustacheStyle, hairColor]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Scissors className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">Grooming Studio</h1>
        </div>
        <p className="text-[#8B7D6B]">
          Try different beard and mustache styles virtually on your photo.
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader
          onImageUpload={handleImageUpload}
          label="Upload a face photo for grooming preview"
          accept="face"
        />
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden relative">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#C89D7C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-[#8B7D6B]">Detecting face...</p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full max-h-[500px] object-contain"
            />
          </div>

          {/* Hair Color Picker */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
            <h3 className="font-medium text-[#3C2A21] mb-3">Hair Color</h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-[#E8E0D8] cursor-pointer"
              />
              <span className="text-sm text-[#8B7D6B]">
                Auto-detected: <span className="font-mono text-[#3C2A21]">{hairColor}</span>
              </span>
            </div>
          </div>

          {/* Beard Styles */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
            <h3 className="font-medium text-[#3C2A21] mb-4">Beard Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {BEARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedBeardStyle(style.id)}
                  className={`p-3 rounded-xl text-left text-sm transition-all ${
                    selectedBeardStyle === style.id
                      ? "bg-[#3C2A21] text-white"
                      : "bg-[#FDFBF7] text-[#3C2A21] hover:bg-[#F4EFEA] border border-[#E8E0D8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedBeardStyle === style.id && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mustache Styles */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
            <h3 className="font-medium text-[#3C2A21] mb-4">Mustache Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {MUSTACHE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMustacheStyle(style.id)}
                  className={`p-3 rounded-xl text-left text-sm transition-all ${
                    selectedMustacheStyle === style.id
                      ? "bg-[#3C2A21] text-white"
                      : "bg-[#FDFBF7] text-[#3C2A21] hover:bg-[#F4EFEA] border border-[#E8E0D8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMustacheStyle === style.id && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              useAnalysisStore.getState().setUploadedImage(null);
              setFaceResult(null);
            }}
            className="w-full py-3 bg-[#F4EFEA] hover:bg-[#EDE5DC] text-[#3C2A21] rounded-xl font-medium transition-colors"
          >
            Upload New Photo
          </button>
        </div>
      )}
    </div>
  );
}
