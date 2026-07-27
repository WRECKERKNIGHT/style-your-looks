"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { BEARD_STYLES, MUSTACHE_STYLES } from "@/lib/constants";
import { initializeFaceLandmarker } from "@/lib/ml/face-analyzer";
import { drawFacialHair, detectHairColor, scoreGroomingStyles, type GroomingScore } from "@/lib/ml/facial-hair";
import { motion } from "framer-motion";
import { Scissors, Check, Star, Sparkles } from "lucide-react";

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
  const [groomingScores, setGroomingScores] = useState<GroomingScore[]>([]);

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

        const faceShape = useAnalysisStore.getState().faceResult?.facialShape;
        const scores = scoreGroomingStyles(faceShape);
        setGroomingScores(scores);

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
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // GROOMING</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Scissors className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            GROOMING <span className="text-gradient-gold">STUDIO.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
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
        <div className="space-y-8">
          {/* Preview */}
          <div className="bg-cream border border-tan overflow-hidden relative rounded-sm">
            {isAnalyzing && (
              <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-amber border-t-transparent animate-spin mx-auto mb-3 rounded-full" />
                  <p className="text-sm text-coffee font-body">DETECTING FACE...</p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full max-h-[560px] object-contain"
            />
          </div>

          {/* Hair Color Picker */}
          <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-4">HAIR COLOR</h3>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-14 h-14 border border-tan cursor-pointer rounded-sm"
              />
              <span className="text-base text-coffee font-body">
                Auto-detected: <span className="text-espresso font-bold">{hairColor}</span>
              </span>
            </div>
          </div>

          {/* Face-Shape Recommendations */}
          {groomingScores.length > 0 && (
            <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-amber" />
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                  RECOMMENDED FOR YOUR FACE
                </h3>
              </div>

              <div className="space-y-4">
                {groomingScores.filter((s) => s.type === "beard").slice(0, 3).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 rounded-sm border transition-all cursor-pointer ${
                      selectedBeardStyle === rec.styleId
                        ? "bg-amber/10 border-amber/40"
                        : "bg-parchment border-tan hover:border-amber/30"
                    }`}
                    onClick={() => setSelectedBeardStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber" />
                        <span className="font-display font-bold text-espresso">
                          {BEARD_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-amber" : rec.score >= 7 ? "text-olive" : "text-coffee"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-coffee font-body ml-6">{rec.reason}</p>
                  </div>
                ))}

                {groomingScores.filter((s) => s.type === "mustache").slice(0, 2).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 rounded-sm border transition-all cursor-pointer ${
                      selectedMustacheStyle === rec.styleId
                        ? "bg-amber/10 border-amber/40"
                        : "bg-parchment border-tan hover:border-amber/30"
                    }`}
                    onClick={() => setSelectedMustacheStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber" />
                        <span className="font-display font-bold text-espresso">
                          {MUSTACHE_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-amber" : rec.score >= 7 ? "text-olive" : "text-coffee"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-coffee font-body ml-6">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Beard Styles */}
          <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-5">BEARD STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {BEARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedBeardStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 rounded-sm ${
                    selectedBeardStyle === style.id
                      ? "bg-amber text-cream shadow-gold"
                      : "bg-parchment text-espresso hover:bg-tan/20 border border-tan card-hover hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedBeardStyle === style.id && (
                      <Check className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mustache Styles */}
          <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-5">MUSTACHE STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MUSTACHE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMustacheStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 rounded-sm ${
                    selectedMustacheStyle === style.id
                      ? "bg-amber text-cream shadow-gold"
                      : "bg-parchment text-espresso hover:bg-tan/20 border border-tan card-hover hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMustacheStyle === style.id && (
                      <Check className="w-4 h-4 flex-shrink-0" />
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
            className="w-full py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors border border-tan rounded-sm"
          >
            Upload New Photo
          </button>
        </div>
      )}
    </div>
  );
}
