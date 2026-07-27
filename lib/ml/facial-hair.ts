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

export function scoreGroomingStyles(faceShape: string | undefined): GroomingScore[] {
  if (!faceShape) return [];

  const scores: GroomingScore[] = [];

  for (const [styleId, shapeScores] of Object.entries(BEARD_FACE_SHAPES)) {
    const score = shapeScores[faceShape] ?? 7;
    scores.push({
      styleId,
      type: "beard",
      score,
      reason: getBeardReason(styleId, faceShape, score),
    });
  }

  for (const [styleId, shapeScores] of Object.entries(MUSTACHE_FACE_SHAPES)) {
    if (styleId === "none") continue;
    const score = shapeScores[faceShape] ?? 7;
    scores.push({
      styleId,
      type: "mustache",
      score,
      reason: getMustacheReason(styleId, faceShape, score),
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
