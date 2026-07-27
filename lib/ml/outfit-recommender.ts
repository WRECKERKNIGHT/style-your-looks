import { COLOR_PALETTES, OCCASIONS } from "../constants";

export interface OutfitRecommendation {
  id: string;
  name: string;
  description: string;
  colors: string[];
  occasion: string;
  reasoning: string;
  keyPieces: string[];
  season?: string;
  styleType?: string;
  bodyTypeMatch?: string[];
  faceShapeMatch?: string[];
  formalityLevel?: number;
  confidence?: number;
}

const OUTFIT_DATABASE: OutfitRecommendation[] = [
  // ═══════════════ NIGHT OUT ═══════════════
  {
    id: "no-1", name: "Classic Night Out", description: "Sharp and sophisticated evening look",
    colors: ["#1a1a2e", "#16213e", "#c89d7c", "#ffffff"],
    occasion: "night-out",
    reasoning: "Dark tones create contrast with your skin tone. The bronze accent adds warmth.",
    keyPieces: ["Black slim-fit blazer", "White dress shirt", "Dark navy trousers", "Bronze accessories"],
    season: "All", styleType: "Classic",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Heart"],
    formalityLevel: 7, confidence: 85,
  },
  {
    id: "no-2", name: "Velvet Luxe", description: "Rich textures for a statement night look",
    colors: ["#4a0e2a", "#2c1e4a", "#c89d7c", "#1a1a1a"],
    occasion: "night-out",
    reasoning: "Deep jewel tones complement your coloring. Velvet texture adds dimension in low lighting.",
    keyPieces: ["Burgundy velvet blazer", "Black turtleneck", "Black slim trousers", "Gold watch"],
    season: "Autumn", styleType: "Statement",
    bodyTypeMatch: ["Rectangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Heart", "Diamond"],
    formalityLevel: 8, confidence: 80,
  },
  {
    id: "no-3", name: "Midnight Monochrome", description: "Sleek all-black with texture play",
    colors: ["#0c0c0c", "#1a1a1a", "#2d2d2d", "#c89d7c"],
    occasion: "night-out",
    reasoning: "All-black creates a lean silhouette. Different textures prevent it from falling flat.",
    keyPieces: ["Black silk shirt", "Black wool trousers", "Black leather jacket", "Silver chain"],
    season: "All", styleType: "Minimal",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Oval"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 6, confidence: 90,
  },
  {
    id: "no-4", name: "Gentleman's Evening", description: "Refined cocktail party elegance",
    colors: ["#1b2838", "#2c3e50", "#ecf0f1", "#b8860b"],
    occasion: "night-out",
    reasoning: "Navy base with cream and gold accents reads sophisticated without trying too hard.",
    keyPieces: ["Navy peak-lapel blazer", "Cream dress shirt", "Dark trousers", "Pocket square"],
    season: "All", styleType: "Classic",
    bodyTypeMatch: ["Inverted Triangle", "Hourglass", "Rectangle"],
    faceShapeMatch: ["Oval", "Square", "Round"],
    formalityLevel: 8, confidence: 88,
  },
  // ═══════════════ FORMAL ═══════════════
  {
    id: "fw-1", name: "Power Formal", description: "Commanding presence for formal events",
    colors: ["#2c3e50", "#ecf0f1", "#c89d7c", "#1a1a1a"],
    occasion: "formal",
    reasoning: "Charcoal and white create a timeless foundation. Warm accessories prevent coldness.",
    keyPieces: ["Charcoal three-piece suit", "White crisp shirt", "Silver tie bar", "Black oxford shoes"],
    season: "All", styleType: "Classic",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Heart"],
    formalityLevel: 10, confidence: 92,
  },
  {
    id: "fw-2", name: "Modern Executive", description: "Contemporary formal with personality",
    colors: ["#1b2838", "#34495e", "#95a5a6", "#ecf0f1"],
    occasion: "formal",
    reasoning: "Navy with tonal layering creates depth. The muted palette lets your features shine.",
    keyPieces: ["Navy slim suit", "Light blue shirt", "Patterned pocket square", "Brown brogues"],
    season: "All", styleType: "Modern",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Oblong", "Square"],
    formalityLevel: 9, confidence: 90,
  },
  {
    id: "fw-3", name: "Black Tie Refined", description: "Peak elegance for black-tie events",
    colors: ["#0a0a0a", "#1a1a1a", "#f5f5f5", "#b8860b"],
    occasion: "formal",
    reasoning: "True black-tie demands respect for tradition. The gold stud adds a subtle signature.",
    keyPieces: ["Black tuxedo", "White wing-collar shirt", "Black bow tie", "Gold cufflinks"],
    season: "All", styleType: "Timeless",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass", "Oval"],
    faceShapeMatch: ["Oval", "Square", "Heart", "Diamond"],
    formalityLevel: 10, confidence: 95,
  },
  {
    id: "fw-4", name: "Summer Formal", description: "Light formal for warm-weather events",
    colors: ["#d5c4a1", "#f5f0e8", "#2c3e50", "#8b7355"],
    occasion: "formal",
    reasoning: "Light neutrals keep you cool while the navy anchor maintains formality.",
    keyPieces: ["Tan linen suit", "White shirt", "Navy knit tie", "Brown loafers"],
    season: "Summer", styleType: "Relaxed Formal",
    bodyTypeMatch: ["Rectangle", "Oval"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 8, confidence: 82,
  },
  // ═══════════════ CASUAL ═══════════════
  {
    id: "ca-1", name: "Effortless Weekend", description: "Relaxed yet put-together casual",
    colors: ["#f4efea", "#c89d7c", "#3c2a21", "#8b7d6b"],
    occasion: "casual",
    reasoning: "Neutral earth tones create a cohesive, approachable look.",
    keyPieces: ["Cream knit sweater", "Tan chinos", "White sneakers", "Brown leather belt"],
    season: "Autumn", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Hourglass", "Oval"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 3, confidence: 88,
  },
  {
    id: "ca-2", name: "Street Casual", description: "Urban-inspired everyday wear",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#c89d7c"],
    occasion: "casual",
    reasoning: "Monochrome base with warm accent creates visual interest without being loud.",
    keyPieces: ["Black oversized hoodie", "Light grey joggers", "White chunky sneakers", "Bronze chain"],
    season: "All", styleType: "Streetwear",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Oval"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 2, confidence: 85,
  },
  {
    id: "ca-3", name: "Layered Casual", description: "Strategic layering for depth",
    colors: ["#3c2a21", "#f4efea", "#8b7d6b", "#c89d7c"],
    occasion: "casual",
    reasoning: "Layered earth tones add visual complexity. Each piece works independently too.",
    keyPieces: ["Brown overshirt", "White tee", "Tan chinos", "White leather sneakers"],
    season: "Spring", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Round", "Diamond"],
    formalityLevel: 3, confidence: 86,
  },
  {
    id: "ca-4", name: "Linen Ease", description: "Breathable summer casual",
    colors: ["#f5f0e8", "#d4a574", "#5c3d2e", "#ffffff"],
    occasion: "casual",
    reasoning: "Linen texture screams summer confidence. The earth tones keep it grounded.",
    keyPieces: ["Cream linen shirt", "Tan linen shorts", "Canvas sneakers", "Woven belt"],
    season: "Summer", styleType: "Relaxed",
    bodyTypeMatch: ["Rectangle", "Oval", "Hourglass"],
    faceShapeMatch: ["Oval", "Heart", "Round"],
    formalityLevel: 2, confidence: 84,
  },
  // ═══════════════ DATE NIGHT ═══════════════
  {
    id: "dn-1", name: "Romantic Dinner", description: "Charming and approachable date look",
    colors: ["#2c3e50", "#c08e62", "#ecf0f1", "#1a1a2e"],
    occasion: "date-night",
    reasoning: "Warm earth tones create an inviting atmosphere. The contrast keeps things polished.",
    keyPieces: ["Navy casual blazer", "Cream linen shirt", "Dark chinos", "Leather loafers"],
    season: "All", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Heart"],
    formalityLevel: 5, confidence: 90,
  },
  {
    id: "dn-2", name: "Refined Minimalist", description: "Clean and confident date outfit",
    colors: ["#1a1a1a", "#f5f5f5", "#c89d7c", "#4a4a4a"],
    occasion: "date-night",
    reasoning: "Minimal palette shows confidence. The warm accent prevents it from feeling stark.",
    keyPieces: ["Black crew-neck sweater", "White straight jeans", "Tan boots", "Simple silver chain"],
    season: "All", styleType: "Minimal",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Oval"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 4, confidence: 87,
  },
  {
    id: "dn-3", name: "Warm Evening", description: "Approachable warmth for intimate settings",
    colors: ["#5c3d2e", "#c4a882", "#f5f0e8", "#2c1810"],
    occasion: "date-night",
    reasoning: "Full earth-tone palette creates warmth and approachability.",
    keyPieces: ["Camel crew-neck", "White oxford shirt", "Dark chinos", "Suede Chelsea boots"],
    season: "Autumn", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Hourglass", "Oval"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 4, confidence: 88,
  },
  {
    id: "dn-4", name: "Rooftop Date", description: "Effortlessly cool evening look",
    colors: ["#1b2838", "#ecf0f1", "#b8860b", "#2d3436"],
    occasion: "date-night",
    reasoning: "Navy with gold accents catches sunset light beautifully.",
    keyPieces: ["Navy overshirt", "White tee", "Dark jeans", "Brown leather boots"],
    season: "Spring", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Square", "Diamond"],
    formalityLevel: 4, confidence: 85,
  },
  // ═══════════════ PARTY ═══════════════
  {
    id: "pa-1", name: "Party Ready", description: "Eye-catching party look with edge",
    colors: ["#0c0c0c", "#c89d7c", "#4a0e2a", "#ffffff"],
    occasion: "party",
    reasoning: "Dark base with metallic accents catches light. The pop of color adds personality.",
    keyPieces: ["Black silk shirt", "Dark jeans", "Gold chain", "Statement rings"],
    season: "All", styleType: "Statement",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Diamond"],
    formalityLevel: 4, confidence: 82,
  },
  {
    id: "pa-2", name: "Neon Nights", description: "Bold and energetic party style",
    colors: ["#0a0a0a", "#e17055", "#00b894", "#dfe6e9"],
    occasion: "party",
    reasoning: "High-contrast palette stands out in party lighting.",
    keyPieces: ["Black fitted tee", "Dark ripped jeans", "Colorful sneakers", "Layered bracelets"],
    season: "All", styleType: "Bold",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Oval"],
    faceShapeMatch: ["Oval", "Round", "Oblong"],
    formalityLevel: 1, confidence: 78,
  },
  {
    id: "pa-3", name: "Silk & Satin", description: "Luxurious textures for VIP vibes",
    colors: ["#2c1810", "#b8860b", "#1a1a1a", "#c89d7c"],
    occasion: "party",
    reasoning: "Rich textures and metallics signal upscale.",
    keyPieces: ["Black satin shirt", "Tailored black trousers", "Gold watch", "Loafers"],
    season: "All", styleType: "Luxe",
    bodyTypeMatch: ["Rectangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Heart", "Diamond"],
    formalityLevel: 6, confidence: 84,
  },
  {
    id: "pa-4", name: "Retro Disco", description: "Vintage-inspired party energy",
    colors: ["#2d1b69", "#e17055", "#fdcb6e", "#dfe6e9"],
    occasion: "party",
    reasoning: "Bold purple and orange create retro energy.",
    keyPieces: ["Purple wide-collar shirt", "Flared dark trousers", "Platform shoes", "Gold chain"],
    season: "All", styleType: "Retro",
    bodyTypeMatch: ["Rectangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 2, confidence: 75,
  },
  // ═══════════════ BUSINESS ═══════════════
  {
    id: "bu-1", name: "Smart Business", description: "Professional with personality",
    colors: ["#2c3e50", "#34495e", "#ecf0f1", "#95a5a6"],
    occasion: "business",
    reasoning: "Layered blues create a trustworthy, professional impression.",
    keyPieces: ["Navy suit", "Light blue shirt", "Navy tie", "Brown derby shoes"],
    season: "All", styleType: "Classic",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 8, confidence: 92,
  },
  {
    id: "bu-2", name: "Business Casual", description: "Approachable professional style",
    colors: ["#3c2a21", "#f4efea", "#c89d7c", "#8b7d6b"],
    occasion: "business",
    reasoning: "Earth tones create warmth in professional settings.",
    keyPieces: ["Brown blazer", "White oxford shirt", "Khaki chinos", "Brown leather shoes"],
    season: "All", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Oval", "Hourglass"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 6, confidence: 88,
  },
  {
    id: "bu-3", name: "Boardroom Authority", description: "Maximum presence for big meetings",
    colors: ["#1a1a2e", "#2c3e50", "#ecf0f1", "#b8860b"],
    occasion: "business",
    reasoning: "Deep navy signals authority. White crisp contrast commands attention.",
    keyPieces: ["Charcoal suit", "White French cuff shirt", "Navy tie", "Gold cufflinks"],
    season: "All", styleType: "Power",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 10, confidence: 93,
  },
  {
    id: "bu-4", name: "Creative Professional", description: "Polished but expressive",
    colors: ["#556b2f", "#2c3e50", "#f4efea", "#8b7355"],
    occasion: "business",
    reasoning: "Olive with navy shows creative thinking while maintaining professionalism.",
    keyPieces: ["Olive blazer", "Navy turtleneck", "Tan chinos", "Brown suede shoes"],
    season: "Autumn", styleType: "Creative",
    bodyTypeMatch: ["Rectangle", "Hourglass", "Oval"],
    faceShapeMatch: ["Oval", "Diamond", "Heart"],
    formalityLevel: 7, confidence: 85,
  },
  // ═══════════════ STREETWEAR ═══════════════
  {
    id: "sw-1", name: "Urban Streetwear", description: "Bold street style statement",
    colors: ["#1a1a1a", "#4a4a4a", "#c89d7c", "#ffffff"],
    occasion: "streetwear",
    reasoning: "Monochrome with metallic accents is the foundation of modern streetwear.",
    keyPieces: ["Oversized black tee", "Cargo pants", "Chunky sneakers", "Bucket hat"],
    season: "All", styleType: "Streetwear",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Oval"],
    faceShapeMatch: ["Oval", "Square", "Round"],
    formalityLevel: 1, confidence: 86,
  },
  {
    id: "sw-2", name: "Layered Street", description: "Complex layering for depth",
    colors: ["#2d3436", "#636e72", "#dfe6e9", "#b2bec3"],
    occasion: "streetwear",
    reasoning: "Tonal greys with texture mixing creates visual complexity.",
    keyPieces: ["Grey hoodie", "Black denim jacket", "Light joggers", "High-top sneakers"],
    season: "Winter", styleType: "Streetwear",
    bodyTypeMatch: ["Rectangle", "Oval"],
    faceShapeMatch: ["Oval", "Oblong", "Square"],
    formalityLevel: 1, confidence: 82,
  },
  {
    id: "sw-3", name: "Techwear Edge", description: "Functional futurism meets street",
    colors: ["#0a0a0a", "#1a1a1a", "#2d3436", "#636e72"],
    occasion: "streetwear",
    reasoning: "All-black tech fabrics with functional details.",
    keyPieces: ["Black shell jacket", "Black cargo pants", "Black boots", "Crossbody bag"],
    season: "Autumn", styleType: "Techwear",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Square", "Diamond"],
    formalityLevel: 1, confidence: 80,
  },
  {
    id: "sw-4", name: "Heritage Street", description: "Classic workwear meets modern street",
    colors: ["#5c3d2e", "#c4a882", "#2c1810", "#f5f0e8"],
    occasion: "streetwear",
    reasoning: "Earth-tone workwear pieces have natural streetwear credibility.",
    keyPieces: ["Brown chore coat", "White tee", "Selvedge denim", "Leather boots"],
    season: "Autumn", styleType: "Heritage",
    bodyTypeMatch: ["Rectangle", "Hourglass", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Square", "Round"],
    formalityLevel: 2, confidence: 84,
  },
  // ═══════════════ SUMMER ═══════════════
  {
    id: "su-1", name: "Summer Breeze", description: "Light and breezy summer style",
    colors: ["#dfe6e9", "#ffeaa7", "#c89d7c", "#2d3436"],
    occasion: "summer",
    reasoning: "Light colors reflect heat while keeping you stylish.",
    keyPieces: ["White linen shirt", "Beige shorts", "Canvas sneakers", "Straw hat"],
    season: "Summer", styleType: "Relaxed",
    bodyTypeMatch: ["Rectangle", "Oval", "Hourglass"],
    faceShapeMatch: ["Oval", "Heart", "Round"],
    formalityLevel: 1, confidence: 86,
  },
  {
    id: "su-2", name: "Coastal Cool", description: "Beach-ready sophistication",
    colors: ["#74b9ff", "#dfe6e9", "#ffffff", "#2d3436"],
    occasion: "summer",
    reasoning: "Ocean-inspired palette for summer. Blue complements warm skin tones.",
    keyPieces: ["Light blue polo", "White linen pants", "Espadrilles", "Aviator sunglasses"],
    season: "Summer", styleType: "Preppy",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 3, confidence: 84,
  },
  {
    id: "su-3", name: "Mediterranean", description: "Resort-ready elegance",
    colors: ["#f5f0e8", "#2c3e50", "#c89d7c", "#556b2f"],
    occasion: "summer",
    reasoning: "Crisp white with navy and olive evokes coastal European sophistication.",
    keyPieces: ["White linen polo", "Navy shorts", "Brown leather sandals", "Woven belt"],
    season: "Summer", styleType: "Resort",
    bodyTypeMatch: ["Rectangle", "Hourglass", "Oval"],
    faceShapeMatch: ["Oval", "Heart", "Diamond"],
    formalityLevel: 3, confidence: 82,
  },
  {
    id: "su-4", name: "Festival Ready", description: "Bold summer festival energy",
    colors: ["#e17055", "#fdcb6e", "#00b894", "#2d3436"],
    occasion: "summer",
    reasoning: "Warm sunset tones blend with nature.",
    keyPieces: ["Tie-dye tank", "Denim shorts", "Canvas sneakers", "Bandana"],
    season: "Summer", styleType: "Bohemian",
    bodyTypeMatch: ["Rectangle", "Oval"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 1, confidence: 76,
  },
  // ═══════════════ ADDITIONAL VERSATILE ═══════════════
  {
    id: "ev-1", name: "Autumn Layers", description: "Rich autumnal layering",
    colors: ["#556b2f", "#8b4513", "#f5f0e8", "#2c1810"],
    occasion: "casual",
    reasoning: "Olive and brown are autumn power colors.",
    keyPieces: ["Olive field jacket", "Brown knit sweater", "Cream chinos", "Leather boots"],
    season: "Autumn", styleType: "Heritage",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Round"],
    formalityLevel: 3, confidence: 88,
  },
  {
    id: "ev-2", name: "Winter Warmth", description: "Cozy winter layers with style",
    colors: ["#2c3e50", "#5c3d2e", "#c4a882", "#1a1a1a"],
    occasion: "casual",
    reasoning: "Navy and camel is a winter power combo.",
    keyPieces: ["Navy peacoat", "Camel scarf", "Dark jeans", "Chelsea boots"],
    season: "Winter", styleType: "Classic",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Heart"],
    formalityLevel: 4, confidence: 90,
  },
  {
    id: "ev-3", name: "Monochrome Sharp", description: "All-grey sophistication",
    colors: ["#636e72", "#b2bec3", "#2d3436", "#dfe6e9"],
    occasion: "business",
    reasoning: "Tonal greys create a refined, editorial look.",
    keyPieces: ["Charcoal overcoat", "Grey crew-neck", "Black trousers", "Black leather shoes"],
    season: "Winter", styleType: "Minimal",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle"],
    faceShapeMatch: ["Oval", "Oblong", "Square"],
    formalityLevel: 7, confidence: 86,
  },
  {
    id: "ev-4", name: "Earth & Gold", description: "Warm earth tones with gold accents",
    colors: ["#5c3d2e", "#b8860b", "#f5f0e8", "#2c1810"],
    occasion: "date-night",
    reasoning: "Full warm palette with gold hardware. Your skin tone's power combo.",
    keyPieces: ["Brown suede jacket", "Cream knit", "Dark chinos", "Gold watch"],
    season: "Autumn", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 5, confidence: 88,
  },
  {
    id: "ev-5", name: "Navy Power", description: "Head-to-toe navy confidence",
    colors: ["#1b2838", "#2c3e50", "#34495e", "#ecf0f1"],
    occasion: "formal",
    reasoning: "Monochrome navy reads expensive and intentional.",
    keyPieces: ["Navy suit", "Navy knit tie", "White pocket square", "Brown brogues"],
    season: "All", styleType: "Power",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Oblong"],
    formalityLevel: 9, confidence: 91,
  },
  {
    id: "ev-6", name: "Weekend Brunch", description: "Effortlessly polished daytime",
    colors: ["#f5f0e8", "#c4a882", "#5c3d2e", "#ffffff"],
    occasion: "casual",
    reasoning: "Light neutrals with earth accents. Relaxed enough for brunch, polished enough for anywhere.",
    keyPieces: ["Cream overshirt", "White tee", "Tan chinos", "White leather sneakers"],
    season: "Spring", styleType: "Smart Casual",
    bodyTypeMatch: ["Rectangle", "Oval", "Hourglass"],
    faceShapeMatch: ["Oval", "Round", "Heart"],
    formalityLevel: 3, confidence: 86,
  },
  {
    id: "ev-7", name: "Athletic Edge", description: "Sporty yet refined weekend look",
    colors: ["#2d3436", "#636e72", "#ffffff", "#00b894"],
    occasion: "casual",
    reasoning: "Athletic-inspired pieces with a pop of color show energy and confidence.",
    keyPieces: ["Black bomber jacket", "White polo", "Grey joggers", "Clean white sneakers"],
    season: "Spring", styleType: "Athleisure",
    bodyTypeMatch: ["Inverted Triangle", "Rectangle"],
    faceShapeMatch: ["Oval", "Square", "Diamond"],
    formalityLevel: 2, confidence: 82,
  },
  {
    id: "ev-8", name: "Workshop Creative", description: "Artful, textured casual",
    colors: ["#8b4513", "#d4a574", "#2c3e50", "#f5f0e8"],
    occasion: "casual",
    reasoning: "Workwear-inspired pieces with refined earth tones. Creative without trying hard.",
    keyPieces: ["Brown chore coat", "Navy crew-neck", "Tan work pants", "Suede desert boots"],
    season: "Autumn", styleType: "Heritage",
    bodyTypeMatch: ["Rectangle", "Inverted Triangle", "Hourglass"],
    faceShapeMatch: ["Oval", "Square", "Round"],
    formalityLevel: 3, confidence: 84,
  },
];

// ═══════════════ SCORING ENGINE ═══════════════

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  );
}

function undertoneScore(outfitColors: string[], skinHex: string, undertone: "Warm" | "Cool" | "Neutral"): number {
  const skinRgb = hexToRgb(skinHex);
  if (!skinRgb) return 50;
  let score = 50;

  const hasWarmAccent = outfitColors.some((c) => {
    const rgb = hexToRgb(c);
    return rgb && rgb.r > rgb.b + 30;
  });
  const hasCoolAccent = outfitColors.some((c) => {
    const rgb = hexToRgb(c);
    return rgb && rgb.b > rgb.r + 30;
  });
  const hasNeutrals = outfitColors.filter((c) => {
    const rgb = hexToRgb(c);
    if (!rgb) return false;
    return Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b) < 40;
  });

  if (undertone === "Warm" && hasWarmAccent) score += 15;
  if (undertone === "Cool" && hasCoolAccent) score += 15;
  if (undertone === "Neutral" && hasNeutrals.length >= 2) score += 10;

  const avgDist = outfitColors.reduce((sum, c) => {
    const rgb = hexToRgb(c);
    return sum + (rgb ? colorDistance(rgb, skinRgb) : 200);
  }, 0) / outfitColors.length;

  if (avgDist > 80 && avgDist < 200) score += 10;
  if (avgDist < 60) score -= 5;

  return Math.min(100, Math.max(0, score));
}

function bodyTypeScore(outfit: OutfitRecommendation, bodyType: string): number {
  if (!outfit.bodyTypeMatch) return 50;
  if (outfit.bodyTypeMatch.includes(bodyType)) return 100;
  const partialMatch = outfit.bodyTypeMatch.some((bt) =>
    (bt === "Rectangle" && bodyType === "Ectomorph") ||
    (bt === "Inverted Triangle" && bodyType === "Mesomorph") ||
    (bt === "Oval" && bodyType === "Endomorph") ||
    (bt === "Oval" && bodyType === "Round")
  );
  return partialMatch ? 70 : 30;
}

function faceShapeScore(outfit: OutfitRecommendation, faceShape: string): number {
  if (!outfit.faceShapeMatch) return 50;
  return outfit.faceShapeMatch.includes(faceShape) ? 100 : 40;
}

function seasonScore(outfit: OutfitRecommendation, currentSeason: string): number {
  if (!outfit.season || outfit.season === "All") return 80;
  if (outfit.season === currentSeason) return 100;
  const adjacentSeasons: Record<string, string[]> = {
    Spring: ["Winter", "Summer"],
    Summer: ["Spring", "Autumn"],
    Autumn: ["Summer", "Winter"],
    Winter: ["Autumn", "Spring"],
  };
  if (adjacentSeasons[currentSeason]?.includes(outfit.season)) return 60;
  return 30;
}

function occasionScore(outfit: OutfitRecommendation, occasion: string | undefined): number {
  if (!occasion) return 60;
  if (outfit.occasion === occasion) return 100;
  const relatedOccasions: Record<string, string[]> = {
    "night-out": ["party", "date-night"],
    "date-night": ["night-out", "casual"],
    party: ["night-out", "streetwear"],
    formal: ["business"],
    business: ["formal"],
    casual: ["streetwear", "summer"],
    streetwear: ["casual", "party"],
    summer: ["casual"],
  };
  if (relatedOccasions[occasion]?.includes(outfit.occasion)) return 60;
  return 20;
}

function skinToneContrastScore(outfitColors: string[], skinToneHex: string): number {
  const skinRgb = hexToRgb(skinToneHex);
  if (!skinRgb) return 50;
  const skinLum = 0.299 * skinRgb.r + 0.587 * skinRgb.g + 0.114 * skinRgb.b;
  const avgOutfitLum = outfitColors.reduce((sum, c) => {
    const rgb = hexToRgb(c);
    if (!rgb) return sum;
    return sum + (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  }, 0) / outfitColors.length;

  const contrast = Math.abs(skinLum - avgOutfitLum);
  if (contrast > 50 && contrast < 150) return 90;
  if (contrast > 30) return 70;
  if (contrast > 10) return 50;
  return 30;
}

// ═══════════════ MAIN EXPORTS ═══════════════

function getWarmColorRecommendations(skinToneHex: string): string[] {
  const base = ["#8B4513", "#CD853F", "#DAA520", "#B8860B", "#D2691E", "#A0522D", "#D4A574", "#C89D7C"];
  const skinRgb = hexToRgb(skinToneHex);
  if (!skinRgb) return base;
  return [...base, ...(skinRgb.r > skinRgb.b ? ["#1b2838", "#2c3e50", "#34495e"] : ["#5c3d2e", "#3c2a21", "#8b7355"])];
}

function getCoolColorRecommendations(skinToneHex: string): string[] {
  const base = ["#4682B4", "#5F9EA0", "#6A5ACD", "#7B68EE", "#9370DB", "#20B2AA", "#48D1CC", "#006400"];
  const skinRgb = hexToRgb(skinToneHex);
  if (!skinRgb) return base;
  return [...base, ...(skinRgb.b > skinRgb.r ? ["#1a1a2e", "#2c3e50", "#0c0c0c"] : ["#4a0e2a", "#2c1e4a", "#1a1a1a"])];
}

function getNeutralColorRecommendations(skinToneHex: string): string[] {
  const base = ["#8B8682", "#A9A9A9", "#696969", "#778899", "#B0C4DE", "#D3D3D3", "#C0C0C0", "#DCDCDC"];
  const skinRgb = hexToRgb(skinToneHex);
  if (!skinRgb) return base;
  return [...base, ...(skinRgb.r + skinRgb.g + skinRgb.b > 380 ? ["#2c3e50", "#1a1a2e", "#3c2a21"] : ["#f4efea", "#f5f0e8", "#ecf0f1"])];
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

export function generateRecommendations(
  undertone: "Warm" | "Cool" | "Neutral",
  bodyType: string,
  occasion?: string,
  skinToneHex?: string,
  faceShape?: string
): OutfitRecommendation[] {
  const pool = occasion ? OUTFIT_DATABASE.filter((o) => o.occasion === occasion) : [...OUTFIT_DATABASE];
  const hex = skinToneHex || "#c89d7c";
  const colorFn = undertone === "Warm" ? getWarmColorRecommendations : undertone === "Cool" ? getCoolColorRecommendations : getNeutralColorRecommendations;
  const recommendedColors = colorFn(hex);
  const season = getCurrentSeason();

  const scored = pool.map((outfit) => {
    const uScore = undertoneScore(outfit.colors, hex, undertone);
    const bScore = bodyTypeScore(outfit, bodyType);
    const fScore = faceShape ? faceShapeScore(outfit, faceShape) : 50;
    const sScore = seasonScore(outfit, season);
    const oScore = occasionScore(outfit, occasion);
    const cScore = skinToneContrastScore(outfit.colors, hex);
    const colorMatch = outfit.colors.filter((c) => recommendedColors.includes(c)).length;

    const totalScore = uScore * 0.25 + bScore * 0.15 + fScore * 0.12 + sScore * 0.12 + oScore * 0.15 + cScore * 0.10 + colorMatch * 8;

    const matchPct = Math.round(Math.min(100, totalScore));
    let reasoning = outfit.reasoning;
    if (bScore >= 80) reasoning += ` This style specifically flatters ${bodyType} body types.`;
    if (fScore >= 80) reasoning += ` The silhouette complements your ${faceShape} face shape.`;
    if (sScore >= 80) reasoning += ` Perfect for the ${season.toLowerCase()} season.`;
    reasoning += ` Overall match: ${matchPct}%.`;

    return { ...outfit, reasoning, confidence: matchPct, _score: totalScore };
  });

  scored.sort((a, b) => b._score - a._score);
  return scored.map(({ _score, ...outfit }) => outfit);
}

export function generateWeekPlan(
  undertone: "Warm" | "Cool" | "Neutral",
  bodyType: string,
  skinToneHex?: string,
  faceShape?: string
): { day: string; outfit: OutfitRecommendation }[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayOccasions: Record<string, string> = {
    Monday: "business",
    Tuesday: "business",
    Wednesday: "casual",
    Thursday: "business",
    Friday: "night-out",
    Saturday: "casual",
    Sunday: "casual",
  };

  return days.map((day) => {
    const recs = generateRecommendations(undertone, bodyType, dayOccasions[day], skinToneHex, faceShape);
    return { day, outfit: recs[0] };
  });
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

export interface OutfitCombo {
  id: string;
  name: string;
  top: { piece: string; color: string; from: string };
  bottom: { piece: string; color: string; from: string };
  shoes: { piece: string; color: string; from: string };
  accessory: { piece: string; color: string; from: string };
  overallColor: string[];
  reasoning: string;
}

function pickTop(rec: OutfitRecommendation): { piece: string; color: string } {
  const topKeywords = ["shirt", "blazer", "jacket", "tee", "turtleneck", "sweater", "polo", "hoodie", "cardigan", "vest", "top"];
  const piece = rec.keyPieces.find((k) => topKeywords.some((w) => k.toLowerCase().includes(w))) || rec.keyPieces[0] || "Shirt";
  return { piece, color: rec.colors[0] };
}

function pickBottom(rec: OutfitRecommendation): { piece: string; color: string } {
  const bottomKeywords = ["trouser", "jean", "pant", "chino", "short", "corduroy", "slacks"];
  const piece = rec.keyPieces.find((k) => bottomKeywords.some((w) => k.toLowerCase().includes(w))) || rec.keyPieces[1] || "Trousers";
  return { piece, color: rec.colors[1] || rec.colors[0] };
}

function pickShoes(rec: OutfitRecommendation): { piece: string; color: string } {
  const shoeKeywords = ["shoe", "sneaker", "boot", "loafer", "oxford", "derby", "sandal", "slipper"];
  const piece = rec.keyPieces.find((k) => shoeKeywords.some((w) => k.toLowerCase().includes(w))) || "Clean sneakers";
  return { piece, color: rec.colors[2] || rec.colors[0] };
}

function pickAccessory(rec: OutfitRecommendation): { piece: string; color: string } {
  const accKeywords = ["watch", "belt", "chain", "ring", "bracelet", "scarf", "hat", "pocket square", "tie", "sunglasses"];
  const piece = rec.keyPieces.find((k) => accKeywords.some((w) => k.toLowerCase().includes(w))) || "Watch";
  return { piece, color: rec.colors[3] || rec.colors[0] };
}

function colorHarmonyScore(colors: string[]): number {
  if (colors.length < 2) return 50;
  let score = 60;
  const allSame = colors.every((c) => c === colors[0]);
  if (allSame) score += 15;
  const allDifferent = new Set(colors).size === colors.length;
  if (allDifferent) score += 10;
  const avgLum = colors.reduce((sum, c) => {
    const rgb = hexToRgb(c);
    return rgb ? sum + (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) : sum;
  }, 0) / colors.length;
  if (avgLum > 80 && avgLum < 200) score += 5;
  return Math.min(100, score);
}

export function generateCombos(
  recommendations: OutfitRecommendation[],
  maxCombos: number = 4
): OutfitCombo[] {
  if (recommendations.length < 2) return [];

  const combos: OutfitCombo[] = [];
  const used = new Set<string>();

  for (let i = 0; i < Math.min(recommendations.length, 5); i++) {
    for (let j = 0; j < Math.min(recommendations.length, 5); j++) {
      if (i === j) continue;
      const top = pickTop(recommendations[i]);
      const bottom = pickBottom(recommendations[j]);
      const shoes = pickShoes(recommendations[i]);
      const accessory = pickAccessory(recommendations[j]);

      const key = `${top.piece}|${bottom.piece}`;
      if (used.has(key)) continue;
      used.add(key);

      const comboColors = [top.color, bottom.color, shoes.color, accessory.color];
      const harmony = colorHarmonyScore(comboColors);

      combos.push({
        id: `combo-${combos.length + 1}`,
        name: `${top.piece.split(" ").slice(-1)[0]} + ${bottom.piece.split(" ").slice(-1)[0]}`,
        top: { ...top, from: recommendations[i].name },
        bottom: { ...bottom, from: recommendations[j].name },
        shoes: { ...shoes, from: recommendations[i].name },
        accessory: { ...accessory, from: recommendations[j].name },
        overallColor: comboColors,
        reasoning: `Pairs the ${top.piece.toLowerCase()} from "${recommendations[i].name}" with ${bottom.piece.toLowerCase()} from "${recommendations[j].name}". Color harmony: ${harmony}/100.`,
      });

      if (combos.length >= maxCombos) break;
    }
    if (combos.length >= maxCombos) break;
  }

  return combos.sort((a, b) => {
    const scoreA = colorHarmonyScore(a.overallColor);
    const scoreB = colorHarmonyScore(b.overallColor);
    return scoreB - scoreA;
  });
}
