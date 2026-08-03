import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

export type FabricType = "solid" | "denim" | "knit" | "linen" | "silk" | "leather";

export interface ClothingItem {
  id: string;
  name: string;
  category: "top" | "bottom" | "outerwear" | "accessory";
  image: string;
  color: string;
  fabric: FabricType;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return { r: 128, g: 128, b: 128 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function pseudoRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw a garment with a procedural fabric texture. Textures are deterministic
 * (seeded from the rect) so re-renders don't flicker.
 */
export function drawFabric(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fabric: FabricType,
  color: string,
  radius = 8
) {
  ctx.save();
  const { r, g, b } = hexToRgb(color);
  const shade = (mul: number, alpha = 1) =>
    `rgba(${Math.min(255, Math.max(0, r * mul))},${Math.min(255, Math.max(0, g * mul))},${Math.min(255, Math.max(0, b * mul))},${alpha})`;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  if (fabric === "denim") {
    const step = Math.max(7, w / 16);
    ctx.lineWidth = Math.max(1, w / 140);
    ctx.strokeStyle = shade(1.18, 0.9);
    for (let i = -h; i < w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + step * 2, y);
      ctx.stroke();
    }
    ctx.strokeStyle = shade(0.72, 0.9);
    for (let i = -h + step; i < w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + step * 2, y);
      ctx.stroke();
    }
  } else if (fabric === "knit") {
    const cols = Math.max(8, Math.floor(w / 9));
    const colW = w / cols;
    for (let i = 0; i < cols; i++) {
      ctx.fillStyle = i % 2 === 0 ? shade(1.12) : shade(0.82);
      ctx.fillRect(x + i * colW, y, colW, h);
    }
  } else if (fabric === "linen") {
    const gap = Math.max(9, w / 20);
    ctx.lineWidth = 1;
    ctx.strokeStyle = shade(1.25, 0.5);
    for (let i = 0; i <= w / gap; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * gap, y);
      ctx.lineTo(x + i * gap + 2, y + h);
      ctx.stroke();
    }
    ctx.strokeStyle = shade(0.78, 0.5);
    for (let i = 0; i <= h / gap; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + i * gap);
      ctx.lineTo(x + w, y + i * gap + 2);
      ctx.stroke();
    }
  } else if (fabric === "silk") {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "rgba(255,255,255,0.4)");
    g.addColorStop(0.4, "rgba(255,255,255,0.02)");
    g.addColorStop(0.62, "rgba(255,255,255,0.02)");
    g.addColorStop(1, "rgba(255,255,255,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    const sheen = ctx.createLinearGradient(x, y, x + w, y);
    sheen.addColorStop(0, "rgba(255,255,255,0)");
    sheen.addColorStop(0.35, "rgba(255,255,255,0.14)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h);
  } else if (fabric === "leather") {
    const rnd = pseudoRandom(Math.round(x * 31 + y * 17 + w * 7 + h * 13));
    const blotches = Math.max(10, Math.round((w * h) / 4500));
    for (let i = 0; i < blotches; i++) {
      const lx = x + rnd() * w;
      const ly = y + rnd() * h;
      const rad = 5 + rnd() * 16;
      const grd = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad);
      grd.addColorStop(0, rnd() > 0.5 ? shade(1.16, 0.4) : shade(0.8, 0.4));
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(lx, ly, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fillRect(x, y, w, h * 0.1);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.restore();
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
  { id: "top-1", name: "Classic White Tee", category: "top", image: "", color: "#F4F1EA", fabric: "knit" },
  { id: "top-2", name: "Navy Oxford Button Down", category: "top", image: "", color: "#1B2838", fabric: "linen" },
  { id: "top-3", name: "Black Turtleneck", category: "top", image: "", color: "#1A1A1A", fabric: "knit" },
  { id: "top-4", name: "Burgundy Polo", category: "top", image: "", color: "#800020", fabric: "knit" },
  { id: "bottom-1", name: "Dark Navy Trousers", category: "bottom", image: "", color: "#1A1A2E", fabric: "solid" },
  { id: "bottom-2", name: "Tan Chinos", category: "bottom", image: "", color: "#D2B48C", fabric: "linen" },
  { id: "bottom-3", name: "Black Slim Jeans", category: "bottom", image: "", color: "#2D3436", fabric: "denim" },
  { id: "outer-1", name: "Charcoal Blazer", category: "outerwear", image: "", color: "#36454F", fabric: "solid" },
  { id: "outer-2", name: "Camel Coat", category: "outerwear", image: "", color: "#C19A6B", fabric: "silk" },
  { id: "outer-3", name: "Tan Leather Jacket", category: "outerwear", image: "", color: "#8A5A2B", fabric: "leather" },
  { id: "acc-1", name: "Gold Chain", category: "accessory", image: "", color: "#DAA520", fabric: "solid" },
];
