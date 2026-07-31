export const FACE_SHAPE_TYPES = [
  "Oval",
  "Round",
  "Square",
  "Heart",
  "Oblong",
  "Diamond",
  "Triangle",
] as const;

export const BODY_TYPES = [
  "Ectomorph",
  "Mesomorph",
  "Endomorph",
  "Rectangle",
  "Triangle",
  "Inverted Triangle",
  "Hourglass",
  "Round",
] as const;

export const MONK_SKIN_TONES = [
  { id: 1, label: "Very Light", hex: "#FDDBB4" },
  { id: 2, label: "Light", hex: "#E8B990" },
  { id: 3, label: "Light-Medium", hex: "#D4A574" },
  { id: 4, label: "Medium", hex: "#C08E62" },
  { id: 5, label: "Medium", hex: "#A87550" },
  { id: 6, label: "Medium-Dark", hex: "#8D6342" },
  { id: 7, label: "Dark", hex: "#6F4E37" },
  { id: 8, label: "Dark", hex: "#5A3E2B" },
  { id: 9, label: "Very Dark", hex: "#3E2A1C" },
  { id: 10, label: "Deep", hex: "#2A1B10" },
] as const;

export const UNDERTONES = ["Warm", "Cool", "Neutral"] as const;

export const BEARD_STYLES = [
  { id: "clean-shaven", label: "Clean Shaven", category: "none" },
  { id: "stubble-short", label: "Short Stubble", category: "stubble" },
  { id: "stubble-medium", label: "Medium Stubble", category: "stubble" },
  { id: "stubble-long", label: "Long Stubble", category: "stubble" },
  { id: "full-beard-short", label: "Short Full Beard", category: "full" },
  { id: "full-beard-medium", label: "Medium Full Beard", category: "full" },
  { id: "full-beard-long", label: "Long Full Beard", category: "full" },
  { id: "goatee", label: "Goatee", category: "partial" },
  { id: "circle-beard", label: "Circle Beard", category: "partial" },
  { id: "van-dyke", label: "Van Dyke", category: "partial" },
  { id: "anchor", label: "Anchor", category: "partial" },
  { id: "balbo", label: "Balbo", category: "partial" },
  { id: "mutton-chops", label: "Mutton Chops", category: "side" },
  { id: "friendly-mutton-chops", label: "Friendly Mutton Chops", category: "side" },
  { id: "hulihee", label: "Hulihee", category: "side" },
] as const;

export const MUSTACHE_STYLES = [
  { id: "none", label: "None" },
  { id: "chevron", label: "Chevron" },
  { id: "handlebar", label: "Handlebar" },
  { id: "pencil", label: "Pencil" },
  { id: "walrus", label: "Walrus" },
  { id: "english", label: "English" },
  { id: "hungarian", label: "Hungarian" },
  { id: "horseshoe", label: "Horseshoe" },
  { id: "toothbrush", label: "Toothbrush" },
] as const;

export const OCCASIONS = [
  { id: "night-out", label: "Night Out", icon: "🌙" },
  { id: "formal", label: "Formal", icon: "🎩" },
  { id: "casual", label: "Casual", icon: "👕" },
  { id: "date-night", label: "Date Night", icon: "💝" },
  { id: "party", label: "Party", icon: "🎉" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "streetwear", label: "Streetwear", icon: "🛹" },
  { id: "summer", label: "Summer", icon: "☀️" },
] as const;

export const COMMUNITY_CATEGORIES = [
  { id: "outfit", label: "Outfit" },
  { id: "face", label: "Face" },
  { id: "grooming", label: "Grooming" },
  { id: "party", label: "Party Look" },
] as const;

export const COLOR_PALETTES = {
  warm: {
    label: "Warm Tones",
    colors: ["#FF6B35", "#FF4500", "#FF8C00", "#FFA500", "#FFD700", "#FFB347", "#FF7F50", "#FF6347"],
  },
  cool: {
    label: "Cool Tones",
    colors: ["#00F5FF", "#00BFFF", "#1E90FF", "#4169E1", "#6A5ACD", "#9932CC", "#00CED1", "#00FA9A"],
  },
  neutral: {
    label: "Neutral Tones",
    colors: ["#1A1A2E", "#16213E", "#0F3460", "#533483", "#E94560", "#0F0A2E", "#2A1B3D", "#44107A"],
  },
  earth: {
    label: "Earth Tones",
    colors: ["#2D1B00", "#4A2800", "#6B3A00", "#8B5E00", "#B8860B", "#DAA520", "#FFD700", "#FFC107"],
  },
  jewel: {
    label: "Jewel Tones",
    colors: ["#FF004D", "#7000FF", "#00FF88", "#00D4FF", "#FFD700", "#FF0088", "#7B00FF", "#FF0055"],
  },
  pastel: {
    label: "Pastel Tones",
    colors: ["#FF6B9D", "#C084FC", "#67E8F9", "#86EFAC", "#FDE047", "#FCA5A5", "#A5B4FC", "#F0ABFC"],
  },
} as const;

export const SCORE_METRICS = {
  face: [
    { key: "symmetry", label: "Facial Symmetry", description: "Balance between left and right sides", weight: 0.18 },
    { key: "goldenRatio", label: "Golden Ratio", description: "How closely your proportions match φ (1.618)", weight: 0.15 },
    { key: "jawline", label: "Jawline Definition", description: "Jaw angle sharpness and chin prominence", weight: 0.15 },
    { key: "proportions", label: "Proportional Harmony", description: "Upper, middle, and lower third balance", weight: 0.12 },
    { key: "skinClarity", label: "Skin Clarity", description: "Surface smoothness and tone evenness", weight: 0.12 },
    { key: "eyeSpacing", label: "Eye Spacing", description: "Interpupillary distance ratio", weight: 0.10 },
    { key: "cheekboneDefinition", label: "Cheekbone Definition", description: "Cheek prominence relative to jaw", weight: 0.08 },
    { key: "lipFullness", label: "Lip Proportion", description: "Upper-to-lower lip ratio and fullness", weight: 0.05 },
    { key: "noseProfile", label: "Nose Profile", description: "Nose width relative to face width", weight: 0.05 },
  ],
} as const;
