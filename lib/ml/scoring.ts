import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  getFaceSymmetry,
  getFaceProportions,
  getJawlineScore,
  getEyeSpacingScore,
  getFacialShape,
} from "./face-analyzer";

export interface FacialMetric {
  label: string;
  score: number;
  weight: number;
  description: string;
  rating: string;
  tip: string;
}

export interface FaceScoreResult {
  overallScore: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyeSpacing: number;
  skinClarity: number;
  facialShape: string;
  goldenRatio: number;
  lipFullness: number;
  noseProfile: number;
  foreheadBalance: number;
  cheekboneDefinition: number;
  facialHarmony: number;
  breakdown: FacialMetric[];
  overallRating: string;
  detailedAnalysis: string;
  strengths: string[];
  improvements: string[];
  styleProfile: string;
}

function scoreToRating(score: number): string {
  if (score >= 9.5) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 7.5) return "Very Good";
  if (score >= 6.5) return "Good";
  if (score >= 5.5) return "Above Average";
  if (score >= 4.5) return "Average";
  if (score >= 3.5) return "Below Average";
  return "Needs Work";
}

function scoreToDetailedLabel(score: number): string {
  if (score >= 9) return "Top 1% — runway-tier facial structure";
  if (score >= 8) return "Top 5% — striking, memorable features";
  if (score >= 7) return "Top 15% — above-average attractiveness";
  if (score >= 6) return "Top 30% — solid, well-proportioned face";
  if (score >= 5) return "Average — common facial proportions";
  if (score >= 4) return "Below average — room for improvement";
  return "Lower range — significant room for enhancement";
}

function getGoldenRatio(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const noseTip = landmarks[1];
  const chin = landmarks[152];
  const leftMouth = landmarks[61];
  const rightMouth = landmarks[291];

  const faceWidth = Math.abs(rightEye.x - leftEye.x);
  const faceLength = Math.abs(chin.y - landmarks[10].y);
  const widthToLength = faceWidth / faceLength;

  const upperThird = Math.abs(landmarks[10].y - landmarks[152].y) * 0.33;
  const midThird = Math.abs(landmarks[152].y - landmarks[152].y) * 0.33;
  const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
  const mouthToFaceWidth = mouthWidth / faceWidth;

  const idealRatio = 0.618;
  const deviation1 = Math.abs(widthToLength - idealRatio);
  const deviation2 = Math.abs(mouthToFaceWidth - 0.6);

  const score = 10 - (deviation1 * 15 + deviation2 * 8);
  return Math.max(1, Math.min(10, score));
}

function getLipFullness(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  const mouthTop = landmarks[0];
  const mouthBottom = landmarks[17];

  const lipHeight = Math.abs(lowerLip.y - upperLip.y);
  const mouthHeight = Math.abs(mouthBottom.y - mouthTop.y);
  const ratio = lipHeight / mouthHeight;

  const idealRatio = 0.55;
  const deviation = Math.abs(ratio - idealRatio);
  const score = 10 - (deviation * 20);
  return Math.max(2, Math.min(9.5, score));
}

function getNoseProfile(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const noseBridge = landmarks[6];
  const noseTip = landmarks[1];
  const noseWidth = Math.abs(landmarks[33].x - landmarks[263].x);
  const faceWidth = Math.abs(landmarks[263].x - landmarks[33].x);
  const noseToFace = noseWidth / faceWidth;

  const idealNoseRatio = 0.45;
  const deviation = Math.abs(noseToFace - idealNoseRatio);
  const score = 10 - (deviation * 18);
  return Math.max(2, Math.min(9.5, score));
}

function getForeheadBalance(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const hairline = landmarks[10];
  const browLine = landmarks[9];
  const noseBase = landmarks[2];
  const chin = landmarks[152];

  const upperThird = Math.abs(browLine.y - hairline.y);
  const middleThird = Math.abs(noseBase.y - browLine.y);
  const lowerThird = Math.abs(chin.y - noseBase.y);

  const avg = (upperThird + middleThird + lowerThird) / 3;
  const deviation = (
    Math.abs(upperThird - avg) +
    Math.abs(middleThird - avg) +
    Math.abs(lowerThird - avg)
  ) / (avg * 3);

  const score = 10 - (deviation * 25);
  return Math.max(2, Math.min(10, score));
}

function getCheekboneDefinition(result: FaceLandmarkerResult): number {
  const landmarks = result.faceLandmarks?.[0];
  if (!landmarks || landmarks.length < 468) return 5;

  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const leftJaw = landmarks[172];
  const rightJaw = landmarks[397];

  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const jawWidth = Math.abs(rightJaw.x - leftJaw.x);
  const cheekToJaw = cheekWidth / jawWidth;

  const score = cheekToJaw > 1.05 ? 8 + (cheekToJaw - 1.05) * 30 :
                cheekToJaw > 0.95 ? 6 + (cheekToJaw - 0.95) * 20 :
                4 + cheekToJaw * 2;
  return Math.max(2, Math.min(9.5, score));
}

function getStyleProfile(shape: string, scores: { symmetry: number; jawline: number; cheekbone: number }): string {
  const { symmetry, jawline, cheekbone } = scores;

  if (jawline >= 8 && cheekbone >= 8) return "Rugged Elegance";
  if (symmetry >= 8.5 && jawline >= 7) return "Classic Handsome";
  if (cheekbone >= 8 && symmetry >= 7) return "Editorial Sharp";
  if (jawline >= 7 && symmetry >= 6) return "Strong Structured";
  if (shape === "Heart" && symmetry >= 7) return "Romantic Lead";
  if (shape === "Oval" && symmetry >= 7.5) return "Versatile Classic";
  if (shape === "Square") return "Bold Masculine";
  if (shape === "Diamond") return "Angular Maverick";
  return "Everyman Appeal";
}

export function calculateFaceScore(
  result: FaceLandmarkerResult,
  skinClarityScore: number
): FaceScoreResult {
  const symmetry = getFaceSymmetry(result);
  const proportions = getFaceProportions(result);
  const jawline = getJawlineScore(result);
  const eyeSpacing = getEyeSpacingScore(result);
  const facialShape = getFacialShape(result);
  const goldenRatio = getGoldenRatio(result);
  const lipFullness = getLipFullness(result);
  const noseProfile = getNoseProfile(result);
  const foreheadBalance = getForeheadBalance(result);
  const cheekboneDefinition = getCheekboneDefinition(result);

  const facialHarmony = (goldenRatio + lipFullness + noseProfile + foreheadBalance + cheekboneDefinition) / 5;

  const metrics: FacialMetric[] = [
    {
      label: "Facial Symmetry",
      score: symmetry,
      weight: 0.18,
      description: "Balance between left and right sides of your face. Measured by comparing 10 bilateral landmark pairs against the nose centerline.",
      rating: scoreToRating(symmetry),
      tip: symmetry >= 7 ? "Your symmetry is a major asset — highlight it with centered hairstyles." : "Strategic eyebrow grooming and asymmetric hairstyles can enhance perceived balance.",
    },
    {
      label: "Golden Ratio Adherence",
      score: goldenRatio,
      weight: 0.15,
      description: "How closely your facial proportions match the φ (1.618) ideal. Measures face width-to-length ratio and mouth-to-face-width ratio.",
      rating: scoreToRating(goldenRatio),
      tip: goldenRatio >= 7 ? "Your proportions are mathematically harmonious — a rare trait." : "Most faces deviate from φ. Your unique ratios give character — lean into it.",
    },
    {
      label: "Jawline Definition",
      score: jawline,
      weight: 0.15,
      description: "Jaw angle sharpness, chin prominence, and jaw-to-face ratio. Strong jawlines signal structural confidence.",
      rating: scoreToRating(jawline),
      tip: jawline >= 7 ? "Your jawline is a defining feature. Keep it clean and well-groomed." : "Angular beard styles (Van Dyke, Anchor) can create the illusion of a sharper jawline.",
    },
    {
      label: "Proportional Harmony",
      score: proportions,
      weight: 0.12,
      description: "How evenly your face divides into upper, middle, and lower thirds. The ideal is equal thirds.",
      rating: scoreToRating(proportions),
      tip: proportions >= 7 ? "Your thirds are well-balanced — most hairstyles will suit you." : "Hairstyles that add volume to underrepresented thirds can create better visual balance.",
    },
    {
      label: "Eye Spacing",
      score: eyeSpacing,
      weight: 0.10,
      description: "Interpupillary distance relative to eye width. Ideal spacing is approximately one eye-width apart.",
      rating: scoreToRating(eyeSpacing),
      tip: eyeSpacing >= 7 ? "Your eye spacing is ideal for most eyewear and makeup styles." : "Glasses with wider frames can create the illusion of more balanced spacing.",
    },
    {
      label: "Skin Clarity",
      score: skinClarityScore,
      weight: 0.12,
      description: "Surface smoothness and evenness of skin tone. Measured by brightness variance across 7 facial zones.",
      rating: scoreToRating(skinClarityScore),
      tip: skinClarityScore >= 7 ? "Your skin texture is smooth — maintain with SPF and hydration." : "A consistent skincare routine (cleanser, exfoliant, moisturizer, SPF) can significantly improve this.",
    },
    {
      label: "Cheekbone Definition",
      score: cheekboneDefinition,
      weight: 0.08,
      description: "Prominence of cheekbones relative to jaw width. Higher cheek-to-jaw ratios create more angular, editorial features.",
      rating: scoreToRating(cheekboneDefinition),
      tip: cheekboneDefinition >= 7 ? "Your cheekbones are a standout feature — contour and lighting will love them." : "Highlighting techniques and angular hairstyles can enhance perceived cheekbone height.",
    },
    {
      label: "Lip Proportion",
      score: lipFullness,
      weight: 0.05,
      description: "Upper-to-lower lip ratio and fullness relative to facial area. Balanced lips contribute to overall facial harmony.",
      rating: scoreToRating(lipFullness),
      tip: "Your lip proportions contribute to your overall facial balance.",
    },
    {
      label: "Nose Profile",
      score: noseProfile,
      weight: 0.05,
      description: "Nose width relative to face width. The ideal nose-to-face width ratio is approximately 0.45.",
      rating: scoreToRating(noseProfile),
      tip: "Your nose proportions work with your facial structure for a cohesive look.",
    },
  ];

  const overallScore = metrics.reduce((acc, m) => acc + m.score * m.weight, 0);
  const roundedScore = Math.round(overallScore * 10) / 10;

  const strengths: string[] = [];
  const improvements: string[] = [];

  metrics.forEach((m) => {
    if (m.score >= 7.5) strengths.push(`${m.label} (${m.score.toFixed(1)}/10) — ${m.rating}`);
    if (m.score < 5.5) improvements.push(`${m.label} (${m.score.toFixed(1)}/10) — ${m.tip}`);
  });

  const styleProfile = getStyleProfile(facialShape, {
    symmetry,
    jawline,
    cheekbone: cheekboneDefinition,
  });

  const detailedAnalysis = scoreToDetailedLabel(roundedScore);

  return {
    overallScore: roundedScore,
    symmetry: Math.round(symmetry * 10) / 10,
    proportions: Math.round(proportions * 10) / 10,
    jawline: Math.round(jawline * 10) / 10,
    eyeSpacing: Math.round(eyeSpacing * 10) / 10,
    skinClarity: Math.round(skinClarityScore * 10) / 10,
    facialShape,
    goldenRatio: Math.round(goldenRatio * 10) / 10,
    lipFullness: Math.round(lipFullness * 10) / 10,
    noseProfile: Math.round(noseProfile * 10) / 10,
    foreheadBalance: Math.round(foreheadBalance * 10) / 10,
    cheekboneDefinition: Math.round(cheekboneDefinition * 10) / 10,
    facialHarmony: Math.round(facialHarmony * 10) / 10,
    breakdown: metrics.map((m) => ({
      ...m,
      score: Math.round(m.score * 10) / 10,
    })),
    overallRating: scoreToRating(roundedScore),
    detailedAnalysis,
    strengths,
    improvements,
    styleProfile,
  };
}

export function getGroomingSuggestions(
  facialShape: string,
  score: FaceScoreResult
): string[] {
  const suggestions: string[] = [];

  switch (facialShape) {
    case "Round":
      suggestions.push("Van Dyke or Anchor beard — adds angular definition to soft jawline");
      suggestions.push("Short sides + textured top hairstyle adds vertical length");
      suggestions.push("Avoid chin curtains and full rounded beards that emphasize circular shape");
      suggestions.push("Clean-shaven or light stubble on cheeks with defined chin hair works best");
      break;
    case "Square":
      suggestions.push("Short, well-groomed stubble complements your naturally strong jaw");
      suggestions.push("Textured crop or classic side part enhances angular bone structure");
      suggestions.push("Avoid overly long beards — they mask your best feature (the jaw)");
      suggestions.push("A light goatee or soul patch adds character without hiding structure");
      break;
    case "Heart":
      suggestions.push("Chin-focused styles (goatee, circle beard) balance your wider forehead");
      suggestions.push("Side-swept fringe or textured bangs soften the forehead line");
      suggestions.push("Fuller lower-face beards create visual balance with your forehead");
      suggestions.push("Avoid heavy sideburns that widen the upper face further");
      break;
    case "Oval":
      suggestions.push("Most styles work with your balanced proportions — you have freedom to experiment");
      suggestions.push("Classic full beard or well-maintained stubble both suit you");
      suggestions.push("Side parts and swept-back styles maintain your natural symmetry");
      suggestions.push("This is the most versatile face shape — use it to try trending styles");
      break;
    case "Oblong":
      suggestions.push("Fuller beards on the sides add width and shorten the face visually");
      suggestions.push("Avoid height in hairstyles — opt for volume on the sides");
      suggestions.push("Cheek-focused beards and sideburns balance facial length");
      suggestions.push("Medium-length styles with horizontal lines work well");
      break;
    case "Diamond":
      suggestions.push("Chin straps and goatees complement a narrow chin");
      suggestions.push("Fringe or side-swept styles soften wider cheekbones");
      suggestions.push("Full beards add volume to the chin area, balancing the cheekbone prominence");
      suggestions.push("Textured, messy styles work better than slick, tight ones");
      break;
    default:
      suggestions.push("Maintain regular grooming routine for best appearance");
      suggestions.push("Keep beard edges clean and defined for a polished look");
  }

  if (score.skinClarity < 6) {
    suggestions.push("Skincare priority: Start with a daily cleanser + SPF 30 moisturizer");
    suggestions.push("Exfoliate 2x/week. Drink 2-3L water daily. Sleep 7+ hours.");
    suggestions.push("Consider niacinamide for pore refinement and vitamin C for brightening");
  } else if (score.skinClarity < 7.5) {
    suggestions.push("Good skin foundation — add retinol 2x/week for texture refinement");
  }

  if (score.symmetry < 7) {
    suggestions.push("Eyebrow shaping can dramatically improve perceived facial symmetry");
    suggestions.push("Consider professional eyebrow threading or mapping for optimal arch");
  }

  if (score.jawline < 6) {
    suggestions.push("Chew gum daily to strengthen masseter muscles and define jawline");
    suggestions.push("Neck exercises (chin tucks, jaw juts) can improve jawline visibility");
  }

  suggestions.push("Trim beard edges every 2-3 weeks for maintained sharpness");
  suggestions.push("Use beard oil daily — argan or jojoba base for healthy, conditioned hair");
  suggestions.push("Match beard length to face shape: shorter for round, longer for long faces");

  return suggestions;
}
