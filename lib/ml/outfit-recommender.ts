import { COLOR_PALETTES, OCCASIONS } from "../constants";

interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  colors: string[];
  occasion: string;
  reasoning: string;
  keyPieces: string[];
  season?: string;
  styleType?: string;
}

const OUTFIT_DATABASE: OutfitRecommendation[] = [
  // ═══════════════ NIGHT OUT ═══════════════
  {
    id: "no-1",
    name: "Classic Night Out",
    description: "Sharp and sophisticated evening look",
    colors: ["#1a1a2e", "#16213e", "#c89d7c", "#ffffff"],
    occasion: "night-out",
    reasoning: "Dark tones create contrast with your skin tone. The bronze accent adds warmth and draws the eye.",
    keyPieces: ["Black slim-fit blazer", "White dress shirt", "Dark navy trousers", "Bronze accessories"],
    season: "All",
    styleType: "Classic",
  },
  {
    id: "no-2",
    name: "Velvet Luxe",
    description: "Rich textures for a statement night look",
    colors: ["#4a0e2a", "#2c1e4a", "#c89d7c", "#1a1a1a"],
    occasion: "night-out",
    reasoning: "Deep jewel tones complement your coloring. Velvet texture adds dimension in low lighting.",
    keyPieces: ["Burgundy velvet blazer", "Black turtleneck", "Black slim trousers", "Gold watch"],
    season: "Autumn",
    styleType: "Statement",
  },
  {
    id: "no-3",
    name: "Midnight Monochrome",
    description: "Sleek all-black with texture play",
    colors: ["#0c0c0c", "#1a1a1a", "#2d2d2d", "#c89d7c"],
    occasion: "night-out",
    reasoning: "All-black creates a lean silhouette. Different textures (silk, wool, leather) prevent it from falling flat.",
    keyPieces: ["Black silk shirt", "Black wool trousers", "Black leather jacket", "Silver chain"],
    season: "All",
    styleType: "Minimal",
  },
  {
    id: "no-4",
    name: "Gentleman's Evening",
    description: "Refined cocktail party elegance",
    colors: ["#1b2838", "#2c3e50", "#ecf0f1", "#b8860b"],
    occasion: "night-out",
    reasoning: "Navy base with cream and gold accents reads sophisticated without trying too hard.",
    keyPieces: ["Navy peak-lapel blazer", "Cream dress shirt", "Dark trousers", "Pocket square"],
    season: "All",
    styleType: "Classic",
  },
  // ═══════════════ FORMAL ═══════════════
  {
    id: "fw-1",
    name: "Power Formal",
    description: "Commanding presence for formal events",
    colors: ["#2c3e50", "#ecf0f1", "#c89d7c", "#1a1a1a"],
    occasion: "formal",
    reasoning: "Charcoal and white create a timeless foundation. Warm accessories prevent the look from feeling cold.",
    keyPieces: ["Charcoal three-piece suit", "White crisp shirt", "Silver tie bar", "Black oxford shoes"],
    season: "All",
    styleType: "Classic",
  },
  {
    id: "fw-2",
    name: "Modern Executive",
    description: "Contemporary formal with personality",
    colors: ["#1b2838", "#34495e", "#95a5a6", "#ecf0f1"],
    occasion: "formal",
    reasoning: "Navy with tonal layering creates depth. The muted palette lets your features be the focal point.",
    keyPieces: ["Navy slim suit", "Light blue shirt", "Patterned pocket square", "Brown brogues"],
    season: "All",
    styleType: "Modern",
  },
  {
    id: "fw-3",
    name: "Black Tie Refined",
    description: "Peak elegance for black-tie events",
    colors: ["#0a0a0a", "#1a1a1a", "#f5f5f5", "#b8860b"],
    occasion: "formal",
    reasoning: "True black-tie demands respect for tradition. The gold stud adds a subtle signature.",
    keyPieces: ["Black tuxedo", "White wing-collar shirt", "Black bow tie", "Gold cufflinks"],
    season: "All",
    styleType: "Timeless",
  },
  {
    id: "fw-4",
    name: "Summer Formal",
    description: "Light formal for warm-weather events",
    colors: ["#d5c4a1", "#f5f0e8", "#2c3e50", "#8b7355"],
    occasion: "formal",
    reasoning: "Light neutrals keep you cool while the navy anchor maintains formality.",
    keyPieces: ["Tan linen suit", "White shirt", "Navy knit tie", "Brown loafers"],
    season: "Summer",
    styleType: "Relaxed Formal",
  },
  // ═══════════════ CASUAL ═══════════════
  {
    id: "ca-1",
    name: "Effortless Weekend",
    description: "Relaxed yet put-together casual",
    colors: ["#f4efea", "#c89d7c", "#3c2a21", "#8b7d6b"],
    occasion: "casual",
    reasoning: "Neutral earth tones create a cohesive, approachable look. Comfort meets style.",
    keyPieces: ["Cream knit sweater", "Tan chinos", "White sneakers", "Brown leather belt"],
    season: "Autumn",
    styleType: "Smart Casual",
  },
  {
    id: "ca-2",
    name: "Street Casual",
    description: "Urban-inspired everyday wear",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#c89d7c"],
    occasion: "casual",
    reasoning: "Monochrome base with warm accent creates visual interest without being loud.",
    keyPieces: ["Black oversized hoodie", "Light grey joggers", "White chunky sneakers", "Bronze chain"],
    season: "All",
    styleType: "Streetwear",
  },
  {
    id: "ca-3",
    name: "Layered Casual",
    description: "Strategic layering for depth",
    colors: ["#3c2a21", "#f4efea", "#8b7d6b", "#c89d7c"],
    occasion: "casual",
    reasoning: "Layered earth tones add visual complexity. Each piece works independently too.",
    keyPieces: ["Brown overshirt", "White tee", "Tan chinos", "White leather sneakers"],
    season: "Spring",
    styleType: "Smart Casual",
  },
  {
    id: "ca-4",
    name: "Linen Ease",
    description: "Breathable summer casual",
    colors: ["#f5f0e8", "#d4a574", "#5c3d2e", "#ffffff"],
    occasion: "casual",
    reasoning: "Linen texture screams summer confidence. The earth tones keep it grounded.",
    keyPieces: ["Cream linen shirt", "Tan linen shorts", "Canvas sneakers", "Woven belt"],
    season: "Summer",
    styleType: "Relaxed",
  },
  // ═══════════════ DATE NIGHT ═══════════════
  {
    id: "dn-1",
    name: "Romantic Dinner",
    description: "Charming and approachable date look",
    colors: ["#2c3e50", "#c08e62", "#ecf0f1", "#1a1a2e"],
    occasion: "date-night",
    reasoning: "Warm earth tones create an inviting atmosphere. The contrast keeps things polished.",
    keyPieces: ["Navy casual blazer", "Cream linen shirt", "Dark chinos", "Leather loafers"],
    season: "All",
    styleType: "Smart Casual",
  },
  {
    id: "dn-2",
    name: "Refined Minimalist",
    description: "Clean and confident date outfit",
    colors: ["#1a1a1a", "#f5f5f5", "#c89d7c", "#4a4a4a"],
    occasion: "date-night",
    reasoning: "Minimal palette shows confidence. The warm accent prevents it from feeling stark.",
    keyPieces: ["Black crew-neck sweater", "White straight jeans", "Tan boots", "Simple silver chain"],
    season: "All",
    styleType: "Minimal",
  },
  {
    id: "dn-3",
    name: "Warm Evening",
    description: "Approachable warmth for intimate settings",
    colors: ["#5c3d2e", "#c4a882", "#f5f0e8", "#2c1810"],
    occasion: "date-night",
    reasoning: "Full earth-tone palette creates warmth and approachability. Soft textures invite closeness.",
    keyPieces: ["Camel crew-neck", "White oxford shirt", "Dark chinos", "Suede Chelsea boots"],
    season: "Autumn",
    styleType: "Smart Casual",
  },
  {
    id: "dn-4",
    name: "Rooftop Date",
    description: "Effortlessly cool evening look",
    colors: ["#1b2838", "#ecf0f1", "#b8860b", "#2d3436"],
    occasion: "date-night",
    reasoning: "Navy with gold accents catches sunset light beautifully. Relaxed but intentional.",
    keyPieces: ["Navy overshirt", "White tee", "Dark jeans", "Brown leather boots"],
    season: "Spring",
    styleType: "Smart Casual",
  },
  // ═══════════════ PARTY ═══════════════
  {
    id: "pa-1",
    name: "Party Ready",
    description: "Eye-catching party look with edge",
    colors: ["#0c0c0c", "#c89d7c", "#4a0e2a", "#ffffff"],
    occasion: "party",
    reasoning: "Dark base with metallic accents catches light. The pop of color adds personality.",
    keyPieces: ["Black silk shirt", "Dark jeans", "Gold chain", "Statement rings"],
    season: "All",
    styleType: "Statement",
  },
  {
    id: "pa-2",
    name: "Neon Nights",
    description: "Bold and energetic party style",
    colors: ["#0a0a0a", "#e17055", "#00b894", "#dfe6e9"],
    occasion: "party",
    reasoning: "High-contrast palette stands out in party lighting. Complementary colors create energy.",
    keyPieces: ["Black fitted tee", "Dark ripped jeans", "Colorful sneakers", "Layered bracelets"],
    season: "All",
    styleType: "Bold",
  },
  {
    id: "pa-3",
    name: "Silk & Satin",
    description: "Luxurious textures for VIP vibes",
    colors: ["#2c1810", "#b8860b", "#1a1a1a", "#c89d7c"],
    occasion: "party",
    reasoning: "Rich textures and metallics signal upscale. The dark base keeps it sophisticated.",
    keyPieces: ["Black satin shirt", "Tailored black trousers", "Gold watch", "Loafers"],
    season: "All",
    styleType: "Luxe",
  },
  {
    id: "pa-4",
    name: "Retro Disco",
    description: "Vintage-inspired party energy",
    colors: ["#2d1b69", "#e17055", "#fdcb6e", "#dfe6e9"],
    occasion: "party",
    reasoning: "Bold purple and orange create retro energy. Gold accents add disco glamour.",
    keyPieces: ["Purple wide-collar shirt", "Flared dark trousers", "Platform shoes", "Gold chain"],
    season: "All",
    styleType: "Retro",
  },
  // ═══════════════ BUSINESS ═══════════════
  {
    id: "bu-1",
    name: "Smart Business",
    description: "Professional with personality",
    colors: ["#2c3e50", "#34495e", "#ecf0f1", "#95a5a6"],
    occasion: "business",
    reasoning: "Layered blues create a trustworthy, professional impression while staying interesting.",
    keyPieces: ["Navy suit", "Light blue shirt", "Navy tie", "Brown derby shoes"],
    season: "All",
    styleType: "Classic",
  },
  {
    id: "bu-2",
    name: "Business Casual",
    description: "Approachable professional style",
    colors: ["#3c2a21", "#f4efea", "#c89d7c", "#8b7d6b"],
    occasion: "business",
    reasoning: "Earth tones create warmth in professional settings. Approachable without being casual.",
    keyPieces: ["Brown blazer", "White oxford shirt", "Khaki chinos", "Brown leather shoes"],
    season: "All",
    styleType: "Smart Casual",
  },
  {
    id: "bu-3",
    name: "Boardroom Authority",
    description: "Maximum presence for big meetings",
    colors: ["#1a1a2e", "#2c3e50", "#ecf0f1", "#b8860b"],
    occasion: "business",
    reasoning: "Deep navy signals authority. White crisp contrast commands attention. Gold tie bar seals it.",
    keyPieces: ["Charcoal suit", "White French cuff shirt", "Navy tie", "Gold cufflinks"],
    season: "All",
    styleType: "Power",
  },
  {
    id: "bu-4",
    name: "Creative Professional",
    description: "Polished but expressive for creative fields",
    colors: ["#556b2f", "#2c3e50", "#f4efea", "#8b7355"],
    occasion: "business",
    reasoning: "Olive with navy shows creative thinking while the neutral base maintains professionalism.",
    keyPieces: ["Olive blazer", "Navy turtleneck", "Tan chinos", "Brown suede shoes"],
    season: "Autumn",
    styleType: "Creative",
  },
  // ═══════════════ STREETWEAR ═══════════════
  {
    id: "sw-1",
    name: "Urban Streetwear",
    description: "Bold street style statement",
    colors: ["#1a1a1a", "#4a4a4a", "#c89d7c", "#ffffff"],
    occasion: "streetwear",
    reasoning: "Monochrome with metallic accents is the foundation of modern streetwear.",
    keyPieces: ["Oversized black tee", "Cargo pants", "Chunky sneakers", "Bucket hat"],
    season: "All",
    styleType: "Streetwear",
  },
  {
    id: "sw-2",
    name: "Layered Street",
    description: "Complex layering for depth",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#b2bec3"],
    occasion: "streetwear",
    reasoning: "Tonal greys with texture mixing creates visual complexity without color overload.",
    keyPieces: ["Grey hoodie", "Black denim jacket", "Light joggers", "High-top sneakers"],
    season: "Winter",
    styleType: "Streetwear",
  },
  {
    id: "sw-3",
    name: "Techwear Edge",
    description: "Functional futurism meets street",
    colors: ["#0a0a0a", "#1a1a1a", "#2d3436", "#636e72"],
    occasion: "streetwear",
    reasoning: "All-black tech fabrics with functional details. The silhouette does the talking.",
    keyPieces: ["Black shell jacket", "Black cargo pants", "Black boots", "Crossbody bag"],
    season: "Autumn",
    styleType: "Techwear",
  },
  {
    id: "sw-4",
    name: "Heritage Street",
    description: "Classic workwear meets modern street",
    colors: ["#5c3d2e", "#c4a882", "#2c1810", "#f5f0e8"],
    occasion: "streetwear",
    reasoning: "Earth-tone workwear pieces have natural streetwear credibility. Rugged meets refined.",
    keyPieces: ["Brown chore coat", "White tee", "Selvedge denim", "Leather boots"],
    season: "Autumn",
    styleType: "Heritage",
  },
  // ═══════════════ SUMMER ═══════════════
  {
    id: "su-1",
    name: "Summer Breeze",
    description: "Light and breezy summer style",
    colors: ["#dfe6e9", "#ffeaa7", "#c89d7c", "#2d3436"],
    occasion: "summer",
    reasoning: "Light colors reflect heat while keeping you stylish. Warm accents tie to skin tone.",
    keyPieces: ["White linen shirt", "Beige shorts", "Canvas sneakers", "Straw hat"],
    season: "Summer",
    styleType: "Relaxed",
  },
  {
    id: "su-2",
    name: "Coastal Cool",
    description: "Beach-ready sophistication",
    colors: ["#74b9ff", "#dfe6e9", "#ffffff", "#2d3436"],
    occasion: "summer",
    reasoning: "Ocean-inspired palette for summer. The blue complements warm skin tones beautifully.",
    keyPieces: ["Light blue polo", "White linen pants", "Espadrilles", "Aviator sunglasses"],
    season: "Summer",
    styleType: "Preppy",
  },
  {
    id: "su-3",
    name: "Mediterranean",
    description: "Resort-ready elegance",
    colors: ["#f5f0e8", "#2c3e50", "#c89d7c", "#556b2f"],
    occasion: "summer",
    reasoning: "Crisp white with navy and olive evokes coastal European sophistication.",
    keyPieces: ["White linen polo", "Navy shorts", "Brown leather sandals", "Woven belt"],
    season: "Summer",
    styleType: "Resort",
  },
  {
    id: "su-4",
    name: "Festival Ready",
    description: "Bold summer festival energy",
    colors: ["#e17055", "#fdcb6e", "#00b894", "#2d3436"],
    occasion: "summer",
    reasoning: "Warm sunset tones blend with nature. The dark anchor keeps it from being overwhelming.",
    keyPieces: ["Tie-dye tank", "Denim shorts", "Canvas sneakers", "Bandana"],
    season: "Summer",
    styleType: "Bohemian",
  },
  // ═══════════════ ADDITIONAL VERSATILE ═══════════════
  {
    id: "ev-1",
    name: "Autumn Layers",
    description: "Rich autumnal layering",
    colors: ["#556b2f", "#8b4513", "#f5f0e8", "#2c1810"],
    occasion: "casual",
    reasoning: "Olive and brown are autumn power colors. Layering adds depth and warmth.",
    keyPieces: ["Olive field jacket", "Brown knit sweater", "Cream chinos", "Leather boots"],
    season: "Autumn",
    styleType: "Heritage",
  },
  {
    id: "ev-2",
    name: "Winter Warmth",
    description: "Cozy winter layers with style",
    colors: ["#2c3e50", "#5c3d2e", "#c4a882", "#1a1a1a"],
    occasion: "casual",
    reasoning: "Navy and camel is a winter power combo. The camel scarf adds warmth at the face.",
    keyPieces: ["Navy peacoat", "Camel scarf", "Dark jeans", "Chelsea boots"],
    season: "Winter",
    styleType: "Classic",
  },
  {
    id: "ev-3",
    name: "Monochrome Sharp",
    description: "All-grey sophistication",
    colors: ["#636e72", "#b2bec3", "#2d3436", "#dfe6e9"],
    occasion: "business",
    reasoning: "Tonal greys create a refined, editorial look. The darkest piece anchors the outfit.",
    keyPieces: ["Charcoal overcoat", "Grey crew-neck", "Black trousers", "Black leather shoes"],
    season: "Winter",
    styleType: "Minimal",
  },
  {
    id: "ev-4",
    name: "Earth & Gold",
    description: "Warm earth tones with gold accents",
    colors: ["#5c3d2e", "#b8860b", "#f5f0e8", "#2c1810"],
    occasion: "date-night",
    reasoning: "Full warm palette with gold hardware. This is your skin tone's power combo.",
    keyPieces: ["Brown suede jacket", "Cream knit", "Dark chinos", "Gold watch"],
    season: "Autumn",
    styleType: "Smart Casual",
  },
  {
    id: "ev-5",
    name: "Navy Power",
    description: "Head-to-toe navy confidence",
    colors: ["#1b2838", "#2c3e50", "#34495e", "#ecf0f1"],
    occasion: "formal",
    reasoning: "Monochrome navy reads expensive and intentional. The cream accent prevents it from being flat.",
    keyPieces: ["Navy suit", "Navy knit tie", "White pocket square", "Brown brogues"],
    season: "All",
    styleType: "Power",
  },
  {
    id: "ev-6",
    name: "Weekend Brunch",
    description: "Effortlessly polished daytime",
    colors: ["#f5f0e8", "#c4a882", "#5c3d2e", "#ffffff"],
    occasion: "casual",
    reasoning: "Light neutrals with earth accents. Relaxed enough for brunch, polished enough for anywhere after.",
    keyPieces: ["Cream overshirt", "White tee", "Tan chinos", "White leather sneakers"],
    season: "Spring",
    styleType: "Smart Casual",
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
