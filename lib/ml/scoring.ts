import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import {
  getFaceSymmetry,
  getFaceProportions,
  getJawlineScore,
  getEyeSpacingScore,
  getFacialShape,
} from "./face-analyzer";

export interface FaceScoreResult {
  overallScore: number;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyeSpacing: number;
  skinClarity: number;
  facialShape: string;
  breakdown: { label: string; score: number; weight: number }[];
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

  const metrics = [
    { label: "Facial Symmetry", score: symmetry, weight: 0.25 },
    { label: "Proportions", score: proportions, weight: 0.2 },
    { label: "Jawline", score: jawline, weight: 0.2 },
    { label: "Eye Spacing", score: eyeSpacing, weight: 0.15 },
    { label: "Skin Clarity", score: skinClarityScore, weight: 0.2 },
  ];

  const overallScore = metrics.reduce(
    (acc, m) => acc + m.score * m.weight,
    0
  );

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    symmetry: Math.round(symmetry * 10) / 10,
    proportions: Math.round(proportions * 10) / 10,
    jawline: Math.round(jawline * 10) / 10,
    eyeSpacing: Math.round(eyeSpacing * 10) / 10,
    skinClarity: Math.round(skinClarityScore * 10) / 10,
    facialShape,
    breakdown: metrics.map((m) => ({
      label: m.label,
      score: Math.round(m.score * 10) / 10,
      weight: m.weight,
    })),
  };
}

export function getGroomingSuggestions(
  facialShape: string,
  score: FaceScoreResult
): string[] {
  const suggestions: string[] = [];

  switch (facialShape) {
    case "Round":
      suggestions.push("Angular jawline-defining beard styles work well (e.g., Van Dyke, Anchor)");
      suggestions.push("Hairstyles with height on top add length to your face");
      suggestions.push("Avoid chin curtains that emphasize roundness");
      break;
    case "Square":
      suggestions.push("Short, well-groomed beards complement your strong jawline");
      suggestions.push("Textured crops or side parts enhance your angular features");
      suggestions.push("Avoid overly long beards that mask your jaw definition");
      break;
    case "Heart":
      suggestions.push("Chin-focused beards help balance a wider forehead");
      suggestions.push("Side-swept or textured fringe hairstyles work well");
      suggestions.push("Goatees or circle beards draw attention to the chin area");
      break;
    case "Oval":
      suggestions.push("Most beard and hairstyle choices suit your balanced proportions");
      suggestions.push("Classic styles like a full beard or side part work excellently");
      suggestions.push("Maintain your natural symmetry with regular grooming");
      break;
    case "Oblong":
      suggestions.push("Fuller beards on the sides help add width");
      suggestions.push("Avoid excessive height in hairstyles; opt for volume on sides");
      suggestions.push("Cheek-focused beards balance facial length");
      break;
    case "Diamond":
      suggestions.push("Chin straps and goatees complement narrow chin");
      suggestions.push("Fringe or side-swept hairstyles soften wider cheekbones");
      suggestions.push("Full beards can add volume to the chin area");
      break;
    default:
      suggestions.push("Maintain regular grooming routine for best appearance");
      suggestions.push("Keep beard edges clean and defined");
  }

  if (score.skinClarity < 6) {
    suggestions.push("Consider a skincare routine: cleanser, moisturizer, SPF daily");
    suggestions.push("Stay hydrated and get adequate sleep for skin health");
  }

  if (score.symmetry < 7) {
    suggestions.push("Strategic eyebrow grooming can improve perceived symmetry");
  }

  suggestions.push("Regular trims every 2-3 weeks keep beard shape sharp");
  suggestions.push("Use beard oil for healthy, well-conditioned facial hair");

  return suggestions;
}
