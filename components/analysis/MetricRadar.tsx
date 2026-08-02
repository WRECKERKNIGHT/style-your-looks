"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export interface RadarMetric {
  label: string;
  score: number;
}

interface MetricRadarProps {
  metrics: RadarMetric[];
  size?: number;
  maxScore?: number;
}

export function MetricRadar({ metrics, size = 420, maxScore = 10 }: MetricRadarProps) {
  const dims = useMemo(() => {
    const padding = 64;
    const w = size;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - padding;
    return { w, h, cx, cy, radius };
  }, [size]);

  const { w, h, cx, cy, radius } = dims;
  const n = metrics.length;

  const pointAt = (i: number, factor: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + radius * factor * Math.cos(angle),
      y: cy + radius * factor * Math.sin(angle),
    };
  };

  const ringPoints = useMemo(
    () => [0.33, 0.66, 1].map((f) => {
      const pts = metrics.map((_, i) => {
        const p = pointAt(i, f);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      });
      return pts.join(" ");
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metrics.length, w, h, cx, cy, radius]
  );

  const valuePoints = useMemo(() => {
    const pts = metrics.map((m, i) => {
      const p = pointAt(i, Math.max(0, Math.min(1, m.score / maxScore)));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    });
    return pts.join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, maxScore, w, h, cx, cy, radius]);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      className="mx-auto"
      style={{ maxWidth: size }}
    >
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8C88A" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#C8963E" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <motion.g
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {ringPoints.map((pts, idx) => (
          <motion.polygon
            key={`ring-${idx}`}
            points={pts}
            fill="none"
            stroke="rgba(200,150,62,0.18)"
            strokeWidth={1}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + idx * 0.12 }}
          />
        ))}

        {metrics.map((_, i) => {
          const p = pointAt(i, 1);
          return (
            <motion.line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(200,150,62,0.1)"
              strokeWidth={1}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            />
          );
        })}

        <motion.polygon
          points={valuePoints}
          fill="url(#radar-fill)"
          stroke="#C8963E"
          strokeWidth={1.8}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          style={{ filter: "drop-shadow(0 0 12px rgba(200,150,62,0.4))" }}
        />

        {metrics.map((m, i) => {
          const p = pointAt(i, Math.max(0, Math.min(1, m.score / maxScore)));
          return (
            <motion.circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={2.6}
              fill="#F2D9A8"
              stroke="#C8963E"
              strokeWidth={1}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.04, type: "spring" }}
            />
          );
        })}

        {metrics.map((m, i) => {
          const p = pointAt(i, 1);
          const lx = p.x + (p.x >= cx ? 8 : -8);
          const ly = p.y + (p.y >= cy ? 12 : -6);
          const anchor = lx > cx ? "start" : "end";
          const short = m.label.length > 12 ? `${m.label.slice(0, 11)}…` : m.label;
          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly}
              textAnchor={anchor}
              fill="#C8963E"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.08em"
              opacity={0.9}
            >
              {short}
            </text>
          );
        })}
      </motion.g>
    </svg>
  );
}
