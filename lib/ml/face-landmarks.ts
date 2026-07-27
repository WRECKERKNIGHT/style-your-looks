export interface Point {
  x: number;
  y: number;
}

const LANDMARK = {
  NOSE_TIP: 1,
  CHIN: 152,
  FOREHEAD: 10,
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  LEFT_JAW: 127,
  RIGHT_JAW: 356,
  LEFT_SHOULDER_EST: 116,
  RIGHT_SHOULDER_EST: 345,
  NOSE_BRIDGE: 6,
} as const;

export function toPixel(
  landmarks: number[][],
  index: number,
  dw: number,
  dh: number
): Point {
  const lm = landmarks[index];
  if (!lm) return { x: dw / 2, y: dh / 2 };
  return { x: lm[0] * dw, y: lm[1] * dh };
}

export function eyeCenter(
  landmarks: number[][],
  innerIdx: number,
  outerIdx: number,
  dw: number,
  dh: number
): Point {
  const inner = toPixel(landmarks, innerIdx, dw, dh);
  const outer = toPixel(landmarks, outerIdx, dw, dh);
  return { x: (inner.x + outer.x) / 2, y: (inner.y + outer.y) / 2 };
}

export function eyeWidth(
  landmarks: number[][],
  innerIdx: number,
  outerIdx: number,
  dw: number
): number {
  const inner = landmarks[innerIdx];
  const outer = landmarks[outerIdx];
  if (!inner || !outer) return dw * 0.1;
  return Math.abs(outer[0] - inner[0]) * dw;
}

export function glassesPosition(landmarks: number[][], dw: number, dh: number) {
  const leftEye = eyeCenter(landmarks, LANDMARK.LEFT_EYE_INNER, LANDMARK.LEFT_EYE_OUTER, dw, dh);
  const rightEye = eyeCenter(landmarks, LANDMARK.RIGHT_EYE_INNER, LANDMARK.RIGHT_EYE_OUTER, dw, dh);
  const centerX = (leftEye.x + rightEye.x) / 2;
  const eyeY = (leftEye.y + rightEye.y) / 2;
  const totalWidth = eyeWidth(landmarks, LANDMARK.LEFT_EYE_OUTER, LANDMARK.RIGHT_EYE_OUTER, dw);

  return { centerX, eyeY, totalWidth, leftEye, rightEye };
}

export function hairRegion(landmarks: number[][], dw: number, dh: number) {
  const forehead = toPixel(landmarks, LANDMARK.FOREHEAD, dw, dh);
  const chin = toPixel(landmarks, LANDMARK.CHIN, dw, dh);
  const leftCheek = toPixel(landmarks, LANDMARK.LEFT_CHEEK, dw, dh);
  const rightCheek = toPixel(landmarks, LANDMARK.RIGHT_CHEEK, dw, dh);

  const faceWidth = rightCheek.x - leftCheek.x;
  const faceHeight = chin.y - forehead.y;

  return {
    topY: Math.max(0, forehead.y - faceHeight * 0.15),
    bottomY: forehead.y + faceHeight * 0.25,
    leftX: Math.max(0, leftCheek.x - faceWidth * 0.25),
    rightX: Math.min(dw, rightCheek.x + faceWidth * 0.25),
    centerX: (leftCheek.x + rightCheek.x) / 2,
    foreheadY: forehead.y,
    faceWidth,
    faceHeight,
  };
}

export function clothingPositions(landmarks: number[][], dw: number, dh: number) {
  const leftCheek = toPixel(landmarks, LANDMARK.LEFT_CHEEK, dw, dh);
  const rightCheek = toPixel(landmarks, LANDMARK.RIGHT_CHEEK, dw, dh);
  const chin = toPixel(landmarks, LANDMARK.CHIN, dw, dh);
  const forehead = toPixel(landmarks, LANDMARK.FOREHEAD, dw, dh);
  const noseTip = toPixel(landmarks, LANDMARK.NOSE_TIP, dw, dh);

  const faceWidth = rightCheek.x - leftCheek.x;
  const faceHeight = chin.y - forehead.y;
  const centerX = (leftCheek.x + rightCheek.x) / 2;

  const shoulderY = chin.y + faceHeight * 0.05;
  const shoulderWidth = faceWidth * 1.8;
  const waistY = chin.y + faceHeight * 0.9;
  const waistWidth = faceWidth * 1.2;

  return {
    top: {
      x: centerX - shoulderWidth / 2,
      y: shoulderY,
      width: shoulderWidth,
      height: faceHeight * 0.7,
    },
    bottom: {
      x: centerX - waistWidth / 2,
      y: waistY,
      width: waistWidth,
      height: faceHeight * 1.0,
    },
    outerwear: {
      x: centerX - shoulderWidth * 0.55,
      y: shoulderY - faceHeight * 0.05,
      width: shoulderWidth * 1.1,
      height: faceHeight * 0.8,
    },
    accessory: {
      x: centerX - faceWidth * 0.3,
      y: forehead.y - faceHeight * 0.15,
      width: faceWidth * 0.6,
      height: faceHeight * 0.12,
    },
    centerX,
    shoulderY,
    faceWidth,
    faceHeight,
  };
}

export { LANDMARK };
