"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, AlertCircle, Shirt, Droplets, Ruler, TrendingUp, Activity } from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function BodyProportionViz({ shoulderWidth, waistWidth, hipWidth }: { shoulderWidth: number; waistWidth: number; hipWidth: number }) {
  const maxVal = Math.max(shoulderWidth, waistWidth, hipWidth);
  const scale = (v: number) => (v / maxVal) * 100;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
        {/* Shoulder */}
        <line x1={100 - scale(shoulderWidth)} y1="15" x2={100 + scale(shoulderWidth)} y2="15" stroke="#B8860B" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(shoulderWidth)} cy="15" r="3" fill="#B8860B" />
        <circle cx={100 + scale(shoulderWidth)} cy="15" r="3" fill="#B8860B" />
        <text x="100" y="8" textAnchor="middle" className="fill-coffee" fontSize="7" fontFamily="DM Sans">SHOULDER</text>

        {/* Waist */}
        <line x1={100 - scale(waistWidth)} y1="55" x2={100 + scale(waistWidth)} y2="55" stroke="#C08E62" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(waistWidth)} cy="55" r="3" fill="#C08E62" />
        <circle cx={100 + scale(waistWidth)} cy="55" r="3" fill="#C08E62" />
        <text x="100" y="48" textAnchor="middle" className="fill-coffee" fontSize="7" fontFamily="DM Sans">WAIST</text>

        {/* Hip */}
        <line x1={100 - scale(hipWidth)} y1="95" x2={100 + scale(hipWidth)} y2="95" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(hipWidth)} cy="95" r="3" fill="#8B7355" />
        <circle cx={100 + scale(hipWidth)} cy="95" r="3" fill="#8B7355" />
        <text x="100" y="88" textAnchor="middle" className="fill-coffee" fontSize="7" fontFamily="DM Sans">HIP</text>

        {/* Connecting lines */}
        <line x1={100 - scale(shoulderWidth)} y1="15" x2={100 - scale(waistWidth)} y2="55" stroke="#C4A882" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 + scale(shoulderWidth)} y1="15" x2={100 + scale(waistWidth)} y2="55" stroke="#C4A882" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 - scale(waistWidth)} y1="55" x2={100 - scale(hipWidth)} y2="95" stroke="#C4A882" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 + scale(waistWidth)} y1="55" x2={100 + scale(hipWidth)} y2="95" stroke="#C4A882" strokeWidth="1" strokeDasharray="3,3" />
      </svg>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[320px]">
        {[
          { label: "Shoulder", value: shoulderWidth, color: "#B8860B" },
          { label: "Waist", value: waistWidth, color: "#C08E62" },
          { label: "Hip", value: hipWidth, color: "#8B7355" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="h-24 bg-parchment border border-tan rounded-sm relative overflow-hidden flex items-end justify-center mb-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-sm"
                style={{ backgroundColor: m.color }}
              />
            </div>
            <span className="text-xs font-body text-coffee">{m.label}</span>
            <p className="font-display font-bold text-espresso text-lg">{(m.value * 100).toFixed(0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BodySilhouette({ bodyType }: { bodyType: string }) {
  const silhouettes: Record<string, string> = {
    Ectomorph: "M50,20 Q60,20 65,30 L68,55 Q72,65 68,80 L65,100 Q63,105 58,105 L55,105 Q50,105 50,100 L50,100 Q50,105 45,105 L42,105 Q37,105 35,100 L32,80 Q28,65 32,55 L35,30 Q40,20 50,20Z",
    Mesomorph: "M50,20 Q65,20 72,35 L78,60 Q82,75 75,90 L68,100 Q63,108 55,108 L45,108 Q37,108 32,100 L25,90 Q18,75 22,60 L28,35 Q35,20 50,20Z",
    Endomorph: "M50,20 Q62,22 68,35 L72,58 Q78,72 75,88 L70,100 Q65,110 55,112 L45,112 Q35,110 30,100 L25,88 Q22,72 28,58 L32,35 Q38,22 50,20Z",
    Rectangle: "M50,20 Q60,20 63,30 L65,58 Q66,70 65,85 L63,100 Q60,108 55,108 L45,108 Q40,108 37,100 L35,85 Q34,70 35,58 L37,30 Q40,20 50,20Z",
    Triangle: "M50,20 Q58,22 60,30 L62,55 Q64,70 66,85 L70,100 Q65,110 55,112 L45,112 Q35,110 30,100 L34,85 Q36,70 38,55 L40,30 Q42,22 50,20Z",
    "Inverted Triangle": "M50,20 Q68,22 74,35 L78,55 Q80,65 76,80 L70,95 Q65,105 55,108 L45,108 Q35,105 30,95 L24,80 Q20,65 22,55 L26,35 Q32,22 50,20Z",
    Hourglass: "M50,20 Q62,22 66,35 L68,50 Q62,62 55,65 L55,65 Q62,68 68,80 L70,95 Q65,108 55,110 L45,110 Q35,108 30,95 L32,80 Q38,68 45,65 L45,65 Q38,62 32,50 L34,35 Q38,22 50,20Z",
    Round: "M50,20 Q65,22 70,38 L72,58 Q74,72 70,88 L65,100 Q60,112 50,115 Q40,112 35,100 L30,88 Q26,72 28,58 L30,38 Q35,22 50,20Z",
  };

  return (
    <svg viewBox="0 0 100 130" className="w-full h-full">
      <path
        d={silhouettes[bodyType] || silhouettes.Rectangle}
        fill="none"
        stroke="#B8860B"
        strokeWidth="1.5"
        className="drop-shadow-sm"
      />
      <path
        d={silhouettes[bodyType] || silhouettes.Rectangle}
        fill="rgba(184, 134, 11, 0.08)"
      />
    </svg>
  );
}

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
          setError("Failed to analyse body. Please try a clearer full-body photo.");
        }
      };
      img.src = imageData;
    },
    [setFullBodyImage, analyzeBodyFromImage]
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // BODY</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Layers className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            BODY <span className="text-gradient-gold">&amp; TONE.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Upload a full-body photo for body type detection, proportion analysis, and skin undertone classification.
        </p>
      </div>

      {!bodyResult && (
        <div className="space-y-5">
          <ImageUploader
            onImageUpload={handleImageUpload}
            label="Upload a full-body photo"
            accept="full-body"
          />

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
                  <span className="font-body font-bold text-espresso text-base">Analysing body proportions and skin tone...</span>
                </div>
                <div className="h-4 bg-[#E8E0D8] overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-amber rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
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

      {bodyResult && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {fullBodyImage && (
            <motion.div variants={fadeUp} className="bg-cream border border-tan overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullBodyImage}
                alt="Analysed body"
                className="w-full max-h-[560px] object-cover"
              />
            </motion.div>
          )}

          {/* Body Type + Silhouette */}
          <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">BODY TYPE DETECTION</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-40 flex-shrink-0">
                <BodySilhouette bodyType={bodyResult.bodyType} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-display font-bold text-espresso">{bodyResult.bodyType}</h2>
                <p className="text-coffee mt-2 font-body text-lg">Your detected body silhouette type</p>
                {bodyResult.bodyProportionScore && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-parchment px-4 py-2 border border-tan rounded-sm">
                    <span className="text-sm font-body text-coffee">Proportion Score:</span>
                    <span className="font-display font-bold text-amber text-lg">{bodyResult.bodyProportionScore}/10</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Body Measurements */}
          <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">BODY PROPORTIONS</h3>
            </div>

            <BodyProportionViz
              shoulderWidth={bodyResult.shoulderWidth}
              waistWidth={bodyResult.waistWidth}
              hipWidth={bodyResult.hipWidth}
            />

            {/* Ratios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              {bodyResult.shoulderToWaistRatio && (
                <div className="bg-parchment p-5 border border-tan rounded-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-body text-coffee">Shoulder-to-Waist Ratio</span>
                    <span className="font-display font-bold text-amber text-lg">{bodyResult.shoulderToWaistRatio}</span>
                  </div>
                  <div className="h-3 bg-[#E8E0D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (bodyResult.shoulderToWaistRatio / 2) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-coffee font-body mt-2">
                    {bodyResult.shoulderToWaistRatio >= 1.5
                      ? "V-taper detected — broader shoulders relative to waist"
                      : bodyResult.shoulderToWaistRatio >= 1.3
                      ? "Balanced proportions — versatile for most styles"
                      : "Straighter silhouette — layering will add visual structure"}
                  </p>
                </div>
              )}
              {bodyResult.waistToHipRatio && (
                <div className="bg-parchment p-5 border border-tan rounded-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-body text-coffee">Waist-to-Hip Ratio</span>
                    <span className="font-display font-bold text-amber text-lg">{bodyResult.waistToHipRatio}</span>
                  </div>
                  <div className="h-3 bg-[#E8E0D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, bodyResult.waistToHipRatio * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-coffee font-body mt-2">
                    {bodyResult.waistToHipRatio <= 0.85
                      ? "Well-defined waist — suits tailored and fitted pieces"
                      : bodyResult.waistToHipRatio <= 0.95
                      ? "Moderate definition — structured tops balance the silhouette"
                      : "Straighter ratio — vertical lines and layering add definition"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Skin Tone */}
          <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-8">
              <Droplets className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">SKIN TONE ANALYSIS</h3>
            </div>
            <div className="flex items-center gap-8">
              <div
                className="w-24 h-24 rounded-full border-2 border-tan shadow-elegant flex-shrink-0"
                style={{ backgroundColor: bodyResult.skinToneValue }}
              />
              <div>
                <h3 className="text-2xl font-display font-bold text-espresso">
                  {bodyResult.skinToneScale}
                </h3>
                <p className="text-coffee font-body text-lg mt-1">
                  Undertone: <span className="font-bold text-espresso">{bodyResult.undertone}</span>
                </p>
                <p className="text-sm text-coffee font-body mt-2">
                  Your {bodyResult.undertone.toLowerCase()} undertone means {bodyResult.undertone === "Warm" ? "earth tones, golds, and warm neutrals will be most flattering" : bodyResult.undertone === "Cool" ? "jewel tones, silvers, and cool blues will complement you best" : "both warm and cool palettes work — you have maximum versatility"}.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Outfit Recommendations */}
          {outfitRecommendations.length > 0 && (
            <motion.div variants={fadeUp} className="bg-cream p-10 border border-tan vintage-border rounded-sm">
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-3">RECOMMENDED OUTFITS</h3>
              <p className="text-coffee font-body text-sm mb-8">
                Curated based on your {bodyResult.bodyType} body type and {bodyResult.undertone.toLowerCase()} undertone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {outfitRecommendations.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-parchment p-6 border border-tan rounded-sm card-hover"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-display font-bold text-espresso tracking-wider">{rec.name}</h4>
                      {rec.season && (
                        <span className="text-xs font-mono text-coffee bg-cream px-2 py-0.5 border border-tan rounded-sm">
                          {rec.season}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-coffee font-body mb-4">{rec.description}</p>
                    <div className="flex gap-2 mb-4">
                      {rec.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 border border-tan rounded-sm shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-coffee font-body italic leading-relaxed">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setError(null);
            }}
            className="w-full py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors border border-tan rounded-sm"
          >
            Analyse Another Photo
          </button>
        </motion.div>
      )}
    </div>
  );
}
