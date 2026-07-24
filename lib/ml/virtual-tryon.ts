import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

export interface ClothingItem {
  id: string;
  name: string;
  category: "top" | "bottom" | "outerwear" | "accessory";
  image: string;
  color: string;
}

export interface OverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export function calculateClothingOverlay(
  poseResult: PoseLandmarkerResult,
  item: ClothingItem,
  canvasWidth: number,
  canvasHeight: number
): OverlayPosition | null {
  if (!poseResult.landmarks || poseResult.landmarks.length === 0) return null;

  const lm = poseResult.landmarks[0];

  if (item.category === "top" || item.category === "outerwear") {
    const leftShoulder = lm[11];
    const rightShoulder = lm[12];
    const leftHip = lm[23];
    const rightHip = lm[24];

    const centerX = ((leftShoulder.x + rightShoulder.x) / 2) * canvasWidth;
    const topY = (leftShoulder.y * canvasHeight) - 20;
    const bottomY = (leftHip.y * canvasHeight) + 20;

    const width = Math.abs(rightShoulder.x - leftShoulder.x) * canvasWidth * 1.3;
    const height = bottomY - topY;

    return {
      x: centerX - width / 2,
      y: topY,
      width,
      height,
      rotation: 0,
    };
  }

  if (item.category === "bottom") {
    const leftHip = lm[23];
    const rightHip = lm[24];
    const leftAnkle = lm[27];
    const rightAnkle = lm[28];

    const centerX = ((leftHip.x + rightHip.x) / 2) * canvasWidth;
    const topY = (leftHip.y * canvasHeight) - 10;
    const bottomY = Math.max(leftAnkle.y, rightAnkle.y) * canvasHeight + 10;

    const width = Math.abs(rightHip.x - leftHip.x) * canvasWidth * 1.4;
    const height = bottomY - topY;

    return {
      x: centerX - width / 2,
      y: topY,
      width,
      height,
      rotation: 0,
    };
  }

  if (item.category === "accessory") {
    const nose = lm[1];
    const centerX = nose.x * canvasWidth;
    const centerY = nose.y * canvasHeight - 60;

    return {
      x: centerX - 30,
      y: centerY - 30,
      width: 60,
      height: 60,
      rotation: 0,
    };
  }

  return null;
}

export function drawClothingOverlay(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  position: OverlayPosition,
  opacity: number = 0.85
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(position.x + position.width / 2, position.y + position.height / 2);
  ctx.rotate((position.rotation * Math.PI) / 180);
  ctx.drawImage(
    image,
    -position.width / 2,
    -position.height / 2,
    position.width,
    position.height
  );
  ctx.restore();
}

export function createColorBlock(
  ctx: CanvasRenderingContext2D,
  position: OverlayPosition,
  color: string,
  opacity: number = 0.7
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  const radius = 8;
  ctx.roundRect(position.x, position.y, position.width, position.height, radius);
  ctx.fill();
  ctx.restore();
}

export const SAMPLE_CLOTHING: ClothingItem[] = [
  { id: "top-1", name: "Classic White Tee", category: "top", image: "", color: "#FFFFFF" },
  { id: "top-2", name: "Navy Button Down", category: "top", image: "", color: "#1B2838" },
  { id: "top-3", name: "Black Turtleneck", category: "top", image: "", color: "#1A1A1A" },
  { id: "top-4", name: "Burgundy Polo", category: "top", image: "", color: "#800020" },
  { id: "bottom-1", name: "Dark Navy Trousers", category: "bottom", image: "", color: "#1A1A2E" },
  { id: "bottom-2", name: "Tan Chinos", category: "bottom", image: "", color: "#D2B48C" },
  { id: "bottom-3", name: "Black Slim Jeans", category: "bottom", image: "", color: "#2D3436" },
  { id: "outer-1", name: "Charcoal Blazer", category: "outerwear", image: "", color: "#36454F" },
  { id: "outer-2", name: "Camel Coat", category: "outerwear", image: "", color: "#C19A6B" },
  { id: "acc-1", name: "Gold Chain", category: "accessory", image: "", color: "#DAA520" },
];
