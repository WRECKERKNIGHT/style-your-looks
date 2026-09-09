import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { prepareCanvas } from './preprocessing';
import {
  resolveModelUrl,
  resolveWasmBase,
  invalidateAssetResolution,
  MODEL_SOURCES,
} from './engine-assets';
import {
  calculateSymmetryScore,
  calculateFaceShape,
  calculateSymmetryAxis,
  createUprightAccessor,
  calculateMandibularAngle,
  calculateNoseProjection,
  calculateLipWidthRatio,
  calculateUpperLipRatio,
  calculateNoseBridgeAngle,
  type FaceShapeClassification,
  type Point2D,
} from './face-geometry';
import { calibratedScore, idealScore } from './scoring-curves';
import { headPose } from './face-quality';

let faceLandmarker: FaceLandmarker | null = null;
let landmarkerInitPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(delegate: 'GPU' | 'CPU'): Promise<FaceLandmarker> {
  const [vision, modelUrl] = await Promise.all([
    resolveWasmBase().then((base) => FilesetResolver.forVisionTasks(base)),
    resolveModelUrl(MODEL_SOURCES.faceLandmarker),
  ]);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelUrl,
      delegate,
    },
    runningMode: 'IMAGE',
    numFaces: 5,
    // Lowered from the 0.5 defaults: real-world selfies in uneven lighting were
    // silently dropping faces entirely, which users experienced as the engine
    // "not detecting" them.
    minFaceDetectionConfidence: 0.35,
    minFacePresenceConfidence: 0.35,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
}

export async function initializeFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  if (landmarkerInitPromise) return landmarkerInitPromise;

  landmarkerInitPromise = (async () => {
    let lastErr: unknown;
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        faceLandmarker = await createLandmarker(delegate);
        return faceLandmarker;
      } catch (err) {
        lastErr = err;
        console.warn(`Face landmarker ${delegate} delegate failed — trying next fallback:`, err);
      }
    }
    landmarkerInitPromise = null;
    throw lastErr instanceof Error ? lastErr : new Error('Failed to initialise face landmarker');
  })();

  return landmarkerInitPromise;
}

/**
 * Tear down the cached landmarker instance. Used when inference starts failing
 * mid-session (GPU context lost, WASM memory pressure) so the next call
 * rebuilds a fresh engine instead of retrying against a dead instance.
 */
export function resetFaceEngine(): void {
  try {
    faceLandmarker?.close();
  } catch {
    // close() can throw if the underlying context is already gone — ignore.
  }
  faceLandmarker = null;
  landmarkerInitPromise = null;
  // Forget pinned asset URLs too — a self-heal that replays a poisoned
  // CDN/local decision is not a heal at all.
  invalidateAssetResolution();
}

/**
 * Map a raw engine failure to an honest, actionable user message.
 * Distinguishes offline, extension-blocked CDNs and old browsers instead of
 * blaming "the connection" for everything.
 */
export function describeEngineError(err: unknown): string {
  const detail = `${err ?? ''}`;
  const msg = err instanceof Error ? err.message : detail;
  if (/wasm|CompileError|WebAssembly/i.test(detail)) {
    return 'This browser could not start the WebAssembly vision engine. Update your browser (Chrome/Samsung Internet/Edge) and try again.';
  }
  if (/ERR_INTERNET_DISCONNECTED|NetworkError|network/i.test(detail)) {
    return 'You appear to be offline. Reconnect and try again — analysis needs to download its vision model once.';
  }
  if (/ERR_BLOCKED_BY_CLIENT|blocked/i.test(detail)) {
    return 'A browser extension (ad-blocker/privacy shield) blocked the vision engine download. Pause it for this site and retry.';
  }
  if (/fetch|Failed to fetch|AbortError|timeout/i.test(msg)) {
    return 'The vision engine download timed out. Check your connection and try again.';
  }
  return 'Could not load the face-detection engine. Check your connection and try again.';
}

/**
 * Run detect() with self-healing: if inference throws after the engine was
 * working (the classic "engine disconnected" symptom), rebuild once on CPU and
 * retry instead of surfacing a dead session to the user.
 */
async function runDetection(
  source: HTMLCanvasElement,
  initFallbackReason?: unknown,
): Promise<FaceLandmarkerResult> {
  const landmarker = await initializeFaceLandmarker();
  try {
    return landmarker.detect(source);
  } catch (err) {
    console.warn(
      'Face engine stopped responding — rebuilding a fresh instance:',
      err ?? initFallbackReason,
    );
    resetFaceEngine();
    try {
      faceLandmarker = await createLandmarker('CPU');
      landmarkerInitPromise = null;
      return faceLandmarker.detect(source);
    } catch (rebuildErr) {
      resetFaceEngine();
      throw rebuildErr instanceof Error ? rebuildErr : new Error(String(rebuildErr));
    }
  }
}

/**
 * Multi-person photos were scored against whichever face MediaPipe listed
 * first (often the smallest/background one). Re-rank detected faces so the
 * most prominent one — largest landmark bounding box — is always index 0,
 * keeping every downstream scorer aligned across landmarks, blendshapes and
 * transform matrices.
 */
function promotePrimaryFace(result: FaceLandmarkerResult): FaceLandmarkerResult {
  const faces = result.faceLandmarks;
  if (!faces || faces.length < 2) return result;

  const areaOf = (lm: { x: number; y: number }[]): number => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of lm) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
  };

  const order = faces.map((_, i) => i).sort((a, b) => areaOf(faces[b]) - areaOf(faces[a]));
  if (order[0] === 0) return result;

  const reorder = <T>(arr: T[]): T[] => order.map((i) => arr[i]);

  return {
    ...result,
    faceLandmarks: reorder(faces),
    faceBlendshapes: result.faceBlendshapes
      ? reorder(result.faceBlendshapes)
      : result.faceBlendshapes,
    facialTransformationMatrixes: result.facialTransformationMatrixes
      ? reorder(result.facialTransformationMatrixes)
      : result.facialTransformationMatrixes,
  };
}

export { prepareCanvas };

export function getFaceSymmetry(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return calculateSymmetryScore(result.faceLandmarks[0]);
}

export function getFaceSymmetryAxis(result: FaceLandmarkerResult) {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return calculateSymmetryAxis(result.faceLandmarks[0]);
}

export function getFaceProportions(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const forehead = U.pt(10);
  const chin = U.pt(152);
  const browLine = U.pt(9);
  const noseBottom = U.pt(2);
  if (!forehead || !chin || !browLine || !noseBottom) return null;

  const faceLength = chin.y - forehead.y;
  if (faceLength === 0) return null;

  const upperThird = (browLine.y - forehead.y) / faceLength;
  const middleThird = (noseBottom.y - browLine.y) / faceLength;
  const lowerThird = (chin.y - noseBottom.y) / faceLength;

  const idealRatio = 1 / 3;
  const deviation =
    Math.abs(upperThird - idealRatio) +
    Math.abs(middleThird - idealRatio) +
    Math.abs(lowerThird - idealRatio);

  return idealScore(deviation, 0, 0.04, 1, 10);
}

/**
 * Multi-factor jawline scorer.
 *
 * Old version used only jaw-width/face-length + one angle → didn't
 * differentiate between faces. New version combines five independent
 * sub-scores, each 0-10, then averages with appropriate weights:
 *
 *   1. Jaw-to-face ratio (width relative to face length)
 *   2. Gonial angle proxy (angle at jaw corner landmarks)
 *   3. Mandibular taper (how much the jaw narrows from gonion to chin)
 *   4. Chin projection (chin prominence relative to lower face)
 *   5. Jaw symmetry (levelness between left and right jaw corners)
 */
export function getJawlineScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftJaw1 = U.pt(127);
  const leftJaw2 = U.pt(134);
  const rightJaw1 = U.pt(356);
  const rightJaw2 = U.pt(363);
  const chin = U.pt(152);
  const top = U.pt(10);
  const leftCheek = U.pt(234);
  const rightCheek = U.pt(454);
  const chinTip = U.pt(152);
  if (
    !leftJaw1 ||
    !leftJaw2 ||
    !rightJaw1 ||
    !rightJaw2 ||
    !chin ||
    !top ||
    !leftCheek ||
    !rightCheek ||
    !chinTip
  )
    return null;

  // 1. Jaw-to-face ratio — sharper sigma for better discrimination
  const jawWidth = Math.hypot(rightJaw1.x - leftJaw1.x, rightJaw1.y - leftJaw1.y);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const jawRatio = jawWidth / faceLength;
  const s1 = idealScore(jawRatio, 0.78, 0.05);

  // 2. Gonial angle — the actual angle at the jaw corner
  const leftAngle =
    Math.abs(
      Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
        Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x),
    ) *
    (180 / Math.PI);
  const s2 = idealScore(leftAngle, 120, 8);

  // 3. Mandibular taper — how much the jaw narrows from gonion to chin
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const taper = cheekWidth > 0 ? (cheekWidth - jawWidth) / cheekWidth : 0.5;
  const s3 = idealScore(taper, 0.45, 0.08);

  // 4. Chin projection — chin centering in the jaw frame
  const chinCenter = Math.abs(chinTip.x - (leftJaw1.x + rightJaw1.x) / 2);
  const chinProjection = jawWidth > 0 ? chinCenter / (jawWidth / 2) : 0.5;
  const s4 = idealScore(chinProjection, 0.0, 0.15);

  // 5. Jaw symmetry — levelness between left and right jaw corners
  const asymmetry = Math.abs(leftJaw1.y - rightJaw1.y) / faceLength;
  const s5 = idealScore(asymmetry, 0, 0.04);

  // Weighted average: gonial angle and ratio are most important
  const score = s1 * 0.25 + s2 * 0.3 + s3 * 0.15 + s4 * 0.15 + s5 * 0.15;
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * Raw jaw metrics for display in the results panel.
 */
export function getJawlineRaw(result: FaceLandmarkerResult): {
  jawAngle: number;
  jawRatio: number;
  taper: number;
} | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftJaw1 = U.pt(127);
  const leftJaw2 = U.pt(134);
  const rightJaw1 = U.pt(356);
  const rightJaw2 = U.pt(363);
  const chin = U.pt(152);
  const top = U.pt(10);
  const leftCheek = U.pt(234);
  const rightCheek = U.pt(454);
  if (
    !leftJaw1 ||
    !leftJaw2 ||
    !rightJaw1 ||
    !rightJaw2 ||
    !chin ||
    !top ||
    !leftCheek ||
    !rightCheek
  )
    return null;

  const jawWidth = Math.hypot(rightJaw1.x - leftJaw1.x, rightJaw1.y - leftJaw1.y);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);

  const jawAngle =
    Math.abs(
      Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
        Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x),
    ) *
    (180 / Math.PI);

  return {
    jawAngle: Math.round(jawAngle * 10) / 10,
    jawRatio: Math.round((jawWidth / faceLength) * 1000) / 1000,
    taper: Math.round(((cheekWidth - jawWidth) / cheekWidth) * 100) / 100,
  };
}

/**
 * Structure Profile — replaces the old "Angular Matrix" label.
 *
 * Measures overall facial angularity using four independent factors:
 *   1. Jawline prominence (jaw-to-face ratio)
 *   2. Cheekbone definition (cheek-to-jaw ratio)
 *   3. Chin projection (chin centering in the jaw frame)
 *   4. Facial convexity (upper face width relative to cheekbone width)
 *
 * Returns a descriptor: "Soft", "Balanced", "Defined", or "Sharp".
 */
export type StructureProfileType = 'Soft' | 'Balanced' | 'Defined' | 'Sharp';

export interface StructureProfileResult {
  label: StructureProfileType;
  jawlineScore: number;
  cheekboneScore: number;
  chinProjection: number;
  facialConvexity: number;
  overallAngle: number;
}

export function getStructureProfile(result: FaceLandmarkerResult): StructureProfileResult | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftJaw = U.pt(127);
  const rightJaw = U.pt(356);
  const leftCheek = U.pt(234);
  const rightCheek = U.pt(454);
  const chin = U.pt(152);
  const top = U.pt(10);
  const leftTemple = U.pt(108);
  const rightTemple = U.pt(337);

  if (
    !leftJaw ||
    !rightJaw ||
    !leftCheek ||
    !rightCheek ||
    !chin ||
    !top ||
    !leftTemple ||
    !rightTemple
  )
    return null;

  const jawWidth = Math.abs(rightJaw.x - leftJaw.x);
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const templeWidth = Math.abs(rightTemple.x - leftTemple.x);

  if (faceLength <= 0 || cheekWidth <= 0 || jawWidth <= 0) return null;

  const jawlineProminence = jawWidth / faceLength;
  const cheekToJaw = cheekWidth / jawWidth;
  const chinCenter = Math.abs(chin.x - (leftJaw.x + rightJaw.x) / 2) / (jawWidth / 2);
  const facialConvexity = templeWidth / cheekWidth;

  const jawlineScore = idealScore(jawlineProminence, 0.78, 0.05);
  const cheekboneScore = idealScore(cheekToJaw, 1.07, 0.05);
  const chinProj = idealScore(chinCenter, 0.0, 0.15);
  const convexity = idealScore(facialConvexity, 0.9, 0.07);

  const overall = (jawlineScore + cheekboneScore + chinProj + convexity) / 4;

  let label: StructureProfileType = 'Balanced';
  if (overall >= 8) label = 'Sharp';
  else if (overall >= 6.5) label = 'Defined';
  else if (overall >= 4.5) label = 'Balanced';
  else label = 'Soft';

  return {
    label,
    jawlineScore: Math.round(jawlineScore * 10) / 10,
    cheekboneScore: Math.round(cheekboneScore * 10) / 10,
    chinProjection: Math.round(chinProj * 10) / 10,
    facialConvexity: Math.round(convexity * 10) / 10,
    overallAngle: Math.round(overall * 10) / 10,
  };
}

/**
 * Youthfulness metric — replaces the old "Age Matrix".
 *
 * Uses geometric proxies available from landmarks + blendshapes:
 *   1. Skin smoothness (brightness variance across zones)
 *   2. Eye openness (from blendshapes — younger faces tend to have wider eyes)
 *   3. Eye region proportion (lower eyelid position relative to iris)
 *   4. Facial compactness (midface ratio — shorter midface reads younger)
 *   5. Skin brightness (average brightness — brighter skin often reads younger)
 *
 * Returns 0-100 where higher = more youthful.
 */
export function getYouthfulness(
  canvas: HTMLCanvasElement,
  result: FaceLandmarkerResult,
  blendshapes?: { eyeOpenness: number; smileIntensity: number },
): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const lm = result.faceLandmarks[0];

  // 1. Skin smoothness — average brightness variance across face zones
  const ctx = canvas.getContext('2d');
  let skinSmoothness: number | null = null;
  if (ctx) {
    const samplePoints = [lm[50], lm[101], lm[118], lm[330], lm[280]];
    let totalVariance = 0;
    let samples = 0;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    for (const point of samplePoints) {
      if (!point) continue;
      const x = Math.floor(point.x * imgWidth);
      const y = Math.floor(point.y * imgHeight);
      const radius = 6;
      try {
        const imageData = ctx.getImageData(
          Math.max(0, x - radius),
          Math.max(0, y - radius),
          radius * 2,
          radius * 2,
        );
        const pixels = imageData.data;
        const values: number[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
          values.push((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
        }
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        totalVariance += Math.sqrt(variance);
        samples++;
      } catch {
        continue;
      }
    }
    if (samples > 0) {
      const avgVariance = totalVariance / samples;
      // Lower variance = smoother skin = higher youthfulness
      skinSmoothness = Math.max(0, Math.min(100, 100 - avgVariance * 3));
    }
  }

  // 2. Eye openness from blendshapes
  const eyeOpenness = blendshapes ? blendshapes.eyeOpenness * 100 : null;

  // 3. Facial compactness (midface ratio — shorter midface reads younger)
  const browLine = U.pt(9);
  const noseBase = U.pt(2);
  const chin = U.pt(152);
  let compactness: number | null = null;
  if (browLine && noseBase && chin) {
    const upper = Math.abs(browLine.y - noseBase.y);
    const lower = Math.abs(noseBase.y - chin.y);
    if (upper > 0 && lower > 0) {
      const ratio = upper / lower;
      // Shorter midface (ratio < 1.0) reads younger
      compactness = Math.max(0, Math.min(100, 100 - Math.abs(ratio - 0.95) * 200));
    }
  }

  // 4. Skin brightness (brighter often reads younger)
  let brightness: number | null = null;
  if (ctx) {
    const center = lm[1]; // nose tip
    if (center) {
      const x = Math.floor(center.x * canvas.width);
      const y = Math.floor(center.y * canvas.height);
      try {
        const imageData = ctx.getImageData(Math.max(0, x - 10), Math.max(0, y - 10), 20, 20);
        const pixels = imageData.data;
        let totalBrightness = 0;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          count++;
        }
        brightness = count > 0 ? (totalBrightness / count / 255) * 100 : null;
      } catch {
        /* ignore */
      }
    }
  }

  // Weighted composite — only measured components contribute; if nothing was
  // observable the estimate is declined rather than defaulted to "average".
  const components: { value: number; weight: number }[] = [];
  const push = (value: number | null, weight: number) => {
    if (value != null) components.push({ value, weight });
  };
  push(skinSmoothness, 0.35);
  push(eyeOpenness, 0.2);
  push(compactness, 0.25);
  push(brightness, 0.2);
  if (components.length === 0) return null;
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const score =
    components.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getEyeSpacingScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftEyeInner = U.pt(133);
  const rightEyeInner = U.pt(362);
  const leftEyeOuter = U.pt(33);
  const rightEyeOuter = U.pt(263);
  if (!leftEyeInner || !rightEyeInner || !leftEyeOuter || !rightEyeOuter) return null;

  const leftEyeWidth = Math.hypot(leftEyeOuter.x - leftEyeInner.x, leftEyeOuter.y - leftEyeInner.y);
  const rightEyeWidth = Math.hypot(
    rightEyeOuter.x - rightEyeInner.x,
    rightEyeOuter.y - rightEyeInner.y,
  );
  const eyeGap = Math.hypot(rightEyeInner.x - leftEyeInner.x, rightEyeInner.y - leftEyeInner.y);
  const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
  if (avgEyeWidth <= 0) return null;

  const ratio = eyeGap / avgEyeWidth;
  return idealScore(ratio, 1.0, 0.12, 1, 10);
}

function dist2(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}

/** Facial Width-to-Height Ratio (FWHR) — bizygomatic width over upper-lip-to-brow height. */
export function getFwhrScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const left = U.pt(234);
  const right = U.pt(454);
  const lip = U.pt(13);
  const brow = U.pt(9);
  if (!left || !right || !lip || !brow) return null;

  const bizygomaticWidth = Math.abs(right.x - left.x);
  const browToLip = Math.abs(lip.y - brow.y);
  if (bizygomaticWidth === 0 || browToLip === 0) return null;

  const fwhr = bizygomaticWidth / browToLip;
  return idealScore(fwhr, 1.95, 0.15, 1, 10);
}

/** Raw FWHR value (for display) — 1.8–2.1 is the researched attractive range. */
export function getRawFwhr(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const left = U.pt(234);
  const right = U.pt(454);
  const lip = U.pt(13);
  const brow = U.pt(9);
  if (!left || !right || !lip || !brow) return 0;
  const bizygomaticWidth = Math.abs(right.x - left.x);
  const browToLip = Math.abs(lip.y - brow.y);
  if (bizygomaticWidth === 0 || browToLip === 0) return 0;
  return Math.round((bizygomaticWidth / browToLip) * 100) / 100;
}

/**
 * Canthal tilt — angle of the line between eye corners, measured in the
 * upright frame so head roll doesn't masquerade as a positive/negative tilt.
 * Positive = outer corner raised.
 */
export function getCanthalTiltScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const lm = result.faceLandmarks[0];
  const U = createUprightAccessor(lm);

  const tilt = (inner: number, outer: number): number | null => {
    const a = U.pt(inner);
    const b = U.pt(outer);
    if (!a || !b) return null;
    const dx = Math.abs(a.x - b.x);
    if (dx <= 0) return null;
    return -Math.atan2(b.y - a.y, dx) * (180 / Math.PI);
  };

  const leftTilt = tilt(133, 33);
  const rightTilt = tilt(362, 263);
  if (leftTilt == null || rightTilt == null) return null;
  const avgTilt = (leftTilt + rightTilt) / 2;

  // Positive tilt reads alert/attractive; population mode ≈ +5°.
  return idealScore(avgTilt, 5, 3.0, 1, 10);
}

/** Raw canthal tilt in degrees (display value), roll-corrected. */
export function getRawCanthalTilt(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const lm = result.faceLandmarks[0];
  const U = createUprightAccessor(lm);
  const tilt = (inner: number, outer: number): number => {
    const a = U.pt(inner);
    const b = U.pt(outer);
    if (!a || !b) return 0;
    const dx = Math.abs(a.x - b.x);
    if (dx <= 0) return 0;
    return -Math.atan2(b.y - a.y, dx) * (180 / Math.PI);
  };
  const avg = (tilt(133, 33) + tilt(362, 263)) / 2;
  return Math.round(avg * 10) / 10;
}

/** Horizontal fifths balance — the face ideally divides into five equal widths. */
export function getHorizontalFifthsScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const U = createUprightAccessor(result.faceLandmarks[0]);

  const lo = U.pt(33);
  const li = U.pt(133);
  const ri = U.pt(362);
  const ro = U.pt(263);
  if (!lo || !li || !ri || !ro) return null;

  const leftOuter = lo.x;
  const leftInner = li.x;
  const rightInner = ri.x;
  const rightOuter = ro.x;

  const faceWidth = rightOuter - leftOuter;
  if (faceWidth <= 0) return null;

  const leftEyeWidth = leftInner - leftOuter;
  const intercanthal = rightInner - leftInner;
  const rightEyeWidth = rightOuter - rightInner;
  const outerBands = (faceWidth - (leftEyeWidth + intercanthal + rightEyeWidth)) / 2;

  const fifths = [outerBands, leftEyeWidth, intercanthal, rightEyeWidth, outerBands];
  const ideal = faceWidth / 5;

  let deviation = 0;
  for (const f of fifths) {
    deviation += Math.abs(f - ideal) / ideal;
  }

  return idealScore(deviation, 0, 0.12, 1, 10);
}

/** Eye width to nose width ratio (golden ideal ~1.618). */
export function getEyeNoseRatioScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const le = U.pt(33);
  const re = U.pt(263);
  const ln = U.pt(94);
  const rn = U.pt(278);
  if (!le || !re || !ln || !rn) return null;

  const eyeWidth = Math.abs(re.x - le.x);
  const noseWidth = Math.abs(rn.x - ln.x);
  if (eyeWidth === 0 || noseWidth === 0) return null;

  const ratio = eyeWidth / noseWidth;
  return idealScore(ratio, 1.618, 0.15, 1, 10);
}

/** Raw eye/nose ratio for display. */
export function getRawEyeNoseRatio(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const le = U.pt(33);
  const re = U.pt(263);
  const ln = U.pt(94);
  const rn = U.pt(278);
  if (!le || !re || !ln || !rn) return 0;
  const eyeWidth = Math.abs(re.x - le.x);
  const noseWidth = Math.abs(rn.x - ln.x);
  if (eyeWidth === 0 || noseWidth === 0) return 0;
  return Math.round((eyeWidth / noseWidth) * 100) / 100;
}

/** Nose-to-chin (nasofacial) ratio — nose length over facial height, ideal ~0.30. */
export function getNoseChinRatioScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const bridge = U.pt(6);
  const noseBase = U.pt(2);
  const top = U.pt(10);
  const chin = U.pt(152);
  if (!bridge || !noseBase || !top || !chin) return null;

  const noseLength = Math.abs(noseBase.y - bridge.y);
  const faceLength = Math.abs(chin.y - top.y);
  if (noseLength === 0 || faceLength === 0) return null;

  const ratio = noseLength / faceLength;
  return idealScore(ratio, 0.3, 0.035, 1, 10);
}

/** Nose projection — ratio of nose tip protrusion to nose length. */
export function getNoseProjectionScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const projection = calculateNoseProjection(result.faceLandmarks[0]);
  if (projection === null) return null;
  return idealScore(projection, 0.55, 0.07, 1, 10);
}

/** Lip width ratio — mouth width relative to face width. */
export function getLipWidthRatioScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const ratio = calculateLipWidthRatio(result.faceLandmarks[0]);
  if (ratio === null) return null;
  return idealScore(ratio, 0.42, 0.05, 1, 10);
}

/** Upper lip ratio — upper lip height relative to total lip height. */
export function getUpperLipRatioScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const ratio = calculateUpperLipRatio(result.faceLandmarks[0]);
  if (ratio === null) return null;
  return idealScore(ratio, 0.38, 0.05, 1, 10);
}

/** Nose bridge angle — straightness of the nose bridge. */
export function getNoseBridgeAngleScore(result: FaceLandmarkerResult): number | null {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  const angle = calculateNoseBridgeAngle(result.faceLandmarks[0]);
  if (angle === null) return null;
  return idealScore(angle, 135, 8, 1, 10);
}

/** Eye tilt — angle of the eye's long axis (positive = outer corner raised). */
export function getEyeTiltScore(result: FaceLandmarkerResult): number | null {
  return getCanthalTiltScore(result);
}

export function getSkinClarity(canvas: HTMLCanvasElement, result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;

  const ctx = canvas.getContext('2d');
  if (!ctx) return 5;

  const lm = result.faceLandmarks[0];
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const samplePoints = [lm[50], lm[101], lm[118], lm[330], lm[280], lm[4], lm[1]];

  let totalVariance = 0;
  let samples = 0;

  for (const point of samplePoints) {
    if (!point) continue;
    const x = Math.floor(point.x * imgWidth);
    const y = Math.floor(point.y * imgHeight);
    const radius = 8;

    try {
      const imageData = ctx.getImageData(
        Math.max(0, x - radius),
        Math.max(0, y - radius),
        radius * 2,
        radius * 2,
      );
      const pixels = imageData.data;
      const values: number[] = [];

      for (let i = 0; i < pixels.length; i += 4) {
        const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        values.push(brightness);
      }

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      totalVariance += Math.sqrt(variance);
      samples++;
    } catch {
      continue;
    }
  }

  if (samples === 0) return 5;

  const avgVariance = totalVariance / samples;
  const score = Math.max(0, Math.min(10, 10 - avgVariance / 10));
  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// RAW GEOMETRY ENGINE
//
// One function produces ALL measurements from landmarks.
// Every other scorer uses these numbers — no independent rediscovery.
// ─────────────────────────────────────────────────────────────────────────────

export type MeasurementUnit = 'ratio' | 'degrees' | 'px_ratio' | 'score';

/**
 * Measurement provenance/status.
 *  - "valid": a real, trustworthy measurement of this photo.
 *  - "low_confidence": measured but with reduced certainty (e.g. strong head
 *    roll or a missing auxiliary landmark) — not precise enough to trust fully.
 *  - "unavailable": genuinely not measurable from this view/photo (e.g. a 3D
 *    /profile quantity from a frontal image). NEVER given a fabricated score.
 */
export type MeasurementStatus = 'valid' | 'low_confidence' | 'unavailable';

/**
 * Which pose the photo was captured in. Front = the standard straight-on
 * portrait (feeds nearly every metric). Profile = a side view, which is the
 * only angle that can measure the true 3D nasal quantities (projection,
 * bridge angle, alar flare); a profile photo contributes ONLY those three.
 */
export type FaceView = 'front' | 'profile';

export interface Measurement {
  raw: number;
  z: number;
  confidence: number;
  unit: MeasurementUnit;
  label: string;
  /** Population reference mean (for UI to display reference range). */
  mu: number;
  /** Population reference std dev (for UI to display reference range). */
  sigma: number;
  /**
   * Status of this measurement. "unavailable" means it must NOT be scored or
   * displayed as if it were a real value.
   */
  status: MeasurementStatus;
  /** Human-readable WHY when this measurement isn't a valid score. */
  reason?: string | null;
}

/** Confidence below this is too uncertain to trust for scoring. */
export const LOW_CONFIDENCE_THRESHOLD = 0.5;

export interface RawGeometry {
  // Raw pixel measurements
  faceWidth: number;
  faceLength: number;
  cheekWidth: number;
  jawWidth: number;
  eyeGap: number;
  leftEyeWidth: number;
  rightEyeWidth: number;
  noseWidth: number;
  noseLength: number;
  mouthWidth: number;

  // Derived ratios — Face Geometry
  faceRatio: Measurement;
  upperThird: Measurement;
  middleThird: Measurement;
  lowerThird: Measurement;
  verticalBalance: Measurement;
  horizontalFifths: Measurement;
  goldenRatio: Measurement;
  fwhr: Measurement;

  // Eyes
  eyeSpacing: Measurement;
  eyeAspectRatio: Measurement;
  canthalTilt: Measurement;
  eyeTilt: Measurement;
  browTilt: Measurement;
  browLengthRatio: Measurement;

  // Nose
  noseWidthRatio: Measurement;
  eyeNoseRatio: Measurement;
  noseChinRatio: Measurement;
  noseProjection: Measurement;
  noseBridgeAngle: Measurement;
  alarAngle: Measurement;

  // Lips
  lipFullness: Measurement;
  lipWidthRatio: Measurement;
  upperLipRatio: Measurement;

  // Structure
  jawRatio: Measurement;
  gonialAngle: Measurement;
  mandibularTaper: Measurement;
  chinProjection: Measurement;
  jawSymmetry: Measurement;
  cheekboneDefinition: Measurement;

  // Overall
  symmetry: Measurement;

  // Classification
  faceShape: FaceShapeClassification;
}

/** Reference distributions: population mean (mu) and standard deviation (sigma). */
const REFS: Record<string, { mu: number; sigma: number }> = {
  faceRatio: { mu: 0.78, sigma: 0.05 },
  verticalBalance: { mu: 0.06, sigma: 0.04 },
  horizontalFifths: { mu: 0.55, sigma: 0.2 },
  goldenRatio: { mu: 0.18, sigma: 0.12 },
  fwhr: { mu: 1.95, sigma: 0.15 },
  eyeSpacing: { mu: 1.1, sigma: 0.12 },
  eyeAspectRatio: { mu: 0.33, sigma: 0.06 },
  canthalTilt: { mu: 5.0, sigma: 3.0 },
  eyeTilt: { mu: 5.0, sigma: 3.0 },
  browTilt: { mu: 8.0, sigma: 4.0 },
  browLengthRatio: { mu: 0.34, sigma: 0.05 },
  noseWidthRatio: { mu: 0.26, sigma: 0.03 },
  noseChinRatio: { mu: 0.3, sigma: 0.035 },
  eyeNoseRatio: { mu: 0.88, sigma: 0.1 },
  noseProjection: { mu: 0.55, sigma: 0.07 },
  noseBridgeAngle: { mu: 0, sigma: 8 },
  alarAngle: { mu: 0, sigma: 10 },
  lipFullness: { mu: 0.55, sigma: 0.08 },
  lipWidthRatio: { mu: 0.47, sigma: 0.05 },
  upperLipRatio: { mu: 0.38, sigma: 0.05 },
  jawRatio: { mu: 0.6, sigma: 0.05 },
  gonialAngle: { mu: 112, sigma: 10 },
  mandibularTaper: { mu: 0.18, sigma: 0.05 },
  chinProjection: { mu: 0.0, sigma: 0.15 },
  jawSymmetry: { mu: 0.0, sigma: 0.04 },
  cheekboneDefinition: { mu: 1.18, sigma: 0.06 },
  symmetry: { mu: 0.0, sigma: 0.03 },
};

function m(
  label: string,
  raw: number,
  ref: { mu: number; sigma: number },
  confidence: number,
  unit: MeasurementUnit = 'ratio',
  reasonHint?: string,
): Measurement {
  const conf = Math.round(confidence * 100) / 100;
  if (!Number.isFinite(raw) || ref.sigma <= 0) {
    return {
      raw: 0,
      z: 0,
      confidence: 0,
      unit,
      label,
      mu: ref.mu,
      sigma: ref.sigma,
      status: 'unavailable',
      reason: 'Measurement produced an invalid value',
    };
  }
  const z = (raw - ref.mu) / ref.sigma;

  // CALIBRATION GATE: a |z| beyond ±OUT_OF_BAND_Z means the raw value sits
  // so far outside the reference distribution that the reference almost
  // certainly does not describe this metric/formula combination (stale mu/sigma
  // after a formula change, wrong units, or a degenerate face mesh). Reporting
  // the floor score (1.5) for all such metrics produces identical, meaningless
  // values that look fabricated. Instead we say the measurement is NOT RELIABLE
  // and exclude it from scoring — the metric appears as "not measured" in the
  // report instead of a fake-looking number.
  const OUT_OF_BAND_Z = 3.2;
  const outOfBand = Math.abs(z) > OUT_OF_BAND_Z;

  const status: MeasurementStatus =
    conf <= 0
      ? 'unavailable'
      : outOfBand || conf < LOW_CONFIDENCE_THRESHOLD
        ? 'low_confidence'
        : 'valid';

  const reason = status === 'valid' ? null : (reasonHint ?? 'Measurement not trustworthy');

  return {
    raw: Math.round(raw * 10000) / 10000,
    z: Math.round(z * 1000) / 1000,
    confidence: conf,
    unit,
    label,
    mu: ref.mu,
    sigma: ref.sigma,
    status,
    reason,
  };
}

function perpDist(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(px - ax, py - ay);
  return Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
}

/**
 * Compute ALL raw facial geometry measurements from MediaPipe landmarks.
 *
 * This is the single source of truth — no other function should
 * independently compute geometry from landmarks.
 */
export function computeRawGeometry(
  result: FaceLandmarkerResult,
  view: FaceView = 'front',
): RawGeometry | null {
  const lm = result.faceLandmarks?.[0];
  // Needs at least 469 points: this function dereferences index 468 (the
  // right alar base) directly, and lm[468] is undefined for a 468-point mesh.
  if (!lm || lm.length < 469) return null;

  const U = createUprightAccessor(lm);
  const pt = (i: number) => U.pt(i);
  const p = (i: number) => lm[i];

  // ── Core landmarks ──
  const forehead = pt(10);
  const chin = pt(152);
  const browLine = pt(9);
  const noseBase = pt(2);

  const leftCheek = pt(234);
  const rightCheek = pt(454);
  const leftJaw = pt(127);
  const leftJaw2 = pt(134);
  const rightJaw = pt(356);
  const rightJaw2 = pt(363);
  const leftTemple = pt(108);
  const rightTemple = pt(337);

  const leftEyeInner = pt(133);
  const rightEyeInner = pt(362);
  const leftEyeOuter = pt(33);
  const rightEyeOuter = pt(263);

  const noseBridge = pt(6);
  const noseTip = pt(1);
  const noseLeft = p(458);
  const noseRight = p(468);
  const noseBaseL = p(94);
  const noseBaseR = p(278);

  const mouthTop = pt(0);
  const mouthBottom = pt(17);
  const upperLip = pt(13);
  const lowerLip = pt(14);
  const leftMouth = pt(61);
  const rightMouth = pt(291);

  // Check all required landmarks first
  const required = [
    forehead,
    chin,
    browLine,
    noseBase,
    leftCheek,
    rightCheek,
    leftJaw,
    leftJaw2,
    rightJaw,
    rightJaw2,
    leftEyeInner,
    rightEyeInner,
    leftEyeOuter,
    rightEyeOuter,
    noseBridge,
    noseTip,
    mouthTop,
    mouthBottom,
    upperLip,
    lowerLip,
    leftMouth,
    rightMouth,
    leftTemple,
    rightTemple,
    // Raw indices used directly by nose metrics — previously dereferenced
    // without a guard, so a mesh missing them crashed with a TypeError
    // instead of reporting the measurement as unavailable.
    noseLeft,
    noseRight,
  ];
  if (required.some((p) => !p)) return null;

  // Safe accessors (non-null after guard above)
  const fg = forehead!;
  const cn = chin!;
  const bl = browLine!;
  const nb = noseBase!;
  const lc = leftCheek!;
  const rc = rightCheek!;
  const lj = leftJaw!;
  const lj2 = leftJaw2!;
  const rj = rightJaw!;
  const rj2 = rightJaw2!;
  const lei = leftEyeInner!;
  const rei = rightEyeInner!;
  const leo = leftEyeOuter!;
  const reo = rightEyeOuter!;
  const nb2 = noseBridge!;
  const nt = noseTip!;
  const mt = mouthTop!;
  const mb = mouthBottom!;
  const ul = upperLip!;
  const ll = lowerLip!;
  const lm2 = leftMouth!;
  const rm = rightMouth!;
  const lt = leftTemple!;
  const rt = rightTemple!;

  // ── Raw pixel measurements ──
  const rawFaceWidth = Math.hypot(rc.x - lc.x, rc.y - lc.y);
  const faceLength = Math.hypot(fg.x - cn.x, fg.y - cn.y);
  const rawCheekWidth = Math.abs(rc.x - lc.x);
  const rawJawWidth = Math.hypot(rj.x - lj.x, rj.y - lj.y);
  const rawEyeGap = Math.hypot(rei.x - lei.x, rei.y - lei.y);
  const rawLeftEyeW = Math.hypot(leo.x - lei.x, leo.y - lei.y);
  const rawRightEyeW = Math.hypot(reo.x - rei.x, reo.y - rei.y);
  const rawNoseW = Math.abs(noseRight.x - noseLeft.x);
  const noseL = Math.abs(nb.y - nb2.y);
  const rawMouthW = Math.abs(rm.x - lm2.x);

  // ── Yaw foreshortening correction ──
  // A mild head-turn (1–20°) compresses every horizontal distance by ≈cos(yaw),
  // which reads as a narrower face, smaller-seeming eyes and fake asymmetry on
  // the turned-away side. Undo it on the width axes instead of flagging the
  // whole report. Beyond 20° the parallax error is too extreme to correct —
  // the pose gate already down-weights those frames, and a proper fix is the
  // side-profile capture which deliberately trades width metrics for the 3D
  // nasal ones.
  const { yaw, pitch, roll } = headPose(result);
  const cosYaw = Math.cos((yaw * Math.PI) / 180);
  const yawScale = Math.abs(yaw) >= 1 && Math.abs(yaw) <= 20 && cosYaw > 0.9 ? 1 / cosYaw : 1;
  const faceWidth = Math.hypot((rc.x - lc.x) * yawScale, rc.y - lc.y);
  const cheekWidth = Math.abs((rc.x - lc.x) * yawScale);
  const jawWidth = Math.hypot((rj.x - lj.x) * yawScale, rj.y - lj.y);
  const eyeGap = Math.hypot((rei.x - lei.x) * yawScale, rei.y - lei.y);
  const leftEyeW = Math.hypot((leo.x - lei.x) * yawScale, leo.y - lei.y);
  const rightEyeW = Math.hypot((reo.x - rei.x) * yawScale, reo.y - rei.y);
  const noseW = Math.abs((noseRight.x - noseLeft.x) * yawScale);
  const mouthW = Math.abs((rm.x - lm2.x) * yawScale);

  const avgEyeWidth = (leftEyeW + rightEyeW) / 2;
  const upper = Math.abs(bl.y - fg.y);
  const middle = Math.abs(nb.y - bl.y);
  const lower = Math.abs(cn.y - nb.y);

  // Degenerate-geometry handling: when a divisor collapses to zero the ratio
  // is undefined, NOT "exactly the population mean". Substituting the reference
  // mean as a fallback made the calibration gate pass (z = 0) and produced a
  // fabricated 'valid' 7.5 "perfectly average" score for unmeasurable geometry.
  // A null ratio now gates the measurement to unavailable (confidence 0).
  const DEGENERATE_REASON =
    'Face geometry too degenerate to measure — retake the photo with the whole face clearly in frame';
  const gatedConf = (raw: number | null) => (raw === null ? 0 : coreConf);
  const gatedRaw = (raw: number | null, fallback: number) => raw ?? fallback;

  // ── Derived ratios ──
  const faceRatio = faceLength > 0 ? faceWidth / faceLength : null;
  const uThird = faceLength > 0 ? upper / faceLength : null;
  const mThird = faceLength > 0 ? middle / faceLength : null;
  const lThird = faceLength > 0 ? lower / faceLength : null;
  const thirdsPresent = [uThird, mThird, lThird].filter(
    (t): t is number => t !== null,
  );
  const avgThird =
    thirdsPresent.length > 0
      ? thirdsPresent.reduce((a, b) => a + b, 0) / thirdsPresent.length
      : null;
  const vBalance =
    avgThird !== null && thirdsPresent.length >= 2
      ? thirdsPresent.reduce((sum, t) => sum + Math.abs(t - avgThird), 0) /
        (avgThird * thirdsPresent.length)
      : null;

  const faceW = reo.x - leo.x;
  const leftEyeW2 = lei.x - leo.x;
  const intercanthal = rei.x - lei.x;
  const rightEyeW2 = reo.x - rei.x;
  const outerBands = faceW > 0 ? (faceW - (leftEyeW2 + intercanthal + rightEyeW2)) / 2 : null;
  const ideal5 = faceW > 0 ? faceW / 5 : null;
  const fifths = [outerBands, leftEyeW2, intercanthal, rightEyeW2, outerBands];
  const hFifths =
    ideal5 !== null
      ? fifths.reduce((sum, f) => sum + Math.abs((f ?? 0) - ideal5) / ideal5, 0)
      : null;

  // Golden-ratio (φ) adherence as a composite of genuinely φ-consistent,
  // *independent* facial ratios. A face has many proportions; the old code
  // compared faceWidth/faceLength (~0.45, the FWHR's inverse) against 0.618,
  // which reads ~30σ off for every face and floors the whole metric. Instead
  // measure ratios that actually sit near φ for real faces:
  //   face length / face width ≈ φ (1.618)
  //   mouth width / nose width  ≈ φ
  // Lower value = closer to the ideal; this is an honest deviation score.
  const phi = 1.618;
  const faceLenToW = faceLength > 0 && faceWidth > 0 ? faceLength / faceWidth : null;
  const mouthToNose = noseW > 0 ? mouthW / noseW : null;
  const goldenAdherence =
    faceLenToW !== null && mouthToNose !== null
      ? Math.abs(faceLenToW - phi) * 0.6 + Math.abs(mouthToNose - phi) * 0.4
      : null;

  const browToLip = Math.abs(ul.y - bl.y);
  const fwhrVal = browToLip > 0 ? cheekWidth / browToLip : null;

  // ── Eyes ──
  const eyeSpacingRatio = avgEyeWidth > 0 ? eyeGap / avgEyeWidth : null;

  // Eye aspect ratio: vertical opening / horizontal width
  const leftEyeTop = pt(159);
  const leftEyeBot = pt(145);
  const rightEyeTop = pt(386);
  const rightEyeBot = pt(374);
  const eyeAspectRatioVal = (() => {
    if (!leftEyeTop || !leftEyeBot || !rightEyeTop || !rightEyeBot || avgEyeWidth <= 0) return null;
    const leftH = Math.abs(leftEyeTop.y - leftEyeBot.y);
    const rightH = Math.abs(rightEyeTop.y - rightEyeBot.y);
    return (leftH + rightH) / 2 / avgEyeWidth;
  })();

  // Eye axis tilt measured in the upright frame. Positive = outer canthus
  // raised above inner. Using |Δx| keeps the atan2 in the [-90,90] branch
  // regardless of whether we read a left eye (outer left of inner) or a right
  // eye (outer right of inner) — the old code used a raw signed Δx that
  // flipped one eye into ~90° for everyone.
  const tiltToDeg = (inner: Point2D, outer: Point2D): number => {
    const dx = Math.abs(inner.x - outer.x);
    if (dx <= 0) return 0;
    // outer.y - inner.y < 0 means the outer corner is higher (y grows downward)
    return -Math.atan2(outer.y - inner.y, dx) * (180 / Math.PI);
  };
  const leftTilt = tiltToDeg(lei, leo);
  const rightTilt = tiltToDeg(rei, reo);
  const eyeTiltBase = (leftTilt + rightTilt) / 2;
  // head-roll is already removed by the upright frame — do not double-correct
  const canthal = eyeTiltBase;
  const eyeTiltVal = eyeTiltBase;

  // Brow metrics
  const leftBrowOuter = pt(46);
  const leftBrowInner = pt(107);
  const rightBrowOuter = pt(276);
  const rightBrowInner = pt(334);
  const browTiltVal = (() => {
    if (!leftBrowOuter || !leftBrowInner || !rightBrowOuter || !rightBrowInner) return 6;
    // Reuse the eye tilt convention: positive = OUTER end of the brow raised
    // above the inner end (the standard "alert/attractive" reading). The old
    // code measured positive = inner raised, which flips every normal brow to
    // a large negative angle and floors the metric against its mu=+8 reference.
    const left = tiltToDeg(leftBrowInner, leftBrowOuter);
    const right = tiltToDeg(rightBrowInner, rightBrowOuter);
    return (left + right) / 2;
  })();
  const browLengthRatioVal = (() => {
    if (!leftBrowOuter || !leftBrowInner || !rightBrowOuter || !rightBrowInner || faceWidth <= 0)
      return 0.4;
    const leftLen = Math.hypot(
      leftBrowInner.x - leftBrowOuter.x,
      leftBrowInner.y - leftBrowOuter.y,
    );
    const rightLen = Math.hypot(
      rightBrowInner.x - rightBrowOuter.x,
      rightBrowInner.y - rightBrowOuter.y,
    );
    return (leftLen + rightLen) / 2 / faceWidth;
  })();

  // ── Nose ──
  const noseWidthRatioVal = faceWidth > 0 ? noseW / faceWidth : null;
  const noseChinRatioVal = faceLength > 0 ? noseL / faceLength : null;
  const eyeNoseRatioVal = noseW > 0 ? avgEyeWidth / noseW : null;

  const noseProjectionVal = (() => {
    const noseBaseWidth = Math.abs(noseRight.x - noseLeft.x);
    const noseLen = Math.abs(nt.y - nb.y);
    if (noseLen <= 0) return null;
    return noseBaseWidth / (2 * noseLen);
  })();

  const noseBridgeAngleVal = (() => {
    // Deviation of the nose-bridge line (root → tip) from the vertical facial
    // axis. 0° = perfectly straight bridge; positive = tip shifted right of
    // the root. The old code measured the nose-tip apex angle (~60-170°) but
    // was calibrated as if it were a vertical-reference angle (mu=135), so
    // every face was pushed to the floor. Reframe as a real, calibrated
    // vertical-deviation measurement.
    const root = pt(168); // bridge root (between the eyes)
    const tip = pt(1); // nose tip (lowest, most projected)
    if (!root || !tip) return null;
    const vertical = Math.abs(root.y - tip.y);
    if (vertical <= 0) return null;
    return Math.atan2(tip.x - root.x, vertical) * (180 / Math.PI);
  })();

  // Alar angle: angle of nostril flare from nose tip to alar base
  const alarAngleVal = (() => {
    if (!noseBaseL || !noseBaseR) return null;
    const leftAlar =
      Math.atan2(noseBaseL.y - nt.y, (noseBaseL.x - nt.x) * yawScale) * (180 / Math.PI);
    const rightAlar =
      Math.atan2(noseBaseR.y - nt.y, (noseBaseR.x - nt.x) * yawScale) * (180 / Math.PI);
    return Math.abs(leftAlar - rightAlar);
  })();

  // ── Lips ──
  const lipH = Math.abs(ll.y - ul.y);
  const mouthH = Math.abs(mb.y - mt.y);
  const lipFull = mouthH > 0 ? lipH / mouthH : null;
  const lipWR = faceWidth > 0 ? mouthW / faceWidth : null;
  const upperLR = lipH > 0 ? Math.abs(ul.y - mt.y) / lipH : null;

  // ── Structure ──
  const jawRatioVal = faceLength > 0 ? jawWidth / faceLength : null;

  const gonialAngleVal =
    Math.abs(Math.atan2(lj2.y - cn.y, lj2.x - cn.x) - Math.atan2(rj2.y - cn.y, rj2.x - cn.x)) *
    (180 / Math.PI);

  const taperVal = cheekWidth > 0 ? (cheekWidth - jawWidth) / cheekWidth : null;

  const chinCenter = Math.abs(cn.x - (lj.x + rj.x) / 2);
  const chinProj = jawWidth > 0 ? chinCenter / (jawWidth / 2) : null;

  const asymmetry = faceLength > 0 ? Math.abs(lj.y - rj.y) / faceLength : null;

  const cheekDef = jawWidth > 0 ? cheekWidth / jawWidth : null;

  // ── Symmetry ──
  const axisA = { x: (lei.x + rei.x) / 2, y: (lei.y + rei.y) / 2 };
  const axisB = { x: cn.x, y: cn.y };
  const pairs = [
    [lj, rj],
    [lc, rc],
    [leo, reo],
    [lm2, rm],
  ];
  let symSum = 0;
  for (const [lp, rp] of pairs) {
    symSum += Math.abs(
      perpDist(axisA.x, axisA.y, axisB.x, axisB.y, lp.x, lp.y) -
        perpDist(axisA.x, axisA.y, axisB.x, axisB.y, rp.x, rp.y),
    );
  }
  const symDev = faceLength > 0 ? symSum / (pairs.length * faceLength) : null;

  // ── Face shape ──
  const faceShape = calculateFaceShape(lm);

  // Honest per-measurement confidence. Penalises all THREE pose axes (yaw,
  // pitch, roll) — the old code only looked at roll via the upright frame, so
  // a turned (yaw) head still reported full confidence. Yaw's contribution is
  // now the largest term: it silently distorts every bilateral width metric.
  // For a side profile, yaw ≈90° is the EXPECTED pose, so only pitch/roll
  // penalise it (the width metrics it ruins are already gated to "unavailable"
  // for that view).
  const poseFactor =
    view === 'profile'
      ? Math.max(0.4, Math.min(1, 1 - (Math.abs(roll) / 30 + Math.abs(pitch) / 40)))
      : Math.max(0.4, Math.min(1, 1 - (Math.abs(yaw) / 35 + Math.abs(roll) / 30 + Math.abs(pitch) / 40)));
  const conf = (indices: number[]): number => {
    if (indices.some((i) => !pt(i))) return 0;
    return Math.round(poseFactor * 100) / 100;
  };
  const coreConf = Math.round(poseFactor * 100) / 100;

  // View gating for 3D-projection and profile-only measurements.
  // Nasal projection, bridge angle and alar flare are fundamentally 3D /
  // profile quantities: from a frontal 2D image the plane-proxy is not an
  // anatomical measurement. They are ALWAYS unavailable from a 'front' view,
  // regardless of how turned the head is — a half-turned front shot is not a
  // profile, and previously it slipped past the old nose-on-midline gate and
  // got measured (and the report re-labeled it as a 'profile' reading).
  // Only a genuine 'profile' view measures them, with dedicated profile
  // formulas that override below.
  const viewConstrainedConf = (indices: number[]): number => {
    if (view === 'front') return 0;
    return conf(indices);
  };

  const geo: RawGeometry = {
    faceWidth,
    faceLength,
    cheekWidth,
    jawWidth,
    eyeGap,
    leftEyeWidth: leftEyeW,
    rightEyeWidth: rightEyeW,
    noseWidth: noseW,
    noseLength: noseL,
    mouthWidth: mouthW,

    faceRatio: m('Face Ratio (W/L)', gatedRaw(faceRatio, REFS.faceRatio.mu), REFS.faceRatio, gatedConf(faceRatio), 'ratio', faceRatio === null ? DEGENERATE_REASON : undefined),
    upperThird: m('Upper Third', gatedRaw(uThird, 1 / 3), { mu: 1 / 3, sigma: 0.04 }, gatedConf(uThird), 'ratio', uThird === null ? DEGENERATE_REASON : undefined),
    middleThird: m('Middle Third', gatedRaw(mThird, 1 / 3), { mu: 1 / 3, sigma: 0.04 }, gatedConf(mThird), 'ratio', mThird === null ? DEGENERATE_REASON : undefined),
    lowerThird: m('Lower Third', gatedRaw(lThird, 1 / 3), { mu: 1 / 3, sigma: 0.04 }, gatedConf(lThird), 'ratio', lThird === null ? DEGENERATE_REASON : undefined),
    verticalBalance: m('Vertical Balance', gatedRaw(vBalance, 0), REFS.verticalBalance, gatedConf(vBalance), 'ratio', vBalance === null ? DEGENERATE_REASON : undefined),
    horizontalFifths: m('Horizontal Fifths', gatedRaw(hFifths, 0), REFS.horizontalFifths, gatedConf(hFifths), 'ratio', hFifths === null ? DEGENERATE_REASON : undefined),
    goldenRatio: m('Golden Ratio Adherence', gatedRaw(goldenAdherence, 0), REFS.goldenRatio, gatedConf(goldenAdherence), 'ratio', goldenAdherence === null ? DEGENERATE_REASON : undefined),
    fwhr: m('FWHR', gatedRaw(fwhrVal, REFS.fwhr.mu), REFS.fwhr, gatedConf(fwhrVal), 'ratio', fwhrVal === null ? DEGENERATE_REASON : undefined),

    eyeSpacing: m('Eye Spacing', gatedRaw(eyeSpacingRatio, REFS.eyeSpacing.mu), REFS.eyeSpacing, gatedConf(eyeSpacingRatio), 'ratio', eyeSpacingRatio === null ? DEGENERATE_REASON : undefined),
    eyeAspectRatio: m(
      'Eye Aspect Ratio',
      gatedRaw(eyeAspectRatioVal, REFS.eyeAspectRatio.mu),
      REFS.eyeAspectRatio,
      gatedConf(eyeAspectRatioVal),
      'ratio',
      eyeAspectRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    canthalTilt: m('Canthal Tilt', canthal, REFS.canthalTilt, coreConf, 'degrees'),
    eyeTilt: m('Eye Tilt', eyeTiltVal, REFS.eyeTilt, coreConf, 'degrees'),
    browTilt: m('Brow Tilt', browTiltVal, REFS.browTilt, conf([46, 107, 276, 334]), 'degrees'),
    browLengthRatio: m(
      'Brow Length Ratio',
      browLengthRatioVal,
      REFS.browLengthRatio,
      conf([46, 107, 276, 334]),
    ),

    noseWidthRatio: m('Nose Width Ratio', gatedRaw(noseWidthRatioVal, REFS.noseWidthRatio.mu), REFS.noseWidthRatio, gatedConf(noseWidthRatioVal), 'ratio', noseWidthRatioVal === null ? DEGENERATE_REASON : undefined),
    eyeNoseRatio: m(
      'Eye–Nose Ratio',
      gatedRaw(eyeNoseRatioVal, REFS.eyeNoseRatio.mu),
      REFS.eyeNoseRatio,
      gatedConf(eyeNoseRatioVal),
      'ratio',
      eyeNoseRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    noseChinRatio: m('Nose–Chin Ratio', gatedRaw(noseChinRatioVal, REFS.noseChinRatio.mu), REFS.noseChinRatio, gatedConf(noseChinRatioVal), 'ratio', noseChinRatioVal === null ? DEGENERATE_REASON : undefined),
    noseProjection: m(
      'Nose Projection',
      gatedRaw(noseProjectionVal, REFS.noseProjection.mu),
      REFS.noseProjection,
      noseProjectionVal === null ? 0 : viewConstrainedConf([458, 468]),
      'ratio',
      noseProjectionVal === null ? DEGENERATE_REASON : undefined,
    ),
    noseBridgeAngle: m(
      'Nose Bridge Angle',
      gatedRaw(noseBridgeAngleVal, REFS.noseBridgeAngle.mu),
      REFS.noseBridgeAngle,
      noseBridgeAngleVal === null ? 0 : viewConstrainedConf([1, 168]),
      'degrees',
      noseBridgeAngleVal === null ? DEGENERATE_REASON : undefined,
    ),
    alarAngle: m(
      'Alar Angle',
      gatedRaw(alarAngleVal, REFS.alarAngle.mu),
      REFS.alarAngle,
      alarAngleVal === null ? 0 : viewConstrainedConf([94, 278]),
      'degrees',
      alarAngleVal === null ? DEGENERATE_REASON : undefined,
    ),

    lipFullness: m('Lip Fullness', gatedRaw(lipFull, REFS.lipFullness.mu), REFS.lipFullness, gatedConf(lipFull), 'ratio', lipFull === null ? DEGENERATE_REASON : undefined),
    lipWidthRatio: m('Lip Width Ratio', gatedRaw(lipWR, REFS.lipWidthRatio.mu), REFS.lipWidthRatio, gatedConf(lipWR), 'ratio', lipWR === null ? DEGENERATE_REASON : undefined),
    upperLipRatio: m('Upper Lip Ratio', gatedRaw(upperLR, REFS.upperLipRatio.mu), REFS.upperLipRatio, gatedConf(upperLR), 'ratio', upperLR === null ? DEGENERATE_REASON : undefined),

    jawRatio: m('Jaw Ratio', gatedRaw(jawRatioVal, REFS.jawRatio.mu), REFS.jawRatio, gatedConf(jawRatioVal), 'ratio', jawRatioVal === null ? DEGENERATE_REASON : undefined),
    gonialAngle: m('Gonial Angle', gonialAngleVal, REFS.gonialAngle, coreConf, 'degrees'),
    mandibularTaper: m('Mandibular Taper', gatedRaw(taperVal, REFS.mandibularTaper.mu), REFS.mandibularTaper, gatedConf(taperVal), 'ratio', taperVal === null ? DEGENERATE_REASON : undefined),
    chinProjection: m('Chin Projection', gatedRaw(chinProj, REFS.chinProjection.mu), REFS.chinProjection, gatedConf(chinProj), 'ratio', chinProj === null ? DEGENERATE_REASON : undefined),
    jawSymmetry: m('Jaw Symmetry', gatedRaw(asymmetry, REFS.jawSymmetry.mu), REFS.jawSymmetry, gatedConf(asymmetry), 'ratio', asymmetry === null ? DEGENERATE_REASON : undefined),
    cheekboneDefinition: m('Cheekbone Definition', gatedRaw(cheekDef, REFS.cheekboneDefinition.mu), REFS.cheekboneDefinition, gatedConf(cheekDef), 'ratio', cheekDef === null ? DEGENERATE_REASON : undefined),

    symmetry: m('Symmetry', gatedRaw(symDev, 0), REFS.symmetry, gatedConf(symDev), 'ratio', symDev === null ? DEGENERATE_REASON : undefined),

    faceShape,
  };

  // ── Side-profile (view = 'profile') ──
  // A profile photo cannot measure frontal 2D quantities — widths, symmetry,
  // fifths and lip/eye ratios all foreshorten to garbage from the side. We
  // keep only the three genuinely 3D nasal metrics, measured from the profile
  // silhouette, and mark everything else explicitly unavailable so the report
  // stays honest instead of scoring distorted numbers.
  if (view === 'profile') {
    const unavailable = (orig: Measurement): Measurement => ({
      ...orig,
      raw: 0,
      z: 0,
      confidence: 0,
      status: 'unavailable',
      reason: 'Not measurable from a side profile — use a straight-on front photo',
    });

    const nasal = (() => {
      const tip = pt(1);
      const glabella = pt(9);
      const chinP = pt(152);
      const bridgeRoot = pt(168);
      if (!tip || !glabella || !chinP || !bridgeRoot) return null;

      // Facial plane = glabella→chin line (the profile's vertical axis).
      const faceVecX = chinP.x - glabella.x;
      const faceVecY = chinP.y - glabella.y;
      const faceLen = Math.hypot(faceVecX, faceVecY);

      // Nose projection: perpendicular distance of the tip from the facial
      // plane, normalised by the nose's vertical length — the classic profile
      // "how far the nose sticks out" measure.
      const pl =
        faceLen > 0
          ? Math.abs(
              ((tip.x - glabella.x) * faceVecY - (tip.y - glabella.y) * faceVecX) / faceLen,
            )
          : 0;
      const noseLenProf = Math.abs(bridgeRoot.y - tip.y);
      const projection = noseLenProf > 0 ? pl / noseLenProf : 0;

      // Nose bridge angle: deviation of the bridge line (root→tip) from the
      // facial plane. 0° = bridge parallel to the face axis; larger = more
      // droop/convex profile.
      const dot = (bridgeRoot.x - tip.x) * faceVecX + (bridgeRoot.y - tip.y) * faceVecY;
      const crossMag = Math.abs(
        (bridgeRoot.x - tip.x) * faceVecY - (bridgeRoot.y - tip.y) * faceVecX,
      );
      const bridgeAngle = Math.atan2(crossMag, dot) * (180 / Math.PI);

      // Alar flare (profile): angle between tip→wing-left and tip→wing-right.
      // In a true profile one wing wraps toward the camera and the other
      // flattens behind — the spread between them IS the visible sagittal flare.
      const lw = p(94);
      const rw = p(278);
      if (!lw || !rw) return null;
      const lA = Math.atan2(Math.abs(lw.y - tip.y), Math.abs(lw.x - tip.x)) * (180 / Math.PI);
      const rA = Math.atan2(Math.abs(rw.y - tip.y), Math.abs(rw.x - tip.x)) * (180 / Math.PI);
      const flare = Math.abs(lA - rA);

      return {
        projection: m('Nose Projection', projection, REFS.noseProjection, coreConf * 0.95),
        bridgeAngle: m(
          'Nose Bridge Angle',
          bridgeAngle,
          REFS.noseBridgeAngle,
          coreConf * 0.95,
          'degrees',
        ),
        alar: m('Alar Angle', flare, { mu: 50, sigma: 16 }, coreConf * 0.95, 'degrees'),
      };
    })();

    const gated: RawGeometry = { ...geo };
    for (const key of Object.keys(gated) as (keyof RawGeometry)[]) {
      if (
        key === 'faceShape' ||
        key === 'noseProjection' ||
        key === 'noseBridgeAngle' ||
        key === 'alarAngle'
      )
        continue;
      // Plain numeric display widths (faceWidth etc.) carry no status — only
      // Measurement fields are gated to "unavailable" for a profile photo.
      if (typeof gated[key] === 'number') continue;
      (gated as unknown as Record<keyof RawGeometry, Measurement>)[key] = unavailable(
        gated[key] as Measurement,
      );
    }
    if (nasal) {
      gated.noseProjection = nasal.projection;
      gated.noseBridgeAngle = nasal.bridgeAngle;
      gated.alarAngle = nasal.alar;
    } else {
      gated.noseProjection = unavailable(geo.noseProjection);
      gated.noseBridgeAngle = unavailable(geo.noseBridgeAngle);
      gated.alarAngle = unavailable(geo.alarAngle);
    }
    // A profile silhouette cannot classify face shape — report it honestly.
    gated.faceShape = { primary: 'Unknown', probabilities: {} };
    return gated;
  }

  return geo;
}

export function getFacialShape(result: FaceLandmarkerResult): FaceShapeClassification {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0)
    return { primary: 'Unknown', probabilities: {} };
  return calculateFaceShape(result.faceLandmarks[0]);
}

export async function analyzeFace(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  onProgress?: (progress: number) => void,
): Promise<FaceLandmarkerResult> {
  onProgress?.(10);

  const initEngine = async (): Promise<void> => {
    await initializeFaceLandmarker();
  };

  try {
    await initEngine();
  } catch (firstErr) {
    console.error('MediaPipe init error:', firstErr);
    // One self-heal retry: a poisoned cached instance or half-fetched asset
    // recovers on a clean rebuild without the user ever seeing an error.
    resetFaceEngine();
    try {
      await initEngine();
    } catch (err) {
      console.error('MediaPipe retry failed:', err);
      throw new Error(describeEngineError(err));
    }
  }
  onProgress?.(30);

  let source = imageSource;
  try {
    source = prepareCanvas(imageSource);
  } catch (err) {
    console.error('Image prepare error:', err);
    throw new Error('Could not read that photo. Try a smaller, clear JPEG or PNG.');
  }

  try {
    const result = promotePrimaryFace(await runDetection(source));
    onProgress?.(100);
    return result;
  } catch (err) {
    console.error('MediaPipe detect error:', err);
    if (err instanceof DOMException && err.name === 'SecurityError') {
      throw new Error(
        'Your browser blocked reading the photo pixels for security reasons. Try a different photo, or re-upload it.',
      );
    }
    throw new Error(
      'The face-detection engine could not process that photo. Try a clearer, front-facing photo.',
    );
  }
}

export async function detectFaceLandmarksOnly(
  imageSource: HTMLImageElement | HTMLCanvasElement,
): Promise<number[][]> {
  const source = prepareCanvas(imageSource);
  const result = promotePrimaryFace(await runDetection(source));
  return result.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];
}
