import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { prepareCanvas } from "./preprocessing";
import { resolveModelUrl, resolveWasmBase, invalidateAssetResolution, MODEL_SOURCES } from "./engine-assets";
import { calculateSymmetryScore, calculateFaceShape, calculateSymmetryAxis, createUprightAccessor, type FaceShapeClassification } from "./face-geometry";
import { idealScore } from "./scoring-curves";

let faceLandmarker: FaceLandmarker | null = null;
let landmarkerInitPromise: Promise<FaceLandmarker> | null = null;

async function createLandmarker(delegate: "GPU" | "CPU"): Promise<FaceLandmarker> {
  const [vision, modelUrl] = await Promise.all([
    resolveWasmBase().then((base) => FilesetResolver.forVisionTasks(base)),
    resolveModelUrl(MODEL_SOURCES.faceLandmarker),
  ]);
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelUrl,
      delegate,
    },
    runningMode: "IMAGE",
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
    for (const delegate of ["GPU", "CPU"] as const) {
      try {
        faceLandmarker = await createLandmarker(delegate);
        return faceLandmarker;
      } catch (err) {
        lastErr = err;
        console.warn(`Face landmarker ${delegate} delegate failed — trying next fallback:`, err);
      }
    }
    landmarkerInitPromise = null;
    throw lastErr instanceof Error ? lastErr : new Error("Failed to initialise face landmarker");
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
  const detail = `${err ?? ""}`;
  const msg = err instanceof Error ? err.message : detail;
  if (/wasm|CompileError|WebAssembly/i.test(detail)) {
    return "This browser could not start the WebAssembly vision engine. Update your browser (Chrome/Samsung Internet/Edge) and try again.";
  }
  if (/ERR_INTERNET_DISCONNECTED|NetworkError|network/i.test(detail)) {
    return "You appear to be offline. Reconnect and try again — analysis needs to download its vision model once.";
  }
  if (/ERR_BLOCKED_BY_CLIENT|blocked/i.test(detail)) {
    return "A browser extension (ad-blocker/privacy shield) blocked the vision engine download. Pause it for this site and retry.";
  }
  if (/fetch|Failed to fetch|AbortError|timeout/i.test(msg)) {
    return "The vision engine download timed out. Check your connection and try again.";
  }
  return "Could not load the face-detection engine. Check your connection and try again.";
}

/**
 * Run detect() with self-healing: if inference throws after the engine was
 * working (the classic "engine disconnected" symptom), rebuild once on CPU and
 * retry instead of surfacing a dead session to the user.
 */
async function runDetection(
  source: HTMLCanvasElement,
  initFallbackReason?: unknown
): Promise<FaceLandmarkerResult> {
  const landmarker = await initializeFaceLandmarker();
  try {
    return landmarker.detect(source);
  } catch (err) {
    console.warn(
      "Face engine stopped responding — rebuilding a fresh instance:",
      err ?? initFallbackReason
    );
    resetFaceEngine();
    try {
      faceLandmarker = await createLandmarker("CPU");
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
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
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

  const reorder = <T,>(arr: T[]): T[] => order.map((i) => arr[i]);

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

export function getFaceSymmetry(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  return calculateSymmetryScore(result.faceLandmarks[0]);
}

export function getFaceSymmetryAxis(result: FaceLandmarkerResult) {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return calculateSymmetryAxis(result.faceLandmarks[0]);
}

export function getFaceProportions(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

  // Vertical thirds are measured in the upright frame so a rolled head
  // doesn't shrink the face-length denominator by cos(tilt).
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const forehead = U.pt(10);
  const chin = U.pt(152);
  const browLine = U.pt(9);
  const noseBottom = U.pt(2);
  if (!forehead || !chin || !browLine || !noseBottom) return 0;

  const faceLength = chin.y - forehead.y;
  if (faceLength === 0) return 0;

  const upperThird = (browLine.y - forehead.y) / faceLength;
  const middleThird = (noseBottom.y - browLine.y) / faceLength;
  const lowerThird = (chin.y - noseBottom.y) / faceLength;

  const idealRatio = 1 / 3;
  const deviation =
    Math.abs(upperThird - idealRatio) +
    Math.abs(middleThird - idealRatio) +
    Math.abs(lowerThird - idealRatio);

  return idealScore(deviation, 0, 0.09);
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
export function getJawlineScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

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
  if (!leftJaw1 || !leftJaw2 || !rightJaw1 || !rightJaw2 || !chin || !top || !leftCheek || !rightCheek || !chinTip) return 0;

  // 1. Jaw-to-face ratio
  const jawWidth = Math.hypot(rightJaw1.x - leftJaw1.x, rightJaw1.y - leftJaw1.y);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const jawRatio = jawWidth / faceLength;
  const s1 = idealScore(jawRatio, 0.78, 0.10);

  // 2. Gonial angle proxy (angle between jaw corner and chin)
  const leftAngle = Math.abs(
    Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
    Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x)
  ) * (180 / Math.PI);
  // Ideal gonial angle ~120° for balanced jaw
  const s2 = idealScore(leftAngle, 120, 18);

  // 3. Mandibular taper (jaw narrows toward chin — higher = more tapered)
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const taper = cheekWidth > 0 ? (cheekWidth - jawWidth) / cheekWidth : 0.5;
  // Ideal taper ~0.45 (jaw is ~55% of cheek width)
  const s3 = idealScore(taper, 0.45, 0.15);

  // 4. Chin projection (chin position relative to jaw — closer to center = more projected)
  const chinCenter = Math.abs(chinTip.x - (leftJaw1.x + rightJaw1.x) / 2);
  const chinProjection = jawWidth > 0 ? chinCenter / (jawWidth / 2) : 0.5;
  // Lower chinCenter = more centered = better projection
  const s4 = idealScore(chinProjection, 0.0, 0.3);

  // 5. Jaw symmetry (levelness between left and right jaw corners)
  const asymmetry = Math.abs(leftJaw1.y - rightJaw1.y) * (180 / Math.PI) / faceLength;
  const s5 = idealScore(asymmetry, 0, 0.08);

  // Weighted average: ratio and gonial are most important
  const score = s1 * 0.25 + s2 * 0.30 + s3 * 0.15 + s4 * 0.15 + s5 * 0.15;
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
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
  if (!leftJaw1 || !leftJaw2 || !rightJaw1 || !rightJaw2 || !chin || !top || !leftCheek || !rightCheek) return null;

  const jawWidth = Math.hypot(rightJaw1.x - leftJaw1.x, rightJaw1.y - leftJaw1.y);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);

  const jawAngle = Math.abs(
    Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
    Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x)
  ) * (180 / Math.PI);

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
export type StructureProfileType = "Soft" | "Balanced" | "Defined" | "Sharp";

export interface StructureProfileResult {
  label: StructureProfileType;
  jawlineScore: number;
  cheekboneScore: number;
  chinProjection: number;
  facialConvexity: number;
  overallAngle: number;
}

export function getStructureProfile(result: FaceLandmarkerResult): StructureProfileResult {
  const defaultProfile: StructureProfileResult = {
    label: "Balanced",
    jawlineScore: 5,
    cheekboneScore: 5,
    chinProjection: 5,
    facialConvexity: 5,
    overallAngle: 5,
  };

  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return defaultProfile;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftJaw = U.pt(127);
  const rightJaw = U.pt(356);
  const leftCheek = U.pt(234);
  const rightCheek = U.pt(454);
  const chin = U.pt(152);
  const top = U.pt(10);
  const leftTemple = U.pt(108);
  const rightTemple = U.pt(337);

  if (!leftJaw || !rightJaw || !leftCheek || !rightCheek || !chin || !top || !leftTemple || !rightTemple) return defaultProfile;

  const jawWidth = Math.abs(rightJaw.x - leftJaw.x);
  const cheekWidth = Math.abs(rightCheek.x - leftCheek.x);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const templeWidth = Math.abs(rightTemple.x - leftTemple.x);

  if (faceLength <= 0 || cheekWidth <= 0 || jawWidth <= 0) return defaultProfile;

  const jawlineProminence = jawWidth / faceLength;
  const cheekToJaw = cheekWidth / jawWidth;
  const chinCenter = Math.abs(chin.x - (leftJaw.x + rightJaw.x) / 2) / (jawWidth / 2);
  const facialConvexity = templeWidth / cheekWidth;

  const jawlineScore = idealScore(jawlineProminence, 0.78, 0.10);
  const cheekboneScore = idealScore(cheekToJaw, 1.07, 0.09);
  const chinProj = idealScore(chinCenter, 0.0, 0.3);
  const convexity = idealScore(facialConvexity, 0.90, 0.12);

  const overall = (jawlineScore + cheekboneScore + chinProj + convexity) / 4;

  let label: StructureProfileType = "Balanced";
  if (overall >= 8) label = "Sharp";
  else if (overall >= 6.5) label = "Defined";
  else if (overall >= 4.5) label = "Balanced";
  else label = "Soft";

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
  blendshapes?: { eyeOpenness: number; smileIntensity: number }
): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 50;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const lm = result.faceLandmarks[0];

  // 1. Skin smoothness — average brightness variance across face zones
  const ctx = canvas.getContext("2d");
  let skinSmoothness = 50;
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
          Math.max(0, x - radius), Math.max(0, y - radius),
          radius * 2, radius * 2
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
      } catch { continue; }
    }
    if (samples > 0) {
      const avgVariance = totalVariance / samples;
      // Lower variance = smoother skin = higher youthfulness
      skinSmoothness = Math.max(0, Math.min(100, 100 - avgVariance * 3));
    }
  }

  // 2. Eye openness from blendshapes
  const eyeOpenness = blendshapes ? blendshapes.eyeOpenness * 100 : 50;

  // 3. Facial compactness (midface ratio — shorter midface reads younger)
  const browLine = U.pt(9);
  const noseBase = U.pt(2);
  const chin = U.pt(152);
  let compactness = 50;
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
  let brightness = 50;
  if (ctx) {
    const center = lm[1]; // nose tip
    if (center) {
      const x = Math.floor(center.x * canvas.width);
      const y = Math.floor(center.y * canvas.height);
      try {
        const imageData = ctx.getImageData(
          Math.max(0, x - 10), Math.max(0, y - 10), 20, 20
        );
        const pixels = imageData.data;
        let totalBrightness = 0;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          count++;
        }
        brightness = count > 0 ? (totalBrightness / count / 255) * 100 : 50;
      } catch { /* ignore */ }
    }
  }

  // Weighted composite
  const score = skinSmoothness * 0.35 + eyeOpenness * 0.20 + compactness * 0.25 + brightness * 0.20;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function getEyeSpacingScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftEyeInner = U.pt(133);
  const rightEyeInner = U.pt(362);
  const leftEyeOuter = U.pt(33);
  if (!leftEyeInner || !rightEyeInner || !leftEyeOuter) return 5;

  const eyeWidth = Math.hypot(leftEyeOuter.x - leftEyeInner.x, leftEyeOuter.y - leftEyeInner.y);
  const eyeGap = Math.hypot(rightEyeInner.x - leftEyeInner.x, rightEyeInner.y - leftEyeInner.y);

  const ratio = eyeGap / eyeWidth;

  // Ideal spacing ≈ one eye-width; σ calibrated to typical population spread.
  return idealScore(ratio, 1.0, 0.28);
}

function dist2(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}

/** Facial Width-to-Height Ratio (FWHR) — bizygomatic width over upper-lip-to-brow height. */
export function getFwhrScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const left = U.pt(234);
  const right = U.pt(454);
  const lip = U.pt(13);
  const brow = U.pt(9);
  if (!left || !right || !lip || !brow) return 5;

  const bizygomaticWidth = Math.abs(right.x - left.x);
  const browToLip = Math.abs(lip.y - brow.y);
  if (bizygomaticWidth === 0 || browToLip === 0) return 5;

  const fwhr = bizygomaticWidth / browToLip;
  // Researched attractive centre ≈ 1.95; σ ≈ half the real FWHR spread.
  return idealScore(fwhr, 1.95, 0.22);
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
export function getCanthalTiltScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];
  const U = createUprightAccessor(lm);

  const tilt = (inner: number, outer: number): number => {
    const a = U.pt(inner);
    const b = U.pt(outer);
    if (!a || !b) return 0;
    return Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
  };

  const leftTilt = tilt(133, 33);
  const rightTilt = tilt(362, 263);
  const avgTilt = (leftTilt + rightTilt) / 2 - U.correctedByDeg;

  // Positive tilt reads alert/attractive; population mode ≈ +5°.
  return idealScore(avgTilt, 5, 4.5);
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
    return Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
  };
  const avg = (tilt(133, 33) + tilt(362, 263)) / 2 - U.correctedByDeg;
  return Math.round(avg * 10) / 10;
}

/** Horizontal fifths balance — the face ideally divides into five equal widths. */
export function getHorizontalFifthsScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const U = createUprightAccessor(result.faceLandmarks[0]);

  const lo = U.pt(33);
  const li = U.pt(133);
  const ri = U.pt(362);
  const ro = U.pt(263);
  if (!lo || !li || !ri || !ro) return 5;

  const leftOuter = lo.x;
  const leftInner = li.x;
  const rightInner = ri.x;
  const rightOuter = ro.x;

  const faceWidth = rightOuter - leftOuter;
  if (faceWidth <= 0) return 5;

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

  return idealScore(deviation, 0, 0.3);
}

/** Eye width to nose width ratio (golden ideal ~1.618). */
export function getEyeNoseRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const le = U.pt(33);
  const re = U.pt(263);
  const ln = U.pt(94);
  const rn = U.pt(278);
  if (!le || !re || !ln || !rn) return 5;

  const eyeWidth = Math.abs(re.x - le.x);
  const noseWidth = Math.abs(rn.x - ln.x);
  if (eyeWidth === 0 || noseWidth === 0) return 5;

  const ratio = eyeWidth / noseWidth;
  return idealScore(ratio, 1.618, 0.38);
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
export function getNoseChinRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const bridge = U.pt(6);
  const noseBase = U.pt(2);
  const top = U.pt(10);
  const chin = U.pt(152);
  if (!bridge || !noseBase || !top || !chin) return 5;

  const noseLength = Math.abs(noseBase.y - bridge.y);
  const faceLength = Math.abs(chin.y - top.y);
  if (noseLength === 0 || faceLength === 0) return 5;

  const ratio = noseLength / faceLength;
  return idealScore(ratio, 0.3, 0.06);
}

/** Midface ratio — glabella-to-subnasale over subnasale-to-menton, ideal ~1.0. */
export function getMidfaceRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const U = createUprightAccessor(result.faceLandmarks[0]);
  const browLine = U.pt(9);
  const noseBase = U.pt(2);
  const chin = U.pt(152);
  if (!browLine || !noseBase || !chin) return 5;

  const upper = Math.abs(browLine.y - noseBase.y);
  const lower = Math.abs(noseBase.y - chin.y);
  if (upper === 0 || lower === 0) return 5;

  const ratio = upper / lower;
  return idealScore(ratio, 1.0, 0.14);
}

export function getSkinClarity(
  canvas: HTMLCanvasElement,
  result: FaceLandmarkerResult
): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

  const ctx = canvas.getContext("2d");
  if (!ctx) return 5;

  const lm = result.faceLandmarks[0];
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const samplePoints = [
    lm[50], lm[101], lm[118], lm[330], lm[280],
    lm[4], lm[1],
  ];

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
        radius * 2
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

export function getFacialShape(result: FaceLandmarkerResult): FaceShapeClassification {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return { primary: "Unknown", probabilities: {} };
  return calculateFaceShape(result.faceLandmarks[0]);
}

export async function analyzeFace(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<FaceLandmarkerResult> {
  onProgress?.(10);

  const initEngine = async (): Promise<void> => {
    await initializeFaceLandmarker();
  };

  try {
    await initEngine();
  } catch (firstErr) {
    console.error("MediaPipe init error:", firstErr);
    // One self-heal retry: a poisoned cached instance or half-fetched asset
    // recovers on a clean rebuild without the user ever seeing an error.
    resetFaceEngine();
    try {
      await initEngine();
    } catch (err) {
      console.error("MediaPipe retry failed:", err);
      throw new Error(describeEngineError(err));
    }
  }
  onProgress?.(30);

  let source = imageSource;
  try {
    source = prepareCanvas(imageSource);
  } catch (err) {
    console.error("Image prepare error:", err);
    throw new Error(
      "Could not read that photo. Try a smaller, clear JPEG or PNG."
    );
  }

  try {
    const result = promotePrimaryFace(await runDetection(source));
    onProgress?.(100);
    return result;
  } catch (err) {
    console.error("MediaPipe detect error:", err);
    if (err instanceof DOMException && err.name === "SecurityError") {
      throw new Error(
        "Your browser blocked reading the photo pixels for security reasons. Try a different photo, or re-upload it."
      );
    }
    throw new Error(
      "The face-detection engine could not process that photo. Try a clearer, front-facing photo."
    );
  }
}

export async function detectFaceLandmarksOnly(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<number[][]> {
  const source = prepareCanvas(imageSource);
  const result = promotePrimaryFace(await runDetection(source));
  return result.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];
}
