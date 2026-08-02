"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface FaceShapeDiagramProps {
  landmarks: number[][];
  width?: number;
  height?: number;
  facialShape?: string;
}

const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const EYE_L = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const EYE_R = [263, 249, 390, 373, 374, 380, 381, 382, 398, 384, 385, 386, 387, 388, 466];
const NOSE = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327];
const MOUTH = [0, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267];
const BROWS = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107, 285, 295, 282, 283, 300, 293, 296, 336, 334, 263];

function points(landmarks: number[][], indices: number[]): string | null {
  const pts: string[] = [];
  for (const i of indices) {
    const lm = landmarks[i];
    if (!lm) return null;
    pts.push(`${(lm[0] * 1000).toFixed(1)},${(lm[1] * 1000).toFixed(1)}`);
  }
  return pts.join(" ");
}

export function FaceShapeDiagram({
  landmarks,
  width = 260,
  height = 300,
  facialShape,
}: FaceShapeDiagramProps) {
  const shapePoints = useMemo(() => points(landmarks, OVAL), [landmarks]);
  const eyeL = useMemo(() => points(landmarks, EYE_L), [landmarks]);
  const eyeR = useMemo(() => points(landmarks, EYE_R), [landmarks]);
  const nose = useMemo(() => points(landmarks, NOSE), [landmarks]);
  const mouth = useMemo(() => points(landmarks, MOUTH), [landmarks]);
  const brows = useMemo(() => points(landmarks, BROWS), [landmarks]);

  return (
    <div className="relative" style={{ width, height }} aria-hidden="true">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(200,150,62,0.12) 0%, rgba(200,150,62,0.03) 55%, transparent 75%)",
        }}
      />
      <svg viewBox="0 0 1000 1000" width="100%" height="100%" className="absolute inset-0">
        <defs>
          <linearGradient id="shape-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8963E" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8A5F3D" stopOpacity="0.12" />
          </linearGradient>
          <filter id="shape-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {shapePoints && (
          <motion.polygon
            points={shapePoints}
            fill="url(#shape-fill)"
            stroke="#C8963E"
            strokeWidth="4"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ filter: "url(#shape-glow)" }}
          />
        )}

        {[
          { pts: eyeL, color: "#E8C88A", delay: 0.5 },
          { pts: eyeR, color: "#E8C88A", delay: 0.55 },
          { pts: brows, color: "#A0764E", delay: 0.7 },
          { pts: nose, color: "#8A5F3D", delay: 0.85 },
          { pts: mouth, color: "#CCA066", delay: 1.0 },
        ].map((region, idx) =>
          region.pts ? (
            <motion.polyline
              key={idx}
              points={region.pts}
              fill="none"
              stroke={region.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.95 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: region.delay, ease: "easeInOut" }}
            />
          ) : null
        )}
      </svg>

      {facialShape && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-aurum-500/40 bg-black/40 backdrop-blur-sm text-center"
        >
          <span className="text-[0.7rem] font-mono tracking-[0.3em] text-aurum-400">
            {facialShape.toUpperCase()}
          </span>
        </motion.div>
      )}
    </div>
  );
}
