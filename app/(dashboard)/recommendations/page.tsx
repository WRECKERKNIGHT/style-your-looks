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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">Outfit Recommendations</h1>
        </div>
        <p className="text-[#8B7D6B]">
          AI-curated outfit picks based on your analysis results.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#8B7D6B]" />
          <h3 className="font-medium text-[#3C2A21]">Filters</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#8B7D6B] mb-2 block">Undertone</label>
            <div className="flex gap-2">
              {UNDERTONES.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedUndertone(tone)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedUndertone === tone
                      ? "bg-[#3C2A21] text-white"
                      : "bg-[#F4EFEA] text-[#3C2A21]"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-[#8B7D6B] mb-2 block">Occasion</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedOccasion("")}
                className={`py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedOccasion === ""
                    ? "bg-[#3C2A21] text-white"
                    : "bg-[#F4EFEA] text-[#3C2A21]"
                }`}
              >
                All
              </button>
              {OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccasion(occ.id)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedOccasion === occ.id
                      ? "bg-[#3C2A21] text-white"
                      : "bg-[#F4EFEA] text-[#3C2A21]"
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
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <h3 className="font-medium text-[#3C2A21] mb-4">Your Best Colors</h3>
        <div className="space-y-3">
          {palettes.map((palette) => (
            <div key={palette.name} className="flex items-center gap-3">
              <span className="text-sm text-[#8B7D6B] w-28 flex-shrink-0">{palette.name}</span>
              <div className="flex gap-1.5 flex-1">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square rounded-lg border border-[#E8E0D8]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outfit Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl p-6 border border-[#E8E0D8] hover:border-[#C89D7C]/50 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Mannequin Mini */}
              <div className="flex-shrink-0">
                <svg viewBox="0 0 120 300" width="100" height="250">
                  <circle cx="60" cy="25" r="17" fill="#E8E0D8" />
                  <rect x="54" y="42" width="12" height="12" rx="2" fill="#E8E0D8" />
                  <path
                    d="M33 54 L87 54 L84 56 L90 96 L92 144 L28 144 L30 96 L36 56 Z"
                    fill={rec.colors[0]}
                    rx="4"
                  />
                  <path d="M33 54 L18 60 L15 114 L21 115 L24 63 L36 56" fill={rec.colors[0]} />
                  <path d="M87 54 L102 60 L105 114 L99 115 L96 63 L84 56" fill={rec.colors[0]} />
                  <rect x="28" y="141" width="64" height="5" rx="1" fill="#8B7D6B" />
                  <path
                    d="M28 146 L31 228 L45 231 L57 156 L69 231 L83 228 L92 146 Z"
                    fill={rec.colors[1]}
                  />
                  <path d="M31 226 L28 237 L48 239 L47 231" fill={rec.colors[2]} />
                  <path d="M83 226 L86 237 L66 239 L67 231" fill={rec.colors[2]} />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-[#3C2A21]">{rec.name}</h3>
                    <p className="text-sm text-[#8B7D6B]">{rec.description}</p>
                  </div>
                  <span className="text-xs bg-[#F4EFEA] text-[#8B7D6B] px-2.5 py-1 rounded-full">
                    {OCCASIONS.find((o) => o.id === rec.occasion)?.label || rec.occasion}
                  </span>
                </div>

                <p className="text-sm text-[#3C2A21] bg-[#FDFBF7] rounded-xl p-3 mb-3">
                  {rec.reasoning}
                </p>

                <div>
                  <h4 className="text-xs font-medium text-[#8B7D6B] mb-2">Key Pieces</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.keyPieces.map((piece, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#F4EFEA] text-[#3C2A21] px-2.5 py-1 rounded-full"
                      >
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5 mt-3">
                  {rec.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg border border-[#E8E0D8]"
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
