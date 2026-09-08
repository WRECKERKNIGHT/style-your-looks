import type { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

export interface FacialHairOverlay {
  type: "beard" | "mustache";
  style: string;
  color: string;
  opacity: number;
}

interface BeardPath {
  points: { x: number; y: number }[];
  controlPoints: { x: number; y: number }[];
  paths?: BeardPath[];
  stipple?: boolean;
  stippleCount?: number;
}

function getBeardPath(
  style: string,
  landmarks: { x: number; y: number; z: number }[]
): BeardPath | null {
  const jaw = landmarks[127];
  const jawRight = landmarks[356];
  const chin = landmarks[152];
  const chinLeft = landmarks[149];
  const chinRight = landmarks[377];
  const lip = landmarks[13];
  const lipLeft = landmarks[61];
  const lipRight = landmarks[291];
  const noseBottom = landmarks[2];
  const cheekLeft = landmarks[116];
  const cheekRight = landmarks[345];

  switch (style) {
    case "full-beard-short":
    case "full-beard-medium":
    case "full-beard-long": {
      const lengthMult = style === "full-beard-long" ? 1.4 : style === "full-beard-medium" ? 1.2 : 1.0;
      return {
        points: [
          jaw,
          chinLeft,
          { x: chin.x, y: chin.y + 0.02 * lengthMult },
          chinRight,
          jawRight,
          { x: jawRight.x - 0.01, y: jawRight.y - 0.03 },
          { x: lipRight.x + 0.02, y: lipRight.y - 0.01 },
          { x: lip.x, y: lip.y - 0.02 },
          { x: lipLeft.x - 0.02, y: lipLeft.y - 0.01 },
          { x: jaw.x + 0.01, y: jaw.y - 0.03 },
        ],
        controlPoints: [
          { x: (jaw.x + chinLeft.x) / 2, y: chin.y },
          { x: chin.x, y: chin.y + 0.03 * lengthMult },
          { x: (chinRight.x + jawRight.x) / 2, y: chin.y },
          { x: lipRight.x, y: lip.y },
          { x: lipLeft.x, y: lip.y },
        ],
      };
    }
    case "goatee": {
      return {
        points: [
          { x: lipLeft.x + 0.02, y: lip.y },
          lip,
          { x: lipRight.x - 0.02, y: lip.y },
          { x: chinRight.x - 0.02, y: (chin.y + lip.y) / 2 },
          { x: chin.x, y: chin.y + 0.015 },
          { x: chinLeft.x + 0.02, y: (chin.y + lip.y) / 2 },
        ],
        controlPoints: [
          { x: lip.x, y: chin.y },
        ],
      };
    }
    case "circle-beard": {
      return {
        points: [
          { x: lipLeft.x, y: lip.y - 0.005 },
          { x: lipLeft.x - 0.01, y: (lip.y + chin.y) / 2 },
          { x: chin.x, y: chin.y + 0.01 },
          { x: lipRight.x + 0.01, y: (lip.y + chin.y) / 2 },
          { x: lipRight.x, y: lip.y - 0.005 },
          { x: lip.x, y: lip.y - 0.005 },
        ],
        controlPoints: [
          { x: lip.x, y: chin.y + 0.01 },
        ],
      };
    }
    case "van-dyke": {
      return {
        points: [
          { x: lipLeft.x + 0.01, y: lip.y - 0.005 },
          { x: lip.x, y: lip.y - 0.01 },
          { x: lipRight.x - 0.01, y: lip.y - 0.005 },
          lipRight,
          { x: lipRight.x - 0.01, y: (lip.y + chin.y) / 2 + 0.01 },
          { x: chin.x, y: chin.y + 0.015 },
          { x: lipLeft.x + 0.01, y: (lip.y + chin.y) / 2 + 0.01 },
          lipLeft,
        ],
        controlPoints: [],
      };
    }
    case "anchor": {
      return {
        points: [
          { x: noseBottom.x, y: noseBottom.y + 0.005 },
          lip,
          { x: lipLeft.x + 0.015, y: lip.y },
          { x: chinLeft.x + 0.01, y: (chin.y + lip.y) / 2 + 0.005 },
          { x: chin.x, y: chin.y + 0.015 },
          { x: chinRight.x - 0.01, y: (chin.y + lip.y) / 2 + 0.005 },
          { x: lipRight.x - 0.015, y: lip.y },
          { x: lip.x, y: lip.y - 0.005 },
        ],
        controlPoints: [],
      };
    }
    case "balbo": {
      return {
        points: [
          { x: lipLeft.x + 0.015, y: lip.y },
          { x: lip.x, y: lip.y - 0.005 },
          { x: lipRight.x - 0.015, y: lip.y },
          lipRight,
          { x: lipRight.x - 0.005, y: (lip.y + chin.y) / 2 },
          { x: chin.x, y: chin.y + 0.015 },
          { x: lipLeft.x + 0.005, y: (lip.y + chin.y) / 2 },
          lipLeft,
        ],
        controlPoints: [],
      };
    }
    case "mutton-chops": {
      return {
        points: [
          jaw,
          { x: jaw.x + 0.02, y: jaw.y - 0.04 },
          { x: cheekLeft.x, y: cheekLeft.y },
          { x: (cheekLeft.x + lipLeft.x) / 2, y: lip.y + 0.01 },
          { x: (cheekRight.x + lipRight.x) / 2, y: lip.y + 0.01 },
          { x: cheekRight.x, y: cheekRight.y },
          { x: jawRight.x - 0.02, y: jawRight.y - 0.04 },
          jawRight,
        ],
        controlPoints: [],
      };
    }
    case "stubble-short":
    case "stubble-medium":
    case "stubble-long": {
      const density = style === "stubble-short" ? 2200 : style === "stubble-medium" ? 3600 : 5200;
      const lengthMult = style === "stubble-long" ? 1.15 : style === "stubble-medium" ? 1.05 : 1.0;
      const chinDip = 0.012 * lengthMult;
      return {
        points: [
          cheekLeft,
          { x: lipLeft.x - 0.02, y: lip.y - 0.005 },
          { x: lip.x, y: lip.y - 0.01 },
          { x: lipRight.x + 0.02, y: lip.y - 0.005 },
          cheekRight,
          jawRight,
          { x: chinRight.x, y: chin.y + 0.004 },
          { x: chin.x, y: chin.y + chinDip },
          { x: chinLeft.x, y: chin.y + 0.004 },
          jaw,
        ],
        controlPoints: [],
        stipple: true,
        stippleCount: density,
      };
    }
    case "friendly-mutton-chops": {
      return {
        points: [],
        controlPoints: [],
        paths: [
          {
            points: [
              cheekLeft,
              { x: cheekLeft.x - 0.015, y: (cheekLeft.y + lip.y) / 2 + 0.008 },
              { x: jaw.x + 0.004, y: jaw.y - 0.012 },
              jaw,
            ],
            controlPoints: [],
          },
          {
            points: [
              cheekRight,
              { x: cheekRight.x + 0.015, y: (cheekRight.y + lip.y) / 2 + 0.008 },
              { x: jawRight.x - 0.004, y: jawRight.y - 0.012 },
              jawRight,
            ],
            controlPoints: [],
          },
        ],
      };
    }
    case "hulihee": {
      return {
        points: [
          jaw,
          cheekLeft,
          { x: lipLeft.x - 0.035, y: lip.y + 0.002 },
          { x: lipLeft.x - 0.01, y: (lip.y + chin.y) / 2 + 0.004 },
          { x: lipRight.x + 0.01, y: (lip.y + chin.y) / 2 + 0.004 },
          { x: lipRight.x + 0.035, y: lip.y + 0.002 },
          cheekRight,
          jawRight,
          { x: chinRight.x, y: chin.y + 0.01 },
          { x: chin.x, y: chin.y + 0.02 },
          { x: chinLeft.x, y: chin.y + 0.01 },
        ],
        controlPoints: [],
      };
    }
    default:
      return null;
  }
}

function getMustachePath(
  style: string,
  landmarks: { x: number; y: number; z: number }[]
): BeardPath | null {
  const noseBottom = landmarks[2];
  const lip = landmarks[13];
  const lipLeft = landmarks[61];
  const lipRight = landmarks[291];
  const philtrumLeft = landmarks[37];
  const philtrumRight = landmarks[267];

  switch (style) {
    case "chevron": {
      return {
        points: [
          { x: lipLeft.x - 0.005, y: lip.y - 0.005 },
          { x: lipLeft.x, y: noseBottom.y + 0.005 },
          { x: noseBottom.x, y: noseBottom.y + 0.01 },
          { x: lipRight.x, y: noseBottom.y + 0.005 },
          { x: lipRight.x + 0.005, y: lip.y - 0.005 },
          lip,
        ],
        controlPoints: [],
      };
    }
    case "handlebar": {
      return {
        points: [
          { x: lipLeft.x - 0.02, y: lip.y - 0.015 },
          { x: lipLeft.x, y: noseBottom.y + 0.005 },
          { x: noseBottom.x, y: noseBottom.y + 0.01 },
          { x: lipRight.x, y: noseBottom.y + 0.005 },
          { x: lipRight.x + 0.02, y: lip.y - 0.015 },
          { x: lip.x, y: lip.y - 0.005 },
        ],
        controlPoints: [
          { x: lipLeft.x - 0.03, y: lip.y - 0.02 },
          { x: lipRight.x + 0.03, y: lip.y - 0.02 },
        ],
      };
    }
    case "pencil": {
      return {
        points: [
          { x: lipLeft.x + 0.005, y: lip.y - 0.005 },
          { x: noseBottom.x, y: noseBottom.y + 0.005 },
          { x: lipRight.x - 0.005, y: lip.y - 0.005 },
          { x: lip.x, y: lip.y - 0.003 },
        ],
        controlPoints: [],
      };
    }
    case "walrus": {
      return {
        points: [
          { x: lipLeft.x - 0.01, y: lip.y + 0.005 },
          { x: lipLeft.x, y: noseBottom.y + 0.005 },
          { x: noseBottom.x, y: noseBottom.y + 0.01 },
          { x: lipRight.x, y: noseBottom.y + 0.005 },
          { x: lipRight.x + 0.01, y: lip.y + 0.005 },
          lip,
        ],
        controlPoints: [],
      };
    }
    case "english": {
      return {
        points: [
          { x: lipLeft.x, y: lip.y },
          { x: lipLeft.x + 0.005, y: noseBottom.y + 0.003 },
          { x: noseBottom.x, y: noseBottom.y + 0.008 },
          { x: lipRight.x - 0.005, y: noseBottom.y + 0.003 },
          { x: lipRight.x, y: lip.y },
          lip,
        ],
        controlPoints: [
          { x: lipLeft.x - 0.005, y: lip.y - 0.015 },
          { x: lipRight.x + 0.005, y: lip.y - 0.015 },
        ],
      };
    }
    case "hungarian": {
      return {
        points: [
          { x: lipLeft.x - 0.015, y: lip.y - 0.005 },
          { x: lipLeft.x, y: noseBottom.y + 0.003 },
          { x: noseBottom.x, y: noseBottom.y + 0.01 },
          { x: lipRight.x, y: noseBottom.y + 0.003 },
          { x: lipRight.x + 0.015, y: lip.y - 0.005 },
          lip,
        ],
        controlPoints: [
          { x: lipLeft.x - 0.025, y: lip.y + 0.01 },
          { x: lipRight.x + 0.025, y: lip.y + 0.01 },
        ],
      };
    }
    case "horseshoe": {
      return {
        points: [
          { x: lipLeft.x - 0.005, y: lip.y - 0.005 },
          { x: lipLeft.x, y: noseBottom.y + 0.003 },
          { x: noseBottom.x, y: noseBottom.y + 0.008 },
          { x: lipRight.x, y: noseBottom.y + 0.003 },
          { x: lipRight.x + 0.005, y: lip.y - 0.005 },
          { x: lipRight.x + 0.01, y: lip.y + 0.025 },
          { x: lip.x, y: lip.y + 0.015 },
          { x: lipLeft.x - 0.01, y: lip.y + 0.025 },
        ],
        controlPoints: [],
      };
    }
    case "toothbrush": {
      return {
        points: [
          { x: lipLeft.x + 0.01, y: lip.y },
          { x: lipLeft.x + 0.015, y: noseBottom.y + 0.003 },
          { x: noseBottom.x - 0.005, y: noseBottom.y + 0.008 },
          { x: noseBottom.x + 0.005, y: noseBottom.y + 0.003 },
          { x: lipRight.x - 0.015, y: lip.y },
          lip,
        ],
        controlPoints: [],
      };
    }
    default:
      return null;
  }
}

export function drawFacialHair(
  ctx: CanvasRenderingContext2D,
  faceResult: FaceLandmarkerResult,
  style: string,
  type: "beard" | "mustache",
  color: string,
  opacity: number = 0.8,
  canvasWidth: number = 1,
  canvasHeight: number = 1
) {
  if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) return;

  const landmarks = faceResult.faceLandmarks[0];
  const path =
    type === "beard"
      ? getBeardPath(style, landmarks)
      : getMustachePath(style, landmarks);

  if (!path) return;

  // --- Step 1: Parse the base color and compute variants ---
  const rgb = hexToRgb(color);
  if (!rgb) return;
  const darkerColor = `rgb(${Math.round(rgb.r * 0.7)},${Math.round(rgb.g * 0.7)},${Math.round(rgb.b * 0.7)})`;
  const lighterColor = `rgb(${Math.min(255, Math.round(rgb.r * 1.15))},${Math.min(255, Math.round(rgb.g * 1.15))},${Math.min(255, Math.round(rgb.b * 1.15))})`;

  // --- Step 2: Sample lighting from the face region ---
  const lightDir = sampleLightDirection(ctx, landmarks, canvasWidth, canvasHeight);

  // --- Step 3: Build the path for clipping ---
  const buildPath = (p: BeardPath) => {
    ctx.beginPath();
    const points = p.points;
    if (points.length === 0) return;
    ctx.moveTo(points[0].x * canvasWidth, points[0].y * canvasHeight);
    if (points.length > 2) {
      for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const cpx = curr.x * canvasWidth;
        const cpy = curr.y * canvasHeight;
        const nx = next.x * canvasWidth;
        const ny = next.y * canvasHeight;
        ctx.quadraticCurveTo(cpx, cpy, (cpx + nx) / 2, (cpy + ny) / 2);
      }
    } else {
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * canvasWidth, points[i].y * canvasHeight);
      }
    }
    ctx.closePath();
  };

  const subs = path.paths && path.paths.length > 0 ? path.paths : [path];

  // --- Step 4: Render shadow underneath for depth ---
  ctx.save();
  ctx.globalAlpha = opacity * 0.12;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "black";
  for (const p of subs) buildPath(p);
  ctx.fill();
  ctx.restore();

  // --- Step 5: Feathered base fill with edge blur ---
  ctx.save();
  ctx.globalAlpha = opacity * 0.85;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "multiply";
  for (const p of subs) buildPath(p);
  ctx.fill();
  ctx.restore();

  // --- Step 6: Lighting gradient overlay ---
  ctx.save();
  ctx.globalAlpha = opacity * 0.25;
  ctx.globalCompositeOperation = "soft-light";
  for (const p of subs) {
    buildPath(p);
    const pts = p.points;
    if (pts.length < 2) continue;
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const pt of pts) {
      minX = Math.min(minX, pt.x);
      maxX = Math.max(maxX, pt.x);
      minY = Math.min(minY, pt.y);
      maxY = Math.max(maxY, pt.y);
    }
    const gx1 = minX * canvasWidth + (lightDir.x > 0 ? 0 : (maxX - minX) * canvasWidth);
    const gx2 = minX * canvasWidth + (lightDir.x > 0 ? (maxX - minX) * canvasWidth : 0);
    const grad = ctx.createLinearGradient(gx1, minY * canvasHeight, gx2, maxY * canvasHeight);
    grad.addColorStop(0, lighterColor);
    grad.addColorStop(1, darkerColor);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();

  // --- Step 7: Hair strand texture ---
  if (path.stipple) {
    const count = path.stippleCount ?? 4000;
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const p of subs) {
      for (const pt of p.points) {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      }
    }
    const w = Math.max(0.001, maxX - minX) * canvasWidth;
    const h = Math.max(0.001, maxY - minY) * canvasHeight;

    let seed = 0;
    for (const c of style) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    let s = seed || 1;
    const rnd = () => {
      s = Math.imul(s ^ (s >>> 15), s | 1) >>> 0;
      s = (s + 0x6d2b79f5) >>> 0;
      return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    };

    // Clip to beard shape
    ctx.save();
    ctx.beginPath();
    for (const p of subs) buildPath(p);
    ctx.clip();

    // Draw individual hair strands
    ctx.globalAlpha = opacity * 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.8, canvasWidth * 0.001);
    ctx.lineCap = "round";
    for (let i = 0; i < count; i++) {
      const sx = minX * canvasWidth + rnd() * w;
      const sy = minY * canvasHeight + rnd() * h;
      const angle = (rnd() - 0.5) * 0.8 + Math.PI * 0.5; // mostly downward
      const len = 2 + rnd() * 5;
      const ex = sx + Math.cos(angle) * len;
      const ey = sy + Math.sin(angle) * len;

      // Vary color per strand
      const variation = 0.75 + rnd() * 0.5;
      ctx.strokeStyle = `rgb(${Math.min(255, Math.round(rgb.r * variation))},${Math.min(255, Math.round(rgb.g * variation))},${Math.min(255, Math.round(rgb.b * variation))})`;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Stipple dots for stubble density
    ctx.globalAlpha = opacity * 0.4;
    ctx.fillStyle = darkerColor;
    const dotCount = Math.round(count * 0.3);
    for (let i = 0; i < dotCount; i++) {
      const dx = minX * canvasWidth + rnd() * w;
      const dy = minY * canvasHeight + rnd() * h;
      const r = 0.6 + rnd() * 1.2;
      ctx.beginPath();
      ctx.arc(dx, dy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  } else {
    // For non-stubble styles, add a subtle hair-direction texture
    ctx.save();
    ctx.beginPath();
    for (const p of subs) buildPath(p);
    ctx.clip();

    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const p of subs) {
      for (const pt of p.points) {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
      }
    }

    let seed = 0;
    for (const c of style) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    let s = seed || 1;
    const rnd = () => {
      s = Math.imul(s ^ (s >>> 15), s | 1) >>> 0;
      s = (s + 0x6d2b79f5) >>> 0;
      return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    };

    // Fine hair lines for fuller styles
    ctx.globalAlpha = opacity * 0.2;
    ctx.strokeStyle = darkerColor;
    ctx.lineWidth = 0.6;
    const strandCount = 1200;
    const w = Math.max(0.001, maxX - minX) * canvasWidth;
    const h = Math.max(0.001, maxY - minY) * canvasHeight;
    for (let i = 0; i < strandCount; i++) {
      const sx = minX * canvasWidth + rnd() * w;
      const sy = minY * canvasHeight + rnd() * h;
      const angle = (rnd() - 0.5) * 0.6 + Math.PI * 0.4;
      const len = 3 + rnd() * 7;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- Step 8: Edge feather pass (soft outer glow to blend with skin) ---
  ctx.save();
  ctx.globalAlpha = opacity * 0.15;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "source-over";
  for (const p of subs) buildPath(p);
  ctx.fill();
  ctx.restore();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function sampleLightDirection(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  w: number,
  h: number
): { x: number; y: number } {
  // Sample brightness on left vs right cheek to estimate light direction
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  if (!leftCheek || !rightCheek) return { x: 0.5, y: -0.3 };

  const sampleBrightness = (lm: { x: number; y: number }) => {
    try {
      const px = ctx.getImageData(
        Math.floor(lm.x * w),
        Math.floor(lm.y * h),
        1, 1
      ).data;
      return (px[0] + px[1] + px[2]) / 3;
    } catch {
      return 128;
    }
  };

  const leftB = sampleBrightness(leftCheek);
  const rightB = sampleBrightness(rightCheek);
  const dx = (rightB - leftB) / 255;
  return { x: dx, y: -0.3 };
}

export function detectHairColor(
  canvas: HTMLCanvasElement,
  faceResult: FaceLandmarkerResult
): string {
  if (!faceResult.faceLandmarks || faceResult.faceLandmarks.length === 0) return "#3C2A21";

  const ctx = canvas.getContext("2d");
  if (!ctx) return "#3C2A21";

  const landmarks = faceResult.faceLandmarks[0];
  const forehead = landmarks[10];
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const samplePoints = [
    landmarks[10],
    landmarks[151],
    { x: landmarks[10].x - 0.03, y: landmarks[10].y },
    { x: landmarks[10].x + 0.03, y: landmarks[10].y },
    { x: landmarks[10].x, y: landmarks[10].y - 0.02 },
  ];

  let totalR = 0, totalG = 0, totalB = 0, count = 0;

  for (const point of samplePoints) {
    const px = Math.floor(point.x * imgWidth);
    const py = Math.floor(point.y * imgHeight);
    try {
      const pixel = ctx.getImageData(px, py, 1, 1).data;
      totalR += pixel[0];
      totalG += pixel[1];
      totalB += pixel[2];
      count++;
    } catch {
      continue;
    }
  }

  if (count === 0) return "#3C2A21";

  const r = Math.round(totalR / count);
  const g = Math.round(totalG / count);
  const b = Math.round(totalB / count);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export interface GroomingScore {
  styleId: string;
  type: "beard" | "mustache";
  score: number;
  reason: string;
}

const BEARD_FACE_SHAPES: Record<string, Record<string, number>> = {
  "full-beard-short": { Oval: 9, Round: 8, Square: 8, Oblong: 7, Diamond: 7, Triangle: 7, "Inverted Triangle": 7, Heart: 7, Rectangle: 8 },
  "full-beard-medium": { Oval: 8, Round: 7, Square: 7, Oblong: 6, Diamond: 7, Triangle: 6, "Inverted Triangle": 6, Heart: 6, Rectangle: 7 },
  "full-beard-long": { Oval: 7, Round: 6, Square: 6, Oblong: 5, Diamond: 6, Triangle: 6, "Inverted Triangle": 5, Heart: 5, Rectangle: 6 },
  "goatee": { Oval: 8, Round: 9, Square: 7, Oblong: 7, Diamond: 8, Triangle: 9, "Inverted Triangle": 8, Heart: 8, Rectangle: 7 },
  "circle-beard": { Oval: 8, Round: 8, Square: 7, Oblong: 8, Diamond: 7, Triangle: 8, "Inverted Triangle": 7, Heart: 7, Rectangle: 8 },
  "van-dyke": { Oval: 9, Round: 8, Square: 8, Oblong: 8, Diamond: 8, Triangle: 8, "Inverted Triangle": 8, Heart: 9, Rectangle: 8 },
  "anchor": { Oval: 9, Round: 9, Square: 7, Oblong: 8, Diamond: 8, Triangle: 8, "Inverted Triangle": 9, Heart: 9, Rectangle: 7 },
  "balbo": { Oval: 9, Round: 8, Square: 8, Oblong: 7, Diamond: 8, Triangle: 8, "Inverted Triangle": 8, Heart: 8, Rectangle: 8 },
  "mutton-chops": { Oval: 6, Round: 6, Square: 7, Oblong: 6, Diamond: 5, Triangle: 6, "Inverted Triangle": 6, Heart: 6, Rectangle: 7 },
  "friendly-mutton-chops": { Oval: 6, Round: 7, Square: 7, Oblong: 5, Diamond: 6, Triangle: 7, "Inverted Triangle": 7, Heart: 6, Rectangle: 7 },
  "hulihee": { Oval: 5, Round: 6, Square: 6, Oblong: 5, Diamond: 5, Triangle: 6, "Inverted Triangle": 5, Heart: 5, Rectangle: 6 },
  "clean-shaven": { Oval: 8, Round: 8, Square: 8, Oblong: 8, Diamond: 8, Triangle: 7, "Inverted Triangle": 7, Heart: 8, Rectangle: 8 },
};

const MUSTACHE_FACE_SHAPES: Record<string, Record<string, number>> = {
  "chevron": { Oval: 8, Round: 7, Square: 8, Oblong: 7, Diamond: 7, Triangle: 7, "Inverted Triangle": 7, Heart: 7, Rectangle: 8 },
  "handlebar": { Oval: 9, Round: 8, Square: 7, Oblong: 8, Diamond: 8, Triangle: 8, "Inverted Triangle": 8, Heart: 9, Rectangle: 7 },
  "pencil": { Oval: 8, Round: 9, Square: 6, Oblong: 8, Diamond: 7, Triangle: 7, "Inverted Triangle": 7, Heart: 8, Rectangle: 8 },
  "walrus": { Oval: 7, Round: 6, Square: 8, Oblong: 6, Diamond: 7, Triangle: 7, "Inverted Triangle": 6, Heart: 7, Rectangle: 8 },
  "english": { Oval: 9, Round: 8, Square: 7, Oblong: 8, Diamond: 8, Triangle: 8, "Inverted Triangle": 8, Heart: 9, Rectangle: 7 },
  "hungarian": { Oval: 8, Round: 7, Square: 8, Oblong: 7, Diamond: 7, Triangle: 7, "Inverted Triangle": 7, Heart: 8, Rectangle: 8 },
  "horseshoe": { Oval: 6, Round: 6, Square: 8, Oblong: 5, Diamond: 6, Triangle: 6, "Inverted Triangle": 5, Heart: 6, Rectangle: 8 },
  "toothbrush": { Oval: 7, Round: 8, Square: 7, Oblong: 7, Diamond: 7, Triangle: 7, "Inverted Triangle": 7, Heart: 7, Rectangle: 7 },
  "none": { Oval: 8, Round: 8, Square: 8, Oblong: 8, Diamond: 8, Triangle: 7, "Inverted Triangle": 7, Heart: 8, Rectangle: 8 },
};

const FACE_SHAPE_KEYS = new Set([
  "Oval", "Round", "Square", "Oblong", "Diamond", "Triangle", "Inverted Triangle", "Heart", "Rectangle",
]);

function normalizeFaceShape(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (FACE_SHAPE_KEYS.has(trimmed)) return trimmed;
  const aliases: Record<string, string> = {
    oval: "Oval",
    round: "Round",
    square: "Square",
    oblong: "Oblong",
    diamond: "Diamond",
    triangle: "Triangle",
    "inverted triangle": "Inverted Triangle",
    "inverted-triangle": "Inverted Triangle",
    "inverted": "Inverted Triangle",
    heart: "Heart",
    rectangle: "Rectangle",
  };
  return aliases[trimmed.toLowerCase()] ?? null;
}

export function scoreGroomingStyles(faceShape: string | undefined): GroomingScore[] {
  const shape = normalizeFaceShape(faceShape);
  if (!shape) return [];

  const scores: GroomingScore[] = [];

  for (const [styleId, shapeScores] of Object.entries(BEARD_FACE_SHAPES)) {
    const score = shapeScores[shape];
    if (score == null) continue;
    scores.push({
      styleId,
      type: "beard",
      score,
      reason: getBeardReason(styleId, shape, score),
    });
  }

  for (const [styleId, shapeScores] of Object.entries(MUSTACHE_FACE_SHAPES)) {
    if (styleId === "none") continue;
    const score = shapeScores[shape];
    if (score == null) continue;
    scores.push({
      styleId,
      type: "mustache",
      score,
      reason: getMustacheReason(styleId, shape, score),
    });
  }

  return scores.sort((a, b) => b.score - a.score);
}

function getBeardReason(style: string, shape: string, score: number): string {
  const reasons: Record<string, string> = {
    "full-beard-short": "Adds definition to the jawline without overwhelming features",
    "full-beard-medium": "Creates a balanced, masculine silhouette with structure",
    "full-beard-long": "Dramatic look that adds length and presence",
    "goatee": "Draws attention to the chin, great for balancing face proportions",
    "circle-beard": "Softens angular features while maintaining a clean look",
    "van-dyke": "Refined style that highlights the lip and chin areas",
    "anchor": "Tapers the chin for a sophisticated, elongating effect",
    "balbo": "Defines the jawline without sideburns — modern and versatile",
    "mutton-chops": "Bold statement that broadens the jaw visually",
    "friendly-mutton-chops": "Wider sideburns that add width and warmth to the face",
    "hulihee": "Classic Fu Manchu style — distinctive and vintage",
  };
  const base = reasons[style] || "A classic grooming choice";
  if (score >= 9) return `${base}. Exceptional match for ${shape} faces.`;
  if (score >= 7) return `${base}. Good complement to ${shape} face shape.`;
  return `${base}. Consider other styles for ${shape} faces.`;
}

function getMustacheReason(style: string, shape: string, score: number): string {
  const reasons: Record<string, string> = {
    chevron: "Natural, rugged look that adds maturity",
    handlebar: "Statement piece that adds width and character",
    pencil: "Subtle definition that narrows the upper lip area",
    walrus: "Bold and distinguished — adds visual weight",
    english: "Refined and elegant with a vintage appeal",
    hungarian: "Full-bodied style that adds presence",
    horseshoe: "Classic tough-guy look that extends the lip line",
    toothbrush: "Compact and tidy — a conversation starter",
  };
  const base = reasons[style] || "A distinctive grooming choice";
  if (score >= 9) return `${base}. Ideal pairing for ${shape} faces.`;
  if (score >= 7) return `${base}. Works well with ${shape} proportions.`;
  return `${base}. Other styles may better suit ${shape} faces.`;
}
