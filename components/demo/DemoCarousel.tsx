"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  ScanLine,
  Fingerprint,
} from "lucide-react";

export interface DemoSlide {
  photo: string;
  title: string;
  detail: string;
  onRun: () => Promise<void>;
  detect?: (img: HTMLImageElement) => Promise<number[][]>;
  scanMode?: "auto" | "swatch";
}

interface DemoCarouselProps {
  slides: DemoSlide[];
  autoplayMs?: number;
}

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23],
  [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [29, 31], [28, 30], [30, 32], [27, 28],
];

const FACE_MESH = "#cbaa72";
const POSE_COLOR = "#e7c58f";

function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return { dx, dy, dw, dh };
}

export function DemoCarousel({ slides, autoplayMs = 5000 }: DemoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "detecting" | "live">("idle");
  const [swatch, setSwatch] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const cacheRef = useRef(new Map<string, number[][]>());

  const slide = slides[index];
  const photo = slide.photo;
  const detect = slide.detect;
  const isSwatch = slide.scanMode === "swatch";
  const mode = useRef<"mesh" | "skeleton" | "swatch">("mesh");

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const handleRun = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await slide.onRun();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (paused || busy) return;
    const t = setTimeout(next, autoplayMs);
    return () => clearTimeout(t);
  }, [index, paused, busy, next, autoplayMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let image: HTMLImageElement | null = null;
    let landmarks: number[][] = [];
    let started = false;

    setSwatch(null);
    setScanState("detecting");
    mode.current = isSwatch ? "swatch" : "mesh";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      image = img;
      const runDetect = async () => {
        if (detect && !isSwatch) {
          const cached = cacheRef.current.get(photo);
          if (cached) {
            landmarks = cached;
          } else {
            try {
              landmarks = await detect(img);
              if (landmarks.length <= 40) mode.current = "skeleton";
              cacheRef.current.set(photo, landmarks);
            } catch {
              landmarks = [];
            }
          }
        }
        if (!disposed) {
          setScanState("live");
          started = true;
        }
      };
      void runDetect();
    };
    img.src = photo;

    const loop = (t: number) => {
      if (disposed) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = rect.width;
        const h = rect.height;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        if (image) {
          const { dx, dy, dw, dh } = drawContain(ctx, image, w, h);

          if (isSwatch) {
            const sweep = dy + ((t / 14) % 1) * dh;
            const grad = ctx.createLinearGradient(0, sweep - 60, 0, sweep + 60);
            grad.addColorStop(0, "rgba(203,170,114,0)");
            grad.addColorStop(0.5, "rgba(203,170,114,0.35)");
            grad.addColorStop(1, "rgba(203,170,114,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(dx, sweep - 60, dw, 120);

            const sx = dx + dw * 0.5;
            const sy = sweep;
            const patch = 3;
            let r = 0, g = 0, b = 0, n = 0;
            for (let px = -patch; px <= patch; px++) {
              for (let py = -patch; py <= patch; py++) {
                const d = ctx.getImageData(sx + px, sy + py, 1, 1).data;
                r += d[0]; g += d[1]; b += d[2]; n++;
              }
            }
            if (n) {
              const col = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
              setSwatch(col);
            }
          } else {
            const sweep = dy + ((t / 16) % 1) * dh;
            const grad = ctx.createLinearGradient(0, sweep - 70, 0, sweep + 70);
            grad.addColorStop(0, "rgba(231,197,143,0)");
            grad.addColorStop(0.5, "rgba(231,197,143,0.28)");
            grad.addColorStop(1, "rgba(231,197,143,0)");
            ctx.fillStyle = grad;
            ctx.fillRect(dx, sweep - 70, dw, 140);

            if (started && landmarks.length) {
              const pulse = 0.5 + 0.5 * Math.sin(t / 180);
              if (mode.current === "skeleton") {
                ctx.strokeStyle = POSE_COLOR;
                ctx.lineWidth = 1.6;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                for (const [a, bPt] of POSE_CONNECTIONS) {
                  const pa = landmarks[a];
                  const pb = landmarks[bPt];
                  if (!pa || !pb) continue;
                  ctx.moveTo(dx + pa[0] * dw, dy + pa[1] * dh);
                  ctx.lineTo(dx + pb[0] * dw, dy + pb[1] * dh);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.fillStyle = POSE_COLOR;
                for (const p of landmarks) {
                  ctx.beginPath();
                  ctx.arc(dx + p[0] * dw, dy + p[1] * dh, 2.4 + pulse, 0, Math.PI * 2);
                  ctx.fill();
                }
              } else {
                ctx.fillStyle = FACE_MESH;
                for (let i = 0; i < landmarks.length; i += 2) {
                  const p = landmarks[i];
                  ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t / 150 + i * 0.05);
                  ctx.beginPath();
                  ctx.arc(dx + p[0] * dw, dy + p[1] * dh, 1.3 + pulse, 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.globalAlpha = 1;
              }
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      img.src = "";
    };
  }, [index, photo, detect, isSwatch]);

  return (
    <div
      className="mt-4 border border-dashed border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-aurum)_4%,transparent)] p-4 sm:p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-col md:flex-row gap-5">
        {/* preview canvas */}
        <div className="relative w-full md:w-56 shrink-0 aspect-[3/4] md:aspect-[4/5] overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          <span className="absolute top-2 left-2 flex items-center gap-1.5 type-mono text-[0.5rem] tracking-[0.2em] px-2 py-1 bg-black/55 text-[#e7c58f] border border-[color-mix(in_srgb,var(--accent-aurum)_45%,transparent)]">
            <ScanLine className="w-3 h-3" />
            {isSwatch
              ? "LIVE PIXEL SAMPLE"
              : scanState === "detecting"
              ? "DETECTING POINTS…"
              : mode.current === "skeleton"
              ? "LIVE POSE SCAN"
              : "LIVE 478-POINT SCAN"}
          </span>

          {isSwatch && swatch && (
            <span className="absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 bg-black/55 border border-[color-mix(in_srgb,var(--accent-aurum)_45%,transparent)]">
              <span
                className="w-5 h-5 rounded-full border border-white/30"
                style={{ background: swatch }}
              />
              <span className="type-mono text-[0.5rem] text-[#e7c58f] tracking-widest">
                SKIN SAMPLE
              </span>
            </span>
          )}
        </div>

        {/* copy + controls */}
        <div className="flex-1 flex flex-col">
          <span className="type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.25em] uppercase flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            DEMO &middot; REAL-TIME SCAN &middot; NO UPLOAD
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-body text-[var(--text-primary)] mt-2 font-semibold">
                {slide.title}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-body mt-1 leading-relaxed">
                {slide.detail}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={prev}
              aria-label="Previous sample"
              className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-aurum-500/50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.photo}
                  aria-label={`Show sample ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-gradient-to-r from-aurum-500 to-aurum-300"
                      : "w-2 bg-[var(--border-primary)] hover:bg-aurum-500/40"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next sample"
              className="w-8 h-8 border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-aurum-500/50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRun}
              disabled={busy}
              className="btn-nexus !py-2.5 !px-4 text-xs whitespace-nowrap ml-auto"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  RUNNING…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  TRY SAMPLE PHOTO
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
