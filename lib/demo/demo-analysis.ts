import type {
  FaceAnalysisResult,
  BodyAnalysisResult,
  OutfitRecommendation,
  FacialMetric,
} from "@/store/analysis-store";
import { analyzeColorSeason } from "@/lib/ml/color-analysis";

export const DEMO_FACE_PHOTO = "/images/demo/face-sample.jpg";
export const DEMO_BODY_PHOTO = "/images/demo/body-sample.jpg";
export const DEMO_SKIN_PHOTO = "/images/demo/skin-sample.jpg";

/**
 * Every bundled demo person. Each entry carries its own photos and its own
 * "real" (photo-derived) result profile, so running the demo never reuses a
 * single person's numbers across the carousel.
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
  facialShape: string;
  overallScore: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyeSpacing: number;
  skinClarity: number;
  skinTone: string;
  skinToneValue: string;
  skinToneScaleId: number;
  skinToneITA: number;
  undertone: string;
  ageEstimation: number;
  genderEstimation: string;
  genderProfile: "neutral" | "masculine" | "feminine";
  emotionDetected: string;
  styleProfile: string;
  detailedAnalysis: string;
  strengths: string[];
  improvements: string[];
  groomingSuggestions: string[];
  breakdown: { label: string; score: number; value?: string }[];
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

const breakdownFor = (profile: DemoFaceProfile) => {
  const { breakdown, overallScore, facialShape } = profile;
  const generic: [string, number, string?][] = [
    ["Facial Symmetry", profile.symmetry, undefined],
    ["Golden Ratio Adherence", overallScore - 0.1, undefined],
    ["Jawline Definition", profile.jawline, undefined],
    ["Proportional Harmony", profile.proportions, undefined],
    ["Skin Clarity", profile.skinClarity, undefined],
  ];
  const rows = [...generic, ...breakdown.map((b) => [b.label, b.score, b.value] as [string, number, string?])];
  return rows.map(
    ([label, score, value], i): FacialMetric => {
      const seed = 0.6 + (i % 3) * 0.1 + (facialShape.length % 5) * 0.02;
      return demoMetric(label, 0.05, "", "", Math.max(5.5, Math.min(9.5, score + seed)), value);
    }
  );
};

function demoMetric(label: string, weight: number, description: string, tip: string, score: number, value?: string): FacialMetric {
  const rating = score >= 8 ? "Excellent" : score >= 7 ? "Strong" : score >= 6 ? "Good" : score >= 5 ? "Fair" : "Needs focus";
  return { label, weight, description, tip, score, rating, value, spread: 0.15 };
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
      facialShape: "Oval",
      overallScore: 8.2,
      symmetry: 8.4,
      proportions: 8.2,
      jawline: 8.3,
      eyeSpacing: 8.5,
      skinClarity: 8.6,
      skinTone: "Light",
      skinToneValue: "#E8B990",
      skinToneScaleId: 2,
      skinToneITA: 50,
      undertone: "Neutral",
      ageEstimation: 27,
      genderEstimation: "Neutral",
      genderProfile: "neutral",
      emotionDetected: "Neutral",
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
      breakdown: [
        { label: "Facial Symmetry", score: 8.4 },
        { label: "Golden Ratio Adherence", score: 8.1, value: "Ratio 1.62 (ideal ≈ 1.62)" },
        { label: "Jawline Definition", score: 8.3 },
        { label: "Proportional Harmony", score: 8.2 },
        { label: "Horizontal Fifths", score: 7.9 },
        { label: "Eye Spacing", score: 8.5 },
        { label: "Skin Clarity", score: 8.6 },
        { label: "Cheekbone Definition", score: 8.2 },
        { label: "FWHR (Facial Width-to-Height)", score: 7.8, value: "Ratio 1.93 (ideal ≈ 1.95)" },
        { label: "Canthal Tilt", score: 8.0, value: "+4.8° (ideal ≈ +5°)" },
        { label: "Eye–Nose Ratio", score: 7.7, value: "Ratio 1.60 (ideal ≈ 1.62)" },
        { label: "Lip Proportion", score: 8.1 },
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
      facialShape: "Heart",
      overallScore: 8.6,
      symmetry: 8.8,
      proportions: 8.5,
      jawline: 8.1,
      eyeSpacing: 8.7,
      skinClarity: 8.9,
      skinTone: "Fair",
      skinToneValue: "#F0C8A8",
      skinToneScaleId: 1,
      skinToneITA: 58,
      undertone: "Warm",
      ageEstimation: 24,
      genderEstimation: "Feminine",
      genderProfile: "feminine",
      emotionDetected: "Neutral",
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
      breakdown: [
        { label: "Facial Symmetry", score: 8.8 },
        { label: "Golden Ratio Adherence", score: 8.6, value: "Ratio 1.63 (ideal ≈ 1.62)" },
        { label: "Jawline Definition", score: 8.1 },
        { label: "Proportional Harmony", score: 8.5 },
        { label: "Horizontal Fifths", score: 8.4 },
        { label: "Eye Spacing", score: 8.7 },
        { label: "Skin Clarity", score: 8.9 },
        { label: "Cheekbone Definition", score: 8.5 },
        { label: "FWHR (Facial Width-to-Height)", score: 8.2, value: "Ratio 1.89 (ideal ≈ 1.95)" },
        { label: "Canthal Tilt", score: 8.3, value: "+4.4° (ideal ≈ +5°)" },
        { label: "Eye–Nose Ratio", score: 8.0, value: "Ratio 1.58 (ideal ≈ 1.62)" },
        { label: "Lip Proportion", score: 8.6 },
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
      facialShape: "Square",
      overallScore: 8.9,
      symmetry: 9.0,
      proportions: 8.7,
      jawline: 9.2,
      eyeSpacing: 8.4,
      skinClarity: 8.3,
      skinTone: "Medium",
      skinToneValue: "#C89D7C",
      skinToneScaleId: 4,
      skinToneITA: 34,
      undertone: "Neutral",
      ageEstimation: 31,
      genderEstimation: "Masculine",
      genderProfile: "masculine",
      emotionDetected: "Neutral",
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
      breakdown: [
        { label: "Facial Symmetry", score: 9.0 },
        { label: "Golden Ratio Adherence", score: 8.8, value: "Ratio 1.64 (ideal ≈ 1.62)" },
        { label: "Jawline Definition", score: 9.2 },
        { label: "Proportional Harmony", score: 8.7 },
        { label: "Horizontal Fifths", score: 8.6 },
        { label: "Eye Spacing", score: 8.4 },
        { label: "Skin Clarity", score: 8.3 },
        { label: "Cheekbone Definition", score: 8.9 },
        { label: "FWHR (Facial Width-to-Height)", score: 8.8, value: "Ratio 2.01 (ideal ≈ 1.95)" },
        { label: "Canthal Tilt", score: 8.5, value: "+5.2° (ideal ≈ +5°)" },
        { label: "Eye–Nose Ratio", score: 8.1, value: "Ratio 1.61 (ideal ≈ 1.62)" },
        { label: "Lip Proportion", score: 8.0 },
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
      facialShape: "Round",
      overallScore: 8.0,
      symmetry: 8.2,
      proportions: 7.9,
      jawline: 7.8,
      eyeSpacing: 8.3,
      skinClarity: 8.4,
      skinTone: "Medium Deep",
      skinToneValue: "#B07A54",
      skinToneScaleId: 5,
      skinToneITA: 28,
      undertone: "Cool",
      ageEstimation: 29,
      genderEstimation: "Feminine",
      genderProfile: "feminine",
      emotionDetected: "Neutral",
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
      breakdown: [
        { label: "Facial Symmetry", score: 8.2 },
        { label: "Golden Ratio Adherence", score: 7.9, value: "Ratio 1.58 (ideal ≈ 1.62)" },
        { label: "Jawline Definition", score: 7.8 },
        { label: "Proportional Harmony", score: 7.9 },
        { label: "Horizontal Fifths", score: 8.1 },
        { label: "Eye Spacing", score: 8.3 },
        { label: "Skin Clarity", score: 8.4 },
        { label: "Cheekbone Definition", score: 8.0 },
        { label: "FWHR (Facial Width-to-Height)", score: 7.7, value: "Ratio 1.84 (ideal ≈ 1.95)" },
        { label: "Canthal Tilt", score: 7.9, value: "+3.9° (ideal ≈ +5°)" },
        { label: "Eye–Nose Ratio", score: 7.8, value: "Ratio 1.55 (ideal ≈ 1.62)" },
        { label: "Lip Proportion", score: 8.2 },
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

/** Deterministic per-person synthetic mesh so every carousel slide scans differently. */
export function generateDemoLandmarks(variant = 0): number[][] {
  const rings: [number, number, number, number, number, number][] = [
    [0.5, 0.55, 0.26, 0.33, 96, 0],
    [0.5, 0.51, 0.19, 0.24, 88, 0.4],
    [0.5, 0.5, 0.12, 0.15, 92, 1.2],
    [0.5, 0.5, 0.06, 0.075, 96, 2.1],
    [0.5, 0.5, 0.028, 0.03, 78, 3.0],
    [0.5, 0.47, 0.008, 0.01, 28, 0.9],
  ];
  const sx = 0.5 + (variant % 3 - 1) * 0.01;
  const sy = 0.53 + ((variant * 7) % 5) * 0.008;
  const stretch = 1 + ((variant * 13) % 5) * 0.03;
  const pts: number[][] = [];
  for (const [cx, cy, rx, ry, n, phase] of rings) {
    for (let i = 0; i < n && pts.length < 478; i++) {
      const a = (i / n) * Math.PI * 2 + phase + variant * 0.11;
      const jitter = 0.004 * Math.sin((i * 13 + phase * 7 + variant * 5) % Math.PI);
      const radial = rx / 0.26;
      pts.push([
        Math.max(0.02, Math.min(0.98, sx + Math.cos(a) * rx * stretch + jitter)),
        Math.max(0.02, Math.min(0.98, sy + Math.sin(a) * ry * 0.9 * stretch + jitter)),
        -radial * 0.55 + 0.3 * Math.cos(a) * radial,
      ]);
    }
  }
  while (pts.length < 478) pts.push([0.5, 0.5, -0.12]);
  return pts.slice(0, 478);
}

function ratingFor(score: number): string {
  return score >= 8 ? "Excellent" : score >= 7 ? "Strong" : score >= 6 ? "Good" : "Fair";
}

export function buildDemoFaceResult(
  person: DemoPerson,
  landmarks?: number[][]
): FaceAnalysisResult {
  const f = person.face;
  const overall = f.overallScore;
  const breakdown = breakdownFor(f);
  const variant = person.id.length;
  const mesh =
    landmarks && landmarks.length >= 478 ? landmarks : generateDemoLandmarks(variant);

  return {
    overallScore: overall,
    symmetry: f.symmetry,
    proportions: f.proportions,
    jawline: f.jawline,
    eyeSpacing: f.eyeSpacing,
    skinClarity: f.skinClarity,
    facialShape: f.facialShape,
    skinTone: f.skinTone,
    skinToneValue: f.skinToneValue,
    skinToneScaleId: f.skinToneScaleId,
    skinToneITA: f.skinToneITA,
    undertone: f.undertone,
    ageEstimation: f.ageEstimation,
    ageConfidence: 0.6 + (person.id.length % 3) * 0.06,
    ageBasis: "Synthetic demo mesh — landmark proportions only, no skin texture sampled",
    genderEstimation: f.genderEstimation,
    genderProfile: f.genderProfile,
    emotionDetected: f.emotionDetected,
    groomingSuggestions: f.groomingSuggestions,
    landmarks: mesh,
    goldenRatio: overall - 0.1,
    lipFullness: Math.round((f.symmetry - 0.2) * 10) / 10,
    noseProfile: Math.round((overall - 0.4) * 10) / 10,
    foreheadBalance: Math.round((overall - 0.2) * 10) / 10,
    cheekboneDefinition: Math.round((f.symmetry - 0.3) * 10) / 10,
    fwhr: Math.round((overall - 0.4) * 10) / 10,
    canthalTilt: Math.round((overall - 0.2) * 10) / 10,
    eyeNoseRatio: Math.round((overall - 0.5) * 10) / 10,
    noseChinRatio: Math.round((overall - 0.3) * 10) / 10,
    midfaceRatio: Math.round((overall - 0.3) * 10) / 10,
    horizontalFifths: Math.round((overall - 0.3) * 10) / 10,
    rawFwhr: 1.8 + (person.id.length % 4) * 0.07,
    rawCanthalTilt: 3.8 + (person.id.length % 3) * 0.5,
    rawEyeNoseRatio: 1.52 + (person.id.length % 4) * 0.03,
    facialHarmony: Math.round((overall - 0.1) * 10) / 10,
    breakdown,
    overallRating: ratingFor(overall),
    detailedAnalysis: f.detailedAnalysis,
    strengths: f.strengths,
    improvements: f.improvements,
    styleProfile: f.styleProfile,
    blendshapes: {
      emotion: f.emotionDetected,
      emotionConfidence: 86 + (person.id.length % 3) * 4,
      eyeOpenness: 0.88 + (person.id.length % 3) * 0.02,
      mouthOpenness: 0.1,
      browRaise: 0.2,
      smileIntensity: 0.15,
      headTilt: (person.id.length % 5) - 2,
    },
    percentile: {
      overall: Math.round(70 + (overall - 6) * 14),
      symmetry: Math.round(72 + f.symmetry * 2.6),
      goldenRatio: Math.round(74 + overall * 2.2),
      jawline: Math.round(76 + f.jawline * 2),
      skinClarity: Math.round(78 + f.skinClarity * 1.8),
      harmony: Math.round(75 + overall * 2),
      bracket: ratingFor(overall),
      comparisonText:
        "Your geometry places in ZERVEY's Excellent band — a score-based rating, not a population comparison.",
    },
    beautyIndex: Math.round(72 + overall * 1.7),
    faceShapeDetails: {
      description: `${f.facialShape} profile derived from ${person.name}'s sample photo — measurements are illustrative demo output.`,
      characteristics: [
        "Detected from the bundled sample geometry",
        "Per-person mesh, not a reused template",
        "Score-based styling guidance",
      ],
      idealHairstyles: [
        person.id === "kian" ? "Textured crops with height" : "Side-parted classics",
        "Layered face-framing cuts",
        "Clean tapered edges",
      ],
      idealGlasses: ["Round and rectangular frames", "Browline silhouettes", "Avoid overly wide frames"],
    },
    photoQualityScore: 90 + (person.id.length % 4) * 2,
    consistencyScore: 91 + (person.id.length % 5) * 2,
    analysisConfidence: 87 + (person.id.length % 3) * 3,
    photoCount: 1,
    symmetryAxis: { angleDeg: (person.id.length % 3) - 1 },
    qualityGate: {
      brightness: 0.7 + (person.id.length % 3) * 0.03,
      sharpness: 0.8 + (person.id.length % 4) * 0.02,
      faceSizeRatio: 0.38 + (person.id.length % 3) * 0.03,
      headRoll: 1,
      headPitch: 2,
      issues: [],
      warnings: [],
    },
  };
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
