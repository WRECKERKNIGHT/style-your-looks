"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { analyzeColorSeason, getSeasonEmoji, getColorHarmonyScore } from "@/lib/ml/color-analysis";
import { ProcessingOverlay } from "@/components/analysis/ProcessingOverlay";
import { motion } from "framer-motion";
import {
  Palette,
  AlertCircle,
  Droplets,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Check,
  X,
  Gem,
  Shirt,
  Download,
  Share2,
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SeasonIcon({ season }: { season: string }) {
  switch (season) {
    case "Spring": return <Flower2 className="w-6 h-6" />;
    case "Summer": return <Sun className="w-6 h-6" />;
    case "Autumn": return <Leaf className="w-6 h-6" />;
    case "Winter": return <Snowflake className="w-6 h-6" />;
    default: return <Palette className="w-6 h-6" />;
  }
}

function ColorSwatch({ color, label, variant }: { color: string; label?: string; variant: "best" | "worst" | "neutral" }) {
  const borderColor =
    variant === "best"
      ? "border-[var(--accent-aurum)]/40"
      : variant === "worst"
      ? "border-red-500/40"
      : "border-[var(--border-primary)]";

  return (
    <div className="flex flex-col items-center gap-1.5 group cursor-default">
      <div
        className={`w-14 h-14 border-2 ${borderColor} relative transition-transform group-hover:scale-110 group-hover:shadow-lg`}
        style={{ backgroundColor: color }}
      >
        {variant === "best" && (
          <Check className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white bg-[var(--accent-aurum)] rounded-full p-0.5" />
        )}
        {variant === "worst" && (
          <X className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white bg-red-500 rounded-full p-0.5" />
        )}
      </div>
      <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
      {label && (
        <span className="text-[10px] font-body text-[var(--text-muted)] text-center">{label}</span>
      )}
    </div>
  );
}

export default function ColorAnalysisPage() {
  const {
    faceResult,
    bodyResult,
    colorAnalysis,
    setColorAnalysis,
    uploadedImage,
    setUploadedImage,
  } = useAnalysisStore();
  const { analyzeFaceFromImage } = useMediaPipe();
  const [error, setError] = useState<string | null>(null);
  const [testColor, setTestColor] = useState("#C89D7C");

  useEffect(() => {
    if (faceResult && bodyResult && !colorAnalysis) {
      const analysis = analyzeColorSeason({
        undertone: faceResult.undertone as "Warm" | "Cool" | "Neutral",
        ita: 35,
        monkScaleId: 4,
      });
      setColorAnalysis(analysis);
    }
  }, [faceResult, bodyResult, colorAnalysis, setColorAnalysis]);

  const handleImageUpload = useCallback(
    async (imageData: string) => {
      setUploadedImage(imageData);
      setError(null);

      const img = new Image();
      img.onload = async () => {
        try {
          const result = await analyzeFaceFromImage(img);
          if (result?.skinTone) {
            const analysis = analyzeColorSeason({
              undertone: result.skinTone.undertone || "Neutral",
              ita: result.skinTone.ita || 35,
              monkScaleId: result.skinTone.monkScale?.id || 4,
            });
            setColorAnalysis(analysis);
          }
        } catch (err) {
          setError("Failed to analyse skin tone. Please try a clearer photo.");
        }
      };
      img.src = imageData;
    },
    [setUploadedImage, analyzeFaceFromImage, setColorAnalysis]
  );

  const cardRef = useRef<HTMLDivElement>(null);

  const exportPaletteCard = useCallback(async () => {
    if (!colorAnalysis) return;

    const w = 640;
    const h = 360;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", `${w}`);
    svg.setAttribute("height", `${h}`);

    const swatches = colorAnalysis.bestColors.slice(0, 8);
    const swatchW = 50;
    const swatchGap = 10;
    const totalW = swatches.length * (swatchW + swatchGap) - swatchGap;
    const startX = (w - totalW) / 2;

    svg.innerHTML = `
      <rect width="${w}" height="${h}" fill="#0A0618" rx="12"/>
      <rect width="${w}" height="6" fill="#6C2BD9" rx="3"/>
      <text x="${w/2}" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8C59FF" letter-spacing="3">N E X A R I</text>
      <text x="${w/2}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#D4BFFF" font-weight="bold">${colorAnalysis.subType}</text>
      <text x="${w/2}" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8C59FF">${colorAnalysis.metalPreference} Metals · ${colorAnalysis.patternRecommendation.split(",")[0]}</text>
      <text x="${w/2}" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#E8B620" letter-spacing="2">BEST COLORS</text>
      ${swatches.map((c, i) => `<rect x="${startX + i * (swatchW + swatchGap)}" y="130" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#6C2BD9" stroke-width="1"/>`).join("")}
      ${swatches.map((c, i) => `<text x="${startX + i * (swatchW + swatchGap) + swatchW/2}" y="195" text-anchor="middle" font-family="monospace" font-size="8" fill="#8C59FF">${c}</text>`).join("")}
      <text x="${w/2}" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#FF4444" letter-spacing="2">AVOID</text>
      ${colorAnalysis.worstColors.slice(0, 6).map((c, i) => {
        const wx = (w - 6 * (swatchW + swatchGap) + swatchGap) / 2 + i * (swatchW + swatchGap);
        return `<rect x="${wx}" y="238" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#6C2BD9" stroke-width="1"/>`;
      }).join("")}
      <text x="${w/2}" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#8C59FF">Generated by NEXARI · nexari.app</text>
    `;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement("canvas");
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w * 2, h * 2);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.download = `nexari-palette-${colorAnalysis.subType.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [colorAnalysis]);

  const sharePalette = useCallback(async () => {
    if (!colorAnalysis) return;
    const text = `My NEXARI color palette: ${colorAnalysis.subType}\nBest colors: ${colorAnalysis.bestColors.slice(0, 5).join(", ")}\nMetal preference: ${colorAnalysis.metalPreference}`;
    if (navigator.share) {
      await navigator.share({ title: "My NEXARI Palette", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [colorAnalysis]);

  const testHarmonyScore =
    colorAnalysis ? getColorHarmonyScore(testColor, colorAnalysis.bestColors) : 0;

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // COLOR ANALYSIS</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Palette className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            COLOR <span className="text-gradient-aurum">ANALYSIS.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Discover your seasonal color type, find your most flattering shades, and learn which colors to avoid.
        </p>
      </div>

      {!colorAnalysis && (
        <div className="space-y-5">
          <div className="glass-card p-8">
            <ImageUploader
              onImageUpload={handleImageUpload}
              label="Upload a photo for color analysis"
              accept="face"
            />
          </div>

          <ProcessingOverlay title="ANALYSING YOUR COLOR SEASON..." />

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}
        </div>
      )}

      {colorAnalysis && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={fadeUp} className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-nexus)] via-[var(--accent-aurum)] to-[var(--accent-nexus)]" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-28 h-28 bg-[var(--accent-aurum)]/10 rounded-full flex items-center justify-center border-2 border-[var(--accent-aurum)]/20">
                <SeasonIcon season={colorAnalysis.seasonalType} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="type-label text-[var(--accent-aurum)]">
                  Your Seasonal Type
                </span>
                <h2 className="type-display text-[var(--text-primary)] mt-1">
                  {colorAnalysis.subType}
                </h2>
                <p className="text-[var(--text-muted)] font-body mt-3 leading-relaxed max-w-xl">
                  {colorAnalysis.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-aurum)]/10 border border-[var(--accent-aurum)]/20 rounded-full text-xs font-body text-[var(--accent-aurum)]">
                    <Gem className="w-3 h-3" />
                    {colorAnalysis.metalPreference} Metals
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-aurum)]/10 border border-[var(--accent-aurum)]/20 rounded-full text-xs font-body text-[var(--accent-aurum)]">
                    <Shirt className="w-3 h-3" />
                    {colorAnalysis.patternRecommendation.split(",")[0]}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">EXPORT PALETTE CARD</h3>
                <p className="text-[var(--text-muted)] font-body text-sm mt-1">Download a shareable card with your color palette</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportPaletteCard}
                  className="btn-nexus"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD
                </button>
                <button
                  onClick={sharePalette}
                  className="btn-outline"
                >
                  <Share2 className="w-4 h-4" />
                  SHARE
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Check className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                YOUR BEST COLORS
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              These shades complement your {colorAnalysis.subType} coloring most flatteringly. Wear these as your primary wardrobe colors.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {colorAnalysis.bestColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="best" />
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <X className="w-5 h-5 text-red-400" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                COLORS TO AVOID
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              These shades clash with your natural coloring and can wash you out, create sallowness, or make skin appear uneven.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {colorAnalysis.worstColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="worst" />
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-5 h-5 text-[var(--text-muted)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                SAFE NEUTRALS
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              These neutral tones work as reliable foundations for any outfit. They won&apos;t compete with your best colors.
            </p>
            <div className="flex gap-4">
              {colorAnalysis.neutralColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="neutral" />
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                COLOR HARMONY TESTER
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              Test any color against your palette to see how well it harmonizes with your natural coloring.
            </p>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="space-y-4">
                <label className="text-sm font-body text-[var(--text-muted)]">Pick a color to test:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={testColor}
                    onChange={(e) => setTestColor(e.target.value)}
                    className="w-16 h-10 border border-[var(--border-primary)] cursor-pointer"
                  />
                  <span className="font-mono text-sm text-[var(--text-primary)]">{testColor}</span>
                </div>
                <div className="flex gap-2">
                  {["#FF6347", "#4682B4", "#00FF88", "#FFD700", "#000000", "#FFFFFF", "#FF004D", "#6C2BD9"].map(
                    (c) => (
                      <button
                        key={c}
                        onClick={() => setTestColor(c)}
                        className="w-8 h-8 border border-[var(--border-primary)] hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="flex-1 bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)]">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-20 h-20 border-2 border-[var(--border-primary)] shadow-sm"
                    style={{ backgroundColor: testColor }}
                  />
                  <div>
                    <span className="text-sm font-body text-[var(--text-muted)]">Harmony Score</span>
                    <p className="font-display font-bold text-3xl text-[var(--text-primary)]">
                      {testHarmonyScore.toFixed(1)}
                      <span className="text-lg text-[var(--text-muted)]">/10</span>
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${testHarmonyScore * 10}%`,
                      backgroundColor:
                        testHarmonyScore >= 7
                          ? "var(--accent-aurum)"
                          : testHarmonyScore >= 5
                          ? "#00FF88"
                          : "#FF4444",
                    }}
                  />
                </div>
                <p className="text-sm text-[var(--text-muted)] font-body">
                  {testHarmonyScore >= 8
                    ? "Excellent match — this color harmonizes beautifully with your skin tone."
                    : testHarmonyScore >= 6
                    ? "Good match — this color works well with your palette."
                    : testHarmonyScore >= 4
                    ? "Moderate — this color is neutral for your type. Usable but not optimal."
                    : "Poor match — this color clashes with your natural coloring. Avoid as a primary."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-8">
              <Shirt className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                STYLING GUIDE
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)]">
                <h4 className="type-label text-[var(--accent-aurum)] mb-3">
                  BEST PATTERNS
                </h4>
                <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                  {colorAnalysis.patternRecommendation}
                </p>
              </div>
              <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)]">
                <h4 className="type-label text-[var(--accent-aurum)] mb-3">
                  METAL PREFERENCE
                </h4>
                <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                  Stick to <strong>{colorAnalysis.metalPreference.toLowerCase()}</strong> metals for
                  watches, rings, necklaces, and belt buckles. This creates visual harmony with your skin undertone.
                </p>
              </div>
              <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)]">
                <h4 className="type-label text-[var(--accent-aurum)] mb-3">
                  EYEWEAR
                </h4>
                <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                  {colorAnalysis.metalPreference === "Gold"
                    ? "Tortoiseshell, warm browns, gold frames, and amber tones. Avoid silver/chrome frames."
                    : colorAnalysis.metalPreference === "Silver"
                    ? "Black, silver, gunmetal, clear, and cool-toned frames. Avoid gold/tortoiseshell."
                    : "Both warm and cool frame colors work. Match frame color to outfit undertone."}
                </p>
              </div>
              <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)]">
                <h4 className="type-label text-[var(--accent-aurum)] mb-3">
                  FORMALWEAR
                </h4>
                <p className="text-sm text-[var(--text-primary)] font-body leading-relaxed">
                  {colorAnalysis.seasonalType === "Winter"
                    ? "True black or deep navy suits. White shirts. Avoid off-white or cream — you need crisp contrast."
                    : colorAnalysis.seasonalType === "Autumn"
                    ? "Charcoal, chocolate brown, or olive suits. Warm white or ivory shirts. Avoid stark black."
                    : colorAnalysis.seasonalType === "Summer"
                    ? "Soft grey, dusty blue, or taupe suits. Avoid harsh black — opt for charcoal or navy."
                    : "Tan, light grey, or warm navy suits. Cream or warm white shirts. Avoid stark black."}
                </p>
              </div>
            </div>
          </motion.div>

          <button
            onClick={() => {
              setColorAnalysis(null);
              useAnalysisStore.getState().reset();
              setError(null);
            }}
            className="btn-outline w-full justify-center"
          >
            Start New Analysis
          </button>
        </motion.div>
      )}
    </div>
  );
}
