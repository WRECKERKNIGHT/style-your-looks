import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { prepareCanvas } from "./preprocessing";
import { resolveModelUrl, resolveWasmBase, MODEL_SOURCES } from "./engine-assets";
import { calculateSymmetryScore, calculateFaceShape, calculateSymmetryAxis } from "./face-geometry";

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

  const reorder = <T,>(arr: T[] | undefined): T[] | undefined =>
    arr ? order.map((i) => arr[i]) : arr;

  return {
    ...result,
    faceLandmarks: reorder(faces)!,
    faceBlendshapes: reorder(result.faceBlendshapes),
    facialTransformationMatrixes: reorder(result.facialTransformationMatrixes),
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

  const lm = result.faceLandmarks[0];

  const forehead = lm[10].y;
  const chin = lm[152].y;
  const browLine = lm[9].y;
  const noseBottom = lm[2].y;

  const faceLength = chin - forehead;
  if (faceLength === 0) return 0;

  const upperThird = (browLine - forehead) / faceLength;
  const middleThird = (noseBottom - browLine) / faceLength;
  const lowerThird = (chin - noseBottom) / faceLength;

  const idealRatio = 1 / 3;
  const deviation =
    Math.abs(upperThird - idealRatio) +
    Math.abs(middleThird - idealRatio) +
    Math.abs(lowerThird - idealRatio);

  const score = Math.max(0, 10 - deviation * 20);
  return Math.min(10, score);
}

export function getJawlineScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

  const lm = result.faceLandmarks[0];

  const leftJaw1 = lm[127];
  const leftJaw2 = lm[134];
  const rightJaw1 = lm[356];
  const rightJaw2 = lm[363];
  const chin = lm[152];

  const jawWidth = Math.sqrt(
    Math.pow(rightJaw1.x - leftJaw1.x, 2) + Math.pow(rightJaw1.y - leftJaw1.y, 2)
  );

  const faceLength = Math.sqrt(
    Math.pow(lm[10].x - chin.x, 2) + Math.pow(lm[10].y - chin.y, 2)
  );

  const jawRatio = jawWidth / faceLength;

  const jawAngle = Math.abs(
    Math.atan2(leftJaw2.y - chin.y, leftJaw2.x - chin.x) -
    Math.atan2(rightJaw2.y - chin.y, rightJaw2.x - chin.x)
  ) * (180 / Math.PI);

  let score = 5;
  if (jawRatio > 0.7 && jawRatio < 0.85) score += 2;
  if (jawAngle > 100 && jawAngle < 130) score += 2;
  if (Math.abs(leftJaw1.y - rightJaw1.y) < 0.01) score += 1;

  return Math.min(10, Math.max(0, score));
}

export function getEyeSpacingScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;

  const lm = result.faceLandmarks[0];

  const leftEyeInner = lm[133];
  const rightEyeInner = lm[362];
  const leftEyeOuter = lm[33];
  const rightEyeOuter = lm[263];

  const eyeWidth = Math.sqrt(
    Math.pow(leftEyeOuter.x - leftEyeInner.x, 2) +
    Math.pow(leftEyeOuter.y - leftEyeInner.y, 2)
  );

  const eyeGap = Math.sqrt(
    Math.pow(rightEyeInner.x - leftEyeInner.x, 2) +
    Math.pow(rightEyeInner.y - leftEyeInner.y, 2)
  );

  const ratio = eyeGap / eyeWidth;

  const idealRatio = 1.0;
  const deviation = Math.abs(ratio - idealRatio);

  const score = Math.max(0, 10 - deviation * 15);
  return Math.min(10, score);
}

function dist2(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}

/** Facial Width-to-Height Ratio (FWHR) — bizygomatic width over upper-lip-to-brow height. */
export function getFwhrScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const bizygomaticWidth = Math.abs(lm[234].x - lm[454].x);
  const browToLip = Math.abs(lm[13].y - lm[9].y);
  if (bizygomaticWidth === 0 || browToLip === 0) return 5;

  const fwhr = bizygomaticWidth / browToLip;
  const ideal = 1.95;
  const score = 10 - Math.abs(fwhr - ideal) * 12;
  return Math.max(2, Math.min(10, score));
}

/** Raw FWHR value (for display) — 1.8–2.1 is the researched attractive range. */
export function getRawFwhr(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const lm = result.faceLandmarks[0];
  const bizygomaticWidth = Math.abs(lm[234].x - lm[454].x);
  const browToLip = Math.abs(lm[13].y - lm[9].y);
  if (bizygomaticWidth === 0 || browToLip === 0) return 0;
  return Math.round((bizygomaticWidth / browToLip) * 100) / 100;
}

/** Canthal tilt — angle of the line between eye corners. Positive = outer corner raised. */
export function getCanthalTiltScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const tilt = (inner: number, outer: number): number => {
    const a = lm[inner];
    const b = lm[outer];
    const angle = Math.atan2(a.y - b.y, b.x - a.x) * (180 / Math.PI);
    return angle;
  };

  const leftTilt = tilt(133, 33);
  const rightTilt = tilt(362, 263);
  const avgTilt = (leftTilt + rightTilt) / 2;

  const ideal = 5;
  const score = 10 - Math.abs(avgTilt - ideal) * 1.2;
  return Math.max(2, Math.min(10, score));
}

/** Raw canthal tilt in degrees (display value). */
export function getRawCanthalTilt(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const lm = result.faceLandmarks[0];
  const tilt = (inner: number, outer: number): number =>
    Math.atan2(lm[inner].y - lm[outer].y, lm[outer].x - lm[inner].x) * (180 / Math.PI);
  const avg = (tilt(133, 33) + tilt(362, 263)) / 2;
  return Math.round(avg * 10) / 10;
}

/** Horizontal fifths balance — the face ideally divides into five equal widths. */
export function getHorizontalFifthsScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const leftOuter = lm[33].x;
  const leftInner = lm[133].x;
  const rightInner = lm[362].x;
  const rightOuter = lm[263].x;

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

  const score = 10 - deviation * 9;
  return Math.max(2, Math.min(10, score));
}

/** Eye width to nose width ratio (golden ideal ~1.618). */
export function getEyeNoseRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const eyeWidth = Math.abs(lm[263].x - lm[33].x);
  const noseWidth = Math.abs(lm[278].x - lm[94].x);
  if (eyeWidth === 0 || noseWidth === 0) return 5;

  const ratio = eyeWidth / noseWidth;
  const ideal = 1.618;
  const score = 10 - Math.abs(ratio - ideal) * 6;
  return Math.max(2, Math.min(10, score));
}

/** Raw eye/nose ratio for display. */
export function getRawEyeNoseRatio(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 0;
  const lm = result.faceLandmarks[0];
  const eyeWidth = Math.abs(lm[263].x - lm[33].x);
  const noseWidth = Math.abs(lm[278].x - lm[94].x);
  if (eyeWidth === 0 || noseWidth === 0) return 0;
  return Math.round((eyeWidth / noseWidth) * 100) / 100;
}

/** Nose-to-chin (nasofacial) ratio — nose length over facial height, ideal ~0.30. */
export function getNoseChinRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const noseLength = Math.abs(lm[6].y - lm[2].y);
  const faceLength = Math.abs(lm[10].y - lm[152].y);
  if (noseLength === 0 || faceLength === 0) return 5;

  const ratio = noseLength / faceLength;
  const ideal = 0.3;
  const score = 10 - Math.abs(ratio - ideal) * 35;
  return Math.max(2, Math.min(10, score));
}

/** Midface ratio — glabella-to-subnasale over subnasale-to-menton, ideal ~1.0. */
export function getMidfaceRatioScore(result: FaceLandmarkerResult): number {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return 5;
  const lm = result.faceLandmarks[0];

  const upper = Math.abs(lm[9].y - lm[2].y);
  const lower = Math.abs(lm[2].y - lm[152].y);
  if (upper === 0 || lower === 0) return 5;

  const ratio = upper / lower;
  const ideal = 1.0;
  const score = 10 - Math.abs(ratio - ideal) * 15;
  return Math.max(2, Math.min(10, score));
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

export function getFacialShape(result: FaceLandmarkerResult): string {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return "Unknown";
  return calculateFaceShape(result.faceLandmarks[0]);
}

export async function analyzeFace(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<FaceLandmarkerResult> {
  onProgress?.(10);

  try {
    await initializeFaceLandmarker();
  } catch (err) {
    console.error("MediaPipe init error:", err);
    throw new Error(
      "Could not load the face-detection engine. Check your connection and try again."
    );
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
