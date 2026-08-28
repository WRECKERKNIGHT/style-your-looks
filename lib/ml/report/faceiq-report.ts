import type { RawGeometry, Measurement } from '../face-analyzer';
import { percentileFromZ, gradeFromPercentile, comparisonFromPercentile } from '../calibration';
import { rangeScore } from '../scoring-curves';

/**
 * FaceIQ Report — a FaceIQ-Labs-style report built on the honest measurement
 * layer (RawGeometry). Unlike the legacy domain/breakdown pipeline, this is a
 * self-contained report grouped into 4 pillars with per-metric data, gender
 * benchmarks, view gating and a prioritized action plan.
 *
 * This is a NEW report. The legacy AnalysisResults/scoring pipeline is kept
 * untouched as a fallback.
 */

export type ReportProfile = 'masculine' | 'feminine' | 'neutral';
export type ViewType = 'frontal' | 'profile' | 'unknown';

export interface ReportMetric {
  key: string;
  label: string;
  pillar: PillarId;
  /** 0-10 score (higher = closer to preferred population band). */
  score: number;
  /** Population percentile 0-100. */
  percentile: number;
  raw: number | null;
  /** Engineering unit of the raw value, e.g. ratio / degrees. */
  unit: string;
  mu: number | null;
  sigma: number | null;
  z: number | null;
  /** 0-1 how confident this measurement is (0 = not available for this view). */
  confidence: number;
  /** Reference range the measurement is compared against. */
  refRange: string;
  description: string;
  tip: string;
  /** Whether this metric can be improved (soft) vs. fixed bone structure. */
  changeable: boolean;
  /** Larger z magnitude = more room to move for the action plan. */
  potential: number;
  genderSensitive: boolean;
}

export interface Pillar {
  id: PillarId;
  label: string;
  short: string;
  description: string;
  /** 0-10 score. */
  score: number;
  /** 0-100 percentile. */
  percentile: number;
  metrics: ReportMetric[];
  weight: number;
}

export type PillarId = 'harmony' | 'angularity' | 'dimorphism' | 'features';

export interface ActionItem {
  metricKey: string;
  label: string;
  pillar: PillarId;
  current: string;
  target: string;
  /** Estimated 0-10 uplift if this metric moved to its target. */
  potential: number;
  priority: number;
  tip: string;
  changeable: boolean;
}

export interface FaceIQReport {
  hero: {
    score: number;
    percentile: number;
    grade: string;
    gradeLabel: string;
    comparison: string;
    beautyIndex: number;
  };
  pillars: Pillar[];
  actions: ActionItem[];
  signatureStrengths: ReportMetric[];
  biggestOpportunity: ActionItem | null;
  shape: string;
  shapeProbabilities: Record<string, number>;
  view: ViewType;
  profile: ReportProfile;
  metricsAvailable: number;
  metricsTotal: number;
  confidence: number;
  /** structural vs soft split (0-10 each) */
  structuralScore: number;
  softScore: number;
}

/** Gender-specific reference overrides for dimorphic metrics. */
const GENDER_REFS: Record<ReportProfile, Partial<Record<string, { mu: number; sigma: number }>>> = {
  masculine: {
    fwhr: { mu: 2.0, sigma: 0.15 },
    gonialAngle: { mu: 110, sigma: 9 },
    jawRatio: { mu: 0.64, sigma: 0.05 },
    browTilt: { mu: 6, sigma: 4 },
    upperLipRatio: { mu: 0.34, sigma: 0.05 },
    lipFullness: { mu: 0.5, sigma: 0.08 },
    canthalTilt: { mu: 4, sigma: 3 },
    cheekboneDefinition: { mu: 1.16, sigma: 0.06 },
  },
  feminine: {
    fwhr: { mu: 1.8, sigma: 0.12 },
    gonialAngle: { mu: 115, sigma: 8 },
    jawRatio: { mu: 0.58, sigma: 0.05 },
    browTilt: { mu: 9, sigma: 4 },
    upperLipRatio: { mu: 0.42, sigma: 0.05 },
    lipFullness: { mu: 0.62, sigma: 0.08 },
    canthalTilt: { mu: 5.5, sigma: 3 },
    cheekboneDefinition: { mu: 1.2, sigma: 0.06 },
  },
  neutral: {},
};

const RATIO_LABEL = 'ratio';
const DEG_LABEL = '°';

interface MetricSpec {
  key: string;
  label: string;
  pillar: PillarId;
  get: (g: RawGeometry) => Measurement | null;
  description: string;
  tip: string;
  changeable?: boolean;
  genderSensitive?: boolean;
  /** For 0-centered metrics where deviation magnitude is what matters. */
  twoSided?: boolean;
}

const SPECS: MetricSpec[] = [
  // ── HARMONY ──────────────────────────────────────────────
  {
    key: 'goldenRatio',
    label: 'Golden Ratio',
    pillar: 'harmony',
    get: (g) => g.goldenRatio,
    description:
      'How closely your whole-face and mouth-to-nose proportions approximate the golden ratio φ ≈ 1.618.',
    tip: 'Golden-ratio adherence mostly reflects bone structure; styling (hair volume, brow shape) can gently nudge perceived proportions.',
  },
  {
    key: 'faceRatio',
    label: 'Face Length / Width',
    pillar: 'harmony',
    get: (g) => g.faceRatio,
    description:
      'Ratio of facial height to width. Near the population mean it reads as balanced and proportionate.',
    tip: 'Hairstyle can visually alter how long or wide your face reads more than your actual bone ratio.',
    changeable: true,
  },
  {
    key: 'verticalBalance',
    label: 'Facial Thirds Balance',
    pillar: 'harmony',
    get: (g) => g.verticalBalance,
    twoSided: true,
    description:
      'How evenly your face divides into forehead, nose and jaw thirds. Small deviations are normal.',
    tip: 'Bang/parting choice and brow line define the perceived forehead third.',
    changeable: true,
  },
  {
    key: 'horizontalFifths',
    label: 'Horizontal Fifths',
    pillar: 'harmony',
    get: (g) => g.horizontalFifths,
    twoSided: true,
    description:
      'Balance across the five eye-width columns of the face. Low deviation = even spacing.',
    tip: 'Whether your eyes sit wide, close, or centered is structural, but makeup and brow grooming alter perceived spacing.',
    changeable: true,
  },
  {
    key: 'fwhr',
    label: 'FWHR (Width-to-Height)',
    pillar: 'harmony',
    get: (g) => g.fwhr,
    description:
      'Facial width relative to upper-facial height. The preferred FWHR shifts by gender — see your profile benchmark.',
    tip: 'Body-fat level changes facial width meaningfully; FWHR rises as overall leanness and lower-face definition improve.',
    changeable: true,
    genderSensitive: true,
  },
  {
    key: 'eyeSpacing',
    label: 'Eye Spacing',
    pillar: 'harmony',
    get: (g) => g.eyeSpacing,
    description:
      'Inter-ocular gap relative to eye width. Near 1.1 (one eye-width apart) reads proportionate.',
    tip: 'Eye spacing is structural. Brow grooming can make eyes appear slightly closer or wider apart.',
  },
  {
    key: 'eyeNoseRatio',
    label: 'Eye–Nose Ratio',
    pillar: 'harmony',
    get: (g) => g.eyeNoseRatio,
    description: 'Average eye width relative to nose width. Typical faces sit near ≈ 0.9.',
    tip: 'A smaller nose relative to eyes is perceived as more youthful and delicate.',
  },
  {
    key: 'noseChinRatio',
    label: 'Nose–Chin Balance',
    pillar: 'harmony',
    get: (g) => g.noseChinRatio,
    description:
      'Nose length relative to chin height. Balanced nose and chin project the lower face harmoniously.',
    tip: 'Facial hair or moreso weight changes affect the lower-third projection more than the nose itself.',
    changeable: true,
  },
  {
    key: 'lipWidthRatio',
    label: 'Lip Width Ratio',
    pillar: 'harmony',
    get: (g) => g.lipWidthRatio,
    description:
      'Mouth width relative to face width. A wider mouth reads as wide-set and expressive.',
    tip: 'Lip liner and subtle overlining can increase perceived mouth width without changing the face.',
    changeable: true,
  },

  // ── ANGULARITY ───────────────────────────────────────────
  {
    key: 'jawRatio',
    label: 'Jawline Definition',
    pillar: 'angularity',
    get: (g) => g.jawRatio,
    description:
      'Jaw width relative to facial length. A strong ratio contributes to a defined, structured jawline.',
    tip: 'Lower body-fat and losing facial puffiness is the single biggest lever for a defined jawline.',
    changeable: true,
  },
  {
    key: 'gonialAngle',
    label: 'Gonial Angle',
    pillar: 'angularity',
    get: (g) => g.gonialAngle,
    genderSensitive: true,
    description:
      'Angle at the corner of the jaw. Squarer, lower angles read as more masculine and defined.',
    tip: 'Leaner jaw corners read more angular; this is otherwise bone structure.',
  },
  {
    key: 'mandibularTaper',
    label: 'Mandibular Taper',
    pillar: 'angularity',
    get: (g) => g.mandibularTaper,
    description:
      'How sharply the lower face tapers from cheekbones to chin. A taper gives an angular V-shaped lower face.',
    tip: 'Reducing facial fullness and developing neck/masseter definition sharpen the taper.',
    changeable: true,
  },
  {
    key: 'cheekboneDefinition',
    label: 'Cheekbone Definition',
    pillar: 'angularity',
    get: (g) => g.cheekboneDefinition,
    description:
      'Prominence of the cheekbones relative to the jaw. Defined cheekbones lift the mid-face.',
    tip: 'Lower body-fat reveals cheekbone structure that is otherwise hidden by fullness.',
    changeable: true,
  },
  {
    key: 'chinProjection',
    label: 'Chin Projection',
    pillar: 'angularity',
    get: (g) => g.chinProjection,
    twoSided: true,
    description:
      'Horizontal projection of the chin relative to the lower face. Balanced projection completes the jaw.',
    tip: 'Chin projection is structural; facial hair styling can visually extend a weak chin.',
  },
  {
    key: 'jawSymmetry',
    label: 'Jaw Symmetry',
    pillar: 'angularity',
    get: (g) => g.jawSymmetry,
    twoSided: true,
    description:
      'Left/right balance of the jaw and lower face. Low asymmetry reads as more harmonious.',
    tip: 'Significant jaw asymmetry is structural; minor asymmetry is universally normal.',
  },

  // ── DIMORPHISM ───────────────────────────────────────────
  {
    key: 'browTilt',
    label: 'Brow Tilt',
    pillar: 'dimorphism',
    get: (g) => g.browTilt,
    genderSensitive: true,
    description:
      'Angle of the brow line. A sharper, more angled brow reads masculine; a softer arch reads feminine.',
    tip: 'Brow shaping is the most controllable dimorphic feature — grooming can shift perceived gender expression.',
    changeable: true,
  },
  {
    key: 'upperLipRatio',
    label: 'Upper Lip Ratio',
    pillar: 'dimorphism',
    get: (g) => g.upperLipRatio,
    genderSensitive: true,
    description:
      'Upper lip height relative to total lip height. Fuller upper lips read more feminine/youthful.',
    tip: 'Subtle overlining of the upper lip can increase perceived ratio.',
    changeable: true,
  },
  {
    key: 'lipFullness',
    label: 'Lip Fullness',
    pillar: 'dimorphism',
    get: (g) => g.lipFullness,
    genderSensitive: true,
    description: 'Lip volume relative to facial area. Fuller lips read more feminine and youthful.',
    tip: 'Hydration and lip care visibly increase perceived fullness.',
    changeable: true,
  },
  {
    key: 'canthalTilt',
    label: 'Canthal Tilt',
    pillar: 'dimorphism',
    get: (g) => g.canthalTilt,
    genderSensitive: true,
    description:
      'Angle of the eye line. Positive tilt (outer corner up) reads alert and youthful; negative reads tired.',
    tip: 'Under-eye care and brow shape affect perceived eye tilt more than the bone itself.',
    changeable: true,
  },
  {
    key: 'eyeAspectRatio',
    label: 'Eye Aspect Ratio',
    pillar: 'dimorphism',
    get: (g) => g.eyeAspectRatio,
    description:
      'Eye openness (height ÷ width). Proportionate, open eyes read alert and attractive.',
    tip: 'Eyelid care and rest affect apparent eye openness.',
    changeable: true,
  },

  // ── FEATURES & HEALTH ────────────────────────────────────
  {
    key: 'symmetry',
    label: 'Facial Symmetry',
    pillar: 'features',
    get: (g) => g.symmetry,
    twoSided: true,
    description: 'Overall left/right mirror balance of the face. Minor asymmetry is universal.',
    tip: 'Symmetry is structural; good posture and balanced grooming help perception.',
  },
  {
    key: 'eyeTilt',
    label: 'Eye Tilt',
    pillar: 'features',
    get: (g) => g.eyeTilt,
    description: 'Average tilt of both eyes. Correlates with canthal tilt for an alert expression.',
    tip: 'Consistent with canthal tilt — under-eye and brow care help reading.',
    changeable: true,
  },
  {
    key: 'noseBridgeAngle',
    label: 'Nose Bridge Straightness',
    pillar: 'features',
    get: (g) => g.noseBridgeAngle,
    twoSided: true,
    description: 'Straightness of the nasal bridge. Only measured from a reliable view.',
    tip: 'A straighter bridge reads refined; this is structural.',
  },
  {
    key: 'alarAngle',
    label: 'Nose Base Angle',
    pillar: 'features',
    get: (g) => g.alarAngle,
    description:
      'Angle of the nose base. Balanced alar width keeps the nose integrated with the face.',
    tip: 'Nose width ratio is structural; contouring can soften perceived width.',
  },
];

const SKIN_METRIC: Omit<ReportMetric, 'score' | 'percentile' | 'potential'> = {
  key: 'skinClarity',
  label: 'Skin Clarity',
  pillar: 'features',
  unit: '/10',
  raw: null,
  mu: null,
  sigma: null,
  z: null,
  confidence: 1,
  refRange: '—',
  description:
    'Evenness and clarity of the skin across the face. This is a condition metric, not bone structure.',
  tip: 'The most changeable metric — skincare, hydration, sun protection and sleep all move it.',
  changeable: true,
  genderSensitive: false,
};

export function detectView(g: RawGeometry): ViewType {
  // Nose-project / alar / bridge measurements are gated to confidence 0 when
  // the landmark engine decided this is a frontal face (see computeRawGeometry).
  if (g.noseProjection.confidence > 0 && g.noseBridgeAngle.confidence > 0) return 'profile';
  return 'frontal';
}

function unitOf(m: Measurement | null): string {
  if (!m) return RATIO_LABEL;
  return m.unit === 'degrees' ? DEG_LABEL : RATIO_LABEL;
}

function buildMetric(
  spec: MetricSpec,
  raw: RawGeometry,
  profile: ReportProfile,
  skinClarityScore: number,
  photoQualityScore: number,
): ReportMetric | null {
  if (spec.key === 'skinClarity') {
    const score = Math.round(skinClarityScore * 10) / 10;
    return {
      ...SKIN_METRIC,
      score,
      percentile: Math.round(scoreToPercentileLinear(score)),
      potential: Math.round((10 - score) * 10) / 10,
    };
  }

  const m = spec.get(raw);
  if (!m || m.confidence <= 0 || m.sigma <= 0) return null;

  // Gender-adjusted reference for dimorphic metrics.
  const genderRef = GENDER_REFS[profile][spec.key];
  const mu = genderRef?.mu ?? m.mu;
  const sigma = genderRef?.sigma ?? m.sigma;
  const z = m.sigma > 0 ? (m.raw - mu) / sigma : 0;

  const absZ = spec.twoSided ? Math.abs(z) : Math.abs((m.raw - m.mu) / (m.sigma || 1));
  const score = Math.round(rangeScore(absZ) * 10) / 10;
  const percentile = spec.twoSided ? percentileFromZ(-absZ * 1.2) : percentileFromZ(-absZ);

  const lower = mu - sigma;
  const upper = mu + sigma;
  const refRange = `${fmtNum(lower)}–${fmtNum(upper)}${unitOf(m)}`;

  return {
    key: spec.key,
    label: spec.label,
    pillar: spec.pillar,
    score,
    percentile,
    raw: m.raw,
    unit: unitOf(m),
    mu,
    sigma,
    z: Math.round(z * 1000) / 1000,
    confidence: m.confidence,
    refRange,
    description: spec.description,
    tip: spec.tip,
    changeable: spec.changeable ?? false,
    potential: Math.round(Math.min(6, absZ * 2) * 10) / 10,
    genderSensitive: spec.genderSensitive ?? false,
  };
}

function scoreToPercentileLinear(score: number): number {
  const z = (score - 5) / 2;
  return percentileFromZ(z);
}

function fmtNum(n: number): string {
  return n >= 100 ? String(Math.round(n)) : n.toFixed(2);
}

function fmtRaw(m: ReportMetric): string {
  if (m.raw === null || m.raw === undefined) return '—';
  if (m.unit === DEG_LABEL) return `${Math.round(m.raw)}${DEG_LABEL}`;
  return m.raw >= 100 ? String(Math.round(m.raw)) : m.raw.toFixed(2);
}

/**
 * Build the complete FaceIQ report.
 */
export function buildFaceIQReport(
  rawGeometry: RawGeometry | null,
  opts: {
    profile: ReportProfile;
    skinClarityScore: number;
    photoQualityScore: number;
    shape: string;
    shapeProbabilities: Record<string, number>;
    confidenceOverride?: number;
  },
): FaceIQReport {
  const profile = opts.profile ?? 'neutral';
  const view = rawGeometry ? detectView(rawGeometry) : 'unknown';

  const allMetrics: ReportMetric[] = [];
  if (rawGeometry) {
    for (const spec of SPECS) {
      const rm = buildMetric(
        spec,
        rawGeometry,
        profile,
        opts.skinClarityScore,
        opts.photoQualityScore,
      );
      if (rm) allMetrics.push(rm);
    }
    const skin = buildMetric(
      {
        key: 'skinClarity',
        label: 'Skin Clarity',
        pillar: 'features',
        get: () => null,
        description: SKIN_METRIC.description,
        tip: SKIN_METRIC.tip,
        changeable: true,
      } as MetricSpec,
      rawGeometry,
      profile,
      opts.skinClarityScore,
      opts.photoQualityScore,
    );
    if (skin) allMetrics.push(skin);
  }

  const totalAvailable = allMetrics.length;

  // Pillar definitions with membership + relative weights.
  const pillarDefs: {
    id: PillarId;
    label: string;
    short: string;
    description: string;
    weight: number;
    keys: string[];
  }[] = [
    {
      id: 'harmony',
      label: 'Harmony',
      short: 'HAR',
      description:
        'Facial proportional balance — how evenly your features sit in thirds, fifths and key ratios.',
      weight: 0.34,
      keys: [
        'goldenRatio',
        'faceRatio',
        'verticalBalance',
        'horizontalFifths',
        'fwhr',
        'eyeSpacing',
        'eyeNoseRatio',
        'noseChinRatio',
        'lipWidthRatio',
      ],
    },
    {
      id: 'angularity',
      label: 'Angularity',
      short: 'ANG',
      description:
        'Bone-structure definition — jawline, gonial angle, mandibular taper, cheekbones and chin.',
      weight: 0.28,
      keys: [
        'jawRatio',
        'gonialAngle',
        'mandibularTaper',
        'cheekboneDefinition',
        'chinProjection',
        'jawSymmetry',
      ],
    },
    {
      id: 'dimorphism',
      label: 'Dimorphism',
      short: 'DIM',
      description:
        'Gender-typical trait expression — brows, lips, eye tilt and eye shape benchmarked to your profile.',
      weight: 0.2,
      keys: ['browTilt', 'upperLipRatio', 'lipFullness', 'canthalTilt', 'eyeAspectRatio'],
    },
    {
      id: 'features',
      label: 'Features & Health',
      short: 'FEA',
      description:
        'Facial symmetry, skin clarity and feature finish — the parts that change most with care.',
      weight: 0.18,
      keys: ['symmetry', 'eyeTilt', 'noseBridgeAngle', 'alarAngle', 'skinClarity'],
    },
  ];

  const pillars: Pillar[] = pillarDefs.map((def) => {
    const metrics = allMetrics.filter((m) => def.keys.includes(m.key));
    let sum = 0;
    let n = 0;
    for (const m of metrics) {
      sum += m.score;
      n++;
    }
    const score = n > 0 ? Math.round((sum / n) * 10) / 10 : 0;
    const percentile =
      n > 0 ? Math.round((metrics.reduce((a, m) => a + m.percentile, 0) / n) * 10) / 10 : 0;
    const weight = metrics.length > 0 ? def.weight : 0;
    return {
      id: def.id,
      label: def.label,
      short: def.short,
      description: def.description,
      score,
      percentile,
      metrics,
      weight,
    };
  });

  const availablePillars = pillars.filter((p) => p.metrics.length > 0);
  const totalWeight = availablePillars.reduce((a, p) => a + p.weight, 0);
  const heroScore =
    totalWeight > 0
      ? Math.round(
          (availablePillars.reduce((a, p) => a + p.score * p.weight, 0) / totalWeight) * 10,
        ) / 10
      : 0;

  // Hero percentile: weighted average of pillar percentiles → then grade.
  const heroPercentile =
    totalWeight > 0
      ? Math.round(availablePillars.reduce((a, p) => a + p.percentile * p.weight, 0) / totalWeight)
      : 0;
  const { grade, label: gradeLabel } = gradeFromPercentile(heroPercentile);
  const beautyIndex = Math.round(heroPercentile);

  // Signature strengths: top 3 by score among confident metrics.
  const signatureStrengths = [...allMetrics]
    .filter((m) => m.confidence > 0 && m.score >= 7.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Action plan: biggest deviation (lowest score) first, weighted by how
  // changeable the metric is (structural metrics rank lower for action).
  const actions: ActionItem[] = [...allMetrics]
    .filter((m) => m.confidence > 0 && m.score < 7.5)
    .map((m) => {
      const uplift = Math.round((7.5 - m.score) * 10) / 10;
      const priority =
        Math.round((m.changeable ? 1.6 : 0.6) * Math.max(0.5, m.potential) * 10) / 10;
      return {
        metricKey: m.key,
        label: m.label,
        pillar: m.pillar,
        current: fmtRaw(m),
        target: m.refRange,
        potential: uplift,
        priority,
        tip: m.tip,
        changeable: m.changeable,
      };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  const biggestOpportunity = actions[0] ?? null;

  // Structural (bone) vs soft (condition) split.
  const structural = allMetrics.filter(
    (m) => m.confidence > 0 && !m.changeable && m.key !== 'skinClarity',
  );
  const soft = allMetrics.filter((m) => m.confidence > 0 && m.changeable);
  const structuralScore = structural.length
    ? Math.round((structural.reduce((a, m) => a + m.score, 0) / structural.length) * 10) / 10
    : 0;
  const softScore = soft.length
    ? Math.round((soft.reduce((a, m) => a + m.score, 0) / soft.length) * 10) / 10
    : 0;

  const metricsTotal = SPECS.length + 1; // + skin clarity
  const confidence = opts.confidenceOverride ?? Math.round((totalAvailable / metricsTotal) * 100);

  return {
    hero: {
      score: heroScore,
      percentile: heroPercentile,
      grade,
      gradeLabel,
      comparison: comparisonFromPercentile(heroPercentile),
      beautyIndex,
    },
    pillars,
    actions,
    signatureStrengths,
    biggestOpportunity,
    shape: opts.shape,
    shapeProbabilities: opts.shapeProbabilities,
    view,
    profile,
    metricsAvailable: totalAvailable,
    metricsTotal,
    confidence,
    structuralScore,
    softScore,
  };
}
