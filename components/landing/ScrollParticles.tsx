"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#B98B56", "#CCA066", "#D4A373"];

interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  seed: number;
  burstDist: number;
  baseOpacity: number;
  color: string;
  jitter: number;
  targetXFrac: number;
  targetYFrac: number;
}

/**
 * ScrollParticles — Particle Disintegration & Reconstruction Engine.
 *
 * As the hero section scrolls out, a cloud of warm particles bursts outward
 * (gravity + turbulence) and then converges back into the following section,
 * snapping into a new formation. Pure Canvas 2D, no GPU/WebGL required.
 */
export function ScrollParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);
  const progressRef = useRef(0);
  const heroElRef = useRef<HTMLElement | null>(null);
  const featuresElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const heroEl = document.getElementById("hero-landing");
    const featuresEl = document.getElementById("features");
    if (!heroEl || !featuresEl) return;
    heroElRef.current = heroEl;
    featuresElRef.current = featuresEl;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const seedParticles = () => {
      const heroRect = heroEl.getBoundingClientRect();
      const cols = Math.max(8, Math.min(24, Math.floor(W / 46)));
      const rows = Math.max(4, Math.min(12, Math.floor(H / 80)));
      const parts: Particle[] = [];
      const density = W < 768 ? 0.55 : 0.4;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() > density) continue;
          const xFrac = (i + 0.5) / cols;
          const yFrac = (j + 0.5) / rows;
          parts.push({
            homeX:
              heroRect.left + xFrac * heroRect.width + (Math.random() - 0.5) * 30,
            homeY:
              heroRect.top + yFrac * heroRect.height + (Math.random() - 0.5) * 30,
            x: 0,
            y: 0,
            size: Math.random() * 1.6 + 0.8,
            delay: Math.random() * 0.3,
            seed: Math.random(),
            burstDist: 110 + Math.random() * 160,
            baseOpacity: Math.random() * 0.35 + 0.25,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            jitter: Math.random() * 0.4,
            targetXFrac: xFrac,
            targetYFrac: yFrac,
          });
        }
      }
      particlesRef.current = parts;
    };
    seedParticles();

    const onResize = () => {
      resize();
      seedParticles();
    };
    window.addEventListener("resize", onResize);

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const onScroll = () => {
      const hr = heroEl.getBoundingClientRect();
      progressRef.current = clamp01((H - hr.bottom) / H);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let running = true;
    const onVisibility = () => {
      running = !document.hidden;
      if (running && animRef.current === 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const animate = () => {
      animRef.current = 0;
      if (!running) return;
      const t = performance.now() / 1000;
      const progress = progressRef.current;
      const parts = particlesRef.current;
      const featuresEl = featuresElRef.current;
      const n = parts.length;

      ctx.clearRect(0, 0, W, H);

      let fr: DOMRect | null = null;
      if (featuresEl) fr = featuresEl.getBoundingClientRect();
      const targetDepth = fr
        ? Math.max(200, Math.min(560, fr.height - 260))
        : 400;
      const targetTop = fr ? fr.top + 200 : H * 0.5;

      const px = new Float32Array(n);
      const py = new Float32Array(n);

      for (let i = 0; i < n; i++) {
        const p = parts[i];
        const local = clamp01((progress - p.delay) / (1 - p.delay));

        if (local <= 0) {
          px[i] = p.homeX + Math.sin(t * 1.4 + p.jitter * 10) * 2;
          py[i] = p.homeY + Math.cos(t * 1.1 + p.jitter * 8) * 2;
          continue;
        }

        const angle = p.seed * Math.PI * 2;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle) * 0.65 + 0.45;

        const burstPhase = clamp01(local / 0.6);
        const burstRadius = ease(burstPhase) * p.burstDist;
        const bx = p.homeX + dirX * burstRadius;
        const by = p.homeY + dirY * burstRadius;

        const convergePhase = clamp01((local - 0.55) / 0.45);
        let tx = bx;
        let ty = by;
        if (fr) {
          tx = fr.left + 40 + p.targetXFrac * (fr.width - 80);
          ty = targetTop + p.targetYFrac * targetDepth;
        }

        const c = ease(convergePhase);
        px[i] = bx + (tx - bx) * c;
        py[i] = by + (ty - by) * c;
      }

      // connection lines — draw a swarm feel during convergence
      const linePath = new Path2D();
      const CONNECT = 90;
      const CONNECT_SQ = CONNECT * CONNECT;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = px[i] - px[j];
          const dy = py[i] - py[j];
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_SQ) {
            linePath.moveTo(px[i], py[i]);
            linePath.lineTo(px[j], py[j]);
          }
        }
      }
      ctx.strokeStyle = "rgba(185, 139, 86, 0.07)";
      ctx.lineWidth = 0.5;
      ctx.stroke(linePath);

      const globalFade = 1 - clamp01((progress - 0.9) / 0.1);

      for (let i = 0; i < n; i++) {
        const p = parts[i];
        const local = clamp01((progress - p.delay) / (1 - p.delay));

        let opacity: number;
        if (local <= 0) {
          opacity = p.baseOpacity * 0.55;
        } else if (local < 0.6) {
          opacity = p.baseOpacity * (0.85 - 0.6 * (local / 0.6));
        } else {
          const c = ease(clamp01((local - 0.6) / 0.4));
          opacity = p.baseOpacity * (0.25 + 0.5 * c);
        }
        opacity *= globalFade;

        const s = p.size * (1 + 0.35 * Math.sin(t * 2 + p.jitter * 7));
        ctx.beginPath();
        ctx.arc(px[i], py[i], s, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      animRef.current = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{ opacity: 0.75 }}
    />
  );
}
