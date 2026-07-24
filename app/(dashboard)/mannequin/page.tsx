"use client";

import { useState } from "react";
import { getRecommendedPalette } from "@/lib/ml/outfit-recommender";
import { COLOR_PALETTES, UNDERTONES, OCCASIONS } from "@/lib/constants";
import { useAnalysisStore } from "@/store/analysis-store";
import { Palette, Check } from "lucide-react";

export default function MannequinPage() {
  const { bodyResult } = useAnalysisStore();
  const [selectedUndertone, setSelectedUndertone] = useState<"Warm" | "Cool" | "Neutral">(
    bodyResult?.undertone as "Warm" | "Cool" | "Neutral" || "Warm"
  );
  const [selectedOccasion, setSelectedOccasion] = useState<string>("night-out");

  const palettes = getRecommendedPalette(selectedUndertone);
  const allPaletteColors = COLOR_PALETTES;

  const mannequinOutfits = [
    { name: "Shirt", colorIndex: 0 },
    { name: "Trousers", colorIndex: 1 },
    { name: "Shoes", colorIndex: 2 },
    { name: "Accessory", colorIndex: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Palette className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">Color Studio</h1>
        </div>
        <p className="text-[#8B7D6B]">
          See how outfit color combinations look on a neutral mannequin.
        </p>
      </div>

      {/* Undertone Selector */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <h3 className="font-medium text-[#3C2A21] mb-3">Your Undertone</h3>
        <div className="flex gap-2">
          {UNDERTONES.map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedUndertone(tone)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedUndertone === tone
                  ? "bg-[#3C2A21] text-white"
                  : "bg-[#F4EFEA] text-[#3C2A21] hover:bg-[#EDE5DC]"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Palettes */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <h3 className="font-medium text-[#3C2A21] mb-4">
          Recommended Palettes for {selectedUndertone} Undertones
        </h3>
        <div className="space-y-4">
          {palettes.map((palette) => (
            <div key={palette.name} className="bg-[#FDFBF7] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#3C2A21]">{palette.name}</span>
              </div>
              <div className="flex gap-2">
                {palette.colors.map((color, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full aspect-square rounded-xl border border-[#E8E0D8] shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-[#8B7D6B] font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mannequin Visualization */}
      <div className="bg-white rounded-2xl p-8 border border-[#E8E0D8]">
        <h3 className="font-medium text-[#3C2A21] mb-6">Mannequin Preview</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* SVG Mannequin */}
          <div className="flex-shrink-0">
            <svg
              viewBox="0 0 200 500"
              width="180"
              height="450"
              className="drop-shadow-md"
            >
              {/* Head */}
              <circle cx="100" cy="40" r="28" fill="#E8E0D8" stroke="#D0C8C0" strokeWidth="1" />

              {/* Neck */}
              <rect x="90" y="68" width="20" height="20" rx="4" fill="#E8E0D8" stroke="#D0C8C0" strokeWidth="1" />

              {/* Shirt/Torso */}
              <path
                d="M55 88 L145 88 L140 92 L148 160 L150 240 L50 240 L52 160 L60 92 Z"
                fill={palettes[0]?.colors[0] || "#C89D7C"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
                rx="4"
              />

              {/* Shirt collar detail */}
              <path
                d="M85 88 L100 110 L115 88"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />

              {/* Left Arm */}
              <path
                d="M55 88 L30 100 L25 190 L35 192 L40 105 L60 92"
                fill={palettes[0]?.colors[0] || "#C89D7C"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
              />

              {/* Right Arm */}
              <path
                d="M145 88 L170 100 L175 190 L165 192 L160 105 L140 92"
                fill={palettes[0]?.colors[0] || "#C89D7C"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
              />

              {/* Belt */}
              <rect x="50" y="235" width="100" height="8" rx="2" fill="#8B7D6B" stroke="#7A6C5A" strokeWidth="0.5" />

              {/* Trousers */}
              <path
                d="M50 243 L55 380 L75 385 L95 260 L115 385 L140 380 L150 243 Z"
                fill={palettes[0]?.colors[1] || "#1A1A2E"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
              />

              {/* Trouser crease lines */}
              <line x1="75" y1="260" x2="72" y2="380" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="125" y1="260" x2="128" y2="380" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

              {/* Left Shoe */}
              <path
                d="M55 378 L50 395 L80 398 L78 385"
                fill={palettes[0]?.colors[2] || "#3C2A21"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
              />

              {/* Right Shoe */}
              <path
                d="M140 378 L145 395 L115 398 L118 385"
                fill={palettes[0]?.colors[2] || "#3C2A21"}
                stroke="#D0C8C0"
                strokeWidth="0.5"
              />

              {/* Watch/Accessory */}
              <circle cx="30" cy="175" r="6" fill={palettes[0]?.colors[3] || "#DAA520"} stroke="#B8860B" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Color Legend */}
          <div className="flex-1 space-y-3">
            {mannequinOutfits.map((outfit, i) => (
              <div
                key={outfit.name}
                className="flex items-center gap-3 bg-[#FDFBF7] rounded-xl p-4"
              >
                <div
                  className="w-10 h-10 rounded-lg border border-[#E8E0D8]"
                  style={{
                    backgroundColor:
                      palettes[0]?.colors[outfit.colorIndex] || "#C89D7C",
                  }}
                />
                <div>
                  <span className="text-sm font-medium text-[#3C2A21]">{outfit.name}</span>
                  <p className="text-xs text-[#8B7D6B]">
                    {palettes[0]?.colors[outfit.colorIndex]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Color Palettes */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8E0D8]">
        <h3 className="font-medium text-[#3C2A21] mb-4">Explore All Palettes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(allPaletteColors).map(([key, palette]) => (
            <div key={key} className="bg-[#FDFBF7] rounded-xl p-4">
              <h4 className="text-sm font-medium text-[#3C2A21] mb-2">{palette.label}</h4>
              <div className="flex gap-1.5">
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
    </div>
  );
}
