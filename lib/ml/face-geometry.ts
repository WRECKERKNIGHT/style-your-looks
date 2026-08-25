export interface Point2D {
  x: number;
  y: number;
}

import { classifyFaceShape } from "./calibration";

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

/** MediaPipe returns objects ({x,y,z}); demo fixtures use [x,y,z] arrays. */
export type LandmarkList = ReadonlyArray<LandmarkPoint> | number[][];

export function getPoint(landmarks: LandmarkList, i: number): Point2D | null {
  const p = landmarks[i];
  if (!p) return null;
  if (Array.isArray(p)) return { x: p[0], y: p[1] };
  return { x: p.x, y: p.y };
}

export interface SymmetryAxis {
  /** Top anchor of the axis (pupil midpoint). */
  a: Point2D;
  /** Bottom anchor of the axis (chin tip). */
  b: Point2D;
  /** Axis angle in degrees relative to vertical (positive = top tilts right). */
  angleDeg: number;
  /** Axis length (normalized units). */
  length: number;
}

export interface StructuralChains {
  jaw: Point2D[];
  noseBridge: Point2D[];
  leftCheek: Point2D[];
  rightCheek: Point2D[];
  lips: Point2D[];
}

const AXIS = {
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  CHIN: 152,
  NOSE_TIP: 1,
} as const;

const SYMMETRY_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [33, 263], // eye outer corners
  [133, 362], // eye inner corners
  [159, 386], // upper lids
  [145, 374], // lower lids
  [46, 275], // brows outer
  [70, 300], // brows inner
  [105, 334], // brows mid
  [61, 291], // mouth corners
  [48, 278], // outer lips
  [0, 17], // lips centerline ends
  [127, 356], // cheekbones
  [234, 454], // jaw
  [172, 397], // mid cheeks
  [93, 323], // forehead
  [58, 288], // forehead inner
  [132, 361], // lower cheeks
];

const JAW_CHAIN = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397];
const NOSE_BRIDGE_CHAIN = [168, 6, 197, 195, 5, 4, 1];
const LEFT_CHEEK_CHAIN = [234, 127, 132, 93];
const RIGHT_CHEEK_CHAIN = [454, 356, 361, 288];
const LIP_CHAIN = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];

function eyeCenter(landmarks: LandmarkList, inner: number, outer: number): Point2D | null {
  const i = getPoint(landmarks, inner);
  const o = getPoint(landmarks, outer);
  if (!i || !o) return null;
  return { x: (i.x + o.x) / 2, y: (i.y + o.y) / 2 };
}

/**
 * 3D pose-aware symmetry axis — the line from the pupil midpoint to the chin
 * tip. Anchoring on real facial anatomy (rather than a fixed vertical) means
 * the axis follows head roll/yaw, so symmetry scoring stays fair even when the
 * photo is slightly tilted.
 */
export function calculateSymmetryAxis(landmarks: LandmarkList): SymmetryAxis | null {
  const leftEye = eyeCenter(landmarks, AXIS.LEFT_EYE_INNER, AXIS.LEFT_EYE_OUTER);
  const rightEye = eyeCenter(landmarks, AXIS.RIGHT_EYE_INNER, AXIS.RIGHT_EYE_OUTER);
  const chin = getPoint(landmarks, AXIS.CHIN);
  if (!leftEye || !rightEye || !chin) return null;

  const a: Point2D = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };
  const b = chin;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) return null;

  // Angle relative to vertical (positive = top of face tilts to the right).
  const angleDeg = Math.atan2(dx, dy) * (180 / Math.PI);

  return { a, b, angleDeg, length };
}

/** Signed perpendicular distance of Q from the axis line. */
function axisSide(axis: SymmetryAxis, q: Point2D): number {
  const ux = (axis.b.x - axis.a.x) / axis.length;
  const uy = (axis.b.y - axis.a.y) / axis.length;
  return ux * (q.y - axis.a.y) - uy * (q.x - axis.a.x);
}

export interface UprightAccessor {
  /** Landmark i rotated into the upright frame (null if missing). */
  pt(i: number): Point2D | null;
  /** Axis tilt that measurements were corrected by, in degrees. */
  correctedByDeg: number;
}

/**
 * Returns an accessor that reads landmarks rotated into the canonical upright
 * frame — the pupil-midpoint → chin axis is vertical, exactly how clinical
 * anthropometry is taken against a plumb line. Widths measured as |Δx| and
 * heights as |Δy| then stop shrinking by cos(tilt) when the head is rolled,
 * so bilateral metrics stay truthful without rejecting slightly tilted
 * photos. Rotation is a no-op for perfectly frontal captures.
 */
export function createUprightAccessor(landmarks: LandmarkList): UprightAccessor {
  const fallback = (i: number) => getPoint(landmarks, i);
  const axis = calculateSymmetryAxis(landmarks);
  if (!axis || Math.abs(axis.angleDeg) < 0.05) {
    return { pt: fallback, correctedByDeg: 0 };
  }

  const theta = (-axis.angleDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const cache = new Map<number, Point2D | null>();

  return {
    correctedByDeg: Math.round(axis.angleDeg * 10) / 10,
    pt(i: number) {
      const cached = cache.get(i);
      if (cached !== undefined) return cached;
      const p = getPoint(landmarks, i);
      let out: Point2D | null = null;
      if (p) {
        const dx = p.x - axis.a.x;
        const dy = p.y - axis.a.y;
        out = {
          x: axis.a.x + dx * cos - dy * sin,
          y: axis.a.y + dx * sin + dy * cos,
        };
      }
      cache.set(i, out);
      return out;
    },
  };
}

/** Position of Q projected onto the axis (0 at pupil midpoint, length at chin). */
function axisOffset(axis: SymmetryAxis, q: Point2D): number {
  const ux = (axis.b.x - axis.a.x) / axis.length;
  const uy = (axis.b.y - axis.a.y) / axis.length;
  return (q.x - axis.a.x) * ux + (q.y - axis.a.y) * uy;
}

/**
 * Mirror-based symmetry engine. Every bilateral pair is reflected across the
 * pose-aware axis: a pair is symmetric when its members sit at equal
 * perpendicular distance on opposite sides AND at the same height along the
 * axis. Nose-tip centering is blended in as a global alignment check.
 */
export function calculateSymmetryScore(landmarks: LandmarkList): number {
  const axis = calculateSymmetryAxis(landmarks);
  if (!axis) return 0;

  let total = 0;
  let count = 0;

  for (const [leftIdx, rightIdx] of SYMMETRY_PAIRS) {
    const l = getPoint(landmarks, leftIdx);
    const r = getPoint(landmarks, rightIdx);
    if (!l || !r) continue;

    const lp = l;
    const rp = r;

    const sL = axisSide(axis, lp);
    const sR = axisSide(axis, rp);
    const tL = axisOffset(axis, lp);
    const tR = axisOffset(axis, rp);

    const sideSpan = Math.abs(sL) + Math.abs(sR);
    const perpendicular =
      sideSpan > 0 ? 1 - Math.abs(sL + sR) / sideSpan : 1;

    const heightSpan = Math.abs(tL) + Math.abs(tR);
    const along =
      heightSpan > 0 ? 1 - Math.abs(tL - tR) / heightSpan : 1;

    total += perpendicular * 0.7 + along * 0.3;
    count++;
  }

  if (count === 0) return 0;

  const nose = getPoint(landmarks, AXIS.NOSE_TIP);
  const noseAlign = nose
    ? Math.max(0, 1 - Math.abs(axisSide(axis, nose)) / (axis.length * 0.12))
    : 1;

  const raw = (total / count) * 10;
  return Math.min(10, Math.max(0, raw * (0.85 + 0.15 * noseAlign)));
}

/** Structural landmark chains used to render facial anatomy overlays. */
export function buildStructuralChains(landmarks: LandmarkList): StructuralChains {
  const pick = (indices: number[]) =>
    indices.map((i) => getPoint(landmarks, i)).filter(Boolean) as Point2D[];

  return {
    jaw: pick(JAW_CHAIN),
    noseBridge: pick(NOSE_BRIDGE_CHAIN),
    leftCheek: pick(LEFT_CHEEK_CHAIN),
    rightCheek: pick(RIGHT_CHEEK_CHAIN),
    lips: pick(LIP_CHAIN),
  };
}

export interface FaceShapeClassification {
  primary: string;
  probabilities: Record<string, number>;
}

/**
 * 10-ratio probabilistic face-shape classifier using cosine similarity
 * against population prototypes from calibration.ts.
 *
 * Landmarks used (stable MediaPipe FaceMesh indices):
 *   10  = top of head (forehead midline)
 *   152 = chin bottom
 *   108 = left temple
 *   337 = right temple
 *   234 = left cheekbone
 *   454 = right cheekbone
 *   172 = left jaw (gonion)
 *   397 = right jaw (gonion)
 *   127 = left mandible (mid-jaw)
 *   363 = right mandible (mid-jaw)
 *   13  = upper lip (Cupid's bow center)
 *   14  = lower lip center
 */
export function calculateFaceShape(landmarks: LandmarkList): FaceShapeClassification {
  const U = createUprightAccessor(landmarks);
  const fw = U.pt(108);
  const fw2 = U.pt(337);
  const c1 = U.pt(234);
  const c2 = U.pt(454);
  const j1 = U.pt(172);
  const j2 = U.pt(397);
  const top = U.pt(10);
  const chin = U.pt(152);
  const m1 = U.pt(127);
  const m2 = U.pt(363);
  if (!fw || !fw2 || !c1 || !c2 || !j1 || !j2 || !top || !chin) {
    return { primary: "Oval", probabilities: { Oval: 1.0 } };
  }

  const foreheadWidth = Math.abs(fw.x - fw2.x);
  const cheekWidth = Math.abs(c1.x - c2.x);
  const jawWidth = Math.abs(j1.x - j2.x);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const mandibleWidth = m1 && m2 ? Math.abs(m1.x - m2.x) : jawWidth;

  if (cheekWidth <= 0 || faceLength <= 0) {
    return { primary: "Oval", probabilities: { Oval: 1.0 } };
  }

  // 10 ratios for classification
  const faceLengthWidth = faceLength / cheekWidth;
  const foreheadCheekRatio = foreheadWidth / cheekWidth;
  const jawCheekRatio = jawWidth / cheekWidth;
  const chinJawRatio = mandibleWidth > 0 ? jawWidth / mandibleWidth : 0.85;
  const jawTaper = jawWidth > 0 ? (cheekWidth - jawWidth) / cheekWidth : 0.5;
  const cheekLengthRatio = cheekWidth / faceLength;
  const templeCheekRatio = foreheadWidth / cheekWidth;

  const ratios = {
    faceLengthWidth,
    foreheadCheekRatio,
    jawCheekRatio,
    chinJawRatio,
    jawTaper,
    cheekLengthRatio,
    templeCheekRatio,
  };

  // Use calibration module's cosine-similarity classifier
  return classifyFaceShape(ratios) as FaceShapeClassification;
}

/**
 * Legacy wrapper for code that still expects a plain string.
 * Returns just the primary shape name.
 */
export function calculateFaceShapeName(landmarks: LandmarkList): string {
  return calculateFaceShape(landmarks).primary;
}
