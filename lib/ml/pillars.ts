import type { FaceScoreResult } from "./scoring";

export interface PillarScore {
  name: string;
  score: number;
  rating: string;
  /** Realistic ceiling if the weakest sub-metrics were improved. */
  potential: number;
  metrics: { label: string; score: number; weight: number }[];
  description: string;
}

export interface IdentityProfile {
  /** Position on the masculine↔feminine styling spectrum, 0–100. */
  spectrum: number;
  spectrumLabel: string;
  archetype: string;
  archetypeTagline: string;
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
  identity: IdentityProfile;
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

/**
 * A pillar's realistic ceiling: lift the two weakest sub-metrics by a
 * fraction of their headroom. Bounded and honest — grooming can move
 * soft-tissue presentation, not bone.
 */
function potentialOf(score: number, metrics: { score: number }[]): number {
  const sorted = [...metrics].sort((a, b) => a.score - b.score).slice(0, 2);
  const headroom = sorted.reduce((acc, m) => acc + (10 - m.score), 0);
  return Math.min(10, Math.round((score + headroom * 0.3) * 10) / 10);
}

function buildPillar(
  name: string,
  description: string,
  metrics: { label: string; score: number; weight: number }[]
): PillarScore {
  const totalWeight = metrics.reduce((a, m) => a + m.weight, 0) || 1;
  const score =
    Math.round(
      (metrics.reduce((acc, m) => acc + m.score * m.weight, 0) / totalWeight) * 10
    ) / 10;
  return {
    name,
    description,
    score,
    rating: scoreToRating(score),
    potential: potentialOf(score, metrics),
    metrics,
  };
}

function deriveIdentity(faceResult: FaceScoreResult): IdentityProfile {
  // Structural markers associated with masculine presentation (FWHR, jaw
  // dominance) vs feminine presentation (lip fullness, positive canthal tilt,
  // eye spacing). Blended with the user's chosen analysis profile so the
  // spectrum reflects both geometry and self-identification.
  const masculineSide =
    ((faceResult.fwhr - 1.7) / 0.6) * 0.3 +          // wider, squarer faces
    ((faceResult.jawline - 5) / 5) * 0.25 +           // jaw strength
    ((faceResult.cheekboneDefinition - 5) / 5) * 0.15;
  const feminineSide =
    ((faceResult.lipFullness - 5) / 5) * 0.15 +
    ((faceResult.canthalTilt - 5) / 5) * 0.1 +
    ((faceResult.eyeSpacing - 5) / 5) * 0.05;

  let spectrum = 50 + (masculineSide - feminineSide) * 50;
  spectrum = Math.max(0, Math.min(100, Math.round(spectrum)));
  const spectrumLabel =
    spectrum >= 70 ? "Strongly Masculine"
    : spectrum >= 58 ? "Masculine Lean"
    : spectrum > 42 ? "Balanced Androgynous"
    : spectrum > 30 ? "Feminine Lean"
    : "Strongly Feminine";

  const { styleProfile, facialShape, symmetry, jawline, cheekboneDefinition } = faceResult;
  let archetype = "The Classic";
  let archetypeTagline = "Timeless proportions that never argue with a trend.";
  switch (styleProfile) {
    case "Rugged Elegance":
    case "Bold Masculine":
      archetype = "The Hero";
      archetypeTagline = "Strong jaw, high structure — presence without saying a word.";
      break;
    case "Editorial Sharp":
    case "Angular Maverick":
      archetype = "The Sharp";
      archetypeTagline = "Angles that photograph like architecture.";
      break;
    case "Strong Structured":
      archetype = "The Model";
      archetypeTagline = "Editorial bone structure built for strong silhouettes.";
      break;
    case "Classic Handsome":
    case "Versatile Classic":
      archetype = symmetry >= 8 ? "The Scholar" : "The Classic";
      archetypeTagline = archetype === "The Scholar"
        ? "Balanced, considered features — quiet-intelligence appeal."
        : "Timeless proportions that never argue with a trend.";
      break;
    case "Romantic Lead":
      archetype = "The Romantic";
      archetypeTagline = "Soft contrast and warmth — leading-role charm.";
      break;
    default:
      archetype = facialShape === "Oval" && jawline < 7 && cheekboneDefinition < 7
        ? "The Boy-Next-Door"
        : "The Classic";
      archetypeTagline = archetype === "The Boy-Next-Door"
        ? "Approachable, easy symmetry — the face people trust instantly."
        : "Timeless proportions that never argue with a trend.";
  }

  return { spectrum, spectrumLabel, archetype, archetypeTagline };
}

export function calculatePillarAnalysis(faceResult: FaceScoreResult): PillarAnalysis {
  const identity = deriveIdentity(faceResult);

  const harmony = buildPillar(
    "Harmony",
    "Feature balance: how evenly your features sit across the face — bilateral asymmetry, facial thirds, and overall proportionality against classical canons.",
    [
      { label: "Feature Balance", score: faceResult.proportions, weight: 0.2 },
      { label: "Left/Right Asymmetry", score: faceResult.symmetry, weight: 0.3 },
      { label: "Facial Thirds", score: faceResult.foreheadBalance, weight: 0.2 },
      { label: "Proportionality", score: (faceResult.goldenRatio + faceResult.horizontalFifths) / 2, weight: 0.3 },
    ]
  );

  const structure = buildPillar(
    "Structure",
    "The architectural layer: cheekbone prominence, jaw definition, chin balance and facial width relative to height.",
    [
      { label: "Cheekbones", score: faceResult.cheekboneDefinition, weight: 0.28 },
      { label: "Jaw", score: faceResult.jawline, weight: 0.32 },
      { label: "Chin Balance", score: faceResult.noseChinRatio, weight: 0.15 },
      { label: "Midface", score: faceResult.midfaceRatio, weight: 0.1 },
      { label: "Facial Width", score: faceResult.fwhr, weight: 0.15 },
    ]
  );

  const vital = buildPillar(
    "Vitality",
    "Surface signals of health and rest: skin clarity and evenness, plus expression energy around the eyes and mouth.",
    [
      { label: "Skin Clarity", score: faceResult.skinClarity, weight: 0.45 },
      { label: "Skin Evenness", score: faceResult.skinClarity, weight: 0.2 },
      {
        label: "Eye Energy",
        score: Math.round((faceResult.blendshapes.eyeOpenness * 8 + 2) * 10) / 10,
        weight: 0.2,
      },
      {
        label: "Expression Vitality",
        score: Math.round((faceResult.blendshapes.smileIntensity * 8 + 2) * 10) / 10,
        weight: 0.15,
      },
    ]
  );

  const identityPillar = buildPillar(
    "Identity",
    "Where you sit on the masculine↔feminine spectrum and which facial archetype your geometry projects.",
    [
      { label: "Spectrum Position", score: 10 - Math.abs(identity.spectrum - 50) / 5, weight: 0.4 },
      { label: "Lip Character", score: faceResult.lipFullness, weight: 0.2 },
      { label: "Eye Character", score: faceResult.canthalTilt, weight: 0.2 },
      { label: "Eye Spacing", score: faceResult.eyeSpacing, weight: 0.2 },
    ]
  );

  const pillars = [harmony, structure, identityPillar, vital];
  const overall =
    Math.round((pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length) * 10) / 10;

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
      pillar: "Vitality",
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
      pillar: "Structure",
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
      pillar: "Structure",
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
      pillar: "Vitality",
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
    pillar: "Identity",
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
    pillar: "Structure",
  });

  improvements.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  const potentialGain =
    improvements.filter((i) => i.impact === "high").length * 0.5 +
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
    identity,
  };
}
