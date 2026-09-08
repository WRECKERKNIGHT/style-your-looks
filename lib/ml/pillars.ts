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
  //
  // Each marker only contributes when it was actually measured — an
  // unavailable metric neither drags the spectrum toward neutral nor skews
  // it. When no marker resolved at all, the spectrum stays at the balanced
  // midpoint.
  const markers: number[] = [];
  if (faceResult.fwhr != null && Number.isFinite(faceResult.fwhr))
    markers.push(((faceResult.fwhr - 1.7) / 0.6) * 0.3); // wider, squarer faces
  if (faceResult.jawline != null && Number.isFinite(faceResult.jawline))
    markers.push(((faceResult.jawline - 5) / 5) * 0.25); // jaw strength
  if (faceResult.cheekboneDefinition != null && Number.isFinite(faceResult.cheekboneDefinition))
    markers.push(((faceResult.cheekboneDefinition - 5) / 5) * 0.15);
  if (faceResult.lipFullness != null && Number.isFinite(faceResult.lipFullness))
    markers.push(-((faceResult.lipFullness - 5) / 5) * 0.15);
  if (faceResult.canthalTilt != null && Number.isFinite(faceResult.canthalTilt))
    markers.push(-((faceResult.canthalTilt - 5) / 5) * 0.1);
  if (faceResult.eyeSpacing != null && Number.isFinite(faceResult.eyeSpacing))
    markers.push(-((faceResult.eyeSpacing - 5) / 5) * 0.05);

  const masculineSide = markers.filter((v) => v > 0).reduce((a, b) => a + b, 0);
  const feminineSide = -markers.filter((v) => v < 0).reduce((a, b) => a + b, 0);

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
      archetype = symmetry != null && symmetry >= 8 ? "The Scholar" : "The Classic";
      archetypeTagline = archetype === "The Scholar"
        ? "Balanced, considered features — quiet-intelligence appeal."
        : "Timeless proportions that never argue with a trend.";
      break;
    case "Romantic Lead":
      archetype = "The Romantic";
      archetypeTagline = "Soft contrast and warmth — leading-role charm.";
      break;
    default:
      archetype =
        facialShape === "Oval" &&
        jawline != null &&
        cheekboneDefinition != null &&
        jawline < 7 &&
        cheekboneDefinition < 7
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

  // Only measured sub-metrics enter a pillar. Their weights are renormalized
  // inside buildPillar, so an absent measurement never fabricates a score —
  // the pillar is simply built from the aspects the photos could resolve.
  const pMetric = (
    label: string,
    score: number | null,
    weight: number
  ): { label: string; score: number; weight: number } | null =>
    score != null && Number.isFinite(score) ? { label, score, weight } : null;

  const pair = (a: number | null, b: number | null): number | null =>
    a != null && b != null ? (a + b) / 2 : null;

  const harmony = buildPillar(
    "Harmony",
    "Feature balance: how evenly your features sit across the face — bilateral asymmetry, facial thirds, and overall proportionality against classical canons.",
    [
      pMetric("Feature Balance", faceResult.proportions, 0.2),
      pMetric("Left/Right Asymmetry", faceResult.symmetry, 0.3),
      pMetric("Nose–Lip Harmony", pair(faceResult.noseProjection, faceResult.upperLipRatio), 0.2),
      pMetric("Proportionality", pair(faceResult.goldenRatio, faceResult.horizontalFifths), 0.3),
    ].filter((m): m is { label: string; score: number; weight: number } => m != null)
  );

  const structure = buildPillar(
    "Structure",
    "The architectural layer: cheekbone prominence, jaw definition, chin balance and facial width relative to height.",
    [
      pMetric("Cheekbones", faceResult.cheekboneDefinition, 0.28),
      pMetric("Jaw", faceResult.jawline, 0.32),
      pMetric("Chin Balance", faceResult.noseChinRatio, 0.15),
      pMetric("Nose Profile", faceResult.noseProfile, 0.1),
      pMetric("Facial Width", faceResult.fwhr, 0.15),
    ].filter((m): m is { label: string; score: number; weight: number } => m != null)
  );

  const vital = buildPillar(
    "Vitality",
    "Surface signals of health and rest: skin clarity and evenness, plus expression energy around the eyes and mouth.",
    [
      pMetric("Skin Clarity", faceResult.skinClarity, 0.35),
      pMetric(
        "Skin Evenness",
        faceResult.skinClarity != null && faceResult.blendshapes != null
          ? Math.max(0, Math.min(10, faceResult.skinClarity * 0.9 + faceResult.blendshapes.smileIntensity * 1.5))
          : null,
        0.2
      ),
      pMetric(
        "Eye Energy",
        faceResult.blendshapes != null
          ? Math.round(Math.max(0, Math.min(10, faceResult.blendshapes.eyeOpenness * 9 + 1)) * 10) / 10
          : null,
        0.2
      ),
      pMetric(
        "Expression Vitality",
        faceResult.blendshapes != null
          ? Math.round(Math.max(0, Math.min(10, faceResult.blendshapes.smileIntensity * 7 + 3)) * 10) / 10
          : null,
        0.15
      ),
      pMetric(
        "Facial Fullness",
        faceResult.youthfulness != null
          ? Math.round(Math.max(0, Math.min(10, faceResult.youthfulness * 0.1)) * 10) / 10
          : null,
        0.1
      ),
    ].filter((m): m is { label: string; score: number; weight: number } => m != null)
  );

  const identityPillar = buildPillar(
    "Identity",
    "Where you sit on the masculine↔feminine spectrum and which facial archetype your geometry projects.",
    [
      pMetric("Spectrum Position", 10 - Math.abs(identity.spectrum - 50) / 5, 0.4),
      pMetric("Lip Character", faceResult.lipFullness, 0.2),
      pMetric("Eye Character", faceResult.canthalTilt, 0.2),
      pMetric("Eye Spacing", faceResult.eyeSpacing, 0.2),
    ].filter((m): m is { label: string; score: number; weight: number } => m != null)
  );

  const pillars = [harmony, structure, identityPillar, vital];
  const overall =
    Math.round((pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length) * 10) / 10;

  const improvements: ImprovementItem[] = [];

  if (faceResult.skinClarity != null && faceResult.skinClarity < 7) {
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

  if (faceResult.jawline != null && faceResult.jawline < 7) {
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

  if (faceResult.symmetry != null && faceResult.symmetry < 7.5) {
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

  if (faceResult.jawline != null && faceResult.jawline < 7) {
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

  if (faceResult.skinClarity != null && faceResult.skinClarity < 8) {
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

  if (faceResult.proportions != null && faceResult.proportions < 6.5) {
    improvements.push({
      id: "hairstyle-balance",
      title: "Hairstyle for Facial Balance",
      description: `Your ${faceResult.facialShape} face shape benefits from hairstyles that ${faceResult.proportions < 5 ? "add volume to underrepresented thirds" : "maintain your natural proportions"}. Consult the grooming tool for specific recommendations.`,
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
