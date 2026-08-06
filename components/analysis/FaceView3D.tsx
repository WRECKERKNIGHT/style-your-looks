"use client";

import { useEffect, useRef } from "react";
import { Box, Rotate3d, Maximize2 } from "lucide-react";

interface FaceView3DProps {
  landmarks: number[][];
  className?: string;
  height?: number;
}

interface Pt3 {
  x: number;
  y: number;
  z: number;
}

function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  if (color.startsWith("#")) {
    const h = color.slice(1);
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  const m = color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
  }
  return { r: 200, g: 150, b: 62, a: 1 };
}

const rgba = (c: { r: number; g: number; b: number; a: number }, alpha: number) =>
  `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, alpha))})`;

const REGION_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const EYE_L = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const EYE_R = [263, 249, 390, 373, 374, 380, 381, 382, 398, 384, 385, 386, 387, 388, 466];
const BROW_L = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107];
const BROW_R = [285, 295, 282, 283, 300, 293, 296, 336, 334, 263];
const NOSE = [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327];
const MOUTH = [0, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267];

function loops(indices: number[]): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < indices.length - 1; i++) {
    edges.push([indices[i], indices[i + 1]]);
  }
  edges.push([indices[indices.length - 1], indices[0]]);
  return edges;
}

const EDGES: { pairs: [number, number][]; color: string; width: number }[] = [
  { pairs: loops(REGION_INDICES), color: "#C8963E", width: 1.4 },
  { pairs: loops(EYE_L), color: "#E8C88A", width: 1.3 },
  { pairs: loops(EYE_R), color: "#E8C88A", width: 1.3 },
  { pairs: loops(BROW_L), color: "#A0764E", width: 1.1 },
  { pairs: loops(BROW_R), color: "#A0764E", width: 1.1 },
  { pairs: loops(NOSE), color: "#8A5F3D", width: 1.2 },
  { pairs: loops(MOUTH), color: "#CCA066", width: 1.5 },
  {
    pairs: [
      [33, 263],
      [133, 362],
      [1, 168],
      [1, 9],
      [10, 152],
      [168, 6],
      [10, 33],
      [10, 263],
    ],
    color: "rgba(200,150,62,0.35)",
    width: 0.8,
  },
];

export function FaceView3D({
  landmarks,
  className,
  height = 340,
}: FaceView3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (!landmarks || landmarks.length < 468) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let yaw = -0.35;
    let pitch = 0.12;
    let targetYaw = yaw;
    let targetPitch = pitch;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;
    let lastMove = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = wrap.clientWidth;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const raw: Pt3[] = landmarks.slice(0, 478).map((lm) => ({
      x: lm[0],
      y: lm[1],
      z: lm[2] !== undefined ? lm[2] : 0,
    }));

    const cx = raw.reduce((a, p) => a + p.x, 0) / raw.length;
    const cy = raw.reduce((a, p) => a + p.y, 0) / raw.length;
    const cz = raw.reduce((a, p) => a + p.z, 0) / raw.length;

    let zMin = Infinity;
    let zMax = -Infinity;
    let xMin = Infinity;
    let xMax = -Infinity;
    const centered = raw.map((p) => {
      const x = p.x - cx;
      const y = p.y - cy;
      const z = p.z - cz;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
      if (x < xMin) xMin = x;
      if (x > xMax) xMax = x;
      return { x, y, z };
    });

    const faceWidth = Math.max(0.001, xMax - xMin);
    const depthSpan = Math.max(0.001, zMax - zMin);
    const zScale = (faceWidth * 0.45) / depthSpan;

    const pts: Pt3[] = centered.map((p) => ({ x: p.x, y: p.y, z: p.z * zScale }));

    const persp = 1.2;

    const project = (p: Pt3): [number, number, number] => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);

      let x = p.x * cosY + p.z * sinY;
      let z = -p.x * sinY + p.z * cosY;
      const y = p.y * cosX - z * sinX;
      z = p.y * sinX + z * cosX;

      const s = 1 / (1 + z * persp);
      return [x * s, y * s, s];
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const half = Math.min(width, height) * 0.42;
      const ox = width / 2;
      const oy = height / 2;

      ctx.save();
      ctx.translate(ox, oy);

      for (const layer of EDGES) {
        const col = parseColor(layer.color);
        for (const [a, b] of layer.pairs) {
          const pa = pts[a];
          const pb = pts[b];
          if (!pa || !pb) continue;
          const [ax, ay, as] = project(pa);
          const [bx, by, bs] = project(pb);
          const n = Math.max(0, Math.min(1, (Math.min(as, bs) - 0.8) / 0.6));
          ctx.strokeStyle = rgba(col, col.a * (0.3 + 0.7 * n));
          ctx.lineWidth = layer.width;
          ctx.beginPath();
          ctx.moveTo(ax * half, ay * half);
          ctx.lineTo(bx * half, by * half);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "rgba(242,217,168,0.9)";
      for (const p of pts) {
        const [sx, sy, s] = project(p);
        const n = Math.max(0, Math.min(1, (s - 0.8) / 0.6));
        const r = Math.max(0.9, 0.9 + 1.1 * n);
        ctx.fillStyle = rgba({ r: 242, g: 217, b: 168, a: 1 }, 0.45 + 0.55 * n);
        ctx.beginPath();
        ctx.arc(sx * half, sy * half, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const loop = () => {
      if (!dragging && Date.now() - lastMove > 1600) {
        yaw += 0.0032;
        pitch = 0.12 + Math.sin(Date.now() / 2600) * 0.02;
        targetYaw = yaw;
        targetPitch = pitch;
      } else {
        yaw += (targetYaw - yaw) * 0.12;
        pitch += (targetPitch - pitch) * 0.12;
      }
      render();
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      targetYaw += dx * 0.009;
      targetPitch = Math.max(-1, Math.min(1, targetPitch + dy * 0.006));
      velocity = dx * 0.009;
      lastMove = Date.now();
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      lastMove = Date.now();
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const onResize = () => {
      const w = wrap.clientWidth;
      canvas.width = w * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${w}px`;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [landmarks, height]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] ${className || ""}`}
    >
      <canvas ref={canvasRef} className="block w-full touch-none" />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-black/45 backdrop-blur-sm border border-[var(--border-primary)]">
        <Box className="w-3 h-3 text-[var(--accent-aurum)]" />
        <span className="text-[0.55rem] font-mono tracking-[0.25em] text-[var(--accent-aurum)] uppercase">
          3D Face Mesh
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-black/45 backdrop-blur-sm border border-[var(--border-primary)]">
        <Rotate3d className="w-3 h-3 text-[var(--accent-mocha)]" />
        <span className="text-[0.5rem] font-mono tracking-widest text-[var(--accent-mocha)] uppercase">
          Drag to rotate
        </span>
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-black/45 backdrop-blur-sm border border-[var(--border-primary)]">
        <Maximize2 className="w-3 h-3 text-[var(--text-muted)]" />
        <span className="text-[0.5rem] font-mono tracking-widest text-[var(--text-muted)] uppercase">
          478 pts
        </span>
      </div>
    </div>
  );
}
