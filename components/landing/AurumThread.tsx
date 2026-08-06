"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const N = 34;
const AURUM = "#B98B56";
const AURUM_LIGHT = "#CCA066";
const CREAM = "#F7E8CF";

type Point = { x: number; y: number };
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  warm: boolean;
};

export function AurumThread() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let scrollY = 0;
    let vel = 0;
    let tension = 0;
    let t = 0;
    let mouseX = 0;
    let lastY = 0;

    const pts: Point[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
    const sparks: Spark[] = [];

    const follow = Array.from({ length: N }, (_, i) =>
      i === 0 ? 0 : 0.5 - (i / N) * 0.42
    );

    const restX = Array.from({ length: N }, (_, i) => {
      const k = i / (N - 1);
      return {
        from: W * 0.78,
        to: W * 0.6,
        s: k,
        wave: Math.sin(k * Math.PI * 1.7) * W * 0.028,
      };
    });

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < N; i++) {
        const k = i / (N - 1);
        pts[i].x = W * 0.78 + (W * 0.6 - W * 0.78) * k + restX[i].wave;
        pts[i].y = H * 0.52 + (H + 60 - H * 0.52) * k;
      }
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
    };

    resize();
    onScroll();
    lastY = scrollY;
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    const drawPath = (toIdx: number, strokeStyle: string, width: number) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < toIdx; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[toIdx].x, pts[toIdx].y);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    };

    const draw = () => {
      t += 0.016;
      const nowVel = scrollY - lastY;
      lastY = scrollY;
      vel = vel * 0.82 + nowVel * 0.18;
      tension = Math.min(1, tension + Math.min(0.5, Math.abs(nowVel) * 0.0016));
      tension *= 0.94;

      const waveAmp = W * (0.028 + tension * 0.08);
      const baseX = W * 0.78;
      const baseY = H * 0.52;
      const tailX = W * 0.6;
      const tailY = H + 80;

      const headTargetX =
        baseX +
        Math.sin(t * 0.7) * W * 0.06 +
        (mouseX - W * 0.5) * 0.04 +
        vel * 2.2;
      const headTargetY = baseY + Math.sin(t * 0.4) * 12;

      pts[0].x += (headTargetX - pts[0].x) * 0.5;
      pts[0].y += (headTargetY - pts[0].y) * 0.5;
      pts[0].x = Math.max(-W * 0.1, Math.min(W * 1.1, pts[0].x));

      for (let i = 1; i < N; i++) {
        const p = pts[i];
        const prev = pts[i - 1];
        const k = i / (N - 1);
        const rest = restX[i].wave * (waveAmp / (W * 0.05));
        const rx = baseX + (tailX - baseX) * k + rest;
        const ry = baseY + (tailY - baseY) * k;
        p.x += (prev.x - p.x) * follow[i] + (rx - p.x) * 0.03;
        p.y += (prev.y - p.y) * follow[i] + (ry - p.y) * 0.03;
      }

      ctx.clearRect(0, 0, W, H);

      drawPath(N - 1, "rgba(201,160,102,0.09)", 7);
      drawPath(Math.floor(N * 0.8), "rgba(201,160,102,0.38)", 2.6);
      drawPath(Math.floor(N * 0.5), "rgba(220,185,135,0.8)", 1.2);

      ctx.save();
      ctx.setLineDash([2, 14]);
      ctx.lineDashOffset = -((scrollY % 16) + t * 6);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < N; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[N - 1].x, pts[N - 1].y);
      ctx.strokeStyle = "rgba(185,139,86,0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      const h = pts[0];
      ctx.beginPath();
      ctx.arc(h.x, h.y, 4.5 + tension * 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220,185,135,0.3)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(h.x, h.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = CREAM;
      ctx.fill();

      if (Math.random() < 0.14 + tension * 0.5) {
        sparks.push({
          x: h.x + (Math.random() - 0.5) * 6,
          y: h.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.8,
          vy: 0.3 + Math.random() * 1.3,
          life: 0,
          max: 34 + Math.random() * 26,
          r: 0.7 + Math.random() * 1.5,
          warm: Math.random() > 0.35,
        });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy *= 0.985;
        s.vx *= 0.985;
        if (s.life >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        const a = 1 - s.life / s.max;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? `rgba(220,185,135,${0.5 * a})` : `rgba(247,232,207,${0.6 * a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 78%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 16%, black 78%, transparent 100%)",
      }}
    />
  );
}
