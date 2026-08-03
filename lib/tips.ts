import type { FaceAnalysisResult, BodyAnalysisResult } from "@/store/analysis-store";

export const onboardingTips = [
  "Upload 2–3 front-facing photos of your face in good, even lighting for the most accurate Face IQ scan.",
  "All analysis runs entirely on your device via MediaPipe — no photo ever leaves your browser.",
  "Face the camera directly at eye level. Slight tilts reduce symmetry accuracy.",
  "After your first scan, every module (Style DNA, Color, Grooming, Try-On) unlocks with real data.",
  "Save analyses to history to build your Style Evolution Timeline over time.",
  "Your Style Score is generated only from your real measurements — no default placeholders.",
];

const SHAPE_TIPS: Record<string, string> = {
  Oval: "Your oval face accommodates nearly every frame and haircut. Emphasize the natural balance — avoid extremes in either direction.",
  Round: "Angular cuts add structure to a round face. A squared-off jawline or sharp side part reads as deliberate, not accidental.",
  Square: "Soften the angles. Rounder frames and textured crops take the edge off a square face and open up the eyes.",
  Oblong: "Balance length with width — mid-height side volume and horizontal accents like browline glasses shorten a long face.",
  Diamond: "Your widest point is the cheekbones. Low-volume crops and frames slightly wider than the cheekbones keep the focus there.",
  Heart: "Narrow the forehead visually. Chin-length layers and wider, bottom-heavy frames rebalance a heart-shaped face.",
  Triangle: "Add width at the temples. Textured top volume and frames that flare outward balance a wider jaw.",
  Rectangular: "Reduce vertical length with fringe and opt for rounded frames that cut the height of a long face.",
};

const UNDERTONE_TIPS: Record<string, string> = {
  cool: "Cool undertones pop against ivory and slate. Skip yellow-based whites — they wash you out.",
  warm: "Warm undertones glow in cream, camel, and olive. Avoid stark white and icy blue near the face.",
  neutral: "You straddle warm and cool — lean into jewel tones and split palettes that borrow from both sides.",
  olive: "Olive undertones shine in muted earth tones. High-saturation neons tend to fight your natural depth.",
};

const LOW_METRIC_TIPS: Record<string, (v: number) => string> = {
  symmetry: () =>
    "Your asymmetry is a feature, not a flaw — hairstyles with deliberate part lines reframe it as character.",
  jawline: () =>
    "Structured collars and higher necklines anchor the jaw. Crew necks can visually shorten it.",
  skinClarity: () =>
    "Your skin clarity benefits from morning light — schedule your next scan before noon for the best read.",
  eyeSpacing: () =>
    "Your eye spacing favors wider lapels. Double-breasted jackets will balance your proportions.",
  proportions: () =>
    "Vertical lines elongate the frame. Pinstripes and monochrome head-to-toe looks are your lever.",
  foreheadBalance: () =>
    "Textured fringe softens the forehead line and brings the eye back to your strongest feature.",
  lipFullness: () =>
    "Deeper lip tones read cleanly in photos. Matte formulations keep the focus on your natural line.",
  cheekboneDefinition: () =>
    "Side-swept hair or a subtle temple shadow draws the eye toward your cheekbone structure.",
};

const GROOMING_TIPS: Record<string, string> = {
  beard: "Your grooming report flagged beard maintenance — keep the neckline sharpened to hold jaw definition.",
  mustache: "Trim the mustache over the lip line to keep the smile area open and the jaw read clean.",
  hair: "Your grooming report recommends cutting the crown a half-inch shorter to tighten the silhouette.",
  skin: "Your grooming report suggests a mattifying layer on the T-zone — glossy finishes soften definition.",
  "skin care": "Your grooming report prioritizes moisture balance — apply serums before the morning scan window.",
};

export function getPersonalizedTips(
  face?: FaceAnalysisResult | null,
  body?: BodyAnalysisResult | null
): string[] {
  if (!face) return onboardingTips;

  const tips: string[] = [];

  const shapeTip = SHAPE_TIPS[face.facialShape];
  if (shapeTip) tips.push(shapeTip);

  const undertoneTip = UNDERTONE_TIPS[face.undertone?.toLowerCase() ?? ""];
  if (undertoneTip) tips.push(undertoneTip);

  const weakest = [...face.breakdown]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  for (const metric of weakest) {
    const factory = LOW_METRIC_TIPS[metric.label];
    if (factory) tips.push(factory(metric.score));
  }

  for (const suggestion of face.groomingSuggestions.slice(0, 3)) {
    const key = suggestion.toLowerCase();
    for (const [tag, tip] of Object.entries(GROOMING_TIPS)) {
      if (key.includes(tag)) {
        tips.push(tip);
        break;
      }
    }
  }

  if (body?.undertone && body.undertone !== face.undertone) {
    tips.push(
      `Your body scan measured a ${body.undertone} undertone — check TONE STUDIO to reconcile the two readings.`
    );
  }

  const unique = Array.from(new Set(tips));
  return unique.slice(0, 8);
}
