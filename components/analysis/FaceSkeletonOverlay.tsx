"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { mapCoverPoint } from "@/lib/image-geometry";
import { calculateSymmetryAxis } from "@/lib/ml/face-geometry";

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

const REGIONS: { id: string; color: string; indices: number[]; delay: number; width: number }[] = [
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

function polylinePoints(
  landmarks: number[][],
  indices: number[],
  map: (u: number, v: number) => { x: number; y: number }
): string | null {
  const pts: string[] = [];
  for (const i of indices) {
    const lm = landmarks[i];
    if (!lm) return null;
    const p = map(lm[0], lm[1]);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(" ");
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
  const map = useMemo(
    () => (u: number, v: number) =>
      mapCoverPoint(u, v, { boxW: width, boxH: height, imageAspect: imageAspect ?? width / height }),
    [width, height, imageAspect]
  );

  const x = (i: number) => map(landmarks[i][0], landmarks[i][1]).x;
  const y = (i: number) => map(landmarks[i][0], landmarks[i][1]).y;

  const canSee = (i: number) => Boolean(landmarks[i]);
  const shapeLabel = facialShape?.toUpperCase() ?? "";

  const fwhrLine =
    measurements?.fwhr !== undefined && canSee(234) && canSee(454) && canSee(9) && canSee(13)
      ? {
          yw: (y(9) + y(13)) / 2,
          x1: x(234),
          x2: x(454),
          yh1: y(9),
          yh2: y(13),
          xv: (x(234) + x(454)) / 2,
        }
      : null;

  const canthalLine = canSee(133) && canSee(33) ? { x1: x(133), y1: y(133), x2: x(33), y2: y(33) } : null;
  const eyeNoseLine =
    measurements?.eyeNoseRatio !== undefined && canSee(33) && canSee(263)
      ? { x1: x(33), y1: (y(33) + y(263)) / 2, x2: x(263), y2: (y(33) + y(263)) / 2 }
      : null;

  // Pose-aware symmetry axis: pupil midpoint → chin tip (follows head roll).
  const axisLine = useMemo(() => {
    const axis = calculateSymmetryAxis(landmarks);
    if (!axis) return null;
    const a = map(axis.a.x, axis.a.y);
    const b = map(axis.b.x, axis.b.y);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, angle: axis.angleDeg };
  }, [landmarks, map]);

  const drawDelay = animate ? 0.2 : 0;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ""}`}
      style={{ width, height }}
    >
      {animate && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(232,200,138,0.04) 0px, rgba(232,200,138,0.04) 1px, transparent 1px, transparent 36px)",
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="absolute inset-0"
      >
        <defs>
          <filter id="skel-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="scan-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(232,200,138,0)" />
            <stop offset="0.5" stopColor="rgba(232,200,138,0.9)" />
            <stop offset="1" stopColor="rgba(232,200,138,0)" />
          </linearGradient>
        </defs>

        {animate && (
          <motion.rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="none"
            stroke="rgba(200,150,62,0.5)"
            strokeWidth={1}
          />
        )}

        {animate && (
          <motion.g
            initial={{ y: 0, opacity: 0.9 }}
            animate={{ y: height - 24, opacity: 0.2 }}
            transition={{ duration: 3.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <rect
              x={0}
              y={0}
              width={width}
              height={2}
              fill="url(#scan-gradient)"
              opacity={0.7}
            />
          </motion.g>
        )}

        <g filter="url(#skel-glow)">
          {REGIONS.map((region) => {
            const points = polylinePoints(landmarks, region.indices, map);
            if (!points) return null;
            return (
              <motion.polyline
                key={region.id}
                points={points}
                fill="none"
                stroke={region.color}
                strokeWidth={region.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                animate={animate ? { pathLength: 1, opacity: 0.95 } : { opacity: 0.95 }}
                transition={{
                  pathLength: { duration: 0.8, delay: drawDelay + region.delay, ease: "easeInOut" },
                  opacity: { duration: 0.4, delay: drawDelay + region.delay },
                }}
              />
            );
          })}

          {axisLine && (
            <>
              <motion.line
                x1={axisLine.x1}
                y1={axisLine.y1}
                x2={axisLine.x2}
                y2={axisLine.y2}
                stroke={COLORS.centerline}
                strokeWidth={1.2}
                strokeDasharray="5 6"
                initial={animate ? { pathLength: 0, opacity: 0 } : false}
                animate={animate ? { pathLength: 1, opacity: 1 } : { opacity: 1 }}
                transition={{ pathLength: { duration: 0.6, delay: drawDelay + 1.2 } }}
              />
              <motion.g
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: drawDelay + 1.5, duration: 0.4 }}
              >
                <text
                  x={axisLine.x1 + 8}
                  y={axisLine.y1 - 6}
                  fill="#fff"
                  fontSize="10"
                  fontFamily="monospace"
                  style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.65)", strokeWidth: 3 }}
                >
                  AXIS {axisLine.angle >= 0 ? "+" : ""}{axisLine.angle.toFixed(1)}°
                </text>
              </motion.g>
            </>
          )}

          {KEY_DOTS.map((dot) =>
            canSee(dot.index) ? (
              <motion.circle
                key={`dot-${dot.index}`}
                cx={x(dot.index)}
                cy={y(dot.index)}
                r={dot.r}
                fill={COLORS.dot}
                initial={animate ? { scale: 0, opacity: 0 } : false}
                animate={animate ? { scale: 1, opacity: 1 } : { opacity: 1 }}
                transition={{ delay: drawDelay + dot.delay, duration: 0.35, type: "spring" }}
              />
            ) : null
          )}
        </g>

        {fwhrLine && (
          <motion.g
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: drawDelay + 1.7, duration: 0.5 }}
          >
            <line
              x1={fwhrLine.x1}
              y1={fwhrLine.yw}
              x2={fwhrLine.x2}
              y2={fwhrLine.yw}
              stroke={COLORS.measure}
              strokeWidth={1.4}
              strokeDasharray="7 5"
            />
            <line
              x1={fwhrLine.xv}
              y1={fwhrLine.yh1}
              x2={fwhrLine.xv}
              y2={fwhrLine.yh2}
              stroke={COLORS.measure}
              strokeWidth={1.4}
              strokeDasharray="7 5"
            />
            <text
              x={Math.min(fwhrLine.x1, fwhrLine.x2) + 8}
              y={fwhrLine.yw - 6}
              fill="#fff"
              fontSize="11"
              fontFamily="monospace"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.65)", strokeWidth: 3 }}
            >
              FWHR {measurements?.fwhr?.toFixed(2)}
            </text>
          </motion.g>
        )}

        {canthalLine && measurements?.canthalTilt !== undefined && (
          <motion.g
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: drawDelay + 1.9, duration: 0.5 }}
          >
            <line
              x1={canthalLine.x1}
              y1={canthalLine.y1}
              x2={canthalLine.x2}
              y2={canthalLine.y2}
              stroke={COLORS.measure}
              strokeWidth={1.4}
              strokeDasharray="4 4"
            />
            <text
              x={canthalLine.x2 - 4}
              y={canthalLine.y2 - 8}
              fill="#fff"
              fontSize="11"
              fontFamily="monospace"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.65)", strokeWidth: 3 }}
            >
              {measurements.canthalTilt >= 0 ? "+" : ""}
              {measurements.canthalTilt.toFixed(1)}°
            </text>
          </motion.g>
        )}

        {eyeNoseLine && (
          <motion.g
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: drawDelay + 2.05, duration: 0.5 }}
          >
            <line
              x1={eyeNoseLine.x1}
              y1={eyeNoseLine.y1}
              x2={eyeNoseLine.x2}
              y2={eyeNoseLine.y2}
              stroke={COLORS.measure}
              strokeWidth={1.4}
              strokeDasharray="4 4"
            />
            <text
              x={(eyeNoseLine.x1 + eyeNoseLine.x2) / 2 - 40}
              y={eyeNoseLine.y1 - 8}
              fill="#fff"
              fontSize="11"
              fontFamily="monospace"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.65)", strokeWidth: 3 }}
            >
              E/N {measurements?.eyeNoseRatio?.toFixed(2)}
            </text>
          </motion.g>
        )}
      </svg>

      {shapeLabel && (
        <motion.div
          initial={animate ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: drawDelay + 2.2, duration: 0.5 }}
          className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-sm border bg-black/45 backdrop-blur-sm"
          style={{ borderColor: "rgba(200,150,62,0.5)" }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: COLORS.oval }} />
          <span className="text-[0.65rem] font-mono tracking-[0.25em] text-[#F2D9A8]">
            SHAPE: {shapeLabel}
          </span>
        </motion.div>
      )}

      {animate && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#E8C88A" }} />
          <span className="text-[0.55rem] font-mono tracking-[0.3em] text-[#E8C88A]">
            FACEIQ LIVE TRACKING
          </span>
        </div>
      )}

      {animate && (
        <>
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: "rgba(200,150,62,0.7)" }} />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: "rgba(200,150,62,0.7)" }} />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: "rgba(200,150,62,0.7)" }} />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: "rgba(200,150,62,0.7)" }} />
        </>
      )}

      {measurements?.fwhr !== undefined && (
        <motion.div
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: drawDelay + 2.3, duration: 0.5 }}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-sm border bg-black/45 backdrop-blur-sm"
          style={{ borderColor: "rgba(232,200,138,0.45)" }}
        >
          <span className="text-[0.6rem] font-mono tracking-widest text-[#E8C88A]">
            VERIFIED GEOMETRY
          </span>
        </motion.div>
      )}
    </div>
  );
}
