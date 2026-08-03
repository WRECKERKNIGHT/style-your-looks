"use client";

import { useId } from "react";

export interface RadarAxis {
  label: string;
  value: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  overlay?: RadarAxis[] | null;
  size?: number;
  label?: string;
  overlayLabel?: string;
}

const PALETTE = ["#CCA066", "#B98B56", "#C8963E", "#8A5F3D"];

export function RadarChart({
  axes,
  overlay = null,
  size = 320,
  label = "NATURAL",
  overlayLabel = "STYLED",
}: RadarChartProps) {
  const gradId = useId().replace(/[:]/g, "");
  const overlayGradId = useId().replace(/[:]/g, "");
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;

  const pointFor = (value: number, index: number, count: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const radius = r * (Math.max(0, Math.min(10, value)) / 10);
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  };

  const polygonPath = (values: number[]) => {
    if (values.length < 3) return "";
    return values
      .map((v, i) => {
        const p = pointFor(v, i, values.length);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";
  };

  const count = axes.length;
  const rings = [2, 4, 6, 8, 10];
  const tick = (i: number) => {
    const p = pointFor(10, i, count);
    const outer = pointFor(10.5, i, count);
    const inner = pointFor(9.6, i, count);
    return (
      <g key={i}>
        <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(185,139,86,0.35)" strokeWidth="1" />
        <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(185,139,86,0.12)" strokeWidth="1" />
        <text
          x={p.x}
          y={p.y}
          dy={i === 0 ? -6 : 4}
          dx={Math.abs(p.x - cx) < 4 ? -axisLabelWidth(axes[i].label) / 2 : p.x > cx ? 6 : -6 - axisLabelWidth(axes[i].label)}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="9"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.08em"
        >
          {axes[i].label}
        </text>
      </g>
    );
  };

  function axisLabelWidth(s: string): number {
    return s.length * 6.5;
  }

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCA066" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#B98B56" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={overlayGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A5F3D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#C07A5A" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {rings.map((ring) => {
          const path = polygonPath(Array(count).fill(ring));
          return (
            <polygon
              key={ring}
              points={path.replace(/Z$/, "")}
              fill="none"
              stroke="rgba(185,139,86,0.15)"
              strokeWidth="1"
            />
          );
        })}

        {axes.map((_, i) => tick(i))}

        {overlay && overlay.length === count && (
          <g>
            <polygon
              points={polygonPath(overlay.map((o) => o.value)).replace(/Z$/, "")}
              fill={`url(#${overlayGradId})`}
              stroke="#C07A5A"
              strokeWidth="1.5"
              strokeDasharray="5,4"
              strokeLinejoin="round"
            />
            {overlay.map((o, i) => {
              const p = pointFor(o.value, i, count);
              return (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C07A5A" stroke="#241812" strokeWidth="1" />
              );
            })}
          </g>
        )}

        <g>
          <polygon
            points={polygonPath(axes.map((a) => a.value)).replace(/Z$/, "")}
            fill={`url(#${gradId})`}
            stroke="#CCA066"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {axes.map((a, i) => {
            const p = pointFor(a.value, i, count);
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4.5" fill="#CCA066" stroke="#241812" strokeWidth="1.5" />
                <title>{`${a.label}: ${a.value.toFixed(1)}`}</title>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-1 rounded-full bg-[#CCA066]" />
          <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">{label}</span>
        </div>
        {overlay && overlay.length === count && (
          <div className="flex items-center gap-2">
            <span className="w-6 h-1 rounded-full bg-[#C07A5A]" />
            <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">{overlayLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
