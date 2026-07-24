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
    colors: ["#D4A574", "#C89D7C", "#8B4513", "#CD853F", "#DAA520", "#B8860B", "#D2691E", "#A0522D"],
  },
  cool: {
    label: "Cool Tones",
    colors: ["#4682B4", "#5F9EA0", "#6A5ACD", "#7B68EE", "#9370DB", "#8FBC8F", "#20B2AA", "#48D1CC"],
  },
  neutral: {
    label: "Neutral Tones",
    colors: ["#8B8682", "#A9A9A9", "#696969", "#778899", "#B0C4DE", "#D3D3D3", "#C0C0C0", "#DCDCDC"],
  },
  earth: {
    label: "Earth Tones",
    colors: ["#8B7355", "#6B4423", "#8B4513", "#A0522D", "#CD853F", "#DEB887", "#D2B48C", "#BC8F8F"],
  },
  jewel: {
    label: "Jewel Tones",
    colors: ["#8B0000", "#4B0082", "#006400", "#008B8B", "#B8860B", "#800080", "#0000CD", "#8B0000"],
  },
  pastel: {
    label: "Pastel Tones",
    colors: ["#FFB6C1", "#FFDAB9", "#E6E6FA", "#F0FFF0", "#F5F5DC", "#FDF5E6", "#F0F8FF", "#FFF0F5"],
  },
} as const;

export const SCORE_METRICS = {
  face: [
    { key: "symmetry", label: "Facial Symmetry", description: "Balance between left and right sides" },
    { key: "proportions", label: "Facial Proportions", description: "Thirds rule and golden ratio adherence" },
    { key: "jawline", label: "Jawline Definition", description: "Jaw angle and chin prominence" },
    { key: "eyeSpacing", label: "Eye Spacing", description: "Interpupillary distance ratio" },
    { key: "skinClarity", label: "Skin Clarity", description: "Texture smoothness and evenness" },
    { key: "facialShape", label: "Facial Harmony", description: "Overall shape balance and attractiveness" },
  ],
} as const;
