import { COLOR_PALETTES, OCCASIONS } from "../constants";

interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  colors: string[];
  occasion: string;
  reasoning: string;
  keyPieces: string[];
}

const OUTFIT_DATABASE: OutfitRecommendation[] = [
  {
    id: "no-1",
    name: "Classic Night Out",
    description: "Sharp and sophisticated evening look",
    colors: ["#1a1a2e", "#16213e", "#c89d7c", "#ffffff"],
    occasion: "night-out",
    reasoning: "Dark tones create contrast with your skin tone. The bronze accent adds warmth and draws the eye.",
    keyPieces: ["Black slim-fit blazer", "White dress shirt", "Dark navy trousers", "Bronze accessories"],
  },
  {
    id: "no-2",
    name: "Velvet Luxe",
    description: "Rich textures for a statement night look",
    colors: ["#4a0e2a", "#2c1e4a", "#c89d7c", "#1a1a1a"],
    occasion: "night-out",
    reasoning: "Deep jewel tones complement your coloring. Velvet texture adds dimension in low lighting.",
    keyPieces: ["Burgundy velvet blazer", "Black turtleneck", "Black slim trousers", "Gold watch"],
  },
  {
    id: "fw-1",
    name: "Power Formal",
    description: "Commanding presence for formal events",
    colors: ["#2c3e50", "#ecf0f1", "#c89d7c", "#1a1a1a"],
    occasion: "formal",
    reasoning: "Charcoal and white create a timeless foundation. Warm accessories prevent the look from feeling cold.",
    keyPieces: ["Charcoal three-piece suit", "White crisp shirt", "Silver tie bar", "Black oxford shoes"],
  },
  {
    id: "fw-2",
    name: "Modern Executive",
    description: "Contemporary formal with personality",
    colors: ["#1b2838", "#34495e", "#95a5a6", "#ecf0f1"],
    occasion: "formal",
    reasoning: "Navy with tonal layering creates depth. The muted palette lets your features be the focal point.",
    keyPieces: ["Navy slim suit", "Light blue shirt", "Patterned pocket square", "Brown brogues"],
  },
  {
    id: "ca-1",
    name: "Effortless Weekend",
    description: "Relaxed yet put-together casual",
    colors: ["#f4efea", "#c89d7c", "#3c2a21", "#8b7d6b"],
    occasion: "casual",
    reasoning: "Neutral earth tones create a cohesive, approachable look. Comfort meets style.",
    keyPieces: ["Cream knit sweater", "Tan chinos", "White sneakers", "Brown leather belt"],
  },
  {
    id: "ca-2",
    name: "Street Casual",
    description: "Urban-inspired everyday wear",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#c89d7c"],
    occasion: "casual",
    reasoning: "Monochrome base with warm accent creates visual interest without being loud.",
    keyPieces: ["Black oversized hoodie", "Light grey joggers", "White chunky sneakers", "Bronze chain"],
  },
  {
    id: "dn-1",
    name: "Romantic Dinner",
    description: "Charming and approachable date look",
    colors: ["#2c3e50", "#c08e62", "#ecf0f1", "#1a1a2e"],
    occasion: "date-night",
    reasoning: "Warm earth tones create an inviting atmosphere. The contrast keeps things polished.",
    keyPieces: ["Navy casual blazer", "Cream linen shirt", "Dark chinos", "Leather loafers"],
  },
  {
    id: "dn-2",
    name: "Refined Minimalist",
    description: "Clean and confident date outfit",
    colors: ["#1a1a1a", "#f5f5f5", "#c89d7c", "#4a4a4a"],
    occasion: "date-night",
    reasoning: "Minimal palette shows confidence. The warm accent prevents it from feeling stark.",
    keyPieces: ["Black crew-neck sweater", "White straight jeans", "Tan boots", "Simple silver chain"],
  },
  {
    id: "pa-1",
    name: "Party Ready",
    description: "Eye-catching party look with edge",
    colors: ["#0c0c0c", "#c89d7c", "#4a0e2a", "#ffffff"],
    occasion: "party",
    reasoning: "Dark base with metallic accents catches light. The pop of color adds personality.",
    keyPieces: ["Black silk shirt", "Dark jeans", "Gold chain", "Statement rings"],
  },
  {
    id: "pa-2",
    name: "Neon Nights",
    description: "Bold and energetic party style",
    colors: ["#0a0a0a", "#e17055", "#00b894", "#dfe6e9"],
    occasion: "party",
    reasoning: "High-contrast palette stands out in party lighting. Complementary colors create energy.",
    keyPieces: ["Black fitted tee", "Dark ripped jeans", "Colorful sneakers", "Layered bracelets"],
  },
  {
    id: "bu-1",
    name: "Smart Business",
    description: "Professional with personality",
    colors: ["#2c3e50", "#34495e", "#ecf0f1", "#95a5a6"],
    occasion: "business",
    reasoning: "Layered blues create a trustworthy, professional impression while staying interesting.",
    keyPieces: ["Navy suit", "Light blue shirt", "Navy tie", "Brown derby shoes"],
  },
  {
    id: "bu-2",
    name: "Business Casual",
    description: "Approachable professional style",
    colors: ["#3c2a21", "#f4efea", "#c89d7c", "#8b7d6b"],
    occasion: "business",
    reasoning: "Earth tones create warmth in professional settings. Approachable without being casual.",
    keyPieces: ["Brown blazer", "White oxford shirt", "Khaki chinos", "Brown leather shoes"],
  },
  {
    id: "sw-1",
    name: "Urban Streetwear",
    description: "Bold street style statement",
    colors: ["#1a1a1a", "#4a4a4a", "#c89d7c", "#ffffff"],
    occasion: "streetwear",
    reasoning: "Monochrome with metallic accents is the foundation of modern streetwear.",
    keyPieces: ["Oversized black tee", "Cargo pants", "Chunky sneakers", "Bucket hat"],
  },
  {
    id: "sw-2",
    name: "Layered Street",
    description: "Complex layering for depth",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#b2bec3"],
    occasion: "streetwear",
    reasoning: "Tonal greys with texture mixing creates visual complexity without color overload.",
    keyPieces: ["Grey hoodie", "Black denim jacket", "Light joggers", "High-top sneakers"],
  },
  {
    id: "su-1",
    name: "Summer Breeze",
    description: "Light and breezy summer style",
    colors: ["#dfe6e9", "#ffeaa7", "#c89d7c", "#2d3436"],
    occasion: "summer",
    reasoning: "Light colors reflect heat while keeping you stylish. Warm accents tie to skin tone.",
    keyPieces: ["White linen shirt", "Beige shorts", "Canvas sneakers", "Straw hat"],
  },
  {
    id: "su-2",
    name: "Coastal Cool",
    description: "Beach-ready sophistication",
    colors: ["#74b9ff", "#dfe6e9", "#ffffff", "#2d3436"],
    occasion: "summer",
    reasoning: "Ocean-inspired palette for summer. The blue complements warm skin tones beautifully.",
    keyPieces: ["Light blue polo", "White linen pants", "Espadrilles", "Aviator sunglasses"],
  },
];

function getWarmColorRecommendations(skinToneHex: string): string[] {
  return [
    "#8B4513", "#CD853F", "#DAA520", "#B8860B",
    "#D2691E", "#A0522D", "#D4A574", "#C89D7C",
    "#1a1a2e", "#2c3e50", "#34495e", "#2d3436",
  ];
}

function getCoolColorRecommendations(skinToneHex: string): string[] {
  return [
    "#4682B4", "#5F9EA0", "#6A5ACD", "#7B68EE",
    "#9370DB", "#20B2AA", "#48D1CC", "#006400",
    "#1a1a2e", "#2c3e50", "#0c0c0c", "#1a1a1a",
  ];
}

function getNeutralColorRecommendations(skinToneHex: string): string[] {
  return [
    "#8B8682", "#A9A9A9", "#696969", "#778899",
    "#B0C4DE", "#D3D3D3", "#C0C0C0", "#DCDCDC",
    "#2c3e50", "#1a1a2e", "#f4efea", "#3c2a21",
  ];
}

export function generateRecommendations(
  undertone: "Warm" | "Cool" | "Neutral",
  bodyType: string,
  occasion?: string
): OutfitRecommendation[] {
  let pool = [...OUTFIT_DATABASE];

  if (occasion) {
    pool = pool.filter((o) => o.occasion === occasion);
  }

  const colorFn =
    undertone === "Warm"
      ? getWarmColorRecommendations
      : undertone === "Cool"
      ? getCoolColorRecommendations
      : getNeutralColorRecommendations;

  const recommendedColors = colorFn("#c89d7c");

  return pool.map((outfit) => ({
    ...outfit,
    reasoning: `${outfit.reasoning} The ${undertone.toLowerCase()} palette enhances your natural coloring.`,
  }));
}

export function getRecommendedPalette(
  undertone: "Warm" | "Cool" | "Neutral"
): { name: string; colors: string[] }[] {
  if (undertone === "Warm") {
    return [
      { name: "Earth Essentials", colors: ["#8B4513", "#CD853F", "#DAA520", "#A0522D", "#F4EFEA"] },
      { name: "Sunset Glow", colors: ["#D2691E", "#B8860B", "#C89D7C", "#3C2A21", "#FDFBF7"] },
      { name: "Rich Amber", colors: ["#D4A574", "#8B7355", "#2B1E16", "#C08E62", "#F4EFEA"] },
    ];
  }
  if (undertone === "Cool") {
    return [
      { name: "Ocean Depth", colors: ["#4682B4", "#5F9EA0", "#2C3E50", "#1A1A2E", "#ECF0F1"] },
      { name: "Royal Jewel", colors: ["#6A5ACD", "#7B68EE", "#4B0082", "#006400", "#F5F5F5"] },
      { name: "Mint Frost", colors: ["#20B2AA", "#48D1CC", "#9370DB", "#2D3436", "#DFE6E9"] },
    ];
  }
  return [
    { name: "Classic Neutrals", colors: ["#8B8682", "#696969", "#2C3E50", "#ECF0F1", "#1A1A1A"] },
    { name: "Soft Modern", colors: ["#B0C4DE", "#D3D3D3", "#34495E", "#95A5A6", "#F5F5F5"] },
    { name: "Refined Grey", colors: ["#778899", "#C0C0C0", "#1B2838", "#DCDCDC", "#2B1E16"] },
  ];
}
