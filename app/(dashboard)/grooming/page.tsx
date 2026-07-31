"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { BEARD_STYLES, MUSTACHE_STYLES } from "@/lib/constants";
import { initializeFaceLandmarker } from "@/lib/ml/face-analyzer";
import { drawFacialHair, detectHairColor, scoreGroomingStyles, type GroomingScore } from "@/lib/ml/facial-hair";
import { motion } from "framer-motion";
import { Scissors, Check, Star, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

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
    } catch { setIsAnalyzing(false); }
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
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // GROOMING</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Scissors className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            GROOMING <span className="text-gradient-aurum">STUDIO.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Try different beard and mustache styles virtually on your photo.
        </p>
      </motion.div>

      {!uploadedImage ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a face photo for grooming preview" accept="face" />
        </div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div className="glass-card overflow-hidden relative">
            {isAnalyzing && (
              <div className="absolute inset-0 glass-card backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)] font-body">DETECTING FACE...</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="w-full max-h-[560px] object-contain" />
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-4">HAIR COLOR</h3>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-14 h-14 border border-[var(--border-primary)] cursor-pointer"
              />
              <span className="text-base text-[var(--text-muted)] font-body">
                Auto-detected: <span className="text-[var(--text-primary)] font-bold">{hairColor}</span>
              </span>
            </div>
          </div>

          {groomingScores.length > 0 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">RECOMMENDED FOR YOUR FACE</h3>
              </div>
              <div className="space-y-4">
                {groomingScores.filter((s) => s.type === "beard").slice(0, 3).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 border transition-all cursor-pointer ${
                      selectedBeardStyle === rec.styleId
                        ? "bg-[var(--accent-aurum)]/10 border-[var(--accent-aurum)]/40"
                        : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[var(--accent-aurum)]/30"
                    }`}
                    onClick={() => setSelectedBeardStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[var(--accent-aurum)]" />
                        <span className="font-display font-bold text-[var(--text-primary)]">
                          {BEARD_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-[var(--accent-aurum)]" : rec.score >= 7 ? "text-[var(--accent-nexus)]" : "text-[var(--text-muted)]"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body ml-6">{rec.reason}</p>
                  </div>
                ))}
                {groomingScores.filter((s) => s.type === "mustache").slice(0, 2).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 border transition-all cursor-pointer ${
                      selectedMustacheStyle === rec.styleId
                        ? "bg-[var(--accent-aurum)]/10 border-[var(--accent-aurum)]/40"
                        : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[var(--accent-aurum)]/30"
                    }`}
                    onClick={() => setSelectedMustacheStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[var(--accent-aurum)]" />
                        <span className="font-display font-bold text-[var(--text-primary)]">
                          {MUSTACHE_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-[var(--accent-aurum)]" : rec.score >= 7 ? "text-[var(--accent-nexus)]" : "text-[var(--text-muted)]"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body ml-6">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-5">BEARD STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {BEARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedBeardStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 ${
                    selectedBeardStyle === style.id
                      ? "btn-nexus justify-center"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)] card-nexus"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedBeardStyle === style.id && <Check className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-5">MUSTACHE STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MUSTACHE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMustacheStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 ${
                    selectedMustacheStyle === style.id
                      ? "btn-nexus justify-center"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)] card-nexus"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMustacheStyle === style.id && <Check className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { useAnalysisStore.getState().setUploadedImage(null); setFaceResult(null); }}
            className="btn-outline w-full justify-center"
          >
            Upload New Photo
          </button>
        </motion.div>
      )}
    </div>
  );
}
