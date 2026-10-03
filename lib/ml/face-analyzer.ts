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
  calculateFaceShape,
  calculateSymmetryAxis,
  createUprightAccessor,
  type FaceShapeClassification,
  type Point2D,
} from './face-geometry';
import { idealScore } from './scoring-curves';
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

export function getFaceSymmetryAxis(result: FaceLandmarkerResult) {
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return calculateSymmetryAxis(result.faceLandmarks[0]);
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
  const score = components.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight;
  return Math.round(Math.max(0, Math.min(100, score)));
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

/**
 * Reference distributions: population mean (mu) and standard deviation (sigma).
 *
 * IMPORTANT: every mu/sigma here describes what `computeRawGeometry` actually
 * measures off MediaPipe's mesh, not the textbook anthropometric value for a
 * similarly-named clinical measurement. The two differ, because the mesh is a
 * stylised average face and because a given ratio is often defined over
 * different landmarks here than in the literature. A textbook mu against a
 * mesh-derived formula is a systematic offset, and a systematic offset shows up
 * as the same extreme "out of range" verdict for every single photo.
 *
 * DERIVATION — measured, not assumed. These were fitted by running this file's
 * own `computeRawGeometry` over a corpus of 435 real photographs processed by
 * the real MediaPipe FaceLandmarker in real Chrome (real WebGL, not a shim).
 * 243 photos produced a face; 190 contained no detectable face and 2 failed the
 * quick quality gate. mu is the median of the frames each metric actually rated
 * (`status === 'valid'`), and sigma is a robust MAD-derived sigma (MAD * 1.4826)
 * rather than a plain standard deviation, so a handful of occluded or
 * three-quarter faces cannot inflate the spread. Per-metric sample sizes run
 * from 21 (lipFullness) to 145; the measured n is recorded next to each entry.
 *
 * This replaced a purely synthetic fit (morph MediaPipe's canonical model and
 * project it through synthetic pose). That fit was measurably wrong: it put
 * eight metrics more than 1σ off the real-photo median, worst of all
 * `lipFullness` (+2.1σ), `noseWidthRatio` (+1.8σ), `eyeSpacing` (−1.6σ),
 * `goldenRatio` (+1.5σ) and `browLengthRatio` (+1.4σ). A synthetic average face
 * is not an average *photograph*, and guessing here silently taxed a large
 * minority of real users as "out of range". The numbers are now measured.
 *
 * KNOWN LIMITATION — sampling bias. The corpus is openly-licensed historical
 * photography, which is demographically skewed and not a modern representative
 * sample of the users this product serves. Treat these as "a large real
 * photographic population, honestly measured", NOT as a certified
 * population standard. Ratios of medians (nose:chin, brow length) are far less
 * ethnicity-sensitive than absolute widths, so those transfer best; the widest
 * metrics (faceRatio, fwhr, jawRatio) carry the most residual bias and have
 * correspondingly wide sigma. Replacing this corpus with a consented,
 * demographically balanced photo set is the next calibration step.
 *
 * `npm run verify:face` locks the result: it re-runs computeRawGeometry over
 * the canonical mesh and fails if any metric stops being measurable, leaves its
 * plausible range, or stops responding to the anatomy it claims to measure, and
 * it replays real captured faces to confirm these mu/sigma still describe real
 * photographs.
 *
 * DO NOT retune confidence from this corpus. 41% of its photos measure
 * `poseFactor < 0.5` and so are reported `low_confidence` on most metrics —
 * that is a property of the corpus, not of the product. Scanned historical
 * portraits carry a median roll of 7° and a median pitch of 9° (p90 pitch 29°,
 * max 54°), and a selfie app's users do not photograph themselves like that. The
 * pose-scaled confidence term is what rejects those frames, and it was tuned
 * against mild head turns on purpose. Re-fitting it here would weaken a
 * deliberate safety margin in order to flatter a biased sample. Likewise the
 * ±10° frontal gate withholds jaw/symmetry metrics on 63% of this corpus; that
 * is the gate working, and mu/sigma above are fitted on the frames that pass it
 * — i.e. on exactly the population the app rates.
 */
const REFS: Record<string, { mu: number; sigma: number }> = {
  // Never scored — reported unavailable with NO_HAIRLINE_REASON. mu/sigma are
  // placeholders so the Measurement shape stays valid.
  upperThird: { mu: 0.33, sigma: 0.04 },

  // Proportions
  faceRatio: { mu: 0.971, sigma: 0.26 }, // n=110
  middleThird: { mu: 0.39, sigma: 0.032 }, // n=145
  lowerThird: { mu: 0.403, sigma: 0.034 }, // n=145
  verticalBalance: { mu: 0.083, sigma: 0.075 }, // n=144
  horizontalFifths: { mu: 0.485, sigma: 0.174 }, // n=144
  goldenRatio: { mu: 0.545, sigma: 0.167 }, // n=141
  // faceRatio, fwhr and jawRatio are the noisiest measurements on a real photo
  // (hair, beard, three-quarter turn and jaw occlusion all move them). Their
  // wide sigma is the honest reading, not a bug to be tuned away.
  fwhr: { mu: 1.844, sigma: 0.42 }, // n=104

  // Eyes
  eyeSpacing: { mu: 1.245, sigma: 0.088 }, // n=143
  eyeAspectRatio: { mu: 0.233, sigma: 0.055 }, // n=122
  canthalTilt: { mu: 3.41, sigma: 2.53 }, // n=144
  eyeTilt: { mu: 3.41, sigma: 2.53 }, // n=144

  // Brows. browTilt is near zero on the measured population: the medial brow
  // end and the lateral tail sit at very nearly the same height, and real
  // photos scatter either side of that far more than a synthetic fit predicted.
  browTilt: { mu: -0.72, sigma: 3.0 }, // n=144
  browLengthRatio: { mu: 0.294, sigma: 0.012 }, // n=145

  // Nose
  noseWidthRatio: { mu: 0.293, sigma: 0.024 }, // n=140
  noseChinRatio: { mu: 0.247, sigma: 0.02 }, // n=145
  // eyeNoseRatio divides two independently-morphing widths, so its spread
  // compounds and its tails are heavier than Gaussian. sigma is set from the
  // p05-p95 span with room left for that, to keep ordinary wide-narrow faces
  // off the out-of-range list.
  eyeNoseRatio: { mu: 0.656, sigma: 0.075 }, // n=145
  noseProjection: { mu: 0.55, sigma: 0.07 }, // front-unavailable
  noseBridgeAngle: { mu: 0, sigma: 8 }, // front-unavailable
  alarAngle: { mu: 0, sigma: 10 }, // front-unavailable

  // Lips
  lipFullness: { mu: 0.377, sigma: 0.05 }, // n=21 — smallest sample, sigma padded
  lipWidthRatio: { mu: 0.366, sigma: 0.051 }, // n=136
  upperLipRatio: { mu: 0.357, sigma: 0.069 }, // n=140

  // Structure
  jawRatio: { mu: 0.783, sigma: 0.2 }, // n=92
  gonialAngle: { mu: 131.4, sigma: 8.0 }, // n=145
  mandibularTaper: { mu: 0.092, sigma: 0.03 }, // n=90
  cheekboneDefinition: { mu: 1.101, sigma: 0.03 }, // n=90

  // Deviation-from-symmetry measures. mu stays at 0 because 0 IS perfect
  // symmetry and that is the meaningful centre; a real population median here
  // is ~0.08 purely because of camera perspective, and taxing every frontal
  // photo for the angle it was shot at is not what this score means.
  //
  // sigma is therefore a floor, and it has to cover that same physical source
  // of apparent asymmetry: even inside the ±10° pose gate a rolled or yawed
  // camera foreshortens one side of the face. The measured real-photo spreads
  // (median 0.086 / MAD-sigma 0.091 for jawSymmetry, 0.035 / 0.037 for overall
  // symmetry) are set slightly ABOVE here so an ordinary frontal photo reads
  // near 0σ and only genuinely lopsided faces fall outside.
  chinProjection: { mu: 0.0, sigma: 0.14 }, // n=90
  jawSymmetry: { mu: 0.0, sigma: 0.15 }, // n=90
  symmetry: { mu: 0.0, sigma: 0.06 }, // n=90
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

  // Cause-specific explanations: a caller-supplied hint (e.g. degenerate
  // geometry, view constraint) wins; otherwise the reason names the actual
  // failure mode so the user sees why a metric isn't rated instead of a
  // generic "not trustworthy".
  const reason =
    status === 'valid'
      ? null
      : (reasonHint ??
        (status === 'unavailable'
          ? 'Measurement not available from this photo — no usable signal'
          : outOfBand
            ? `Measured, but ${Math.abs(z).toFixed(1)}σ outside the calibrated reference range (±${OUT_OF_BAND_Z}σ) — too far out to trust or to average into your score`
            : 'Camera angle, blur or lighting lowered measurement confidence below the reliable threshold'));

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
  // Needs at least 455 points: the highest index this function dereferences
  // directly is 454 (the right cheekbone). A bare 468-point mesh satisfies
  // this, as does the 478-point mesh that carries iris landmarks 468..477.
  if (!lm || lm.length < 455) return null;

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
  // Bigonial width is measured at the mandibular ANGLE, not at the widest
  // point of the face oval. 127/356 sit at ear level (y≈+2.4) and are actually
  // WIDER than the cheekbones (|x|=7.74 vs 7.66), so using them as "jaw width"
  // inverts the anatomy and drives mandibularTaper negative and
  // cheekboneDefinition below 1. 58/288 are the gonial points.
  const leftJaw = pt(58);
  const rightJaw = pt(288);
  // Lower-jaw outline points used for the gonial angle's ramus/body arms.
  const leftRamusTop = pt(127);
  const rightRamusTop = pt(356);
  const leftTemple = pt(108);
  const rightTemple = pt(337);

  const leftEyeInner = pt(133);
  const rightEyeInner = pt(362);
  const leftEyeOuter = pt(33);
  const rightEyeOuter = pt(263);

  const noseBridge = pt(6);
  const noseTip = pt(1);
  // Alar base (the widest point of each nostril wing). 129/358 are a verified
  // mirror pair on the canonical model (x = ∓1.786). The previous indices were
  // 458/468, which are NOT nose points at all: 458 is a left-of-midline point
  // on the nose dorsum (0.460, -1.334) and 468 is the LEFT IRIS CENTRE, since
  // MediaPipe's 478-point output reserves 468..472 for the left iris and
  // 473..477 for the right. Every nose-width-derived metric was therefore
  // measuring "left iris to nose dorsum" — and because the mirror index was
  // wrong on one side only, the result was also bilaterally asymmetric.
  const noseLeft = pt(129);
  const noseRight = pt(358);
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
    rightJaw,
    leftRamusTop,
    rightRamusTop,
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
    // Alar indices used directly by the nose-width metrics — dereferenced
    // without a guard here would crash with a TypeError instead of reporting
    // the measurement as unavailable.
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
  const rj = rightJaw!;
  const lrt = leftRamusTop!;
  const rrt = rightRamusTop!;
  const lei = leftEyeInner!;
  const rei = rightEyeInner!;
  const leo = leftEyeOuter!;
  const reo = rightEyeOuter!;
  const nb2 = noseBridge!;
  const nt = noseTip!;
  const nl = noseLeft!;
  const nr = noseRight!;
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
  const rawNoseW = Math.abs(nr.x - nl.x);
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
  const yawScale = Math.abs(yaw) >= 1 && Math.abs(yaw) <= 25 && cosYaw > 0.88 ? 1 / cosYaw : 1;
  const faceWidth = Math.hypot((rc.x - lc.x) * yawScale, rc.y - lc.y);
  const cheekWidth = Math.abs((rc.x - lc.x) * yawScale);
  const jawWidth = Math.hypot((rj.x - lj.x) * yawScale, rj.y - lj.y);
  const eyeGap = Math.hypot((rei.x - lei.x) * yawScale, rei.y - lei.y);
  const leftEyeW = Math.hypot((leo.x - lei.x) * yawScale, leo.y - lei.y);
  const rightEyeW = Math.hypot((reo.x - rei.x) * yawScale, reo.y - rei.y);
  const noseW = Math.abs((nr.x - nl.x) * yawScale);
  const mouthW = Math.abs((rm.x - lm2.x) * yawScale);

  const avgEyeWidth = (leftEyeW + rightEyeW) / 2;

  // Degenerate-geometry handling: when a divisor collapses to zero the ratio
  // is undefined, NOT "exactly the population mean". Substituting the reference
  // mean as a fallback made the calibration gate pass (z = 0) and produced a
  // fabricated 'valid' 7.5 "perfectly average" score for unmeasurable geometry.
  // A null ratio now gates the measurement to unavailable (confidence 0).
  const DEGENERATE_REASON =
    'Face geometry too degenerate to measure — retake the photo with the whole face clearly in frame';
  const NO_HAIRLINE_REASON =
    'The upper facial third starts at the hairline, which a face-tracking mesh does not contain — only the lower two thirds can be measured here';
  const gatedConf = (raw: number | null) => (raw === null ? 0 : coreConf);
  const gatedRaw = (raw: number | null, fallback: number) => raw ?? fallback;

  // ── Derived ratios ──
  const faceRatio = faceLength > 0 ? faceWidth / faceLength : null;
  const middle = Math.abs(nb.y - bl.y);
  const lower = Math.abs(cn.y - nb.y);
  const mThird = faceLength > 0 ? middle / faceLength : null;
  const lThird = faceLength > 0 ? lower / faceLength : null;
  // The classic equal-thirds test splits the face at the TRICHION (hairline),
  // the glabella, the subnasale and the menton. MediaPipe's mesh has no
  // hairline: landmark 10 is simply the topmost midline vertex of the
  // forehead, which on the canonical model sits at y=+8.26 against a glabella
  // of +4.89 — so "10→9" is 19% of the face, not 33%, and reading it as the
  // upper third put every real face at roughly -3.6σ. There is no landmark that
  // recovers a hairline from this mesh, so the upper third is reported as
  // unmeasurable rather than invented.
  const uThird: number | null = null;
  // Vertical balance is the disagreement between the two thirds that ARE
  // measurable: glabella→subnasale against subnasale→menton. Restricted to
  // two bands the mean absolute deviation collapses to |m-l| / mean(m,l).
  const vBalance =
    mThird !== null && lThird !== null && mThird + lThird > 0
      ? Math.abs(mThird - lThird) / ((mThird + lThird) / 2)
      : null;

  // Horizontal "facial fifths" divide the face at eye level into five equal
  // bands: face-edge→outer canthus, outer→inner canthus (the eye itself),
  // inner→inner canthus (intercanthal), then mirrored. The total width those
  // bands must span is the FULL face width at eye level, not the outer-canthus
  // span. Using reo.x - leo.x as the total made both outer bands identically
  // zero (they are defined as the leftover after the three inner bands, which
  // already sum to that same span) while still dividing by faceW/5 — so the
  // score was structurally pinned at exactly 4.0 for every face ever measured.
  const faceW = Math.abs((rc.x - lc.x) * yawScale);
  const leftEyeW2 = lei.x - leo.x;
  const intercanthal = rei.x - lei.x;
  const rightEyeW2 = reo.x - rei.x;
  const outerBands = faceW > 0 ? (faceW - (leftEyeW2 + intercanthal + rightEyeW2)) / 2 : null;
  const ideal5 = faceW > 0 ? faceW / 5 : null;
  const fifths = [outerBands, leftEyeW2, intercanthal, rightEyeW2, outerBands];
  const bandsPresent = fifths.filter((f): f is number => f !== null);
  const hFifths =
    ideal5 !== null && bandsPresent.length > 0
      ? bandsPresent.reduce((sum, f) => sum + Math.abs(f - ideal5) / ideal5, 0)
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

  // Brow metrics. MediaPipe's brow landmarks form two rows per side: an upper
  // row and a lower row. 46/276 are the lower-row lateral tails and 55/285
  // the lower-row medial ends — a matched, mirrored pair on the canonical
  // model. The upper-medial points are 107 and 336 (also a verified pair).
  // 334 is NOT the mirror of 107: it mirrors 105, the upper-LATERAL point, so
  // pairing (107, 46) with (334, 276) compared a medial point on one side
  // against a lateral point on the other. That alone made the two brows report
  // different tilts (-16° vs -44°) and inflated/collapsed brow length.
  const leftBrowOuter = pt(46);
  const leftBrowInner = pt(55);
  const rightBrowOuter = pt(276);
  const rightBrowInner = pt(285);
  const browTiltVal = (() => {
    if (!leftBrowOuter || !leftBrowInner || !rightBrowOuter || !rightBrowInner) return null;
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
      return null;
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
    const noseBaseWidth = Math.abs(nr.x - nl.x);
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
  // lipH  = the vermilion band itself, upper lip peak (13) to lower lip peak (14)
  // mouthH = the full mouth aperture, inner lip line top (0) to bottom (17)
  // "Upper Lip Ratio" is upper vermilion as a share of the WHOLE mouth height,
  // so it must divide by mouthH. Dividing by lipH made the value ~1.06 for
  // every face (upper vermilion is by definition almost the same size as the
  // whole vermilion band) against a mu of 0.38 — a permanent +13σ.
  const lipH = Math.abs(ll.y - ul.y);
  const mouthH = Math.abs(mb.y - mt.y);
  const lipFull = mouthH > 0 ? lipH / mouthH : null;
  const lipWR = faceWidth > 0 ? mouthW / faceWidth : null;
  const upperLR = mouthH > 0 ? Math.abs(ul.y - mt.y) / mouthH : null;

  // ── Structure ──
  const jawRatioVal = faceLength > 0 ? jawWidth / faceLength : null;

  // Gonial angle: the angle AT the mandibular angle between the ascending ramus
  // (up toward the condyle/ear) and the horizontal body of the mandible
  // (forward toward the chin), measured on both sides and averaged.
  //
  // The old formula took the angle subtended at the CHIN by landmarks 134/363.
  // Those points are not the gonion at all — they sit on the front surface
  // beside the mouth (x=∓0.92, y=0.07, z=6.67, i.e. close to the midline) — so
  // the expression returned ~11° for every face against a mu of 112°, a
  // permanent -10σ, and carried almost no information about jaw shape.
  const gonialAngleVal = (() => {
    if (!lj || !rj || !lrt || !rrt) return null;
    const angleAt = (gonion: Point2D, ramusTop: Point2D) => {
      const toRamus = Math.atan2(ramusTop.y - gonion.y, ramusTop.x - gonion.x);
      const toChin = Math.atan2(cn.y - gonion.y, cn.x - gonion.x);
      let d = Math.abs(toRamus - toChin) * (180 / Math.PI);
      if (d > 180) d = 360 - d;
      return d;
    };
    return (angleAt(lj, lrt) + angleAt(rj, rrt)) / 2;
  })();

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
  // the largest term: it silently distorts every bilateral width metric.
  // For a side profile, yaw ≈90° is the EXPECTED pose, so only pitch/roll
  // penalise it (the width metrics it ruins are already gated to "unavailable"
  // for that view).
  //
  // The penalties are tuned to the pose correction (yaw foreshortening ≤25°,
  // roll removed by the upright frame): a normal selfie with yaw ≤15° and minor
  // tilt still scores confidently, while wider turns and angles get
  // down-weighted — the measurement reports "not reliable" instead of being
  // fabricated or wildly off. The old penalties were so aggressive that a
  // straight-on photo with a mere 10–15° head turn fell below confidence 0.5
  // and the whole report showed "NOT RELIABLE FOR THIS PHOTO".
  const poseFactor =
    view === 'profile'
      ? Math.max(0.4, Math.min(1, 1 - (Math.abs(roll) / 50 + Math.abs(pitch) / 50)))
      : Math.max(
          0.4,
          Math.min(1, 1 - (Math.abs(yaw) / 50 + Math.abs(roll) / 50 + Math.abs(pitch) / 55)),
        );
  const conf = (indices: number[]): number => {
    if (indices.some((i) => !pt(i))) return 0;
    return Math.round(poseFactor * 100) / 100;
  };
  const coreConf = Math.round(poseFactor * 100) / 100;

  // Metrics that compare the left and right sides of the jaw against each other,
  // or divide one width by another, cannot be de-foreshortened from a single 2D
  // image. Dividing by cos(yaw) corrects a pure rotation, but the turned-away
  // side is also physically further from the lens, so perspective alone makes
  // the near jaw read wider and the two gonia sit at different heights. That
  // reads as a genuinely asymmetric jaw on a perfectly symmetric face, and it
  // pushed ~46% of normally-posed frames outside the reference band for
  // jawSymmetry alone. These are only reported for a near-frontal frame.
  const FRONTAL_POSE_LIMIT_DEG = 10;
  const frontalConf = (): number =>
    Math.abs(yaw) <= FRONTAL_POSE_LIMIT_DEG &&
    Math.abs(roll) <= FRONTAL_POSE_LIMIT_DEG &&
    Math.abs(pitch) <= FRONTAL_POSE_LIMIT_DEG
      ? coreConf
      : 0;
  const POSE_LIMITED_REASON =
    'This comparison needs a straighter, more front-on photo — a turned head foreshortens one side and makes a symmetric jaw look uneven';

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

    faceRatio: m(
      'Face Ratio (W/L)',
      gatedRaw(faceRatio, REFS.faceRatio.mu),
      REFS.faceRatio,
      gatedConf(faceRatio),
      'ratio',
      faceRatio === null ? DEGENERATE_REASON : undefined,
    ),
    upperThird: m('Upper Third', 0, REFS.upperThird, 0, 'ratio', NO_HAIRLINE_REASON),
    middleThird: m(
      'Middle Third',
      gatedRaw(mThird, REFS.middleThird.mu),
      REFS.middleThird,
      gatedConf(mThird),
      'ratio',
      mThird === null ? DEGENERATE_REASON : undefined,
    ),
    lowerThird: m(
      'Lower Third',
      gatedRaw(lThird, REFS.lowerThird.mu),
      REFS.lowerThird,
      gatedConf(lThird),
      'ratio',
      lThird === null ? DEGENERATE_REASON : undefined,
    ),
    verticalBalance: m(
      'Vertical Balance',
      gatedRaw(vBalance, 0),
      REFS.verticalBalance,
      gatedConf(vBalance),
      'ratio',
      vBalance === null ? DEGENERATE_REASON : undefined,
    ),
    horizontalFifths: m(
      'Horizontal Fifths',
      gatedRaw(hFifths, 0),
      REFS.horizontalFifths,
      gatedConf(hFifths),
      'ratio',
      hFifths === null ? DEGENERATE_REASON : undefined,
    ),
    goldenRatio: m(
      'Golden Ratio Adherence',
      gatedRaw(goldenAdherence, 0),
      REFS.goldenRatio,
      gatedConf(goldenAdherence),
      'ratio',
      goldenAdherence === null ? DEGENERATE_REASON : undefined,
    ),
    fwhr: m(
      'FWHR',
      gatedRaw(fwhrVal, REFS.fwhr.mu),
      REFS.fwhr,
      gatedConf(fwhrVal),
      'ratio',
      fwhrVal === null ? DEGENERATE_REASON : undefined,
    ),

    eyeSpacing: m(
      'Eye Spacing',
      gatedRaw(eyeSpacingRatio, REFS.eyeSpacing.mu),
      REFS.eyeSpacing,
      gatedConf(eyeSpacingRatio),
      'ratio',
      eyeSpacingRatio === null ? DEGENERATE_REASON : undefined,
    ),
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
    browTilt: m(
      'Brow Tilt',
      gatedRaw(browTiltVal, REFS.browTilt.mu),
      REFS.browTilt,
      gatedConf(browTiltVal),
      'degrees',
      browTiltVal === null ? DEGENERATE_REASON : undefined,
    ),
    browLengthRatio: m(
      'Brow Length Ratio',
      gatedRaw(browLengthRatioVal, REFS.browLengthRatio.mu),
      REFS.browLengthRatio,
      gatedConf(browLengthRatioVal),
      'ratio',
      browLengthRatioVal === null ? DEGENERATE_REASON : undefined,
    ),

    noseWidthRatio: m(
      'Nose Width Ratio',
      gatedRaw(noseWidthRatioVal, REFS.noseWidthRatio.mu),
      REFS.noseWidthRatio,
      gatedConf(noseWidthRatioVal),
      'ratio',
      noseWidthRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    eyeNoseRatio: m(
      'Eye–Nose Ratio',
      gatedRaw(eyeNoseRatioVal, REFS.eyeNoseRatio.mu),
      REFS.eyeNoseRatio,
      gatedConf(eyeNoseRatioVal),
      'ratio',
      eyeNoseRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    noseChinRatio: m(
      'Nose–Chin Ratio',
      gatedRaw(noseChinRatioVal, REFS.noseChinRatio.mu),
      REFS.noseChinRatio,
      gatedConf(noseChinRatioVal),
      'ratio',
      noseChinRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    noseProjection: m(
      'Nose Projection',
      gatedRaw(noseProjectionVal, REFS.noseProjection.mu),
      REFS.noseProjection,
      noseProjectionVal === null ? 0 : viewConstrainedConf([129, 358]),
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

    lipFullness: m(
      'Lip Fullness',
      gatedRaw(lipFull, REFS.lipFullness.mu),
      REFS.lipFullness,
      gatedConf(lipFull),
      'ratio',
      lipFull === null ? DEGENERATE_REASON : undefined,
    ),
    lipWidthRatio: m(
      'Lip Width Ratio',
      gatedRaw(lipWR, REFS.lipWidthRatio.mu),
      REFS.lipWidthRatio,
      gatedConf(lipWR),
      'ratio',
      lipWR === null ? DEGENERATE_REASON : undefined,
    ),
    upperLipRatio: m(
      'Upper Lip Ratio',
      gatedRaw(upperLR, REFS.upperLipRatio.mu),
      REFS.upperLipRatio,
      gatedConf(upperLR),
      'ratio',
      upperLR === null ? DEGENERATE_REASON : undefined,
    ),

    jawRatio: m(
      'Jaw Ratio',
      gatedRaw(jawRatioVal, REFS.jawRatio.mu),
      REFS.jawRatio,
      gatedConf(jawRatioVal),
      'ratio',
      jawRatioVal === null ? DEGENERATE_REASON : undefined,
    ),
    gonialAngle: m(
      'Gonial Angle',
      gatedRaw(gonialAngleVal, REFS.gonialAngle.mu),
      REFS.gonialAngle,
      gatedConf(gonialAngleVal),
      'degrees',
      gonialAngleVal === null ? DEGENERATE_REASON : undefined,
    ),
    mandibularTaper: m(
      'Mandibular Taper',
      gatedRaw(taperVal, REFS.mandibularTaper.mu),
      REFS.mandibularTaper,
      taperVal === null ? 0 : frontalConf(),
      'ratio',
      taperVal === null ? DEGENERATE_REASON : POSE_LIMITED_REASON,
    ),
    chinProjection: m(
      'Chin Projection',
      gatedRaw(chinProj, REFS.chinProjection.mu),
      REFS.chinProjection,
      chinProj === null ? 0 : frontalConf(),
      'ratio',
      chinProj === null ? DEGENERATE_REASON : POSE_LIMITED_REASON,
    ),
    jawSymmetry: m(
      'Jaw Symmetry',
      gatedRaw(asymmetry, REFS.jawSymmetry.mu),
      REFS.jawSymmetry,
      asymmetry === null ? 0 : frontalConf(),
      'ratio',
      asymmetry === null ? DEGENERATE_REASON : POSE_LIMITED_REASON,
    ),
    cheekboneDefinition: m(
      'Cheekbone Definition',
      gatedRaw(cheekDef, REFS.cheekboneDefinition.mu),
      REFS.cheekboneDefinition,
      cheekDef === null ? 0 : frontalConf(),
      'ratio',
      cheekDef === null ? DEGENERATE_REASON : POSE_LIMITED_REASON,
    ),

    symmetry: m(
      'Symmetry',
      gatedRaw(symDev, 0),
      REFS.symmetry,
      symDev === null ? 0 : frontalConf(),
      'ratio',
      symDev === null ? DEGENERATE_REASON : POSE_LIMITED_REASON,
    ),

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
          ? Math.abs(((tip.x - glabella.x) * faceVecY - (tip.y - glabella.y) * faceVecX) / faceLen)
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

/**
 * Landmarks only — no scoring. Used by the demo viewer to draw the live mesh
 * without running a full analysis. Returns [x, y, z] triples because that is
 * what the mesh renderer consumes.
 */
export async function detectFaceLandmarksOnly(
  imageSource: HTMLImageElement | HTMLCanvasElement,
): Promise<number[][]> {
  const source = prepareCanvas(imageSource);
  const result = promotePrimaryFace(await runDetection(source));
  return result.faceLandmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];
}
