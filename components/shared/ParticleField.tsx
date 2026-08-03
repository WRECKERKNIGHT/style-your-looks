"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const PARTICLE_COUNT = 36;
    const CONNECTION_DIST = 120;
    const MOUSE_RADIUS = 150;

    const initParticle = (): Particle => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      life: Math.random() * 100,
    });

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, initParticle);

    let running = true;
    const onVisibility = () => {
      running = document.hidden ? false : true;
      if (running && animRef.current === 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

    const animate = () => {
      animRef.current = 0;
      if (!running) return;

      const W = window.innerWidth;
      const H = window.innerHeight;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, W, H);

      // Batch all connection lines into a single path, then stroke once.
      const linePath = new Path2D();
      const n = particles.length;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < CONNECTION_DIST_SQ) {
            linePath.moveTo(p.x, p.y);
            linePath.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.strokeStyle = "rgba(185, 139, 86, 0.06)";
      ctx.lineWidth = 0.5;
      ctx.stroke(linePath);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.5;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0.01) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx -= (dx / dist) * force * 0.3;
          p.vy -= (dy / dist) * force * 0.3;
        }

        p.vx *= 0.999;
        p.vy *= 0.999;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        p.x = Math.max(0, Math.min(W, p.x));
        p.y = Math.max(0, Math.min(H, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185, 139, 86, ${p.opacity * (0.5 + Math.sin(p.life * 0.02) * 0.5)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      animRef.current = 0;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.6 }}
    />
  );
}
