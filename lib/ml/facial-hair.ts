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

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.003 * canvasWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();

  const points = path.points;
  if (points.length === 0) {
    ctx.restore();
    return;
  }

  const firstX = points[0].x * canvasWidth;
  const firstY = points[0].y * canvasHeight;
  ctx.moveTo(firstX, firstY);

  if (points.length > 2) {
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];

      const cpx = curr.x * canvasWidth;
      const cpy = curr.y * canvasHeight;
      const nx = next.x * canvasWidth;
      const ny = next.y * canvasHeight;

      const midX = (cpx + nx) / 2;
      const midY = (cpy + ny) / 2;

      ctx.quadraticCurveTo(cpx, cpy, midX, midY);
    }
  } else {
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * canvasWidth, points[i].y * canvasHeight);
    }
  }

  ctx.closePath();
  ctx.fill();

  ctx.restore();
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
