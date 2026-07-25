import type { ColorAnalysisResult } from "@/store/analysis-store";

interface SkinData {
  undertone: "Warm" | "Cool" | "Neutral";
  ita: number;
  monkScaleId: number;
}

const SEASONAL_PROFILES: Record<
  string,
  {
    label: string;
    subTypes: string[];
    bestColors: string[];
    worstColors: string[];
    neutralColors: string[];
    metalPreference: string;
    patternRecommendation: string;
    description: string;
  }
> = {
  Spring: {
    label: "Spring",
    subTypes: ["Light Spring", "Warm Spring", "Bright Spring"],
    bestColors: [
      "#E8B990", "#D4A574", "#C89D7C", "#B8860B",
      "#556B2F", "#8B4513", "#CD853F", "#F5DEB3",
      "#FFD700", "#FFA07A", "#F08080", "#FF6347",
      "#2E8B57", "#6B8E23", "#DAA520", "#F4EFEA",
    ],
    worstColors: [
      "#000000", "#1a1a1a", "#2d2d2d", "#4a0e2a",
      "#1a1a2e", "#2c1810", "#3E2A1C", "#5A3E2B",
    ],
    neutralColors: ["#F5F0E8", "#E8E0D8", "#C4A882", "#8B7355", "#D4A574"],
    metalPreference: "Gold",
    patternRecommendation: "Warm-toned prints, floral patterns, warm plaids",
    description:
      "Your warm undertone and medium ITA value place you firmly in the Spring palette. You thrive in warm, clear, and moderately saturated colors. Earth tones, warm greens, and golden hues make your skin glow.",
  },
  Summer: {
    label: "Summer",
    subTypes: ["Light Summer", "Cool Summer", "Soft Summer"],
    bestColors: [
      "#B0C4DE", "#778899", "#6A5ACD", "#4682B4",
      "#5F9EA0", "#9370DB", "#8FBC8F", "#DDA0DD",
      "#BC8F8F", "#C0C0C0", "#D3D3D3", "#E6E6FA",
      "#AFEEEE", "#DB7093", "#FFE4E1", "#F5F5DC",
    ],
    worstColors: [
      "#FF4500", "#FF6347", "#D2691E", "#B8860B",
      "#8B4513", "#CD853F", "#DAA520", "#556B2F",
    ],
    neutralColors: ["#D3D3D3", "#C0C0C0", "#A9A9A9", "#B0C4DE", "#E6E6FA"],
    metalPreference: "Silver",
    patternRecommendation: "Soft watercolors, pastels, muted florals",
    description:
      "Your cool undertone and lower ITA value align with the Summer palette. You look best in soft, muted, cool-toned colors. Think dusty blues, lavenders, and rose tones that complement your cool complexion.",
  },
  Autumn: {
    label: "Autumn",
    subTypes: ["Warm Autumn", "Deep Autumn", "Soft Autumn"],
    bestColors: [
      "#8B4513", "#A0522D", "#CD853F", "#D2691E",
      "#556B2F", "#6B4423", "#8B7355", "#BC8F8F",
      "#DAA520", "#B8860B", "#D4A574", "#C89D7C",
      "#2E8B57", "#808000", "#6B8E23", "#F4EFEA",
    ],
    worstColors: [
      "#FF69B4", "#FFB6C1", "#E6E6FA", "#AFEEEE",
      "#87CEEB", "#ADD8E6", "#B0E0E6", "#40E0D0",
    ],
    neutralColors: ["#8B7355", "#6B4423", "#5C3D2E", "#D4A574", "#BC8F8F"],
    metalPreference: "Gold",
    patternRecommendation: "Earth-tone prints, animal patterns, warm geometric",
    description:
      "Your warm undertone with deeper pigmentation places you in the Autumn palette. Rich, warm, and earthy colors — burnt orange, olive, chocolate — are your power colors. They create depth and warmth in your appearance.",
  },
  Winter: {
    label: "Winter",
    subTypes: ["Bright Winter", "Cool Winter", "Deep Winter"],
    bestColors: [
      "#000000", "#1a1a2e", "#2c3e50", "#4B0082",
      "#8B0000", "#006400", "#0000CD", "#DC143C",
      "#F5F5F5", "#FFFFFF", "#C0C0C0", "#B0C4DE",
      "#4682B4", "#5F9EA0", "#6A5ACD", "#008B8B",
    ],
    worstColors: [
      "#D2B48C", "#DEB887", "#F5DEB3", "#FFE4B5",
      "#FFEBCD", "#FAEBD7", "#FFE4C4", "#FFDEAD",
    ],
    neutralColors: ["#000000", "#FFFFFF", "#C0C0C0", "#2c3e50", "#1a1a2e"],
    metalPreference: "Silver or Platinum",
    patternRecommendation: "Bold geometric, high-contrast stripes, color blocking",
    description:
      "Your cool undertone with high contrast potential places you in the Winter palette. You command attention in bold, saturated, high-contrast colors. True black and white are your foundation — most other seasons can't pull them off.",
  },
};

function classifySeason(under: "Warm" | "Cool" | "Neutral", ita: number): string {
  if (under === "Warm") {
    return ita > 35 ? "Spring" : "Autumn";
  }
  if (under === "Cool") {
    return ita > 30 ? "Summer" : "Winter";
  }
  // Neutral undertone — use ITA to break the tie
  if (ita > 45) return "Spring";
  if (ita > 30) return "Summer";
  if (ita > 15) return "Autumn";
  return "Winter";
}

function getSubType(season: string, ita: number, undertone: "Warm" | "Cool" | "Neutral"): string {
  const profile = SEASONAL_PROFILES[season];
  if (!profile) return season;

  if (season === "Spring") {
    if (ita > 50) return "Light Spring";
    if (undertone === "Neutral") return "Bright Spring";
    return "Warm Spring";
  }
  if (season === "Summer") {
    if (ita > 40) return "Light Summer";
    if (undertone === "Cool") return "Cool Summer";
    return "Soft Summer";
  }
  if (season === "Autumn") {
    if (ita > 25) return "Soft Autumn";
    if (ita < 10) return "Deep Autumn";
    return "Warm Autumn";
  }
  // Winter
  if (ita > 25) return "Bright Winter";
  if (ita < 5) return "Deep Winter";
  return "Cool Winter";
}

export function analyzeColorSeason(
  skinData: SkinData
): ColorAnalysisResult {
  const season = classifySeason(skinData.undertone, skinData.ita);
  const subType = getSubType(season, skinData.ita, skinData.undertone);
  const profile = SEASONAL_PROFILES[season];

  return {
    seasonalType: season,
    subType,
    bestColors: profile.bestColors,
    worstColors: profile.worstColors,
    neutralColors: profile.neutralColors,
    metalPreference: profile.metalPreference,
    patternRecommendation: profile.patternRecommendation,
    description: profile.description,
  };
}

export function getSeasonEmoji(season: string): string {
  switch (season) {
    case "Spring": return "🌸";
    case "Summer": return "🌊";
    case "Autumn": return "🍂";
    case "Winter": return "❄️";
    default: return "🎨";
  }
}

export function getColorHarmonyScore(
  colorHex: string,
  bestColors: string[]
): number {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgb1 = hexToRgb(colorHex);
  let minDist = Infinity;

  for (const c of bestColors) {
    const rgb2 = hexToRgb(c);
    const dist = Math.sqrt(
      (rgb1.r - rgb2.r) ** 2 +
      (rgb1.g - rgb2.g) ** 2 +
      (rgb1.b - rgb2.b) ** 2
    );
    minDist = Math.min(minDist, dist);
  }

  // Max Euclidean distance in RGB is ~441
  const score = Math.max(0, Math.min(10, 10 - (minDist / 44) * 10));
  return Math.round(score * 10) / 10;
}
