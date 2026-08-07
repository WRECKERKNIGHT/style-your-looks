"use client";

import { useEffect, useMemo, useRef } from "react";
import { mapCoverPoint } from "@/lib/image-geometry";
import { calculateSymmetryAxis } from "@/lib/ml/face-geometry";
import { faceBounds } from "@/lib/ml/face-landmarks";

export interface SkeletonMeasurements {
  fwhr?: number;
  canthalTilt?: number;
  eyeNoseRatio?: number;
}

interface FaceSkeletonOverlayProps {
  landmarks: number[][];
  width: number;
  height: number;
  imageAspect?: number;
  facialShape?: string;
  measurements?: SkeletonMeasurements;
  animate?: boolean;
  className?: string;
}

const COLORS = {
  oval: "#C8963E",
  eye: "#E8C88A",
  brow: "#A0764E",
  nose: "#8A5F3D",
  mouth: "#CCA066",
  innerMouth: "#9C7142",
  centerline: "rgba(200, 150, 62, 0.35)",
  measure: "#E8C88A",
  dot: "#F2D9A8",
};

interface RegionSpec {
  id: string;
  color: string;
  indices: number[];
  delay: number;
  width: number;
}

const REGIONS: RegionSpec[] = [
  {
    id: "oval",
    color: COLORS.oval,
    width: 1.6,
    delay: 0,
    indices: [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
      152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    ],
  },
  {
    id: "left-eye",
    color: COLORS.eye,
    width: 1.6,
    delay: 0.55,
    indices: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  },
  {
    id: "right-eye",
    color: COLORS.eye,
    width: 1.6,
    delay: 0.62,
    indices: [263, 249, 390, 373, 374, 380, 381, 382, 398, 384, 385, 386, 387, 388, 466],
  },
  {
    id: "left-brow",
    color: COLORS.brow,
    width: 1.3,
    delay: 0.78,
    indices: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
  },
  {
    id: "right-brow",
    color: COLORS.brow,
    width: 1.3,
    delay: 0.84,
    indices: [285, 295, 282, 283, 300, 293, 296, 336, 334, 263],
  },
  {
    id: "nose",
    color: COLORS.nose,
    width: 1.5,
    delay: 0.9,
    indices: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327],
  },
  {
    id: "mouth",
    color: COLORS.mouth,
    width: 1.7,
    delay: 1.05,
    indices: [0, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267],
  },
  {
    id: "inner-mouth",
    color: COLORS.innerMouth,
    width: 1.2,
    delay: 1.15,
    indices: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191],
  },
];

const KEY_DOTS: { index: number; delay: number; r: number }[] = [
  { index: 33, delay: 1.25, r: 3.4 },
  { index: 133, delay: 1.25, r: 3.4 },
  { index: 263, delay: 1.3, r: 3.4 },
  { index: 362, delay: 1.3, r: 3.4 },
  { index: 1, delay: 1.4, r: 4 },
  { index: 152, delay: 1.45, r: 3.4 },
  { index: 61, delay: 1.5, r: 3 },
  { index: 291, delay: 1.5, r: 3 },
  { index: 234, delay: 1.55, r: 3.4 },
  { index: 454, delay: 1.55, r: 3.4 },
  { index: 9, delay: 1.6, r: 3 },
];

interface Pt {
  x: number;
  y: number;
}

function pathLength(pts: Pt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

interface PreparedRegion extends RegionSpec {
  pts: Pt[];
  len: number;
}

interface PreparedData {
  regions: PreparedRegion[];
  keyDots: { index: number; delay: number; r: number; p: Pt }[];
  ovalPts: Pt[];
  ovalLen: number;
  axis: { x1: number; y1: number; x2: number; y2: number; angle: number } | null;
  fwhr: { yw: number; x1: number; x2: number; yh1: number; yh2: number; xv: number } | null;
  canthal: { x1: number; y1: number; x2: number; y2: number } | null;
  eyeNose: { x1: number; y1: number; x2: number; y2: number } | null;
  bounds: { x: number; y: number; w: number; h: number } | null;
}

function prepareData(
  landmarks: number[][],
  width: number,
  height: number,
  imageAspect?: number
): PreparedData {
  const map = (u: number, v: number) =>
    mapCoverPoint(u, v, { boxW: width, boxH: height, imageAspect: imageAspect ?? width / height });
  const pt = (i: number): Pt | null => {
    const lm = landmarks[i];
    if (!lm) return null;
    return map(lm[0], lm[1]);
  };

  const regions: PreparedRegion[] = REGIONS.map((region) => {
    const pts: Pt[] = [];
    for (const i of region.indices) {
      const p = pt(i);
      if (p) pts.push(p);
    }
    return { ...region, pts, len: pathLength(pts) };
  });

  const keyDots: PreparedData["keyDots"] = [];
  for (const dot of KEY_DOTS) {
    const p = pt(dot.index);
    if (p) keyDots.push({ ...dot, p });
  }

  const ovalRegion = regions[0];
  const ovalPts = ovalRegion.pts;
  const ovalLen = ovalRegion.len;

  const axisRaw = calculateSymmetryAxis(landmarks);
  const axis =
    axisRaw && width > 0 && height > 0
      ? (() => {
          const a = map(axisRaw.a.x, axisRaw.a.y);
          const b = map(axisRaw.b.x, axisRaw.b.y);
          return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, angle: axisRaw.angleDeg };
        })()
      : null;

  const fwhr =
    landmarks[234] && landmarks[454] && landmarks[9] && landmarks[13]
      ? {
          yw: (pt(9)!.y + pt(13)!.y) / 2,
          x1: pt(234)!.x,
          x2: pt(454)!.x,
          yh1: pt(9)!.y,
          yh2: pt(13)!.y,
          xv: (pt(234)!.x + pt(454)!.x) / 2,
        }
      : null;

  const canthal =
    landmarks[133] && landmarks[33] ? { x1: pt(133)!.x, y1: pt(133)!.y, x2: pt(33)!.x, y2: pt(33)!.y } : null;

  const eyeNose =
    landmarks[33] && landmarks[263]
      ? { x1: pt(33)!.x, y1: (pt(33)!.y + pt(263)!.y) / 2, x2: pt(263)!.x, y2: (pt(33)!.y + pt(263)!.y) / 2 }
      : null;

  let bounds: PreparedData["bounds"] = null;
  const rawBounds = faceBounds(landmarks, 1, 1);
  if (rawBounds) {
    const a = map(rawBounds.x, rawBounds.y);
    const b = map(rawBounds.x + rawBounds.w, rawBounds.y + rawBounds.h);
    const x = Math.max(0, a.x);
    const y = Math.max(0, a.y);
    const w = Math.min(width, b.x) - x;
    const h = Math.min(height, b.y) - y;
    if (w > 0 && h > 0) bounds = { x, y, w, h };
  }

  return { regions, keyDots, ovalPts, ovalLen, axis, fwhr, canthal, eyeNose, bounds };
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSec: number,
  animate: boolean,
  data: PreparedData,
  measurements: SkeletonMeasurements
) {
  ctx.clearRect(0, 0, width, height);

  const bounds = data.bounds;
  const drawDelay = animate ? 0.2 : 0;

  if (animate && bounds) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.w, bounds.h);
    ctx.clip();

    const gridStep = 36;
    ctx.strokeStyle = "rgba(232,200,138,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = bounds.x; gx < bounds.x + bounds.w; gx += gridStep) {
      ctx.moveTo(gx, bounds.y);
      ctx.lineTo(gx, bounds.y + bounds.h);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const region of data.regions) {
    if (region.pts.length < 2) continue;
    const start = drawDelay + region.delay;
    const revealT = animate ? (timeSec - start) / 0.8 : 1;
    if (revealT <= 0) continue;

    ctx.beginPath();
    ctx.moveTo(region.pts[0].x, region.pts[0].y);
    for (let i = 1; i < region.pts.length; i++) {
      ctx.lineTo(region.pts[i].x, region.pts[i].y);
    }
    ctx.strokeStyle = region.color;
    ctx.lineWidth = region.width;
    ctx.globalAlpha = Math.min(1, revealT) * 0.95;
    ctx.shadowColor = "rgba(200,150,62,0.35)";
    ctx.shadowBlur = 4;

    if (revealT < 1 && animate) {
      ctx.setLineDash([region.len, region.len]);
      ctx.lineDashOffset = region.len * (1 - revealT);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (data.axis) {
    ctx.save();
    ctx.strokeStyle = COLORS.centerline;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 6]);
    const start = drawDelay + 1.2;
    const revealT = animate ? (timeSec - start) / 0.6 : 1;
    if (revealT > 0) {
      const len = Math.hypot(data.axis.x2 - data.axis.x1, data.axis.y2 - data.axis.y1);
      ctx.setLineDash([len, len]);
      ctx.lineDashOffset = len * (1 - Math.min(1, revealT));
      ctx.beginPath();
      ctx.moveTo(data.axis.x1, data.axis.y1);
      ctx.lineTo(data.axis.x2, data.axis.y2);
      ctx.stroke();
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = 0;
      if (timeSec > drawDelay + 1.5) {
        const label = `AXIS ${data.axis.angle >= 0 ? "+" : ""}${data.axis.angle.toFixed(1)}°`;
        drawLabel(ctx, label, data.axis.x1 + 8, data.axis.y1 - 6);
      }
    }
    ctx.restore();
  }

  if (data.fwhr && measurements?.fwhr !== undefined) {
    const t = animate ? Math.min(1, (timeSec - (drawDelay + 1.7)) / 0.5) : 1;
    if (t > 0) {
      ctx.save();
      ctx.globalAlpha = t;
      ctx.strokeStyle = COLORS.measure;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(data.fwhr.x1, data.fwhr.yw);
      ctx.lineTo(data.fwhr.x2, data.fwhr.yw);
      ctx.moveTo(data.fwhr.xv, data.fwhr.yh1);
      ctx.lineTo(data.fwhr.xv, data.fwhr.yh2);
      ctx.stroke();
      drawLabel(ctx, `FWHR ${measurements.fwhr.toFixed(2)}`, Math.min(data.fwhr.x1, data.fwhr.x2) + 8, data.fwhr.yw - 6);
      ctx.restore();
    }
  }

  if (data.canthal && measurements?.canthalTilt !== undefined) {
    const t = animate ? Math.min(1, (timeSec - (drawDelay + 1.9)) / 0.5) : 1;
    if (t > 0) {
      ctx.save();
      ctx.globalAlpha = t;
      ctx.strokeStyle = COLORS.measure;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(data.canthal.x1, data.canthal.y1);
      ctx.lineTo(data.canthal.x2, data.canthal.y2);
      ctx.stroke();
      const label = `${measurements.canthalTilt >= 0 ? "+" : ""}${measurements.canthalTilt.toFixed(1)}°`;
      drawLabel(ctx, label, data.canthal.x2 - 4, data.canthal.y2 - 8);
      ctx.restore();
    }
  }

  if (data.eyeNose && measurements?.eyeNoseRatio !== undefined) {
    const t = animate ? Math.min(1, (timeSec - (drawDelay + 2.05)) / 0.5) : 1;
    if (t > 0) {
      ctx.save();
      ctx.globalAlpha = t;
      ctx.strokeStyle = COLORS.measure;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(data.eyeNose.x1, data.eyeNose.y1);
      ctx.lineTo(data.eyeNose.x2, data.eyeNose.y2);
      ctx.stroke();
      drawLabel(
        ctx,
        `E/N ${measurements.eyeNoseRatio.toFixed(2)}`,
        (data.eyeNose.x1 + data.eyeNose.x2) / 2 - 40,
        data.eyeNose.y1 - 8
      );
      ctx.restore();
    }
  }

  for (const dot of data.keyDots) {
    const start = drawDelay + dot.delay;
    const appear = animate ? Math.min(1, (timeSec - start) / 0.35) : 1;
    if (appear <= 0) continue;

    if (animate) {
      const cycle = ((timeSec - start) % 2) / 2;
      const ringR = dot.r * (1.4 + 1.8 * cycle);
      ctx.beginPath();
      ctx.arc(dot.p.x, dot.p.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.oval;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.5 * (1 - cycle);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(dot.p.x, dot.p.y, dot.r, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.dot;
    ctx.globalAlpha = appear;
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  if (animate && data.ovalPts.length > 4 && data.ovalLen > 0) {
    const tilt = measurements?.canthalTilt ?? 0;
    const flowDuration = Math.min(9, Math.max(4, 6 - tilt * 0.08));
    const flowForward = (measurements?.canthalTilt ?? 0) >= 0;
    const t = (timeSec % flowDuration) / flowDuration;

    ctx.save();
    ctx.strokeStyle = "rgba(232,200,138,0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 15]);
    ctx.lineDashOffset = flowForward ? -880 * t : 880 * t;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(data.ovalPts[0].x, data.ovalPts[0].y);
    for (let i = 1; i < data.ovalPts.length; i++) {
      ctx.lineTo(data.ovalPts[i].x, data.ovalPts[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.globalAlpha = 1;

    const target = flowForward ? t : 1 - t;
    const segF = target * (data.ovalPts.length - 1);
    const idx = Math.min(data.ovalPts.length - 2, Math.floor(segF));
    const f = segF - idx;
    const a = data.ovalPts[idx];
    const b = data.ovalPts[idx + 1];
    const cx = a.x + (b.x - a.x) * f;
    const cy = a.y + (b.y - a.y) * f;

    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(232,200,138,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(242,217,168,0.95)";
    ctx.fill();
    ctx.restore();
  }

  if (animate && bounds) {
    ctx.save();
    ctx.strokeStyle = "rgba(200,150,62,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.w - 1, bounds.h - 1);

    const sweep = (timeSec % 3.2) / 3.2;
    const scanStart = bounds.y;
    const scanEnd = Math.max(scanStart, bounds.y + bounds.h - 2);
    const scanY = scanStart + (scanEnd - scanStart) * sweep;
    const grad = ctx.createLinearGradient(bounds.x, scanY - 2, bounds.x, scanY + 2);
    grad.addColorStop(0, "rgba(232,200,138,0)");
    grad.addColorStop(0.5, "rgba(232,200,138,0.9)");
    grad.addColorStop(1, "rgba(232,200,138,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(bounds.x, scanY - 2, bounds.w, 4);
    ctx.restore();
  }
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

export function FaceSkeletonOverlay({
  landmarks,
  width,
  height,
  imageAspect,
  facialShape,
  measurements,
  animate = true,
  className,
}: FaceSkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataRef = useRef<PreparedData | null>(null);

  const data = useMemo(
    () => prepareData(landmarks, width, height, imageAspect),
    [landmarks, width, height, imageAspect]
  );

  const shapeLabel = facialShape?.toUpperCase() ?? "";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    dataRef.current = data;
    let raf = 0;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      const timeSec = now / 1000;
      const c = ctx;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dataRef.current) {
        drawOverlay(c, width, height, timeSec, animate, dataRef.current, measurements ?? {});
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [data, width, height, animate, measurements]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ""}`}
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {shapeLabel && (
        <div
          className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-sm border bg-black/45 backdrop-blur-sm"
          style={{ borderColor: "rgba(200,150,62,0.5)" }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.oval }} />
          <span className="text-[0.65rem] font-mono tracking-[0.25em] text-[#F2D9A8]">
            SHAPE: {shapeLabel}
          </span>
        </div>
      )}

      {animate && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#E8C88A" }} />
          <span className="text-[0.55rem] font-mono tracking-[0.3em] text-[#E8C88A]">
            FACEIQ LIVE TRACKING
          </span>
        </div>
      )}

      {animate && data.bounds && (
        <>
          <div
            className="absolute w-8 h-8 border-t-2 border-l-2"
            style={{ top: data.bounds.y, left: data.bounds.x, borderColor: "rgba(200,150,62,0.7)" }}
          />
          <div
            className="absolute w-8 h-8 border-t-2 border-r-2"
            style={{ top: data.bounds.y, left: data.bounds.x + data.bounds.w - 32, borderColor: "rgba(200,150,62,0.7)" }}
          />
          <div
            className="absolute w-8 h-8 border-b-2 border-l-2"
            style={{ top: data.bounds.y + data.bounds.h - 32, left: data.bounds.x, borderColor: "rgba(200,150,62,0.7)" }}
          />
          <div
            className="absolute w-8 h-8 border-b-2 border-r-2"
            style={{ top: data.bounds.y + data.bounds.h - 32, left: data.bounds.x + data.bounds.w - 32, borderColor: "rgba(200,150,62,0.7)" }}
          />
        </>
      )}

      {measurements?.fwhr !== undefined && (
        <div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-sm border bg-black/45 backdrop-blur-sm"
          style={{ borderColor: "rgba(232,200,138,0.45)" }}
        >
          <span className="text-[0.6rem] font-mono tracking-widest text-[#E8C88A]">
            VERIFIED GEOMETRY
          </span>
        </div>
      )}
    </div>
  );
}
