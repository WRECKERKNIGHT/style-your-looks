"use client";

import { useState, useMemo } from "react";
import { generateRecommendations, getRecommendedPalette } from "@/lib/ml/outfit-recommender";
import { useAnalysisStore } from "@/store/analysis-store";
import { OCCASIONS, UNDERTONES } from "@/lib/constants";
import { Sparkles, Filter } from "lucide-react";

export default function RecommendationsPage() {
  const { faceResult, bodyResult } = useAnalysisStore();
  const [selectedUndertone, setSelectedUndertone] = useState<"Warm" | "Cool" | "Neutral">(
    faceResult?.undertone as "Warm" | "Cool" | "Neutral" || "Warm"
  );
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");

  const recommendations = useMemo(
    () => generateRecommendations(selectedUndertone, bodyResult?.bodyType || "Unknown", selectedOccasion || undefined),
    [selectedUndertone, bodyResult, selectedOccasion]
  );

  const palettes = getRecommendedPalette(selectedUndertone);

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // OUTFITS</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Sparkles className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            OUTFIT <span className="text-gradient-gold">RECS.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          AI-curated outfit picks based on your analysis results.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-amber" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider">FILTERS</h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-body text-coffee tracking-widest uppercase mb-3 block font-semibold">Undertone</label>
            <div className="flex gap-3">
              {UNDERTONES.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedUndertone(tone)}
                  className={`flex-1 py-3.5 text-base font-body font-semibold transition-all rounded-sm ${
                    selectedUndertone === tone
                      ? "bg-amber text-cream shadow-gold"
                      : "bg-parchment text-espresso hover:bg-tan/20 border border-tan"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-body text-coffee tracking-widest uppercase mb-3 block font-semibold">Occasion</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedOccasion("")}
                className={`py-3.5 text-base font-body font-semibold transition-all rounded-sm ${
                  selectedOccasion === ""
                    ? "bg-amber text-cream shadow-gold"
                    : "bg-parchment text-espresso hover:bg-tan/20 border border-tan"
                }`}
              >
                All
              </button>
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`py-3.5 text-base font-body font-semibold transition-all rounded-sm ${
                    selectedOccasion === occ.id
                      ? "bg-amber text-cream shadow-gold"
                      : "bg-parchment text-espresso hover:bg-tan/20 border border-tan"
                  }`}
                >
                  {occ.icon} {occ.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Your Color Palette */}
      <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
        <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-6">YOUR BEST COLORS</h3>
        <div className="space-y-4">
          {palettes.map((palette) => (
            <div key={palette.name} className="bg-parchment p-4 border border-tan rounded-sm">
              <span className="text-sm font-body font-bold text-espresso tracking-wider block mb-3">{palette.name}</span>
              <div className="flex gap-3">
                {palette.colors.map((color, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full aspect-square border border-tan shadow-sm rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] text-coffee font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outfit Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-cream p-8 border border-tan hover:border-amber/40 transition-colors vintage-border rounded-sm card-hover"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Mannequin Mini */}
              <div className="flex-shrink-0">
                <svg viewBox="0 0 120 300" width="120" height="300">
                  <circle cx="60" cy="25" r="17" fill="#5C3D2E" stroke="#C4A882" strokeWidth="0.5" />
                  <rect x="54" y="42" width="12" height="12" rx="2" fill="#5C3D2E" stroke="#C4A882" strokeWidth="0.5" />
                  <path
                    d="M33 54 L87 54 L84 56 L90 96 L92 144 L28 144 L30 96 L36 56 Z"
                    fill={rec.colors[0]}
                    rx="4"
                  />
                  <path d="M33 54 L18 60 L15 114 L21 115 L24 63 L36 56" fill={rec.colors[0]} />
                  <path d="M87 54 L102 60 L105 114 L99 115 L96 63 L84 56" fill={rec.colors[0]} />
                  <rect x="28" y="141" width="64" height="5" rx="1" fill="#8B7355" />
                  <path
                    d="M28 146 L31 228 L45 231 L57 156 L69 231 L83 228 L92 146 Z"
                    fill={rec.colors[1]}
                  />
                  <path d="M31 226 L28 237 L48 239 L47 231" fill={rec.colors[2]} />
                  <path d="M83 226 L86 237 L66 239 L67 231" fill={rec.colors[2]} />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-espresso tracking-wider">{rec.name}</h3>
                    <p className="text-sm text-coffee font-body mt-1">{rec.description}</p>
                  </div>
                  <span className="text-xs font-body bg-parchment text-coffee px-3 py-1.5 tracking-wider uppercase border border-tan rounded-sm">
                    {OCCASIONS.find((o) => o.id === rec.occasion)?.label || rec.occasion}
                  </span>
                </div>

                <p className="text-base text-espresso bg-parchment p-4 mb-4 font-body leading-relaxed border border-tan rounded-sm">
                  {rec.reasoning}
                </p>

                <div>
                  <h4 className="text-xs font-body text-coffee tracking-widest uppercase mb-3 font-semibold">Key Pieces</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.keyPieces.map((piece, i) => (
                      <span
                        key={i}
                        className="text-sm bg-parchment text-espresso px-3 py-1.5 font-body border border-tan rounded-sm"
                      >
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {rec.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 border border-tan rounded-sm shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
