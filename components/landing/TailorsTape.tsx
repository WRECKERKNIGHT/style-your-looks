"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const SPACING = 42;

export function TailorsTape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const readout = readoutRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let scrollY = 0;
    let progress = 0;

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      progress = Math.min(1, Math.max(0, scrollY / max));
      schedule();
    };

    const draw = () => {
      raf = 0;
      ctx.clearRect(0, 0, W, H);

      const start = Math.floor(scrollY / SPACING);
      const end = Math.ceil((scrollY + H) / SPACING);

      for (let k = start; k <= end; k++) {
        const y = k * SPACING - scrollY;
        if (y < -20 || y > H + 20) continue;
        const major = k % 5 === 0;
        const mid = k % 5 === 2 || k % 5 === 3;
        const len = major ? 34 : mid ? 21 : 13;

        ctx.strokeStyle = major
          ? "rgba(185,139,86,0.9)"
          : "rgba(185,139,86,0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W - len, y);
        ctx.lineTo(W - 2, y);
        ctx.stroke();

        if (major) {
          ctx.fillStyle = "rgba(138,115,88,0.85)";
          ctx.font = "500 9px 'JetBrains Mono', monospace";
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillText(String(Math.round(k / 5)).padStart(2, "0"), W - len - 6, y + 0.5);
        }
      }

      ctx.strokeStyle = "rgba(185,139,86,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W - 38, 0);
      ctx.lineTo(W - 38, H);
      ctx.stroke();

      const ny = H / 2;
      ctx.beginPath();
      ctx.moveTo(0, ny);
      ctx.lineTo(W, ny);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(220,185,135,0.16)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, ny);
      ctx.lineTo(W, ny);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(185,139,86,0.95)";
      ctx.stroke();

      ctx.save();
      ctx.translate(W - 3, ny);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#C8963E";
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, ny, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = "#CCA066";
      ctx.fill();

      if (readout) readout.textContent = `${Math.round(progress * 100)}%`;
    };

    const schedule = () => {
      if (raf !== 0) return;
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (!document.hidden) schedule();
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[30] hidden h-screen w-16 flex-col items-end justify-between py-8 lg:flex">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-60"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      />
      <span className="relative z-10 rotate-180 text-[10px] font-mono font-semibold tracking-[0.35em] text-[var(--text-muted)] [writing-mode:vertical-rl]">
        MEASURED
      </span>
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)]/70 px-2.5 py-2 shadow-[var(--card-shadow)] backdrop-blur">
        <span
          ref={readoutRef}
          className="font-mono text-[11px] font-bold leading-none text-[var(--accent-caramel)]"
        >
          0%
        </span>
        <span className="text-[8px] leading-none tracking-[0.22em] text-[var(--text-muted)]">
          CUT
        </span>
      </div>
    </div>
  );
}
