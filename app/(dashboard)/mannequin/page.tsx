"use client";

import { useState } from "react";
import { getRecommendedPalette } from "@/lib/ml/outfit-recommender";
import { COLOR_PALETTES, UNDERTONES, OCCASIONS } from "@/lib/constants";
import { useAnalysisStore } from "@/store/analysis-store";
import { Palette } from "lucide-react";

export default function MannequinPage() {
  const { bodyResult } = useAnalysisStore();
  const [selectedUndertone, setSelectedUndertone] = useState<"Warm" | "Cool" | "Neutral">(
    bodyResult?.undertone as "Warm" | "Cool" | "Neutral" || "Warm"
  );

  const palettes = getRecommendedPalette(selectedUndertone);
  const allPaletteColors = COLOR_PALETTES;

  const mannequinOutfits = [
    { name: "Shirt", colorIndex: 0 },
    { name: "Trousers", colorIndex: 1 },
    { name: "Shoes", colorIndex: 2 },
    { name: "Accessory", colorIndex: 3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // COLOR LAB</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Palette className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            COLOR <span className="text-gradient-gold">LAB.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          See how outfit colour combinations look on a neutral mannequin.
        </p>
      </div>

      {/* Undertone Selector */}
      <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
        <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-4">YOUR UNDERTONE</h3>
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

      {/* Recommended Palettes */}
      <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
        <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-6">
          RECOMMENDED PALETTES FOR {selectedUndertone.toUpperCase()} UNDERTONES
        </h3>
        <div className="space-y-5">
          {palettes.map((palette) => (
            <div key={palette.name} className="bg-parchment p-5 border border-tan rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-body font-bold text-espresso">{palette.name}</span>
              </div>
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

      {/* Mannequin Visualization */}
      <div className="bg-cream p-10 border border-tan vintage-border rounded-sm">
        <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-8">MANNEQUIN PREVIEW</h3>
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* SVG Mannequin */}
          <div className="flex-shrink-0">
            <svg
              viewBox="0 0 200 500"
              width="200"
              height="500"
              className="drop-shadow-elegant"
            >
              {/* Head */}
              <circle cx="100" cy="40" r="28" fill="#5C3D2E" stroke="#C4A882" strokeWidth="1" />

              {/* Neck */}
              <rect x="90" y="68" width="20" height="20" rx="4" fill="#5C3D2E" stroke="#C4A882" strokeWidth="0.5" />

              {/* Shirt/Torso */}
              <path
                d="M55 88 L145 88 L140 92 L148 160 L150 240 L50 240 L52 160 L60 92 Z"
                fill={palettes[0]?.colors[0] || "#B8860B"}
                stroke="#C4A882"
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
                fill={palettes[0]?.colors[0] || "#B8860B"}
                stroke="#C4A882"
                strokeWidth="0.5"
              />

              {/* Right Arm */}
              <path
                d="M145 88 L170 100 L175 190 L165 192 L160 105 L140 92"
                fill={palettes[0]?.colors[0] || "#B8860B"}
                stroke="#C4A882"
                strokeWidth="0.5"
              />

              {/* Belt */}
              <rect x="50" y="235" width="100" height="8" rx="2" fill="#8B7355" stroke="#C4A882" strokeWidth="0.5" />

              {/* Trousers */}
              <path
                d="M50 243 L55 380 L75 385 L95 260 L115 385 L140 380 L150 243 Z"
                fill={palettes[0]?.colors[1] || "#2C1810"}
                stroke="#C4A882"
                strokeWidth="0.5"
              />

              {/* Trouser crease lines */}
              <line x1="75" y1="260" x2="72" y2="380" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="125" y1="260" x2="128" y2="380" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

              {/* Left Shoe */}
              <path
                d="M55 378 L50 395 L80 398 L78 385"
                fill={palettes[0]?.colors[2] || "#B8860B"}
                stroke="#C4A882"
                strokeWidth="0.5"
              />

              {/* Right Shoe */}
              <path
                d="M140 378 L145 395 L115 398 L118 385"
                fill={palettes[0]?.colors[2] || "#B8860B"}
                stroke="#C4A882"
                strokeWidth="0.5"
              />

              {/* Watch/Accessory */}
              <circle cx="30" cy="175" r="7" fill={palettes[0]?.colors[3] || "#B8860B"} stroke="#C4A882" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Color Legend */}
          <div className="flex-1 space-y-4">
            {mannequinOutfits.map((outfit, i) => (
              <div
                key={outfit.name}
                className="flex items-center gap-4 bg-parchment p-5 border border-tan rounded-sm"
              >
                <div
                  className="w-12 h-12 border border-tan rounded-sm shadow-sm"
                  style={{
                    backgroundColor:
                      palettes[0]?.colors[outfit.colorIndex] || "#B8860B",
                  }}
                />
                <div>
                  <span className="text-base font-body font-bold text-espresso">{outfit.name}</span>
                  <p className="text-sm text-coffee font-mono mt-0.5">
                    {palettes[0]?.colors[outfit.colorIndex]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Color Palettes */}
      <div className="bg-cream p-8 border border-tan vintage-border rounded-sm">
        <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-6">EXPLORE ALL PALETTES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(allPaletteColors).map(([key, palette]) => (
            <div key={key} className="bg-parchment p-5 border border-tan rounded-sm">
              <h4 className="text-base font-body font-bold text-espresso mb-3">{palette.label}</h4>
              <div className="flex gap-2">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square border border-tan rounded-sm"
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
