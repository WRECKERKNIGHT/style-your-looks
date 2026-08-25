import type { GarmentOptions, GarmentKind, FabricPattern } from "./garments";

export interface OutfitPreset {
  id: string;
  name: string;
  description: string;
  occasion: string;
  /** How to pick colors: "best" uses colorAnalysis.bestColors, "neutral" uses neutrals, "custom" uses the fixed colors. */
  colorSource: "best" | "neutral" | "custom";
  top: GarmentOptions;
  bottom: GarmentOptions;
  outerwear?: GarmentOptions;
  /** Fixed colors only used when colorSource === "custom". */
  customColors?: { top: string; bottom: string; outerwear?: string };
  glasses?: { style: string; frameColor: string };
  hairStyle?: string;
  beardStyle?: string;
}

/**
 * Curated one-click outfit presets. Colors are intentionally neutral/warm
 * so they look good on most skin tones. When the user has a color analysis,
 * `applyPreset` substitutes their `bestColors` automatically.
 */
export const OUTFIT_PRESETS: OutfitPreset[] = [
  {
    id: "casual-classic",
    name: "Casual Classic",
    description: "Clean white tee + dark jeans — timeless simplicity.",
    occasion: "Everyday",
    colorSource: "neutral",
    top: { kind: "tshirt", color: "#F2F0EB", pattern: "solid", fit: 0.008 },
    bottom: { kind: "jeans", color: "#2C3E5A", pattern: "denim", fit: 0.006 },
  },
  {
    id: "smart-casual",
    name: "Smart Casual",
    description: "Polo shirt + chinos — effortlessly polished.",
    occasion: "Brunch / Date",
    colorSource: "best",
    top: { kind: "polo", color: "#5B7B8A", pattern: "solid", fit: 0.007 },
    bottom: { kind: "pants", color: "#C4B49A", pattern: "solid", fit: 0.008 },
  },
  {
    id: "street-layered",
    name: "Street Layered",
    description: "Hoodie under a bomber — urban edge.",
    occasion: "Weekend / City",
    colorSource: "best",
    top: { kind: "hoodie", color: "#4A4A4A", pattern: "solid", fit: 0.012 },
    bottom: { kind: "joggers", color: "#3B3B3B", pattern: "solid", fit: 0.01 },
    outerwear: { kind: "bomber", color: "#2D5A3D", pattern: "solid", fit: 0.014 },
  },
  {
    id: "office-sharp",
    name: "Office Sharp",
    description: "Blazer + tailored pants — boardroom ready.",
    occasion: "Work / Formal",
    colorSource: "custom",
    customColors: { top: "#F8F6F2", bottom: "#2C2C2C", outerwear: "#1A1A2E" },
    top: { kind: "longsleeve", color: "#F8F6F2", pattern: "solid", fit: 0.006 },
    bottom: { kind: "pants", color: "#2C2C2C", pattern: "solid", fit: 0.005 },
    outerwear: { kind: "blazer", color: "#1A1A2E", pattern: "solid", fit: 0.008 },
  },
  {
    id: "summer-light",
    name: "Summer Light",
    description: "Tank + shorts — beat the heat in style.",
    occasion: "Beach / Vacation",
    colorSource: "best",
    top: { kind: "tank", color: "#E8DDD3", pattern: "solid", fit: 0.005 },
    bottom: { kind: "shorts", color: "#8B7355", pattern: "solid", fit: 0.007 },
  },
  {
    id: "winter-ready",
    name: "Winter Ready",
    description: "Turtleneck under overcoat — cold-weather sophistication.",
    occasion: "Winter / Evening",
    colorSource: "custom",
    customColors: { top: "#2C2C2C", bottom: "#1A1A1A", outerwear: "#5C4033" },
    top: { kind: "turtleneck", color: "#2C2C2C", pattern: "solid", fit: 0.006 },
    bottom: { kind: "pants", color: "#1A1A1A", pattern: "solid", fit: 0.006 },
    outerwear: { kind: "overcoat", color: "#5C4033", pattern: "solid", fit: 0.016 },
  },
  {
    id: "rugged-outdoor",
    name: "Rugged Outdoor",
    description: "Flannel + cargo — ready for anything.",
    occasion: "Outdoor / Travel",
    colorSource: "best",
    top: { kind: "flannel", color: "#8B4513", pattern: "check", fit: 0.01 },
    bottom: { kind: "cargo", color: "#556B2F", pattern: "solid", fit: 0.012 },
  },
  {
    id: "minimalist-clean",
    name: "Minimalist Clean",
    description: "Long sleeve + slim pants — less is more.",
    occasion: "Gallery / Studio",
    colorSource: "neutral",
    top: { kind: "longsleeve", color: "#E8E4DF", pattern: "solid", fit: 0.006 },
    bottom: { kind: "pants", color: "#3C3C3C", pattern: "solid", fit: 0.005 },
  },
  {
    id: "athleisure",
    name: "Athleisure",
    description: "Henley + sweatpants — comfort meets style.",
    occasion: "Gym / Coffee Run",
    colorSource: "best",
    top: { kind: "henley", color: "#6B7B8D", pattern: "heather", fit: 0.008 },
    bottom: { kind: "sweatpants", color: "#4A4A4A", pattern: "solid", fit: 0.012 },
  },
  {
    id: "evening-elegant",
    name: "Evening Elegant",
    description: "Puffer over turtleneck — modern evening wear.",
    occasion: "Dinner / Event",
    colorSource: "custom",
    customColors: { top: "#1A1A1A", bottom: "#1A1A1A", outerwear: "#2C2C2C" },
    top: { kind: "turtleneck", color: "#1A1A1A", pattern: "solid", fit: 0.005 },
    bottom: { kind: "pants", color: "#1A1A1A", pattern: "solid", fit: 0.005 },
    outerwear: { kind: "puffer", color: "#2C2C2C", pattern: "quilt", fit: 0.018 },
  },
];

/**
 * Apply a preset, substituting the user's best colors if the preset uses
 * colorSource "best". Falls back to the preset's default color if the user
 * has no color analysis.
 */
export function applyPreset(
  preset: OutfitPreset,
  bestColors?: string[],
  neutralColors?: string[]
): { top: GarmentOptions; bottom: GarmentOptions; outerwear?: GarmentOptions } {
  const pickColor = (index: number, fallback: string): string => {
    if (preset.colorSource === "custom" && preset.customColors) {
      return index === 0 ? preset.customColors.top : index === 1 ? preset.customColors.bottom : preset.customColors.outerwear ?? fallback;
    }
    const palette = preset.colorSource === "best" ? bestColors : neutralColors;
    if (palette && palette.length > 0) {
      return palette[index % palette.length];
    }
    return fallback;
  };

  return {
    top: { ...preset.top, color: pickColor(0, preset.top.color) },
    bottom: { ...preset.bottom, color: pickColor(1, preset.bottom.color) },
    outerwear: preset.outerwear
      ? { ...preset.outerwear, color: pickColor(2, preset.outerwear.color) }
      : undefined,
  };
}
