import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task";

let poseLandmarker: PoseLandmarker | null = null;
let poseInitPromise: Promise<PoseLandmarker> | null = null;

async function createPoseLandmarker(
  delegate: "GPU" | "CPU"
): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: "IMAGE",
    numPoses: 1,
  });
}

export function initializePoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarker) return Promise.resolve(poseLandmarker);
  if (poseInitPromise) return poseInitPromise;

  poseInitPromise = (async () => {
    try {
      poseLandmarker = await createPoseLandmarker("GPU");
    } catch (err) {
      console.warn("GPU delegate unavailable — falling back to CPU:", err);
      poseLandmarker = await createPoseLandmarker("CPU");
    }
    return poseLandmarker;
  })().catch((err) => {
    poseInitPromise = null;
    throw err;
  });

  return poseInitPromise;
}

export interface BodyMeasurements {
  shoulderWidth: number;
  waistWidth: number;
  hipWidth: number;
  torsoLength: number;
  legLength: number;
}

export function extractBodyMeasurements(
  result: PoseLandmarkerResult
): BodyMeasurements | null {
  if (!result.landmarks || result.landmarks.length === 0) return null;

  const lm = result.landmarks[0];

  const leftShoulder = lm[11];
  const rightShoulder = lm[12];
  const leftHip = lm[23];
  const rightHip = lm[24];
  const leftKnee = lm[25];
  const rightKnee = lm[26];
  const leftAnkle = lm[27];
  const rightAnkle = lm[28];

  const shoulderWidth = Math.sqrt(
    Math.pow(rightShoulder.x - leftShoulder.x, 2) +
    Math.pow(rightShoulder.y - leftShoulder.y, 2)
  );

  const hipWidth = Math.sqrt(
    Math.pow(rightHip.x - leftHip.x, 2) +
    Math.pow(rightHip.y - leftHip.y, 2)
  );

  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  const waistLeftX = (leftShoulder.x + leftHip.x) / 2;
  const waistRightX = (rightShoulder.x + rightHip.x) / 2;
  const waistWidth = Math.abs(waistRightX - waistLeftX);

  const torsoLength = Math.abs(midHipY - midShoulderY);

  const midKneeY = (leftKnee.y + rightKnee.y) / 2;
  const midAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
  const legLength = Math.abs(midAnkleY - midKneeY);

  return {
    shoulderWidth,
    waistWidth,
    hipWidth,
    torsoLength,
    legLength,
  };
}

export function classifyBodyType(measurements: BodyMeasurements): string {
  const { shoulderWidth, waistWidth, hipWidth } = measurements;

  const shoulderToHip = shoulderWidth / hipWidth;
  const shoulderToWaist = shoulderWidth / waistWidth;
  const waistToHip = waistWidth / hipWidth;

  if (shoulderToWaist < 1.1 && waistToHip < 1.1 && shoulderToHip > 0.9 && shoulderToHip < 1.1) {
    return "Rectangle";
  }

  if (shoulderToHip > 1.15 && shoulderToWaist > 1.2) {
    return "Inverted Triangle";
  }

  if (shoulderToHip < 0.9 && waistToHip < 0.95) {
    return "Triangle";
  }

  if (shoulderToWaist > 1.3 && waistToHip < 0.85 && shoulderToHip > 0.9 && shoulderToHip < 1.1) {
    return "Hourglass";
  }

  if (waistToHip > 1.05 && shoulderToWaist < 1.05) {
    return "Round";
  }

  if (shoulderToWaist < 1.15 && shoulderToWaist > 1.05) {
    return "Mesomorph";
  }

  if (shoulderWidth < waistWidth && waistWidth > hipWidth) {
    return "Endomorph";
  }

  return "Ectomorph";
}

export async function analyzeBody(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<PoseLandmarkerResult> {
  onProgress?.(10);
  const landmarker = await initializePoseLandmarker();
  onProgress?.(30);

  const result = landmarker.detect(imageSource);
  onProgress?.(100);

  return result;
}

export async function detectPoseOnly(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<number[][]> {
  const landmarker = await initializePoseLandmarker();
  const result = landmarker.detect(imageSource);
  return result.landmarks?.[0]?.map((l) => [l.x, l.y, l.z]) || [];
}
