import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

interface RGB { r: number; g: number; b: number; }
interface CIELAB { L: number; a: number; b: number; }

function rgbToXYZ(rgb: RGB): { X: number; Y: number; Z: number } {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  return {
    X: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    Y: r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
    Z: r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
  };
}

function xyzToCIELAB(X: number, Y: number, Z: number): CIELAB {
  const Xn = 95.047;
  const Yn = 100.0;
  const Zn = 108.883;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : (903.3 * t + 16) / 116;

  const fx = f(X / Xn);
  const fy = f(Y / Yn);
  const fz = f(Z / Zn);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function calculateITA(lab: CIELAB): number {
  return (Math.atan((lab.L - 50) / lab.b) * 180) / Math.PI;
}

function mapITAToMonkScale(ita: number): { id: number; label: string; hex: string } {
  const scale = [
    { id: 1, label: "Very Light", hex: "#FDDBB4", minITA: 55 },
    { id: 2, label: "Light", hex: "#E8B990", minITA: 48 },
    { id: 3, label: "Light-Medium", hex: "#D4A574", minITA: 41 },
    { id: 4, label: "Medium Light", hex: "#C08E62", minITA: 35 },
    { id: 5, label: "Medium", hex: "#A87550", minITA: 28 },
    { id: 6, label: "Medium Dark", hex: "#8D6342", minITA: 20 },
    { id: 7, label: "Dark", hex: "#6F4E37", minITA: 13 },
    { id: 8, label: "Dark", hex: "#5A3E2B", minITA: 6 },
    { id: 9, label: "Very Dark", hex: "#3E2A1C", minITA: -5 },
    { id: 10, label: "Deep", hex: "#2A1B10", minITA: -Infinity },
  ];

  for (const level of scale) {
    if (ita >= level.minITA) return level;
  }
  return scale[scale.length - 1];
}

function mapITAToFitzpatrick(ita: number): string {
  if (ita > 55) return "Type I - Very Fair";
  if (ita > 41) return "Type II - Fair";
  if (ita > 28) return "Type III - Medium";
  if (ita > 13) return "Type IV - Olive";
  if (ita > -5) return "Type V - Brown";
  return "Type VI - Dark";
}

function detectUndertone(lab: CIELAB, rgb: RGB): "Warm" | "Cool" | "Neutral" {
  const warmScore =
    (rgb.r > rgb.b ? 1 : 0) +
    (lab.a > 0 ? 1 : 0) +
    (lab.b > 0 ? 1 : 0);

  const coolScore =
    (rgb.b > rgb.r ? 1 : 0) +
    (lab.a < 0 ? 1 : 0) +
    (lab.b < 0 ? 1 : 0);

  if (warmScore > coolScore + 1) return "Warm";
  if (coolScore > warmScore + 1) return "Cool";
  return "Neutral";
}

function getAverageColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
): RGB | null {
  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(
      Math.max(0, x - radius),
      Math.max(0, y - radius),
      radius * 2,
      radius * 2
    );
  } catch {
    return null;
  }
  const pixels = imageData.data;

  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    r += pixels[i];
    g += pixels[i + 1];
    b += pixels[i + 2];
    count++;
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

export function analyzeSkinTone(
  canvas: HTMLCanvasElement,
  faceResult: FaceLandmarkerResult
): {
  monkScale: { id: number; label: string; hex: string };
  fitzpatrick: string;
  undertone: "Warm" | "Cool" | "Neutral";
  ita: number;
  rgb: RGB;
} | null {
  if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const lm = faceResult.faceLandmarks[0];
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const samplePoints = [
    { x: lm[1].x, y: lm[1].y },
    { x: lm[4].x, y: lm[4].y },
    { x: lm[6].x, y: lm[6].y },
    { x: lm[168].x, y: lm[168].y },
    { x: lm[197].x, y: lm[197].y },
  ];

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (const point of samplePoints) {
    const px = Math.floor(point.x * imgWidth);
    const py = Math.floor(point.y * imgHeight);
    const color = getAverageColor(ctx, px, py, 5);
    if (!color) continue;
    totalR += color.r;
    totalG += color.g;
    totalB += color.b;
    count++;
  }

  if (count === 0) return null;

  const avgColor: RGB = {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };

  const xyz = rgbToXYZ(avgColor);
  const lab = xyzToCIELAB(xyz.X, xyz.Y, xyz.Z);
  const ita = calculateITA(lab);
  const monkScale = mapITAToMonkScale(ita);
  const fitzpatrick = mapITAToFitzpatrick(ita);
  const undertone = detectUndertone(lab, avgColor);

  return {
    monkScale,
    fitzpatrick,
    undertone,
    ita,
    rgb: avgColor,
  };
}

function isSkinLike(c: RGB): boolean {
  const { r, g, b } = c;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 30 || max > 245 || min < 10) return false;

  if (!(r >= g && g >= b)) return false;

  const rg = r - g;
  const gb = g - b;
  if (rg < 2 || rg > 95) return false;
  if (gb < 0 || gb > 95) return false;
  if (max - min < 10) return false;

  return true;
}

/**
 * Skin-tone estimate that does NOT require face landmarks. Samples a grid of
 * patches, keeps the most skin-like ones, and averages them. Used by the
 * body-analysis flow so it can run fully independently of the face model.
 */
export function analyzeSkinToneFromImage(
  canvas: HTMLCanvasElement
): {
  monkScale: { id: number; label: string; hex: string };
  fitzpatrick: string;
  undertone: "Warm" | "Cool" | "Neutral";
  ita: number;
  rgb: RGB;
} | null {
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width < 2 || canvas.height < 2) return null;

  const cols = 6;
  const rows = 8;
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;
  const patches: RGB[] = [];

  for (let gy = 1; gy < rows - 1; gy++) {
    for (let gx = 1; gx < cols - 1; gx++) {
      const cx = Math.floor((gx + 0.5) * cellW);
      const cy = Math.floor((gy + 0.5) * cellH);
      const color = getAverageColor(ctx, cx, cy, Math.max(3, Math.round(Math.min(cellW, cellH) / 4)));
      if (color && isSkinLike(color)) patches.push(color);
    }
  }

  if (patches.length === 0) {
    const fallback = getAverageColor(ctx, Math.floor(canvas.width / 2), Math.floor(canvas.height / 3), 8);
    if (fallback && isSkinLike(fallback)) patches.push(fallback);
  }

  if (patches.length === 0) return null;

  const avgColor: RGB = patches.reduce(
    (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
    { r: 0, g: 0, b: 0 }
  );
  const count = patches.length;
  avgColor.r = Math.round(avgColor.r / count);
  avgColor.g = Math.round(avgColor.g / count);
  avgColor.b = Math.round(avgColor.b / count);

  const xyz = rgbToXYZ(avgColor);
  const lab = xyzToCIELAB(xyz.X, xyz.Y, xyz.Z);
  const ita = calculateITA(lab);
  const monkScale = mapITAToMonkScale(ita);
  const fitzpatrick = mapITAToFitzpatrick(ita);
  const undertone = detectUndertone(lab, avgColor);

  return {
    monkScale,
    fitzpatrick,
    undertone,
    ita,
    rgb: avgColor,
  };
}
