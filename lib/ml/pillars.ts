import type { FaceScoreResult } from "./scoring";

export interface PillarScore {
  name: string;
  score: number;
  rating: string;
  metrics: { label: string; score: number; weight: number }[];
  description: string;
}

export interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "grooming" | "skincare" | "style" | "fitness" | "non-surgical";
  effort: "easy" | "moderate" | "significant";
  timeframe: string;
  pillar: string;
}

export interface PillarAnalysis {
  overall: number;
  pillars: PillarScore[];
  improvements: ImprovementItem[];
  projection: { current: number; potential: number; months: number };
}

function scoreToRating(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  if (score >= 6) return "Good";
  if (score >= 5) return "Average";
  if (score >= 4) return "Below Average";
  return "Needs Work";
}

export function calculatePillarAnalysis(faceResult: FaceScoreResult): PillarAnalysis {
  const harmony: PillarScore = {
    name: "Harmony",
    score: Math.round(((faceResult.goldenRatio + faceResult.symmetry + faceResult.proportions + faceResult.facialHarmony + faceResult.foreheadBalance) / 5) * 10) / 10,
    rating: "",
    metrics: [
      { label: "Golden Ratio", score: faceResult.goldenRatio, weight: 0.25 },
      { label: "Symmetry", score: faceResult.symmetry, weight: 0.25 },
      { label: "Proportions", score: faceResult.proportions, weight: 0.2 },
      { label: "Facial Harmony", score: faceResult.facialHarmony, weight: 0.15 },
      { label: "Forehead Balance", score: faceResult.foreheadBalance, weight: 0.15 },
    ],
    description: "Measures the proportional balance and mathematical harmony of your facial features.",
  };
  harmony.rating = scoreToRating(harmony.score);

  const angularity: PillarScore = {
    name: "Angularity",
    score: Math.round(((faceResult.jawline + faceResult.cheekboneDefinition + faceResult.noseProfile) / 3) * 10) / 10,
    rating: "",
    metrics: [
      { label: "Jawline Definition", score: faceResult.jawline, weight: 0.45 },
      { label: "Cheekbone Definition", score: faceResult.cheekboneDefinition, weight: 0.35 },
      { label: "Nose Profile", score: faceResult.noseProfile, weight: 0.2 },
    ],
    description: "Evaluates jawline sharpness, bone structure definition, and angular features.",
  };
  angularity.rating = scoreToRating(angularity.score);

  const dimorphism: PillarScore = {
    name: "Dimorphism",
    score: Math.round(((faceResult.lipFullness + faceResult.eyeSpacing + faceResult.overallScore * 0.3) / 2.3) * 10) / 10,
    rating: "",
    metrics: [
      { label: "Lip Proportion", score: faceResult.lipFullness, weight: 0.35 },
      { label: "Eye Spacing", score: faceResult.eyeSpacing, weight: 0.35 },
      { label: "Facial Shape", score: faceResult.overallScore * 0.9, weight: 0.3 },
    ],
    description: "Assesses gender-specific facial traits and feature prominence.",
  };
  dimorphism.rating = scoreToRating(dimorphism.score);

  const health: PillarScore = {
    name: "Health",
    score: faceResult.skinClarity,
    rating: "",
    metrics: [
      { label: "Skin Clarity", score: faceResult.skinClarity, weight: 0.6 },
      { label: "Blendshape Vitality", score: Math.round((faceResult.blendshapes.smileIntensity * 8 + 2) * 10) / 10, weight: 0.4 },
    ],
    description: "Indicates skin health, texture quality, and overall vitality indicators.",
  };
  health.rating = scoreToRating(health.score);

  const pillars = [harmony, angularity, dimorphism, health];
  const overall = Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length * 10) / 10;

  const improvements: ImprovementItem[] = [];

  if (faceResult.skinClarity < 7) {
    improvements.push({
      id: "skincare-basic",
      title: "Establish Daily Skincare Routine",
      description: "Start with a gentle cleanser, niacinamide serum, moisturizer, and SPF 30. This single habit can improve skin clarity by 1-2 points within 8 weeks.",
      impact: "high",
      category: "skincare",
      effort: "easy",
      timeframe: "8 weeks",
      pillar: "Health",
    });
  }

  if (faceResult.jawline < 7) {
    improvements.push({
      id: "jawline-exercise",
      title: "Jawline Definition Exercises",
      description: "Daily mewing (proper tongue posture), jaw resistance exercises, and chewing gum can strengthen masseter muscles and improve jawline definition over 3-6 months.",
      impact: "medium",
      category: "fitness",
      effort: "moderate",
      timeframe: "3-6 months",
      pillar: "Angularity",
    });
  }

  if (faceResult.symmetry < 7.5) {
    improvements.push({
      id: "eyebrow-shaping",
      title: "Professional Eyebrow Shaping",
      description: "Well-shaped eyebrows can dramatically improve perceived facial symmetry. Consider professional threading or microblading for a more balanced look.",
      impact: "high",
      category: "grooming",
      effort: "easy",
      timeframe: "1 week",
      pillar: "Harmony",
    });
  }

  if (faceResult.jawline < 7) {
    improvements.push({
      id: "beard-strategic",
      title: "Strategic Beard Styling",
      description: `For your ${faceResult.facialShape} face shape, a ${faceResult.facialShape === "Round" ? "Van Dyke or Anchor beard" : "well-groomed short beard"} can create the illusion of a sharper jawline and more angular features.`,
      impact: "high",
      category: "grooming",
      effort: "easy",
      timeframe: "2-4 weeks",
      pillar: "Angularity",
    });
  }

  if (faceResult.skinClarity < 8) {
    improvements.push({
      id: "skincare-advanced",
      title: "Add Retinol & Vitamin C",
      description: "After establishing basics, add retinol 2x/week for texture refinement and vitamin C serum in the morning for brightening and antioxidant protection.",
      impact: "medium",
      category: "skincare",
      effort: "moderate",
      timeframe: "12 weeks",
      pillar: "Health",
    });
  }

  improvements.push({
    id: "style-color",
    title: "Optimize Color Palette",
    description: `Your analysis suggests a ${faceResult.styleProfile} profile. Use the Tone Studio tool to find your seasonal palette and choose clothing colors that complement your skin tone.`,
    impact: "medium",
    category: "style",
    effort: "easy",
    timeframe: "Immediate",
    pillar: "Harmony",
  });

  if (faceResult.foreheadBalance < 6.5) {
    improvements.push({
      id: "hairstyle-balance",
      title: "Hairstyle for Facial Balance",
      description: `Your ${faceResult.facialShape} face shape benefits from hairstyles that ${faceResult.foreheadBalance < 5 ? "add volume to the sides to balance your forehead" : "maintain your natural proportions"}. Consult the grooming tool for specific recommendations.`,
      impact: "medium",
      category: "grooming",
      effort: "easy",
      timeframe: "Immediate",
      pillar: "Harmony",
    });
  }

  improvements.push({
    id: "posture-confidence",
    title: "Posture & Confidence Training",
      description: "Good posture (shoulders back, chin level) can improve how your jawline and facial structure appear. Practice chin tucks and neck stretches daily.",
    impact: "low",
    category: "fitness",
    effort: "easy",
    timeframe: "4 weeks",
    pillar: "Angularity",
  });

  improvements.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  const potentialGain = improvements.filter((i) => i.impact === "high").length * 0.5 +
    improvements.filter((i) => i.impact === "medium").length * 0.25;
  const potential = Math.min(10, overall + potentialGain);

  return {
    overall,
    pillars,
    improvements,
    projection: {
      current: overall,
      potential: Math.round(potential * 10) / 10,
      months: 6,
    },
  };
}
