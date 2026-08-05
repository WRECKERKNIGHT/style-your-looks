"use client";

import { useState, useCallback, useMemo } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe, AnalysisCancelledError } from "@/hooks/useMediaPipe";
import { ProcessingOverlay } from "@/components/analysis/ProcessingOverlay";
import { motion } from "framer-motion";
import { Layers, AlertCircle, Shirt, Droplets, Ruler, TrendingUp, Activity, Share2 } from "lucide-react";
import { DemoCarousel } from "@/components/demo/DemoCarousel";
import { DemoBadge } from "@/components/demo/DemoBadge";
import { DEMO_BODY_PHOTO, buildDemoBodyResult } from "@/lib/demo/demo-analysis";
import { detectPoseOnly } from "@/lib/ml/body-analyzer";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";
import { ShareCardModal, type ShareCardData } from "@/components/shared/ShareCardModal";

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
        <line x1={100 - scale(shoulderWidth)} y1="15" x2={100 + scale(shoulderWidth)} y2="15" stroke="var(--accent-nexus)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(shoulderWidth)} cy="15" r="3" fill="var(--accent-nexus)" />
        <circle cx={100 + scale(shoulderWidth)} cy="15" r="3" fill="var(--accent-nexus)" />
        <text x="100" y="8" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="DM Sans">SHOULDER</text>
        <line x1={100 - scale(waistWidth)} y1="55" x2={100 + scale(waistWidth)} y2="55" stroke="var(--accent-aurum)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(waistWidth)} cy="55" r="3" fill="var(--accent-aurum)" />
        <circle cx={100 + scale(waistWidth)} cy="55" r="3" fill="var(--accent-aurum)" />
        <text x="100" y="48" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="DM Sans">WAIST</text>
        <line x1={100 - scale(hipWidth)} y1="95" x2={100 + scale(hipWidth)} y2="95" stroke="#B98B56" strokeWidth="3" strokeLinecap="round" />
        <circle cx={100 - scale(hipWidth)} cy="95" r="3" fill="#B98B56" />
        <circle cx={100 + scale(hipWidth)} cy="95" r="3" fill="#B98B56" />
        <text x="100" y="88" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontFamily="DM Sans">HIP</text>
        <line x1={100 - scale(shoulderWidth)} y1="15" x2={100 - scale(waistWidth)} y2="55" stroke="var(--accent-nexus)" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 + scale(shoulderWidth)} y1="15" x2={100 + scale(waistWidth)} y2="55" stroke="var(--accent-nexus)" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 - scale(waistWidth)} y1="55" x2={100 - scale(hipWidth)} y2="95" stroke="var(--accent-nexus)" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={100 + scale(waistWidth)} y1="55" x2={100 + scale(hipWidth)} y2="95" stroke="var(--accent-nexus)" strokeWidth="1" strokeDasharray="3,3" />
      </svg>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[320px]">
        {[
          { label: "Shoulder", value: shoulderWidth, color: "var(--accent-nexus)" },
          { label: "Waist", value: waistWidth, color: "var(--accent-aurum)" },
          { label: "Hip", value: hipWidth, color: "#B98B56" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="h-24 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] relative overflow-hidden flex items-end justify-center mb-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.value / maxVal) * 100}%` }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
                style={{ backgroundColor: m.color }}
              />
            </div>
            <span className="text-xs font-body text-[var(--text-muted)]">{m.label}</span>
            <p className="font-display font-bold text-[var(--text-primary)] text-lg">{(m.value * 100).toFixed(0)}</p>
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
        stroke="var(--accent-nexus)"
        strokeWidth="1.5"
        className="drop-shadow-sm"
      />
      <path
        d={silhouettes[bodyType] || silhouettes.Rectangle}
        fill="rgba(185, 139, 86, 0.08)"
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
    setBodyResult,
    setOutfitRecommendations,
  } = useAnalysisStore();
  const { analyzeBodyFromImage, cancelAnalysis } = useMediaPipe();
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleImageUpload = useCallback(
    async (imageData: string) => {
      setFullBodyImage(imageData);
      setError(null);

      const img = new Image();
      img.onload = async () => {
        try {
          await analyzeBodyFromImage(img);
        } catch (err) {
          if (err instanceof AnalysisCancelledError) return;
          setError("Failed to analyse body. Please try a clearer full-body photo.");
        }
      };
      img.onerror = () => {
        setError("Could not load that photo. Please try re-uploading a different image.");
      };
      img.src = imageData;
    },
    [setFullBodyImage, analyzeBodyFromImage]
  );

  const runDemo = useCallback(async () => {
    useAnalysisStore.getState().reset();
    useAnalysisStore.getState().setSource("demo");
    setFullBodyImage(DEMO_BODY_PHOTO);
    setError(null);
    await new Promise((r) => setTimeout(r, 1500));
    const { result, recommendations } = buildDemoBodyResult();
    setBodyResult(result);
    setOutfitRecommendations(recommendations);
  }, [setFullBodyImage, setBodyResult, setOutfitRecommendations]);

  const shareData = useMemo<ShareCardData | null>(() => {
    if (!bodyResult) return null;
    return {
      photo: fullBodyImage,
      brand: "ZERVEY",
      brandTag: "Measured like a tailor",
      title: `${bodyResult.bodyType} Body`,
      subtitle: `${bodyResult.undertone} undertone`,
      overview: [
        { label: "Body Type", value: bodyResult.bodyType },
        { label: "Skin Tone", value: bodyResult.skinToneScale },
        { label: "Undertone", value: bodyResult.undertone },
        { label: "Shoulder-to-Waist", value: `${bodyResult.shoulderToWaistRatio?.toFixed(2) ?? "—"}` },
        { label: "Waist-to-Hip", value: `${bodyResult.waistToHipRatio?.toFixed(2) ?? "—"}` },
        { label: "Symmetry", value: `${bodyResult.bodySymmetry?.toFixed(1) ?? "—"}/10` },
      ],
      scoreLabel: "BODY PROPORTION SCORE",
      score: `${bodyResult.bodyProportionScore?.toFixed(1) ?? "8.4"}`,
      scoreSuffix: "/10",
      footer: "zervey.app · computed on-device",
      fileName: `zervey-body-${bodyResult.bodyType.toLowerCase().replace(/\s+/g, "-")}.png`,
      shareText: `My ZERVEY body analysis: ${bodyResult.bodyType} type · ${bodyResult.undertone} undertone · proportion score ${bodyResult.bodyProportionScore?.toFixed(1)}/10`,
      demo: fullBodyImage === DEMO_BODY_PHOTO,
    };
  }, [bodyResult, fullBodyImage]);

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <div>
        <span className="section-number">EST. MMXXIV // BODY</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Layers className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            BODY <span className="text-gradient-aurum">&amp; TONE.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Upload a full-body photo for body type detection, proportion analysis, and skin undertone classification.
        </p>
      </div>
      </ScrollParallax>

      {!bodyResult && (
        <div className="space-y-5">
          <div className="glass-card p-8">
            <ImageUploader
              onImageUpload={handleImageUpload}
              label="Upload a full-body photo"
              accept="full-body"
            />

            <DemoCarousel
              slides={[
                {
                  photo: DEMO_BODY_PHOTO,
                  title: "Run a full body-type, proportion and undertone scan on a sample.",
                  detail:
                    "Watch the pose skeleton lock onto the silhouette — then see shoulder–waist–hip ratios and curated outfit recommendations.",
                  onRun: runDemo,
                  detect: detectPoseOnly,
                },
              ]}
            />
          </div>

          <ProcessingOverlay title="ANALYSING YOUR BODY..." />

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}
        </div>
      )}

      {bodyResult && (
        <ScrollBlur blur={8} minOpacity={0.9}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {fullBodyImage === DEMO_BODY_PHOTO && (
            <motion.div variants={fadeUp}>
              <DemoBadge />
            </motion.div>
          )}
          {fullBodyImage && (
            <motion.div variants={fadeUp} className="glass-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fullBodyImage}
                alt="Analysed body"
                className="w-full max-h-[560px] object-cover"
              />
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">BODY TYPE DETECTION</h3>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-40 flex-shrink-0">
                <BodySilhouette bodyType={bodyResult.bodyType} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="type-display text-[var(--text-primary)]">{bodyResult.bodyType}</h2>
                <p className="text-[var(--text-muted)] mt-2 font-body type-subhead">Your detected body silhouette type</p>
                {bodyResult.bodyProportionScore && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-[var(--bg-tertiary)] px-4 py-2 border border-[var(--border-primary)]">
                    <span className="text-sm font-body text-[var(--text-muted)]">Proportion Score:</span>
                    <span className="font-display font-bold text-gradient-aurum text-lg">{bodyResult.bodyProportionScore}/10</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">BODY PROPORTIONS</h3>
            </div>

            <BodyProportionViz
              shoulderWidth={bodyResult.shoulderWidth}
              waistWidth={bodyResult.waistWidth}
              hipWidth={bodyResult.hipWidth}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              {bodyResult.shoulderToWaistRatio && (
                <div className="bg-[var(--bg-tertiary)] p-5 border border-[var(--border-primary)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-body text-[var(--text-muted)]">Shoulder-to-Waist Ratio</span>
                    <span className="font-display font-bold text-gradient-aurum text-lg">{bodyResult.shoulderToWaistRatio}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (bodyResult.shoulderToWaistRatio / 2) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-body mt-2">
                    {bodyResult.shoulderToWaistRatio >= 1.5
                      ? "V-taper detected — broader shoulders relative to waist"
                      : bodyResult.shoulderToWaistRatio >= 1.3
                      ? "Balanced proportions — versatile for most styles"
                      : "Straighter silhouette — layering will add visual structure"}
                  </p>
                </div>
              )}
              {bodyResult.waistToHipRatio && (
                <div className="bg-[var(--bg-tertiary)] p-5 border border-[var(--border-primary)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-body text-[var(--text-muted)]">Waist-to-Hip Ratio</span>
                    <span className="font-display font-bold text-gradient-aurum text-lg">{bodyResult.waistToHipRatio}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, bodyResult.waistToHipRatio * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-body mt-2">
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

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <Droplets className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">SKIN TONE ANALYSIS</h3>
            </div>
            <div className="flex items-center gap-8">
              <div
                className="w-24 h-24 rounded-full border-2 border-[var(--border-primary)] flex-shrink-0 glow-ring"
                style={{ backgroundColor: bodyResult.skinToneValue }}
              />
              <div>
                <h3 className="type-heading text-[var(--text-primary)]">
                  {bodyResult.skinToneScale}
                </h3>
                <p className="text-[var(--text-muted)] font-body type-subhead mt-1">
                  Undertone: <span className="font-bold text-[var(--text-primary)]">{bodyResult.undertone}</span>
                </p>
                <p className="text-sm text-[var(--text-muted)] font-body mt-2">
                  Your {bodyResult.undertone.toLowerCase()} undertone means {bodyResult.undertone === "Warm" ? "earth tones, golds, and warm neutrals will be most flattering" : bodyResult.undertone === "Cool" ? "jewel tones, silvers, and cool blues will complement you best" : "both warm and cool palettes work — you have maximum versatility"}.
                </p>
              </div>
            </div>
          </motion.div>

          {outfitRecommendations.length > 0 && (
            <motion.div variants={fadeUp} className="glass-card p-10">
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-3">RECOMMENDED OUTFITS</h3>
              <p className="text-[var(--text-muted)] font-body text-sm mb-8">
                Curated based on your {bodyResult.bodyType} body type and {bodyResult.undertone.toLowerCase()} undertone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {outfitRecommendations.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)] card-nexus"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="type-label text-[var(--text-primary)]">{rec.name}</h4>
                      {rec.season && (
                        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 border border-[var(--border-primary)]">
                          {rec.season}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body mb-4">{rec.description}</p>
                    <div className="flex gap-2 mb-4">
                      {rec.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 border border-[var(--border-primary)] shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-body italic leading-relaxed">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <button
            onClick={() => {
              useAnalysisStore.getState().reset();
              setError(null);
              cancelAnalysis();
            }}
            className="btn-outline w-full justify-center"
          >
            Analyse Another Photo
          </button>

          <div className="flex justify-center">
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share result card"
              className="btn-outline !py-3 !px-8"
            >
              <Share2 className="w-4 h-4" />
              SHARE RESULT CARD
            </button>
          </div>
        </motion.div>
        </ScrollBlur>
      )}

      <ShareCardModal open={shareOpen} onClose={() => setShareOpen(false)} data={shareData} />
    </div>
  );
}
