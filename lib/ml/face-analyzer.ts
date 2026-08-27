import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { prepareCanvas } from "./preprocessing";
import { resolveModelUrl, resolveWasmBase, invalidateAssetResolution, MODEL_SOURCES } from "./engine-assets";
import { calculateSymmetryScore, calculateFaceShape, calculateSymmetryAxis, createUprightAccessor, calculateMandibularAngle, calculateNoseProjection, calculateLipWidthRatio, calculateUpperLipRatio, calculateNoseBridgeAngle, calculateEyeTilt, type FaceShapeClassification } from "./face-geometry";
import { calibratedScore, idealScore } from "./scoring-curves";

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
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const forehead = U.pt(10);
  const chin = U.pt(152);
  const browLine = U.pt(9);
  const noseBottom = U.pt(2);
  if (!forehead || !chin || !browLine || !noseBottom) return 5;

  const faceLength = chin.y - forehead.y;
  if (faceLength === 0) return 5;

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
export function getJawlineScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;

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
  if (!leftJaw1 || !leftJaw2 || !rightJaw1 || !rightJaw2 || !chin || !top || !leftCheek || !rightCheek || !chinTip) return 5;

  // 1. Jaw-to-face ratio — sharper sigma for better discrimination
  const jawWidth = Math.hypot(rightJaw1.x - leftJaw1.x, rightJaw1.y - leftJaw1.y);
  const faceLength = Math.hypot(top.x - chin.x, top.y - chin.y);
  const jawRatio = jawWidth / faceLength;
  const s1 = idealScore(jawRatio, 0.78, 0.05);

  // 2. Gonial angle — the actual angle at the jaw corner
  const leftAngle = Math.abs(
    Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
    Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x)
  ) * (180 / Math.PI);
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
  const score = s1 * 0.25 + s2 * 0.30 + s3 * 0.15 + s4 * 0.15 + s5 * 0.15;
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

  const jawlineScore = idealScore(jawlineProminence, 0.78, 0.05);
  const cheekboneScore = idealScore(cheekToJaw, 1.07, 0.05);
  const chinProj = idealScore(chinCenter, 0.0, 0.15);
  const convexity = idealScore(facialConvexity, 0.90, 0.07);

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
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;

  const U = createUprightAccessor(result.faceLandmarks[0]);
  const leftEyeInner = U.pt(133);
  const rightEyeInner = U.pt(362);
  const leftEyeOuter = U.pt(33);
  const rightEyeOuter = U.pt(263);
  if (!leftEyeInner || !rightEyeInner || !leftEyeOuter || !rightEyeOuter) return 5;

  const leftEyeWidth = Math.hypot(leftEyeOuter.x - leftEyeInner.x, leftEyeOuter.y - leftEyeInner.y);
  const rightEyeWidth = Math.hypot(rightEyeOuter.x - rightEyeInner.x, rightEyeOuter.y - rightEyeInner.y);
  const eyeGap = Math.hypot(rightEyeInner.x - leftEyeInner.x, rightEyeInner.y - leftEyeInner.y);
  const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
  if (avgEyeWidth <= 0) return 5;

  const ratio = eyeGap / avgEyeWidth;
  return idealScore(ratio, 1.0, 0.12, 1, 10);
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

  return idealScore(deviation, 0, 0.12, 1, 10);
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
  return idealScore(ratio, 0.3, 0.035, 1, 10);
}

/** Nose projection — ratio of nose tip protrusion to nose length. */
export function getNoseProjectionScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const projection = calculateNoseProjection(result.faceLandmarks[0]);
  if (projection === null) return 5;
  return idealScore(projection, 0.55, 0.07, 1, 10);
}

/** Lip width ratio — mouth width relative to face width. */
export function getLipWidthRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const ratio = calculateLipWidthRatio(result.faceLandmarks[0]);
  if (ratio === null) return 5;
  return idealScore(ratio, 0.42, 0.05, 1, 10);
}

/** Upper lip ratio — upper lip height relative to total lip height. */
export function getUpperLipRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const ratio = calculateUpperLipRatio(result.faceLandmarks[0]);
  if (ratio === null) return 5;
  return idealScore(ratio, 0.38, 0.05, 1, 10);
}

/** Nose bridge angle — straightness of the nose bridge. */
export function getNoseBridgeAngleScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const angle = calculateNoseBridgeAngle(result.faceLandmarks[0]);
  if (angle === null) return 5;
  return idealScore(angle, 135, 8, 1, 10);
}

/** Eye tilt — angle of the eye's long axis (positive = outer corner raised). */
export function getEyeTiltScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const tilt = calculateEyeTilt(result.faceLandmarks[0]);
  if (tilt === null) return 5;
  return idealScore(tilt, 5, 3.0, 1, 10);
}

export function getSkinClarity(
  canvas: HTMLCanvasElement,
  result: FaceLandmarkerResult
): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;

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

// ─────────────────────────────────────────────────────────────────────────────
// RAW GEOMETRY ENGINE
//
// One function produces ALL measurements from landmarks.
// Every other scorer uses these numbers — no independent rediscovery.
// ─────────────────────────────────────────────────────────────────────────────

export type MeasurementUnit = "ratio" | "degrees" | "px_ratio" | "score";

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
}

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
  faceRatio:       { mu: 0.68, sigma: 0.06 },
  verticalBalance: { mu: 0.0,  sigma: 0.04 },
  horizontalFifths:{ mu: 0.0,  sigma: 0.12 },
  goldenRatio:     { mu: 0.618, sigma: 0.06 },
  fwhr:            { mu: 1.95, sigma: 0.15 },
  eyeSpacing:      { mu: 1.0,  sigma: 0.12 },
  eyeAspectRatio:  { mu: 0.33, sigma: 0.06 },
  canthalTilt:     { mu: 5.0,  sigma: 3.0 },
  eyeTilt:         { mu: 5.0,  sigma: 3.0 },
  browTilt:        { mu: 8.0,  sigma: 4.0 },
  browLengthRatio: { mu: 0.40, sigma: 0.06 },
  noseWidthRatio:  { mu: 0.28, sigma: 0.03 },
  noseChinRatio:   { mu: 0.30, sigma: 0.035 },
  noseProjection:  { mu: 0.55, sigma: 0.07 },
  noseBridgeAngle: { mu: 135,  sigma: 8 },
  alarAngle:       { mu: 85,   sigma: 10 },
  lipFullness:     { mu: 0.55, sigma: 0.08 },
  lipWidthRatio:   { mu: 0.42, sigma: 0.05 },
  upperLipRatio:   { mu: 0.38, sigma: 0.05 },
  jawRatio:        { mu: 0.78, sigma: 0.05 },
  gonialAngle:     { mu: 120,  sigma: 8 },
  mandibularTaper: { mu: 0.45, sigma: 0.08 },
  chinProjection:  { mu: 0.0,  sigma: 0.15 },
  jawSymmetry:     { mu: 0.0,  sigma: 0.04 },
  cheekboneDefinition: { mu: 1.07, sigma: 0.05 },
  symmetry:        { mu: 0.0,  sigma: 0.03 },
};

function m(
  label: string,
  raw: number,
  ref: { mu: number; sigma: number },
  confidence: number,
  unit: MeasurementUnit = "ratio"
): Measurement {
  if (!Number.isFinite(raw) || ref.sigma <= 0) {
    return { raw: 0, z: 0, confidence: 0, unit, label, mu: ref.mu, sigma: ref.sigma };
  }
  return {
    raw: Math.round(raw * 10000) / 10000,
    z: Math.round(((raw - ref.mu) / ref.sigma) * 1000) / 1000,
    confidence: Math.round(confidence * 100) / 100,
    unit,
    label,
    mu: ref.mu,
    sigma: ref.sigma,
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
export function computeRawGeometry(result: FaceLandmarkerResult): RawGeometry | null {
  const lm = result.faceLandmarks?.[0];
  if (!lm || lm.length < 468) return null;

  const U = createUprightAccessor(lm);
  const pt = (i: number) => U.pt(i);
  const p = (i: number) => lm[i];

  // ── Core landmarks ──
  const forehead = pt(10);
  const chin     = pt(152);
  const browLine = pt(9);
  const noseBase = pt(2);

  const leftCheek  = pt(234);
  const rightCheek = pt(454);
  const leftJaw    = pt(127);
  const leftJaw2   = pt(134);
  const rightJaw   = pt(356);
  const rightJaw2  = pt(363);
  const leftTemple = pt(108);
  const rightTemple= pt(337);

  const leftEyeInner  = pt(133);
  const rightEyeInner = pt(362);
  const leftEyeOuter  = pt(33);
  const rightEyeOuter = pt(263);

  const noseBridge  = pt(6);
  const noseTip     = pt(1);
  const noseLeft    = p(458);
  const noseRight   = p(468);
  const noseBaseL   = p(94);
  const noseBaseR   = p(278);

  const mouthTop    = pt(0);
  const mouthBottom = pt(17);
  const upperLip    = pt(13);
  const lowerLip    = pt(14);
  const leftMouth   = pt(61);
  const rightMouth  = pt(291);

  // Check all required landmarks first
  const required = [forehead, chin, browLine, noseBase, leftCheek, rightCheek,
    leftJaw, leftJaw2, rightJaw, rightJaw2, leftEyeInner, rightEyeInner,
    leftEyeOuter, rightEyeOuter, noseBridge, noseTip, mouthTop, mouthBottom,
    upperLip, lowerLip, leftMouth, rightMouth, leftTemple, rightTemple];
  if (required.some(p => !p)) return null;

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
  const faceWidth  = Math.hypot(rc.x - lc.x, rc.y - lc.y);
  const faceLength = Math.hypot(fg.x - cn.x, fg.y - cn.y);
  const cheekWidth = Math.abs(rc.x - lc.x);
  const jawWidth   = Math.hypot(rj.x - lj.x, rj.y - lj.y);
  const eyeGap     = Math.hypot(rei.x - lei.x, rei.y - lei.y);
  const leftEyeW   = Math.hypot(leo.x - lei.x, leo.y - lei.y);
  const rightEyeW  = Math.hypot(reo.x - rei.x, reo.y - rei.y);
  const noseW      = Math.abs(noseRight.x - noseLeft.x);
  const noseL      = Math.abs(nb.y - nb2.y);
  const mouthW     = Math.abs(rm.x - lm2.x);

  const avgEyeWidth = (leftEyeW + rightEyeW) / 2;
  const upper = Math.abs(bl.y - fg.y);
  const middle = Math.abs(nb.y - bl.y);
  const lower = Math.abs(cn.y - nb.y);

  // ── Derived ratios ──
  const faceRatio   = faceLength > 0 ? faceWidth / faceLength : 1;
  const uThird      = faceLength > 0 ? upper / faceLength : 1/3;
  const mThird      = faceLength > 0 ? middle / faceLength : 1/3;
  const lThird      = faceLength > 0 ? lower / faceLength : 1/3;
  const avgThird    = (uThird + mThird + lThird) / 3;
  const vBalance    = avgThird > 0
    ? (Math.abs(uThird - avgThird) + Math.abs(mThird - avgThird) + Math.abs(lThird - avgThird)) / (avgThird * 3)
    : 0;

  const faceW = reo.x - leo.x;
  const leftEyeW2 = lei.x - leo.x;
  const intercanthal = rei.x - lei.x;
  const rightEyeW2 = reo.x - rei.x;
  const outerBands = faceW > 0 ? (faceW - (leftEyeW2 + intercanthal + rightEyeW2)) / 2 : 0;
  const ideal5 = faceW > 0 ? faceW / 5 : 1;
  const fifths = [outerBands, leftEyeW2, intercanthal, rightEyeW2, outerBands];
  const hFifths = ideal5 > 0
    ? fifths.reduce((sum, f) => sum + Math.abs(f - ideal5) / ideal5, 0)
    : 0;

  const widthToLength = faceLength > 0 ? faceWidth / faceLength : 1;
  const mouthToFaceW  = faceWidth > 0 ? mouthW / faceWidth : 0.5;
  const goldenAdherence = Math.abs(widthToLength - 0.618) + Math.abs(mouthToFaceW - 0.6) * 0.35;

  const browToLip = Math.abs(ul.y - bl.y);
  const fwhrVal   = browToLip > 0 ? cheekWidth / browToLip : 1.95;

  // ── Eyes ──
  const eyeSpacingRatio = avgEyeWidth > 0 ? eyeGap / avgEyeWidth : 1;

  // Eye aspect ratio: vertical opening / horizontal width
  const leftEyeTop = pt(159);
  const leftEyeBot = pt(145);
  const rightEyeTop = pt(386);
  const rightEyeBot = pt(374);
  const eyeAspectRatioVal = (() => {
    if (!leftEyeTop || !leftEyeBot || !rightEyeTop || !rightEyeBot || avgEyeWidth <= 0) return 0.33;
    const leftH = Math.abs(leftEyeTop.y - leftEyeBot.y);
    const rightH = Math.abs(rightEyeTop.y - rightEyeBot.y);
    return ((leftH + rightH) / 2) / avgEyeWidth;
  })();

  const leftTiltFn = () => Math.atan2(lei.y - leo.y, leo.x - lei.x) * (180 / Math.PI);
  const rightTiltFn = () => Math.atan2(rei.y - reo.y, reo.x - rei.x) * (180 / Math.PI);
  const canthal = (leftTiltFn() + rightTiltFn()) / 2 - U.correctedByDeg;

  const rawLeftTilt  = Math.atan2(p(468).y - p(33).y, p(33).x - p(468).x) * (180 / Math.PI);
  const rawRightTilt = Math.atan2(p(278).y - p(263).y, p(263).x - p(278).x) * (180 / Math.PI);
  const eyeTiltVal = (rawLeftTilt + rawRightTilt) / 2 - U.correctedByDeg;

  // Brow metrics
  const leftBrowOuter = pt(46);
  const leftBrowInner = pt(107);
  const rightBrowOuter = pt(276);
  const rightBrowInner = pt(334);
  const browTiltVal = (() => {
    if (!leftBrowOuter || !leftBrowInner || !rightBrowOuter || !rightBrowInner) return 8;
    const leftAngle = Math.atan2(leftBrowInner.y - leftBrowOuter.y, leftBrowInner.x - leftBrowOuter.x) * (180 / Math.PI);
    const rightAngle = Math.atan2(rightBrowInner.y - rightBrowOuter.y, rightBrowInner.x - rightBrowOuter.x) * (180 / Math.PI);
    return ((-leftAngle) + rightAngle) / 2 - U.correctedByDeg;
  })();
  const browLengthRatioVal = (() => {
    if (!leftBrowOuter || !leftBrowInner || !rightBrowOuter || !rightBrowInner || faceWidth <= 0) return 0.40;
    const leftLen = Math.hypot(leftBrowInner.x - leftBrowOuter.x, leftBrowInner.y - leftBrowOuter.y);
    const rightLen = Math.hypot(rightBrowInner.x - rightBrowOuter.x, rightBrowInner.y - rightBrowOuter.y);
    return ((leftLen + rightLen) / 2) / faceWidth;
  })();

  // ── Nose ──
  const noseWidthRatioVal = faceWidth > 0 ? noseW / faceWidth : 0.28;
  const noseChinRatioVal  = faceLength > 0 ? noseL / faceLength : 0.30;

  const noseProjectionVal = (() => {
    const noseBaseWidth = Math.abs(noseRight.x - noseLeft.x);
    const noseLen = Math.abs(nt.y - nb.y);
    if (noseLen <= 0) return 0.55;
    return noseBaseWidth / (2 * noseLen);
  })();

  const noseBridgeAngleVal = (() => {
    const v1x = noseLeft.x - nt.x;
    const v1y = noseLeft.y - nt.y;
    const v2x = noseRight.x - nt.x;
    const v2y = noseRight.y - nt.y;
    const dot = v1x * v2x + v1y * v2y;
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    return mag > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI) : 135;
  })();

  // Alar angle: angle of nostril flare from nose tip to alar base
  const alarAngleVal = (() => {
    if (!noseBaseL || !noseBaseR) return 85;
    const leftAlar = Math.atan2(noseBaseL.y - nt.y, noseBaseL.x - nt.x) * (180 / Math.PI);
    const rightAlar = Math.atan2(noseBaseR.y - nt.y, noseBaseR.x - nt.x) * (180 / Math.PI);
    return Math.abs(leftAlar - rightAlar);
  })();

  // ── Lips ──
  const lipH    = Math.abs(ll.y - ul.y);
  const mouthH  = Math.abs(mb.y - mt.y);
  const lipFull = mouthH > 0 ? lipH / mouthH : 0.55;
  const lipWR   = faceWidth > 0 ? mouthW / faceWidth : 0.42;
  const upperLR = lipH > 0 ? Math.abs(ul.y - mt.y) / lipH : 0.38;

  // ── Structure ──
  const jawRatioVal   = faceLength > 0 ? jawWidth / faceLength : 0.78;

  const gonialAngleVal = Math.abs(
    Math.atan2(lj2.y - cn.y, lj2.x - cn.x) -
    Math.atan2(rj2.y - cn.y, rj2.x - cn.x)
  ) * (180 / Math.PI);

  const taperVal = cheekWidth > 0 ? (cheekWidth - jawWidth) / cheekWidth : 0.45;

  const chinCenter = Math.abs(cn.x - (lj.x + rj.x) / 2);
  const chinProj   = jawWidth > 0 ? chinCenter / (jawWidth / 2) : 0;

  const asymmetry = faceLength > 0 ? Math.abs(lj.y - rj.y) / faceLength : 0;

  const cheekDef = jawWidth > 0 ? cheekWidth / jawWidth : 1.07;

  // ── Symmetry ──
  const axisA = { x: (lei.x + rei.x) / 2, y: (lei.y + rei.y) / 2 };
  const axisB = { x: cn.x, y: cn.y };
  const pairs = [[lj, rj], [lc, rc], [leo, reo], [lm2, rm]];
  let symSum = 0;
  for (const [lp, rp] of pairs) {
    symSum += Math.abs(perpDist(axisA.x, axisA.y, axisB.x, axisB.y, lp.x, lp.y) -
                       perpDist(axisA.x, axisA.y, axisB.x, axisB.y, rp.x, rp.y));
  }
  const symDev = faceLength > 0 ? symSum / (pairs.length * faceLength) : 0;

  // ── Face shape ──
  const faceShape = calculateFaceShape(lm);

  return {
    faceWidth, faceLength, cheekWidth, jawWidth, eyeGap,
    leftEyeWidth: leftEyeW, rightEyeWidth: rightEyeW,
    noseWidth: noseW, noseLength: noseL, mouthWidth: mouthW,

    faceRatio:      m("Face Ratio (W/L)", faceRatio, REFS.faceRatio, 1),
    upperThird:     m("Upper Third", uThird, { mu: 1/3, sigma: 0.04 }, 1),
    middleThird:    m("Middle Third", mThird, { mu: 1/3, sigma: 0.04 }, 1),
    lowerThird:     m("Lower Third", lThird, { mu: 1/3, sigma: 0.04 }, 1),
    verticalBalance:m("Vertical Balance", vBalance, REFS.verticalBalance, 1),
    horizontalFifths: m("Horizontal Fifths", hFifths, REFS.horizontalFifths, 1),
    goldenRatio:    m("Golden Ratio Adherence", goldenAdherence, REFS.goldenRatio, 1),
    fwhr:           m("FWHR", fwhrVal, REFS.fwhr, 1),

    eyeSpacing:     m("Eye Spacing", eyeSpacingRatio, REFS.eyeSpacing, 1),
    eyeAspectRatio: m("Eye Aspect Ratio", eyeAspectRatioVal, REFS.eyeAspectRatio, 1),
    canthalTilt:    m("Canthal Tilt", canthal, REFS.canthalTilt, 1, "degrees"),
    eyeTilt:        m("Eye Tilt", eyeTiltVal, REFS.eyeTilt, 1, "degrees"),
    browTilt:       m("Brow Tilt", browTiltVal, REFS.browTilt, 1, "degrees"),
    browLengthRatio:m("Brow Length Ratio", browLengthRatioVal, REFS.browLengthRatio, 1),

    noseWidthRatio: m("Nose Width Ratio", noseWidthRatioVal, REFS.noseWidthRatio, 1),
    noseChinRatio:  m("Nose–Chin Ratio", noseChinRatioVal, REFS.noseChinRatio, 1),
    noseProjection: m("Nose Projection", noseProjectionVal, REFS.noseProjection, 1),
    noseBridgeAngle:m("Nose Bridge Angle", noseBridgeAngleVal, REFS.noseBridgeAngle, 1, "degrees"),
    alarAngle:      m("Alar Angle", alarAngleVal, REFS.alarAngle, 1, "degrees"),

    lipFullness:    m("Lip Fullness", lipFull, REFS.lipFullness, 1),
    lipWidthRatio:  m("Lip Width Ratio", lipWR, REFS.lipWidthRatio, 1),
    upperLipRatio:  m("Upper Lip Ratio", upperLR, REFS.upperLipRatio, 1),

    jawRatio:       m("Jaw Ratio", jawRatioVal, REFS.jawRatio, 1),
    gonialAngle:    m("Gonial Angle", gonialAngleVal, REFS.gonialAngle, 1, "degrees"),
    mandibularTaper:m("Mandibular Taper", taperVal, REFS.mandibularTaper, 1),
    chinProjection: m("Chin Projection", chinProj, REFS.chinProjection, 1),
    jawSymmetry:    m("Jaw Symmetry", asymmetry, REFS.jawSymmetry, 1),
    cheekboneDefinition: m("Cheekbone Definition", cheekDef, REFS.cheekboneDefinition, 1),

    symmetry:       m("Symmetry", symDev, REFS.symmetry, 1),

    faceShape,
  };
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
