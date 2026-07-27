"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { useMediaPipe } from "@/hooks/useMediaPipe";
import { analyzeColorSeason, getSeasonEmoji, getColorHarmonyScore } from "@/lib/ml/color-analysis";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Loader2,
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

function ColorSwatch({
  color,
  label,
  variant,
}: {
  color: string;
  label?: string;
  variant: "best" | "worst" | "neutral";
}) {
  const borderColor =
    variant === "best"
      ? "border-amber/40"
      : variant === "worst"
      ? "border-burgundy/40"
      : "border-tan";

  return (
    <div className="flex flex-col items-center gap-1.5 group cursor-default">
      <div
        className={`w-14 h-14 border-2 ${borderColor} rounded-sm shadow-sm relative transition-transform group-hover:scale-110 group-hover:shadow-md`}
        style={{ backgroundColor: color }}
      >
        {variant === "best" && (
          <Check className="absolute -top-1.5 -right-1.5 w-4 h-4 text-cream bg-amber rounded-full p-0.5" />
        )}
        {variant === "worst" && (
          <X className="absolute -top-1.5 -right-1.5 w-4 h-4 text-cream bg-burgundy rounded-full p-0.5" />
        )}
      </div>
      <span className="text-[10px] font-mono text-coffee opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
      {label && (
        <span className="text-[10px] font-body text-coffee text-center">{label}</span>
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
    isAnalyzing,
    analysisProgress,
  } = useAnalysisStore();
  const { analyzeFaceFromImage } = useMediaPipe();
  const [error, setError] = useState<string | null>(null);
  const [testColor, setTestColor] = useState("#C89D7C");

  // Auto-generate color analysis when face data exists but color analysis doesn't
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
      <rect width="${w}" height="${h}" fill="#F5F0EB" rx="12"/>
      <rect width="${w}" height="6" fill="#B8860B" rx="3"/>
      <text x="${w/2}" y="40" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#8B7355" letter-spacing="3">A U R A S T Y L E</text>
      <text x="${w/2}" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#3C2A21" font-weight="bold">${colorAnalysis.subType}</text>
      <text x="${w/2}" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8B7355">${colorAnalysis.metalPreference} Metals · ${colorAnalysis.patternRecommendation.split(",")[0]}</text>
      <text x="${w/2}" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#C08E62" letter-spacing="2">BEST COLORS</text>
      ${swatches.map((c, i) => `<rect x="${startX + i * (swatchW + swatchGap)}" y="130" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#C4A882" stroke-width="1"/>`).join("")}
      ${swatches.map((c, i) => `<text x="${startX + i * (swatchW + swatchGap) + swatchW/2}" y="195" text-anchor="middle" font-family="monospace" font-size="8" fill="#8B7355">${c}</text>`).join("")}
      <text x="${w/2}" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#722F37" letter-spacing="2">AVOID</text>
      ${colorAnalysis.worstColors.slice(0, 6).map((c, i) => {
        const wx = (w - 6 * (swatchW + swatchGap) + swatchGap) / 2 + i * (swatchW + swatchGap);
        return `<rect x="${wx}" y="238" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#C4A882" stroke-width="1"/>`;
      }).join("")}
      <text x="${w/2}" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#C08E62">Generated by AuraStyle · aura-style-ai.vercel.app</text>
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
      link.download = `aurastyle-palette-${colorAnalysis.subType.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [colorAnalysis]);

  const sharePalette = useCallback(async () => {
    if (!colorAnalysis) return;
    const text = `My AuraStyle color palette: ${colorAnalysis.subType}\nBest colors: ${colorAnalysis.bestColors.slice(0, 5).join(", ")}\nMetal preference: ${colorAnalysis.metalPreference}`;
    if (navigator.share) {
      await navigator.share({ title: "My AuraStyle Palette", text });
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
          <Palette className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            COLOR <span className="text-gradient-gold">ANALYSIS.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Discover your seasonal color type, find your most flattering shades,
          and learn which colors to avoid.
        </p>
      </div>

      {/* Upload if no analysis */}
      {!colorAnalysis && (
        <div className="space-y-5">
          <ImageUploader
            onImageUpload={handleImageUpload}
            label="Upload a photo for color analysis"
            accept="face"
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
                  <span className="font-body font-bold text-espresso text-base">
                    Analysing skin undertone for seasonal classification...
                  </span>
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

      {/* Results */}
      {colorAnalysis && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Season Card */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber via-tan to-amber" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-28 h-28 bg-amber/10 rounded-full flex items-center justify-center border-2 border-amber/20">
                <SeasonIcon season={colorAnalysis.seasonalType} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-body text-amber tracking-widest uppercase">
                  Your Seasonal Type
                </span>
                <h2 className="text-4xl font-display font-bold text-espresso mt-1">
                  {colorAnalysis.subType}
                </h2>
                <p className="text-coffee font-body mt-3 leading-relaxed max-w-xl">
                  {colorAnalysis.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 border border-amber/20 rounded-full text-xs font-body text-amber">
                    <Gem className="w-3 h-3" />
                    {colorAnalysis.metalPreference} Metals
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 border border-amber/20 rounded-full text-xs font-body text-amber">
                    <Shirt className="w-3 h-3" />
                    {colorAnalysis.patternRecommendation.split(",")[0]}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Export Palette */}
          <motion.div variants={fadeUp} className="bg-cream p-6 border border-tan vintage-border rounded-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">EXPORT PALETTE CARD</h3>
                <p className="text-coffee font-body text-sm mt-1">Download a shareable card with your color palette</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportPaletteCard}
                  className="flex items-center gap-2 px-5 py-3 bg-amber text-cream font-body text-sm font-bold tracking-wider rounded-sm hover:bg-amber/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD
                </button>
                <button
                  onClick={sharePalette}
                  className="flex items-center gap-2 px-5 py-3 bg-parchment text-espresso font-body text-sm font-bold tracking-wider border border-tan rounded-sm hover:bg-tan/20 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  SHARE
                </button>
              </div>
            </div>
          </motion.div>

          {/* Best Colors */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-3">
              <Check className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                YOUR BEST COLORS
              </h3>
            </div>
            <p className="text-coffee font-body text-sm mb-8">
              These shades complement your {colorAnalysis.subType} coloring most flatteringly.
              Wear these as your primary wardrobe colors.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {colorAnalysis.bestColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="best" />
              ))}
            </div>
          </motion.div>

          {/* Worst Colors */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-3">
              <X className="w-5 h-5 text-burgundy" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                COLORS TO AVOID
              </h3>
            </div>
            <p className="text-coffee font-body text-sm mb-8">
              These shades clash with your natural coloring and can wash you out,
              create sallowness, or make skin appear uneven.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {colorAnalysis.worstColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="worst" />
              ))}
            </div>
          </motion.div>

          {/* Neutral / Safe Colors */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-3">
              <Droplets className="w-5 h-5 text-coffee" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                SAFE NEUTRALS
              </h3>
            </div>
            <p className="text-coffee font-body text-sm mb-8">
              These neutral tones work as reliable foundations for any outfit.
              They won't compete with your best colors.
            </p>
            <div className="flex gap-4">
              {colorAnalysis.neutralColors.map((color, i) => (
                <ColorSwatch key={i} color={color} variant="neutral" />
              ))}
            </div>
          </motion.div>

          {/* Color Harmony Tester */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-3">
              <Palette className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                COLOR HARMONY TESTER
              </h3>
            </div>
            <p className="text-coffee font-body text-sm mb-8">
              Test any color against your palette to see how well it harmonizes with your natural coloring.
            </p>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="space-y-4">
                <label className="text-sm font-body text-coffee">Pick a color to test:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={testColor}
                    onChange={(e) => setTestColor(e.target.value)}
                    className="w-16 h-10 border border-tan rounded-sm cursor-pointer"
                  />
                  <span className="font-mono text-sm text-espresso">{testColor}</span>
                </div>
                <div className="flex gap-2">
                  {["#FF6347", "#4682B4", "#556B2F", "#B8860B", "#000000", "#FFFFFF", "#800080", "#FFD700"].map(
                    (c) => (
                      <button
                        key={c}
                        onClick={() => setTestColor(c)}
                        className="w-8 h-8 border border-tan rounded-sm hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="flex-1 bg-parchment p-6 border border-tan rounded-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-20 h-20 border-2 border-tan rounded-sm shadow-sm"
                    style={{ backgroundColor: testColor }}
                  />
                  <div>
                    <span className="text-sm font-body text-coffee">Harmony Score</span>
                    <p className="font-display font-bold text-3xl text-espresso">
                      {testHarmonyScore.toFixed(1)}
                      <span className="text-lg text-coffee">/10</span>
                    </p>
                  </div>
                </div>
                <div className="h-4 bg-[#E8E0D8] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${testHarmonyScore * 10}%`,
                      backgroundColor:
                        testHarmonyScore >= 7
                          ? "#B8860B"
                          : testHarmonyScore >= 5
                          ? "#556B2F"
                          : "#722F37",
                    }}
                  />
                </div>
                <p className="text-sm text-coffee font-body">
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

          {/* Pattern & Metal Guide */}
          <motion.div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
            <div className="flex items-center gap-3 mb-8">
              <Shirt className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                STYLING GUIDE
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-parchment p-6 border border-tan rounded-sm">
                <h4 className="text-sm font-display font-bold text-amber tracking-wider mb-3">
                  BEST PATTERNS
                </h4>
                <p className="text-sm text-espresso font-body leading-relaxed">
                  {colorAnalysis.patternRecommendation}
                </p>
              </div>
              <div className="bg-parchment p-6 border border-tan rounded-sm">
                <h4 className="text-sm font-display font-bold text-amber tracking-wider mb-3">
                  METAL PREFERENCE
                </h4>
                <p className="text-sm text-espresso font-body leading-relaxed">
                  Stick to <strong>{colorAnalysis.metalPreference.toLowerCase()}</strong> metals for
                  watches, rings, necklaces, and belt buckles. This creates visual harmony with your
                  skin undertone.
                </p>
              </div>
              <div className="bg-parchment p-6 border border-tan rounded-sm">
                <h4 className="text-sm font-display font-bold text-amber tracking-wider mb-3">
                  EYEWEAR
                </h4>
                <p className="text-sm text-espresso font-body leading-relaxed">
                  {colorAnalysis.metalPreference === "Gold"
                    ? "Tortoiseshell, warm browns, gold frames, and amber tones. Avoid silver/chrome frames."
                    : colorAnalysis.metalPreference === "Silver"
                    ? "Black, silver, gunmetal, clear, and cool-toned frames. Avoid gold/tortoiseshell."
                    : "Both warm and cool frame colors work. Match frame color to outfit undertone."}
                </p>
              </div>
              <div className="bg-parchment p-6 border border-tan rounded-sm">
                <h4 className="text-sm font-display font-bold text-amber tracking-wider mb-3">
                  FORMALWEAR
                </h4>
                <p className="text-sm text-espresso font-body leading-relaxed">
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
            className="w-full py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors border border-tan rounded-sm"
          >
            Start New Analysis
          </button>
        </motion.div>
      )}
    </div>
  );
}
