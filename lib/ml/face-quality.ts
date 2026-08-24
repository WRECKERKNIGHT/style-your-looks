import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface PhotoQualityReport {
  score: number;
  brightness: number;
  sharpness: number;
  faceSizeRatio: number;
  headYaw: number;
  headRoll: number;
  headPitch: number;
  usable: boolean;
  issues: string[];
  warnings: string[];
}

function getLuminance(
  canvas: HTMLCanvasElement,
  size = 96
): { data: Uint8Array; w: number; h: number } {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { data: new Uint8Array(0), w: 0, h: 0 };

  const small = document.createElement("canvas");
  small.width = size;
  small.height = size;
  const sctx = small.getContext("2d");
  if (!sctx) return { data: new Uint8Array(0), w: 0, h: 0 };

  try {
    sctx.drawImage(canvas, 0, 0, size, size);
    const img = sctx.getImageData(0, 0, size, size);
    const data = new Uint8Array(size * size);
    for (let i = 0; i < size * size; i++) {
      const r = img.data[i * 4];
      const g = img.data[i * 4 + 1];
      const b = img.data[i * 4 + 2];
      data[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return { data, w: size, h: size };
  } catch {
    return { data: new Uint8Array(0), w: 0, h: 0 };
  }
}

function assessBrightness(mean: number): { score: number; issue?: string; warning?: string } {
  if (mean < 35) return { score: Math.max(0.5, (mean / 35) * 2), warning: "Photo is dark — lighting will affect accuracy" };
  if (mean > 240) return { score: 1.5, warning: "Photo is overexposed — accuracy may be reduced" };
  if (mean < 55) return { score: 3 + (mean / 55) * 3, warning: "Photo is dim — lighting will affect accuracy" };
  const b = mean / 255;
  const score = Math.max(0, Math.min(10, 10 - Math.abs(b - 0.62) * 14));
  return { score: Math.round(score * 10) / 10 };
}

function assessSharpness(data: Uint8Array, w: number, h: number): { score: number; issue?: string; warning?: string } {
  if (data.length === 0) return { score: 5, warning: "Could not assess sharpness" };

  let edge = 0;
  let count = 0;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w - 1; x++) {
      edge += Math.abs(data[row + x] - data[row + x + 1]);
      count++;
    }
  }
  edge = edge / count;
  const score = Math.min(10, edge / 11);
  if (edge < 2.2) return { score: Math.max(0.5, Math.round(score * 10) / 10), warning: "Photo is slightly blurry — accuracy may be reduced" };
  if (edge < 4) return { score: Math.round(score * 10) / 10, warning: "Photo may be slightly blurry" };
  return { score: Math.round(score * 10) / 10 };
}

function faceBoundingBox(result: FaceLandmarkerResult): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const lm = result.faceLandmarks?.[0];
  if (!lm || lm.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of lm) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * Full 3-axis head pose from the MediaPipe facial transformation matrix.
 * The 4×4 transform is stored column-major, so rotation element R[row][col]
 * lives at data[col * stride + row]. Decomposing R = Rz(yaw)·Ry(pitch)·Rx(roll):
 *   yaw   = atan2(R10, R00)   pitch = asin(-R20)   roll = atan2(R21, R22)
 * Yaw (head turned left/right) is the pose axis that silently distorts every
 * bilateral width metric, so it must be measured — not folded into "roll".
 */
function headPose(result: FaceLandmarkerResult): { yaw: number; pitch: number; roll: number } {
  const matrix = result.facialTransformationMatrixes?.[0];
  if (!matrix || !matrix.data) return { yaw: 0, pitch: 0, roll: 0 };
  const s = matrix.columns || 4;
  const m = matrix.data;
  const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
  const yaw = Math.atan2(m[1], m[0]) * (180 / Math.PI);
  const pitch = Math.asin(clamp1(-m[2])) * (180 / Math.PI);
  const roll = Math.atan2(m[s + 2], m[s * 2 + 2]) * (180 / Math.PI);
  const safe = (v: number) => (Number.isFinite(v) ? v : 0);
  return { yaw: safe(yaw), pitch: safe(pitch), roll: safe(roll) };
}

export function assessPhotoQuality(
  canvas: HTMLCanvasElement,
  result: FaceLandmarkerResult,
  numFacesDetected: number
): PhotoQualityReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (numFacesDetected === 0) {
    return {
      score: 0,
      brightness: 0,
      sharpness: 0,
      faceSizeRatio: 0,
      headYaw: 0,
      headRoll: 0,
      headPitch: 0,
      usable: false,
      issues: ["No face detected"],
      warnings: [],
    };
  }

  if (numFacesDetected > 1) {
    issues.push("Multiple faces detected — use a photo with only you in it");
  }

  const lum = getLuminance(canvas);
  let mean = 0;
  if (lum.data.length > 0) {
    for (let i = 0; i < lum.data.length; i++) mean += lum.data[i];
    mean /= lum.data.length;
  }

  const brightness = assessBrightness(mean);
  if (brightness.issue) issues.push(brightness.issue);
  if (brightness.warning) warnings.push(brightness.warning);

  const sharpness = assessSharpness(lum.data, lum.w, lum.h);
  if (sharpness.issue) issues.push(sharpness.issue);
  if (sharpness.warning) warnings.push(sharpness.warning);

  const bbox = faceBoundingBox(result);
  let faceSizeRatio = 0;
  let sizeScore = 10;
  if (bbox) {
    faceSizeRatio = Math.max(bbox.maxX - bbox.minX, bbox.maxY - bbox.minY);
    if (faceSizeRatio < 0.12) {
      issues.push("Face is too small — move closer to the camera");
      sizeScore = 1;
    } else if (faceSizeRatio > 0.95) {
      issues.push("Face fills the frame — pull back a bit");
      sizeScore = 2;
    } else if (faceSizeRatio < 0.2) {
      warnings.push("Face is relatively small in frame");
      sizeScore = 5 + (faceSizeRatio / 0.2) * 4;
    } else {
      sizeScore = Math.min(10, 6 + (faceSizeRatio - 0.2) * 8);
    }
  }

  const pose = headPose(result);

  // Yaw is the most damaging off-frontal axis: it compresses one side of the
  // face, which reads as fake "asymmetry" and skewed fifths/FWHR. Reject hard
  // turns, warn on moderate ones.
  if (Math.abs(pose.yaw) > 25) {
    issues.push("Head is turned too far to the side — look straight at the camera");
  } else if (Math.abs(pose.yaw) > 15) {
    warnings.push("Head slightly turned — a frontal pose gives the most accurate read");
  }

  if (Math.abs(pose.roll) > 18) {
    warnings.push("Face is tilted — hold your head straight for the sharpest results");
  } else if (Math.abs(pose.roll) > 10) {
    warnings.push("Slight head tilt detected — try to face the camera directly");
  }
  if (Math.abs(pose.pitch) > 32) {
    issues.push("Camera angle too extreme — face the camera directly");
  } else if (Math.abs(pose.pitch) > 22) {
    warnings.push("Camera is shooting at an angle — accuracy may be reduced");
  }

  const usable = issues.length === 0;

  // Pose contributes directly to capture quality so that confidence and
  // best-photo selection prefer genuinely frontal frames.
  const yawDev = Math.min(1, Math.abs(pose.yaw) / 25);
  const pitchDev = Math.min(1, Math.abs(pose.pitch) / 32);
  const rollDev = Math.min(1, Math.abs(pose.roll) / 18);
  const poseScore = Math.max(0, 10 - (yawDev * 4 + pitchDev * 3 + rollDev * 3));

  const base =
    0.45 * brightness.score + 0.27 * sharpness.score + 0.16 * sizeScore + 0.12 * poseScore;
  const score = Math.max(0, Math.min(10, Math.round((base - issues.length * 1.2) * 10) / 10));

  return {
    score,
    brightness: Math.round(brightness.score * 10) / 10,
    sharpness: sharpness.score,
    faceSizeRatio: Math.round(faceSizeRatio * 100) / 100,
    headYaw: Math.round(pose.yaw * 10) / 10,
    headRoll: Math.round(pose.roll * 10) / 10,
    headPitch: Math.round(pose.pitch * 10) / 10,
    usable,
    issues,
    warnings,
  };
}

/**
 * How frontal the capture was, 0–10. Used to weight analysis confidence: a
 * perfectly lit photo taken with the head turned 25° still deserves a
 * confidence penalty, because bilateral geometry is unreliable off-axis.
 */
export function frontalityScore(
  q: Pick<PhotoQualityReport, "headYaw" | "headPitch" | "headRoll">
): number {
  const yawDev = Math.min(1, Math.abs(q.headYaw) / 25);
  const pitchDev = Math.min(1, Math.abs(q.headPitch) / 32);
  const rollDev = Math.min(1, Math.abs(q.headRoll) / 18);
  return Math.max(0, 10 - (yawDev * 4 + pitchDev * 3 + rollDev * 3));
}
