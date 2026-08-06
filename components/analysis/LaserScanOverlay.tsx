"use client";

import { useEffect, useRef, useMemo } from "react";
import { mapCoverPoint } from "@/lib/image-geometry";

interface LaserScanOverlayProps {
  landmarks?: number[][];
  width: number;
  height: number;
  imageAspect?: number;
  running?: boolean;
  className?: string;
}

interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CORE = "#22d3ee"; // holographic cyan core
const EDGE = "#2dd4bf"; // teal edge

/** Face bounding box in cover-mapped pixels (falls back to full frame). */
function computeFaceBox(
  landmarks: number[][],
  width: number,
  height: number,
  imageAspect?: number
): BBox {
  const map = (u: number, v: number) =>
    mapCoverPoint(u, v, { boxW: width, boxH: height, imageAspect: imageAspect ?? width / height });

  let minX = 0;
  let minY = 0;
  let maxX = width;
  let maxY = height;
  let found = false;

  for (const lm of landmarks) {
    if (!lm) continue;
    const p = map(lm[0], lm[1]);
    if (!found) {
      minX = p.x; minY = p.y; maxX = p.x; maxY = p.y; found = true;
    } else {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  if (!found) return { x: 0, y: 0, w: width, h: height };

  const padX = (maxX - minX) * 0.06;
  const padY = (maxY - minY) * 0.1;
  return {
    x: Math.max(0, minX - padX),
    y: Math.max(0, minY - padY),
    w: Math.min(width - Math.max(0, minX - padX), maxX - minX + padX * 2),
    h: Math.min(height - Math.max(0, minY - padY), maxY - minY + padY * 2),
  };
}

/**
 * Holographic laser-scan VFX. A high-DPI canvas sweeps a glowing beam across
 * the face bounding box with a holographic grid, corner brackets and a trailing
 * afterglow. Pure canvas — no DOM filters — so results stay perfectly crisp.
 */
export function LaserScanOverlay({
  landmarks = [],
  width,
  height,
  imageAspect,
  running = true,
  className,
}: LaserScanOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const box = useMemo(
    () => computeFaceBox(landmarks, width, height, imageAspect),
    [landmarks, width, height, imageAspect]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gridStep = 30;

    const drawGrid = () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.w, box.h);
      ctx.clip();
      ctx.strokeStyle = "rgba(34,211,238,0.16)";
      ctx.lineWidth = 1;
      for (let gx = box.x; gx < box.x + box.w; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, box.y);
        ctx.lineTo(gx, box.y + box.h);
        ctx.stroke();
      }
      for (let gy = box.y; gy < box.y + box.h; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(box.x, gy);
        ctx.lineTo(box.x + box.w, gy);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawBeam = (y: number) => {
      const grad = ctx.createLinearGradient(0, y - 34, 0, y + 10);
      grad.addColorStop(0, "rgba(34,211,238,0)");
      grad.addColorStop(0.55, "rgba(34,211,238,0.28)");
      grad.addColorStop(0.85, "rgba(45,212,191,0.9)");
      grad.addColorStop(1, "rgba(45,212,191,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(box.x, y - 34, box.w, 44);

      ctx.save();
      ctx.shadowColor = CORE;
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#a5f3fc";
      ctx.fillRect(box.x, y - 1, box.w, 2);
      ctx.restore();
    };

    const drawBrackets = () => {
      const s = 22;
      const lw = 2;
      ctx.strokeStyle = `rgba(103,232,249,0.9)`;
      ctx.lineWidth = lw;
      const corners = [
        [box.x, box.y, 1, 1],
        [box.x + box.w, box.y, -1, 1],
        [box.x, box.y + box.h, 1, -1],
        [box.x + box.w, box.y + box.h, -1, -1],
      ] as const;
      for (const [cx, cy, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * dy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + s * dx, cy);
        ctx.stroke();
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawBrackets();

      const progress = (Math.sin(time / 900) + 1) / 2;
      const y = box.y + progress * box.h;
      drawBeam(y);
    };

    if (reduce || !running) {
      draw(1350);
      return;
    }

    const wrap = canvas.parentElement;
    let visible = true;
    let raf = 0;
    const tick = (time: number) => {
      if (!visible) return;
      draw(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const observer =
      wrap && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting;
              if (visible) raf = requestAnimationFrame(tick);
              else cancelAnimationFrame(raf);
            },
            { threshold: 0.05 }
          )
        : null;
    observer?.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [box, width, height, running]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ width, height }} />
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: EDGE }} />
        <span className="text-[0.55rem] font-mono tracking-[0.3em]" style={{ color: CORE }}>
          HOLOGRAPHIC LASER SCAN
        </span>
      </div>
    </div>
  );
}
