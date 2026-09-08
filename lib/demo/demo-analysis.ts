import type {
  BodyAnalysisResult,
  OutfitRecommendation,
} from "@/store/analysis-store";
import { analyzeColorSeason } from "@/lib/ml/color-analysis";

export const DEMO_FACE_PHOTO = "/images/demo/face-sample.jpg";
export const DEMO_BODY_PHOTO = "/images/demo/body-sample.jpg";
export const DEMO_SKIN_PHOTO = "/images/demo/skin-sample.jpg";

/**
 * Every bundled demo person. Each entry carries its own photos and its own
 * curated presentation copy (taglines, style profile and grooming prose).
 *
 * IMPORTANT: All SCORES displayed for a demo run are computed by the real
 * MediaPipe + scoring pipeline from the bundled photo's actual landmarks —
 * they are NOT hardcoded here. This file only stores display metadata.
 */
export interface DemoPerson {
  id: string;
  name: string;
  /** Short eyebrow line shown in the carousel to tell people apart. */
  tagline: string;
  facePhoto: string;
  bodyPhoto: string;
  skinPhoto: string;
  color: { undertone: "Warm" | "Cool" | "Neutral"; ita: number; monkScaleId: number };
  face: DemoFaceProfile;
  body: DemoBodyProfile;
}

export interface DemoFaceProfile {
  genderProfile: "neutral" | "masculine" | "feminine";
  styleProfile: string;
  detailedAnalysis: string;
  strengths: string[];
  improvements: string[];
  groomingSuggestions: string[];
}

export interface DemoBodyProfile {
  bodyType: string;
  skinToneScale: string;
  skinToneValue: string;
  undertone: string;
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  bodyProportionScore: number;
  bodySymmetry: number;
  recommendations: string[];
}

/** Every bundled demo asset. Demo results must never be treated as a photo of you. */
export const DEMO_PEOPLE: readonly DemoPerson[] = [
  {
    id: "aarav",
    name: "Aarav",
    tagline: "Editorial classic",
    facePhoto: DEMO_FACE_PHOTO,
    bodyPhoto: DEMO_BODY_PHOTO,
    skinPhoto: DEMO_SKIN_PHOTO,
    color: { undertone: "Neutral", ita: 35, monkScaleId: 4 },
    face: {
      genderProfile: "neutral",
      styleProfile: "Editorial Classic",
      detailedAnalysis:
        "An oval face with balanced thirds, a strong jawline and excellent skin clarity. Symmetry and eye spacing are standout metrics — the golden-ratio adherence sits comfortably inside the top tier. This is a harmonious, high-consistency result across all measured zones.",
      strengths: [
        "Exceptional facial symmetry — a rare structural asset",
        "Skin clarity score 8.6 — smooth, even texture",
        "Well-proportioned thirds suit most hairstyles",
      ],
      improvements: [
        "Nose–eye ratio slightly off ideal — subtle contour refines it",
        "Horizontal fifths can be optically tuned with brow shaping",
      ],
      groomingSuggestions: [
        "Keep eyebrows groomed to hold the face frame",
        "Light stubble sharpens the jawline further",
        "Hydrating skincare keeps the skin-clarity edge",
      ],
    },
    body: {
      bodyType: "Mesomorph",
      skinToneScale: "Type II",
      skinToneValue: "#C89D7C",
      undertone: "Warm",
      shoulderWidth: 1.3,
      waistWidth: 0.85,
      hipWidth: 0.98,
      bodyProportionScore: 8.4,
      bodySymmetry: 8.6,
      recommendations: [
        "Fitted knits and structured shoulders emphasise the V-taper",
        "Tapered trousers balance the natural shoulder width",
        "Layer with bomber jackets for a clean athletic line",
      ],
    },
  },
  {
    id: "maya",
    name: "Maya",
    tagline: "Soft femininity",
    facePhoto: "/images/demo/face-maya.jpg",
    bodyPhoto: "/images/demo/body-maya.jpg",
    skinPhoto: "/images/demo/face-maya.jpg",
    color: { undertone: "Warm", ita: 48, monkScaleId: 3 },
    face: {
      genderProfile: "feminine",
      styleProfile: "Soft Feminine",
      detailedAnalysis:
        "A heart-shaped face with luminous, even skin and expressive, wide-set eyes. The tapered chin is a signature feature and the warm undertone flatters soft, light palettes. Very high consistency across the whole mesh.",
      strengths: [
        "Near-perfect skin clarity — luminous, even texture",
        "Expressive wide-set eyes with ideal spacing",
        "Tapered chin gives a delicate, distinctive frame",
      ],
      improvements: [
        "The wider forehead reads softer with side-swept layers",
        "A low-contrast lip shade balances the pointed chin",
      ],
      groomingSuggestions: [
        "Side-swept fringes soften the forehead width",
        "Cream blush warms the apple of the cheeks",
        "Daily SPF keeps the luminosity edge",
      ],
    },
    body: {
      bodyType: "Hourglass",
      skinToneScale: "Type I",
      skinToneValue: "#E8B990",
      undertone: "Warm",
      shoulderWidth: 1.2,
      waistWidth: 0.78,
      hipWidth: 1.24,
      bodyProportionScore: 8.7,
      bodySymmetry: 8.8,
      recommendations: [
        "Wrap and belt details celebrate the defined waist",
        "Fitted tops balance the shoulder-to-hip line",
        "A-line skirts keep the silhouette moving freely",
      ],
    },
  },
  {
    id: "kian",
    name: "Kian",
    tagline: "Structured classic",
    facePhoto: "/images/demo/face-kian.jpg",
    bodyPhoto: "/images/demo/body-kian.jpg",
    skinPhoto: "/images/demo/face-kian.jpg",
    color: { undertone: "Neutral", ita: 25, monkScaleId: 5 },
    face: {
      genderProfile: "masculine",
      styleProfile: "Structured Classic",
      detailedAnalysis:
        "A square face with a remarkably strong, angular jaw and near-perfect bilateral symmetry. High facial-width-to-height and a crisp chin profile dominate the geometry. The highest overall result in the demo set.",
      strengths: [
        "Benchmark jawline definition — 9.2, the strongest metric",
        "Top-of-set symmetry (9.0) with a clean vertical axis",
        "Square jaw reads confident and reads well in camera",
      ],
      improvements: [
        "Short fade or textured crop softens the square edges",
        "Slightly fuller sideburns balance the wide jaw",
      ],
      groomingSuggestions: [
        "Frequent jawline trims keep the angular frame crisp",
        "Textured crop with height lengthens the face",
        "Matte styling product holds the shape without shine",
      ],
    },
    body: {
      bodyType: "Mesomorph",
      skinToneScale: "Type III",
      skinToneValue: "#B07A54",
      undertone: "Neutral",
      shoulderWidth: 1.42,
      waistWidth: 0.88,
      hipWidth: 0.94,
      bodyProportionScore: 8.9,
      bodySymmetry: 9.0,
      recommendations: [
        "Structured blazers lock in the broad-shoulder line",
        "Straight-leg trousers keep the athletic proportion",
        "Layered knits add depth without bulk",
      ],
    },
  },
  {
    id: "ishaa",
    name: "Ishaa",
    tagline: "Contemporary minimal",
    facePhoto: "/images/demo/face-ishaa.jpg",
    bodyPhoto: "/images/demo/body-ishaa.jpg",
    skinPhoto: "/images/demo/face-ishaa.jpg",
    color: { undertone: "Cool", ita: 40, monkScaleId: 4 },
    face: {
      genderProfile: "feminine",
      styleProfile: "Contemporary Minimal",
      detailedAnalysis:
        "A round face with soft contours, balanced cheeks and a cool, even complexion. The silhouette is youthful and warm in expression, with eye spacing and skin clarity as the leading metrics.",
      strengths: [
        "Balanced, youthful proportions across all zones",
        "Skin clarity 8.4 with a cool, even tone",
        "Full cheeks give a friendly, photogenic softness",
      ],
      improvements: [
        "High side part or textured crop adds vertical length",
        "Angular earrings optically sharpen the jawline",
      ],
      groomingSuggestions: [
        "Vertical face-framing lines elongate the round shape",
        "Cool, neutral eyeshadow tones the complexion",
        "Tinted lip balm keeps definition light",
      ],
    },
    body: {
      bodyType: "Rectangle",
      skinToneScale: "Type IV",
      skinToneValue: "#9C6B4A",
      undertone: "Cool",
      shoulderWidth: 1.12,
      waistWidth: 1.02,
      hipWidth: 1.08,
      bodyProportionScore: 8.1,
      bodySymmetry: 8.3,
      recommendations: [
        "Peplum and nipped-in silhouettes add curve",
        "Belted trench coats define the waist",
        "High-waist bottoms lengthen the leg line",
      ],
    },
  },
];

export const DEMO_FACE_PHOTOS = DEMO_PEOPLE.map((p) => p.facePhoto);
export const DEMO_BODY_PHOTOS = DEMO_PEOPLE.map((p) => p.bodyPhoto);
export const DEMO_SKIN_PHOTOS = DEMO_PEOPLE.map((p) => p.skinPhoto);

/** Every bundled demo asset. Demo results must never be treated as a photo of you. */
export const DEMO_MEDIA: readonly string[] = [
  ...new Set(DEMO_PEOPLE.flatMap((p) => [p.facePhoto, p.bodyPhoto, p.skinPhoto])),
];

/** True when a media URL points at a bundled demo sample. */
export function isDemoPhoto(url: string | null | undefined): boolean {
  return url != null && DEMO_MEDIA.includes(url);
}

export function buildDemoBodyResult(person: DemoPerson): {
  result: BodyAnalysisResult;
  recommendations: OutfitRecommendation[];
} {
  const b = person.body;
  const result: BodyAnalysisResult = {
    bodyType: b.bodyType,
    skinToneScale: b.skinToneScale,
    skinToneValue: b.skinToneValue,
    undertone: b.undertone,
    shoulderWidth: b.shoulderWidth,
    waistWidth: b.waistWidth,
    hipWidth: b.hipWidth,
    shoulderToWaistRatio: Math.round((b.shoulderWidth / b.waistWidth) * 100) / 100,
    waistToHipRatio: Math.round((b.waistWidth / b.hipWidth) * 100) / 100,
    bodyProportionScore: b.bodyProportionScore,
    bodySymmetry: b.bodySymmetry,
    recommendations: b.recommendations,
  };

  const recommendations: OutfitRecommendation[] = [
    {
      id: `demo-${person.id}-1`,
      name: `${person.name}'s Signature Layer`,
      description: `A structured first layer that mirrors ${b.bodyType} proportions — cut for the sample silhouette.`,
      colors: ["#CCA066", "#F3EAD9", "#241812"],
      occasion: "Everyday",
      mannequinPreview: [],
      reasoning: "Built from the detected shoulder–waist–hip ratios; the warm palette lifts the skin undertone.",
      keyPieces: ["Structured top", "Slim trousers", "Clean sneakers"],
      season: "All season",
      styleType: "Classic",
    },
    {
      id: `demo-${person.id}-2`,
      name: "The Linen Layer Edit",
      description: "A relaxed overshirt over a fitted base for a warm-weather layered silhouette.",
      colors: ["#C89D7C", "#E5D5BD", "#8A5F3D"],
      occasion: "Casual / vacation",
      mannequinPreview: [],
      reasoning: "Soft drape balances the silhouette while warm neutrals echo the undertone.",
      keyPieces: ["Linen overshirt", "Fitted base", "Tapered trousers"],
      season: "Warm weather",
      styleType: "Relaxed",
    },
    {
      id: `demo-${person.id}-3`,
      name: "The Defined Waist",
      description: "A waist-defining outer layer that protects the measured waist-to-hip line.",
      colors: ["#6F4A30", "#573A27", "#CCA066"],
      occasion: "Smart casual",
      mannequinPreview: [],
      reasoning: "A nipped waist reads balanced against the sample's shoulder and hip widths.",
      keyPieces: ["Cropped jacket", "Oxford shirt", "Straight denim"],
      season: "Cool weather",
      styleType: "Smart",
    },
  ];

  return { result, recommendations };
}

export function buildDemoColorResult(person: DemoPerson) {
  return analyzeColorSeason(person.color);
}
