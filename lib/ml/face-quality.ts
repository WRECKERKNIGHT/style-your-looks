import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface PhotoQualityReport {
  score: number | null;
  brightness: number | null;
  sharpness: number | null;
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

function assessBrightness(mean: number, hasData: boolean): { score: number | null; issue?: string; warning?: string } {
  if (!hasData)
    return { score: null, warning: "Photo lighting could not be assessed" };
  // One continuous curve over the whole exposure range, peaking at the ideal
  // ~0.62 luminance (mean ≈ 158). The old piecewise bands jumped score by 1.6
  // the instant mean crossed 55 (5.99 at 54.9 -> 4.34 at 55.0) and collapsed
  // to a flat 1.5 above 240 — a slightly lighter photo scored WORSE than a
  // much lighter one. No branch here changes the curve; warnings only annotate.
  const b = Math.max(0, Math.min(1, mean / 255));
  const score = Math.max(0.5, Math.min(10, 10 - Math.abs(b - 0.62) * 14));
  const rounded = Math.round(score * 10) / 10;
  if (mean < 35) return { score: rounded, warning: "Photo is very dark — lighting will affect accuracy" };
  if (mean < 55) return { score: rounded, warning: "Photo is dim — lighting will affect accuracy" };
  if (mean > 240) return { score: rounded, warning: "Photo is overexposed — accuracy may be reduced" };
  if (mean > 200) return { score: rounded, warning: "Photo is quite bright — accuracy may be slightly reduced" };
  return { score: rounded };
}

function assessSharpness(data: Uint8Array, w: number, h: number): { score: number | null; issue?: string; warning?: string } {
  if (data.length === 0) return { score: null, warning: "Photo sharpness could not be assessed" };

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

function everyFaceBoundingBox(result: FaceLandmarkerResult): Array<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  area: number;
}> {
  const boxes: Array<{ minX: number; minY: number; maxX: number; maxY: number; area: number }> = [];
  for (const lm of result.faceLandmarks ?? []) {
    if (!lm || lm.length === 0) continue;
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
    if (!Number.isFinite(minX)) continue;
    boxes.push({
      minX,
      minY,
      maxX,
      maxY,
      area: Math.max(0, maxX - minX) * Math.max(0, maxY - minY),
    });
  }
  return boxes;
}

/**
 * Full 3-axis head pose from the MediaPipe facial transformation matrix.
 * The 4×4 transform is stored column-major, so rotation element R[row][col]
 * lives at data[col * stride + row]. Decomposing R = Rz(yaw)·Ry(pitch)·Rx(roll):
 *   yaw   = atan2(R10, R00)   pitch = asin(-R20)   roll = atan2(R21, R22)
 * Yaw (head turned left/right) is the pose axis that silently distorts every
 * bilateral width metric, so it must be measured — not folded into "roll".
 */
export function headPose(result: FaceLandmarkerResult): { yaw: number; pitch: number; roll: number } {
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
  numFacesDetected: number,
  view: 'front' | 'profile' = 'front'
): PhotoQualityReport {
  const issues: string[] = [];
  const warnings: string[] = [];

  // A side-profile photo is INTENTIONALLY turned to the camera. Frontal-pose
  // rules (hard yaw limits) don't apply to it, otherwise every profile shot
  // would be rejected before it could contribute its nasal measurements.
  const isProfile = view === 'profile';
  if (numFacesDetected === 0) {
    return {
      score: null,
      brightness: null,
      sharpness: null,
      faceSizeRatio: 0,
      headYaw: 0,
      headRoll: 0,
      headPitch: 0,
      usable: false,
      issues: ["No face detected"],
      warnings: [],
    };
  }

  // Multiple faces: MediaPipe can report several detections in a single
  // photo — including small face-shaped objects in the background (posters,
  // reflections, screen doppelgangers). Rejecting on ANY extra detection
  // blocked perfectly usable selfies. Only a genuinely large second face
  // (≈ another person in the frame) is a hard reject; a small background
  // face becomes a warning and the largest face is kept.
  const allFaces = everyFaceBoundingBox(result);
  const primaryArea = allFaces[0]?.area ?? 0;
  const largestExtra = allFaces
    .slice(1)
    .reduce((max, f) => Math.max(max, f.area), 0);
  if (allFaces.length > 1) {
    if (primaryArea > 0 && largestExtra / primaryArea >= 0.15) {
      issues.push("Multiple faces detected — use a photo with only you in it");
    } else {
      warnings.push(
        "Another face was detected in the background — keeping the largest face for analysis",
      );
    }
  }

  const lum = getLuminance(canvas);
  const hasLuminance = lum.data.length > 0;
  let mean = 0;
  if (hasLuminance) {
    for (let i = 0; i < lum.data.length; i++) mean += lum.data[i];
    mean /= lum.data.length;
  }

  const brightness = assessBrightness(mean, hasLuminance);
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
    // A face that reaches the very edge of the frame is almost certainly
    // clipped (chin or forehead out of shot), which silently distorts the
    // geometry. Flag it as a warning unless the crop is extreme.
    const nearEdge =
      bbox.minX < 0.03 ||
      bbox.minY < 0.03 ||
      bbox.maxX > 0.97 ||
      bbox.maxY > 0.97;
    if (nearEdge) {
      warnings.push(
        "Face touches the edge of the frame — results may be slightly less accurate",
      );
    }
    if (faceSizeRatio < 0.09) {
      issues.push("Face is too small — move closer to the camera");
      sizeScore = 1;
    } else if (faceSizeRatio > 0.99) {
      issues.push("Face fills the entire frame — pull back a bit");
      sizeScore = 2;
    } else if (faceSizeRatio < 0.16) {
      warnings.push("Face is relatively small in frame");
      sizeScore = 5 + (faceSizeRatio / 0.2) * 4;
    } else if (faceSizeRatio > 0.93) {
      warnings.push("Face is very close to the camera — results may be slightly less accurate");
      sizeScore = Math.min(10, 6 + (faceSizeRatio - 0.2) * 8) * 0.9;
    } else {
      sizeScore = Math.min(10, 6 + (faceSizeRatio - 0.2) * 8);
    }
  }

  const pose = headPose(result);

  // Yaw is the most damaging off-frontal axis: it compresses one side of the
  // face, which reads as fake "asymmetry" and skewed fifths/FWHR. Normal
  // person-captured selfies routinely have a head turn of 15–30° without
  // being unusable — the geometry engine corrects yaw foreshortening up to
  // ~25° and only scores measurements within the reliable band, so we reject
  // hard turns only when they are clearly a side-on or profile frame.
  // Exempted for profile captures, where a large yaw is the entire point.
  if (!isProfile) {
    if (Math.abs(pose.yaw) > 55) {
      issues.push("Head is turned fully to the side — face the camera directly");
    } else if (Math.abs(pose.yaw) > 20) {
      warnings.push("Head slightly turned — a frontal pose gives the most accurate read");
    }
  }

  if (Math.abs(pose.roll) > 24) {
    warnings.push("Face is tilted — hold your head straight for the sharpest results");
  } else if (Math.abs(pose.roll) > 12) {
    warnings.push("Slight head tilt detected — try to face the camera directly");
  }
  if (Math.abs(pose.pitch) > 55) {
    issues.push("Camera angle too extreme — face the camera directly");
  } else if (Math.abs(pose.pitch) > 28) {
    warnings.push("Camera is shooting at an angle — accuracy may be reduced");
  }

  const usable = issues.length === 0;

  // Pose contributes directly to capture quality so that confidence and
  // best-photo selection prefer genuinely frontal frames. Profile captures
  // score on pitch/roll only — their yaw (≈90°) is expected, not a defect.
  const yawDev = isProfile ? 0 : Math.min(1, Math.abs(pose.yaw) / 55);
  const pitchDev = Math.min(1, Math.abs(pose.pitch) / 55);
  const rollDev = Math.min(1, Math.abs(pose.roll) / 30);
  const poseScore = Math.max(0, 10 - (yawDev * 4 + pitchDev * 3 + rollDev * 3));

  const base =
    0.45 * (brightness.score ?? 0) +
    0.27 * (sharpness.score ?? 0) +
    0.16 * sizeScore +
    0.12 * poseScore;
  const availableWeight =
    (brightness.score == null ? 0 : 0.45) +
    (sharpness.score == null ? 0 : 0.27) +
    0.16 +
    0.12;
  // Only measured components contribute; when none can be sampled the overall
  // capture quality is unknowable and stays null (never a fabricated number).
  const score =
    availableWeight <= 0
      ? null
      : Math.max(
          0,
          Math.min(10, Math.round((base / availableWeight - issues.length * 1.2) * 10) / 10),
        );

  return {
    score,
    brightness: brightness.score == null ? null : Math.round(brightness.score * 10) / 10,
    sharpness: sharpness.score == null ? null : sharpness.score,
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
  q: Pick<PhotoQualityReport, "headYaw" | "headPitch" | "headRoll">,
  view: 'front' | 'profile' = 'front'
): number {
  const yawDev = view === 'profile' ? 0 : Math.min(1, Math.abs(q.headYaw) / 55);
  const pitchDev = Math.min(1, Math.abs(q.headPitch) / 55);
  const rollDev = Math.min(1, Math.abs(q.headRoll) / 30);
  return Math.max(0, 10 - (yawDev * 4 + pitchDev * 3 + rollDev * 3));
}
