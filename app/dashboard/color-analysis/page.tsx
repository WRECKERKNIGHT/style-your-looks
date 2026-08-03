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
  Layers,
  Contrast,
  Archive,
  Plus,
  Trash2,
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
      ? "border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function DrapeTool({ photo, palette }: { photo: string | null; palette: string[] }) {
  const [drape, setDrape] = useState("#C4703F");
  const [mode, setMode] = useState<"multiply" | "color" | "overlay">("color");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="relative overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-base)] aspect-[3/4] max-w-sm mx-auto w-full">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Drape preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(160deg,#C89D7C 0%,#A0764E 60%,#8A5F3D 100%)" }} />
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: drape, mixBlendMode: mode }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-sm px-3 py-2">
          <span className="font-mono text-[0.6rem] text-white">{drape}</span>
          <span className="type-mono text-[0.5rem] text-white/70 tracking-widest uppercase">
            {mode} blend
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <span className="type-label text-[var(--text-primary)] mb-3 block">
            CHOOSE A DRAPE COLOR
          </span>
          <div className="flex flex-wrap gap-2">
            {palette.slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => setDrape(c)}
                className={`w-10 h-10 border-2 transition-transform hover:scale-110 ${
                  drape === c ? "border-[var(--accent-aurum)]" : "border-[var(--border-primary)]"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Drape ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={drape}
            onChange={(e) => setDrape(e.target.value)}
            className="w-14 h-10 border border-[var(--border-primary)] cursor-pointer"
          />
          <div className="flex gap-2">
            {(["multiply", "color", "overlay"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 border text-xs font-body uppercase tracking-wider transition-colors ${
                  mode === m
                    ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
          Simulates holding a fabric swatch under your chin. <strong className="text-[var(--text-primary)]">Color</strong> tint
          shows the pure hue on your skin; <strong className="text-[var(--text-primary)]">Multiply</strong> shows a deeper shade;
          <strong className="text-[var(--text-primary)]"> Overlay</strong> mixes both. Pick colors from your best palette and
          see which ones brighten or drain your face.
        </p>
      </div>
    </div>
  );
}

function ContrastMatrix({ skinHex, palette }: { skinHex: string; palette: string[] }) {
  const [reference, setReference] = useState(skinHex);
  const rows = palette.slice(0, 8);
  const cols = palette.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="type-label text-[var(--text-muted)]">REFERENCE</span>
          <input
            type="color"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-12 h-9 border border-[var(--border-primary)] cursor-pointer"
          />
          <span className="font-mono text-xs text-[var(--text-primary)]">{reference}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-body">
          Contrast ratio against your skin tone. High = the color pops on you; Low = tonal, seamless.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr>
              <th className="p-2 text-left type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">COLOR</th>
              {cols.map((c) => (
                <th key={c} className="p-2">
                  <div className="w-8 h-8 mx-auto border border-[var(--border-primary)]" style={{ backgroundColor: c }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ratios = cols.map((col) => contrastRatio(row, col));
              return (
                <tr key={row}>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border border-[var(--border-primary)]" style={{ backgroundColor: row }} />
                      <span className="font-mono text-[0.55rem] text-[var(--text-muted)]">{row}</span>
                    </div>
                  </td>
                  {ratios.map((r, i) => {
                    const tier = r >= 4.5 ? "high" : r >= 2.5 ? "medium" : "low";
                    const bg =
                      tier === "high"
                        ? "bg-[color-mix(in_srgb,var(--accent-aurum)_18%,transparent)] text-[var(--accent-aurum)]"
                        : tier === "medium"
                        ? "bg-[color-mix(in_srgb,var(--accent-nexus)_14%,transparent)] text-[var(--accent-nexus)]"
                        : "bg-[color-mix(in_srgb,var(--text-muted)_8%,transparent)] text-[var(--text-muted)]";
                    return (
                      <td key={i} className={`p-2 text-center type-mono text-[0.6rem] ${bg}`}>
                        {r.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4">
        <span className="type-mono text-[0.55rem] text-[var(--accent-aurum)] tracking-widest">▣ HIGH ≥ 4.5 — pops</span>
        <span className="type-mono text-[0.55rem] text-[var(--accent-nexus)] tracking-widest">▣ MEDIUM 2.5–4.5 — balanced</span>
        <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">▣ LOW &lt; 2.5 — tonal</span>
      </div>
    </div>
  );
}

function WardrobeMatcher({ palette }: { palette: string[] }) {
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("#CCA066");

  const addItem = () => {
    const c = draft.toLowerCase();
    if (items.some((i) => i.toLowerCase() === c)) return;
    setItems((prev) => [...prev, c]);
  };

  const removeItem = (c: string) => setItems((prev) => prev.filter((i) => i !== c));

  const verdict = (color: string) => {
    const bestMatch = Math.max(...palette.map((p) => contrastRatio(color, p)));
    if (palette.some((p) => p.toLowerCase() === color.toLowerCase())) return { tier: "perfect" as const, label: "IN YOUR PALETTE", note: "Exact match to your season's best colors." };
    if (bestMatch >= 6) return { tier: "keep" as const, label: "KEEP", note: `Strong contrast with your palette — works as an accent (best match ratio ${bestMatch.toFixed(2)}).` };
    if (bestMatch >= 3.2) return { tier: "optional" as const, label: "OPTIONAL", note: "Neutral for your season. Fine in small doses." };
    return { tier: "avoid" as const, label: "AVOID", note: `Clashes with your palette — drains your coloring (best match ratio only ${bestMatch.toFixed(2)}).` };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-14 h-10 border border-[var(--border-primary)] cursor-pointer"
        />
        <div className="flex gap-2">
          {["#CCA066", "#A13B2F", "#4682B4", "#241812", "#FBF7F0", "#7A9E6B", "#C4703F", "#8A5F3D"].map((c) => (
            <button
              key={c}
              onClick={() => setDraft(c)}
              className="w-8 h-8 border border-[var(--border-primary)] hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              aria-label={`Add ${c}`}
            />
          ))}
        </div>
        <button onClick={addItem} className="btn-nexus !py-2 !px-4 text-xs">
          <Plus className="w-3.5 h-3.5" />
          ADD TO WARDROBE
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] font-body">
          Add colors from your actual wardrobe — each piece is scored against your seasonal palette and flagged as
          KEEP, OPTIONAL, or AVOID.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((c) => {
            const v = verdict(c);
            const border =
              v.tier === "perfect"
                ? "border-[var(--accent-aurum)]"
                : v.tier === "keep"
                ? "border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                : v.tier === "optional"
                ? "border-[var(--border-primary)]"
                : "border-red-500/40";
            return (
              <div key={c} className={`flex items-start gap-3 bg-[var(--bg-tertiary)] p-4 border ${border}`}>
                <div className="w-10 h-10 shrink-0 border border-[var(--border-primary)]" style={{ backgroundColor: c }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`type-mono text-[0.55rem] tracking-widest ${
                        v.tier === "avoid" ? "text-red-400" : v.tier === "keep" || v.tier === "perfect" ? "text-[var(--accent-aurum)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {v.label}
                    </span>
                    <span className="font-mono text-[0.55rem] text-[var(--text-muted)] ml-auto">{c}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed mt-1">{v.note}</p>
                </div>
                <button
                  onClick={() => removeItem(c)}
                  className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"
                  aria-label={`Remove ${c}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
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
      <rect width="${w}" height="${h}" fill="#241812" rx="12"/>
      <rect width="${w}" height="6" fill="#8A5F3D" rx="3"/>
      <text x="${w/2}" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#C9B18C" letter-spacing="3">N E X A R I</text>
      <text x="${w/2}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#F3EAD9" font-weight="bold">${colorAnalysis.subType}</text>
      <text x="${w/2}" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#C9B18C">${colorAnalysis.metalPreference} Metals · ${colorAnalysis.patternRecommendation.split(",")[0]}</text>
      <text x="${w/2}" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#C8963E" letter-spacing="2">BEST COLORS</text>
      ${swatches.map((c, i) => `<rect x="${startX + i * (swatchW + swatchGap)}" y="130" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#8A5F3D" stroke-width="1"/>`).join("")}
      ${swatches.map((c, i) => `<text x="${startX + i * (swatchW + swatchGap) + swatchW/2}" y="195" text-anchor="middle" font-family="monospace" font-size="8" fill="#C9B18C">${c}</text>`).join("")}
      <text x="${w/2}" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#FF4444" letter-spacing="2">AVOID</text>
      ${colorAnalysis.worstColors.slice(0, 6).map((c, i) => {
        const wx = (w - 6 * (swatchW + swatchGap) + swatchGap) / 2 + i * (swatchW + swatchGap);
        return `<rect x="${wx}" y="238" width="${swatchW}" height="${swatchW}" rx="6" fill="${c}" stroke="#8A5F3D" stroke-width="1"/>`;
      }).join("")}
      <text x="${w/2}" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#C9B18C">Generated by ZERVEY · zervey.app</text>
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
      link.download = `zervey-palette-${colorAnalysis.subType.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [colorAnalysis]);

  const sharePalette = useCallback(async () => {
    if (!colorAnalysis) return;
    const text = `My ZERVEY color palette: ${colorAnalysis.subType}\nBest colors: ${colorAnalysis.bestColors.slice(0, 5).join(", ")}\nMetal preference: ${colorAnalysis.metalPreference}`;
    if (navigator.share) {
      await navigator.share({ title: "My ZERVEY Palette", text });
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
              <div className="w-28 h-28 bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] rounded-full flex items-center justify-center border-2 border-[color-mix(in_srgb,var(--accent-aurum)_20%,transparent)]">
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-aurum)_20%,transparent)] rounded-full text-xs font-body text-[var(--accent-aurum)]">
                    <Gem className="w-3 h-3" />
                    {colorAnalysis.metalPreference} Metals
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border border-[color-mix(in_srgb,var(--accent-aurum)_20%,transparent)] rounded-full text-xs font-body text-[var(--accent-aurum)]">
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
                  {["#C4703F", "#4682B4", "#7A9E6B", "#C8963E", "#241812", "#FBF7F0", "#A13B2F", "#8A5F3D"].map(
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
                          ? "var(--accent-honey)"
                          : "#A13B2F",
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
            <div className="flex items-center gap-3 mb-3">
              <Layers className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                VIRTUAL DRAPE TOOL
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              Try fabric colors against your photo in real time — the drape simulates each shade resting against your skin.
            </p>
            <DrapeTool photo={uploadedImage} palette={colorAnalysis.bestColors} />
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Contrast className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                CONTRAST MATRIX
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              WCAG contrast ratios between your palette colors and a skin-tone reference — find combinations that pop vs. blend.
            </p>
            <ContrastMatrix
              skinHex={bodyResult?.skinToneValue || "#C89D7C"}
              palette={colorAnalysis.bestColors}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Archive className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
                WARDROBE MATCHER
              </h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              Add the pieces already hanging in your closet — ZERVEY scores each against your season.
            </p>
            <WardrobeMatcher palette={colorAnalysis.bestColors} />
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
