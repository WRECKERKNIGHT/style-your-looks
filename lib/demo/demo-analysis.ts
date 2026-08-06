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

/** Every bundled demo asset. Demo results must never be treated as a photo of you. */
export const DEMO_MEDIA: readonly string[] = [
  DEMO_FACE_PHOTO,
  DEMO_BODY_PHOTO,
  DEMO_SKIN_PHOTO,
];

/** True when a media URL points at a bundled demo sample. */
export function isDemoPhoto(url: string | null | undefined): boolean {
  return url != null && DEMO_MEDIA.includes(url);
}

function demoMetric(label: string, weight: number, description: string, tip: string, score: number, value?: string): FacialMetric {
  const rating = score >= 8 ? "Excellent" : score >= 7 ? "Strong" : score >= 6 ? "Good" : score >= 5 ? "Fair" : "Needs focus";
  return { label, weight, description, tip, score, rating, value, spread: 0.15 };
}

export function generateDemoLandmarks(): number[][] {
  const rings: [number, number, number, number, number, number][] = [
    [0.5, 0.55, 0.26, 0.33, 96, 0],
    [0.5, 0.51, 0.19, 0.24, 88, 0.4],
    [0.5, 0.5, 0.12, 0.15, 92, 1.2],
    [0.5, 0.5, 0.06, 0.075, 96, 2.1],
    [0.5, 0.5, 0.028, 0.03, 78, 3.0],
    [0.5, 0.47, 0.008, 0.01, 28, 0.9],
  ];
  const pts: number[][] = [];
  for (const [cx, cy, rx, ry, n, phase] of rings) {
    for (let i = 0; i < n && pts.length < 478; i++) {
      const a = (i / n) * Math.PI * 2 + phase;
      const jitter = 0.004 * Math.sin((i * 13 + phase * 7) % Math.PI);
      const radial = rx / 0.26;
      pts.push([
        Math.max(0.02, Math.min(0.98, cx + Math.cos(a) * rx + jitter)),
        Math.max(0.02, Math.min(0.98, cy + Math.sin(a) * ry * 0.9 + jitter)),
        -radial * 0.55 + 0.3 * Math.cos(a) * radial,
      ]);
    }
  }
  while (pts.length < 478) pts.push([0.5, 0.5, -0.12]);
  return pts.slice(0, 478);
}

export function buildDemoFaceResult(): FaceAnalysisResult {
  const breakdown = [
    demoMetric("Facial Symmetry", 0.18, "Balance between left and right sides of your face.", "Centered hairstyles frame symmetry well.", 8.4),
    demoMetric("Golden Ratio Adherence", 0.14, "How closely your facial proportions match the φ ideal.", "Your proportions are mathematically harmonious.", 8.1, "Ratio 1.62 (ideal ≈ 1.62)"),
    demoMetric("Jawline Definition", 0.15, "Jaw angle sharpness and chin prominence.", "A defining feature — keep it clean.", 8.3),
    demoMetric("Proportional Harmony", 0.12, "How evenly your face divides into thirds.", "Your thirds are well balanced.", 8.2),
    demoMetric("Horizontal Fifths", 0.08, "Even division of the face into five widths.", "Eye placement is balanced.", 7.9),
    demoMetric("Eye Spacing", 0.08, "Interpupillary distance relative to eye width.", "Ideal spacing for most eyewear.", 8.5),
    demoMetric("Skin Clarity", 0.1, "Surface smoothness and evenness of tone.", "Maintain with SPF and hydration.", 8.6),
    demoMetric("Cheekbone Definition", 0.07, "Prominence of cheekbones relative to jaw.", "A standout feature.", 8.2),
    demoMetric("FWHR (Facial Width-to-Height)", 0.03, "Bizygomatic width over upper-lip-to-brow height.", "In the researched attractive range.", 7.8, "Ratio 1.93 (ideal ≈ 1.95)"),
    demoMetric("Canthal Tilt", 0.02, "Angle of the line between inner and outer eye corners.", "A positive tilt reads as alert.", 8.0, "+4.8° (ideal ≈ +5°)"),
    demoMetric("Eye–Nose Ratio", 0.02, "Eye width relative to nose width.", "Mathematically harmonious.", 7.7, "Ratio 1.60 (ideal ≈ 1.62)"),
    demoMetric("Lip Proportion", 0.01, "Upper-to-lower lip ratio and fullness.", "Contribues to overall balance.", 8.1),
  ];

  return {
    overallScore: 8.2,
    symmetry: 8.4,
    proportions: 8.2,
    jawline: 8.3,
    eyeSpacing: 8.5,
    skinClarity: 8.6,
    facialShape: "Oval",
    skinTone: "Light",
    undertone: "Neutral",
    ageEstimation: 27,
    genderEstimation: "Neutral",
    genderProfile: "neutral",
    emotionDetected: "Neutral",
    groomingSuggestions: [
      "Keep eyebrows groomed to hold the face frame",
      "Light stubble sharpens the jawline further",
      "Hydrating skincare keeps the skin-clarity edge",
    ],
    landmarks: generateDemoLandmarks(),
    goldenRatio: 8.1,
    lipFullness: 8.1,
    noseProfile: 7.8,
    foreheadBalance: 8.0,
    cheekboneDefinition: 8.2,
    fwhr: 7.8,
    canthalTilt: 8.0,
    eyeNoseRatio: 7.7,
    noseChinRatio: 8.0,
    midfaceRatio: 7.9,
    horizontalFifths: 7.9,
    rawFwhr: 1.93,
    rawCanthalTilt: 4.8,
    rawEyeNoseRatio: 1.6,
    facialHarmony: 8.1,
    breakdown,
    overallRating: "Excellent",
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
    styleProfile: "Editorial Classic",
    blendshapes: {
      emotion: "Neutral",
      emotionConfidence: 92,
      eyeOpenness: 0.9,
      mouthOpenness: 0.1,
      browRaise: 0.2,
      smileIntensity: 0.15,
      headTilt: 2,
    },
    percentile: {
      overall: 89,
      symmetry: 92,
      goldenRatio: 87,
      jawline: 88,
      skinClarity: 90,
      harmony: 86,
      bracket: "TOP 10%",
      comparisonText:
        "Your geometry ranks in the 89th percentile — you place in the top tier of analysed faces.",
    },
    beautyIndex: 86,
    faceShapeDetails: {
      description:
        "An oval face is proportioned so the length is about one and a half times the width. The jaw softly rounds toward the chin, and the forehead is slightly wider than the jaw.",
      characteristics: [
        "Balanced, slightly longer than wide",
        "Softly rounded chin",
        "Gentle taper from forehead to jaw",
      ],
      idealHairstyles: [
        "Textured crops with height",
        "Side-parted classics",
        "Shoulder-length layers",
      ],
      idealGlasses: ["Round and rectangular frames", "Browline silhouettes", "Avoid overly wide frames"],
    },
    photoQualityScore: 94,
    consistencyScore: 96,
    analysisConfidence: 91,
    photoCount: 2,
    symmetryAxis: { angleDeg: 1.2 },
    qualityGate: {
      brightness: 0.72,
      sharpness: 0.81,
      faceSizeRatio: 0.42,
      headRoll: 1.2,
      headPitch: 2.1,
      issues: [],
      warnings: [],
    },
  };
}

export function buildDemoBodyResult(): { result: BodyAnalysisResult; recommendations: OutfitRecommendation[] } {
  const result: BodyAnalysisResult = {
    bodyType: "Mesomorph",
    skinToneScale: "Type II",
    skinToneValue: "#C89D7C",
    undertone: "Warm",
    shoulderWidth: 1.3,
    waistWidth: 0.85,
    hipWidth: 0.98,
    shoulderToWaistRatio: 1.53,
    waistToHipRatio: 0.87,
    bodyProportionScore: 8.4,
    bodySymmetry: 8.6,
    recommendations: [
      "Fitted knits and structured shoulders emphasise the V-taper",
      "Tapered trousers balance the natural shoulder width",
      "Layer with bomber jackets for a clean athletic line",
    ],
  };

  const recommendations: OutfitRecommendation[] = [
    {
      id: "demo-1",
      name: "The V-Taper Tee",
      description: "A structured crew-neck tee with a subtle shoulder seam that mirrors the natural V-taper.",
      colors: ["#CCA066", "#F3EAD9", "#241812"],
      occasion: "Everyday",
      mannequinPreview: [],
      reasoning: "Crew-necks balance the jaw-to-shoulder line; the warm palette lifts the skin undertone.",
      keyPieces: ["Crew-neck tee", "Slim chinos", "Leather sneakers"],
      season: "All season",
      styleType: "Classic",
    },
    {
      id: "demo-2",
      name: "Linen Layer Edit",
      description: "A relaxed linen overshirt over a fitted tank for a warm-weather layered silhouette.",
      colors: ["#C89D7C", "#E5D5BD", "#8A5F3D"],
      occasion: "Casual / vacation",
      mannequinPreview: [],
      reasoning: "Linen's soft drape softens the athletic frame while the warm neutrals echo the undertone.",
      keyPieces: ["Linen overshirt", "Fitted tank", "Tapered chinos"],
      season: "Warm weather",
      styleType: "Relaxed",
    },
    {
      id: "demo-3",
      name: "The Tailored Field Jacket",
      description: "A cropped field jacket with a defined waist that keeps the chest wide and the core sharp.",
      colors: ["#6F4A30", "#573A27", "#CCA066"],
      occasion: "Smart casual",
      mannequinPreview: [],
      reasoning: "A waist-defining outer layer protects the 1.53 shoulder-to-waist ratio.",
      keyPieces: ["Field jacket", "Oxford shirt", "Straight denim"],
      season: "Cool weather",
      styleType: "Smart",
    },
  ];

  return { result, recommendations };
}

export function buildDemoColorResult() {
  return analyzeColorSeason({ undertone: "Neutral", ita: 35, monkScaleId: 4 });
}
