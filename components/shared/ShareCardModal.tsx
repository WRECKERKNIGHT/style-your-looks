"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Loader2 } from "lucide-react";

export interface ShareCardData {
  photo: string | null;
  brand: string;
  brandTag: string;
  title: string;
  subtitle: string;
  overview: { label: string; value: string }[];
  scoreLabel: string;
  score: string;
  scoreSuffix?: string;
  footer: string;
  fileName: string;
  shareText: string;
  demo?: boolean;
}

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  data: ShareCardData | null;
}

const W = 1080;
const H = 1350;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string
) {
  ctx.font = font;
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
  return yy;
}

export function ShareCardModal({ open, onClose, data }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open || !data) return;
    let cancelled = false;

    const render = async () => {
      setRendering(true);
      setPreview(null);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#2A1C15");
      bg.addColorStop(0.5, "#241812");
      bg.addColorStop(1, "#1C110C");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // warm halo
      const halo = ctx.createRadialGradient(W / 2, H * 0.28, 0, W / 2, H * 0.28, H * 0.6);
      halo.addColorStop(0, "rgba(185,139,86,0.16)");
      halo.addColorStop(1, "rgba(185,139,86,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      // grain
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      for (let i = 0; i < 2600; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4);
      }

      // top gold line
      ctx.fillStyle = "#8A5F3D";
      ctx.fillRect(0, 0, W, 8);

      // brand wordmark
      ctx.fillStyle = "#CCA066";
      ctx.font = "600 46px Georgia, 'Times New Roman', serif";
      ctx.fillText(data.brand, 64, 108);
      ctx.fillStyle = "rgba(201,177,140,0.75)";
      ctx.font = "500 20px 'Courier New', monospace";
      ctx.fillText(data.brandTag.toUpperCase(), 64, 142);

      // DEMO chip
      if (data.demo) {
        ctx.fillStyle = "rgba(200,150,62,0.16)";
        roundRect(ctx, 64, 166, 168, 42, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(200,150,62,0.55)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, 64, 166, 168, 42, 8);
        ctx.stroke();
        ctx.fillStyle = "#DCB987";
        ctx.font = "600 18px 'Courier New', monospace";
        ctx.fillText("DEMO SAMPLE", 82, 194);
      }

      // photo
      const photoY = data.demo ? 240 : 200;
      const photoH = 500;
      const photoLoaded = await new Promise<HTMLImageElement | null>((resolve) => {
        if (!data.photo) return resolve(null);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = data.photo;
      });
      if (cancelled) return;

      roundRect(ctx, 64, photoY, W - 128, photoH, 18);
      ctx.save();
      ctx.clip();
      if (photoLoaded) {
        const r = (W - 128) / photoLoaded.width;
        const dw = W - 128;
        const dh = photoLoaded.height * r;
        const dy = photoY + (photoH - dh) / 2;
        ctx.drawImage(photoLoaded, 64, Math.max(photoY, dy), dw, dh);
      } else {
        const ph = ctx.createLinearGradient(0, photoY, 0, photoY + photoH);
        ph.addColorStop(0, "#3A2A22");
        ph.addColorStop(1, "#2A1C15");
        ctx.fillStyle = ph;
        ctx.fillRect(64, photoY, W - 128, photoH);
        ctx.fillStyle = "#573A27";
        ctx.font = "600 40px Georgia, serif";
        ctx.fillText(data.title, 96, photoY + 220);
      }
      // bottom fade on photo
      const fade = ctx.createLinearGradient(0, photoY + photoH - 140, 0, photoY + photoH);
      fade.addColorStop(0, "rgba(36,24,18,0)");
      fade.addColorStop(1, "rgba(36,24,18,0.88)");
      ctx.fillStyle = fade;
      ctx.fillRect(64, photoY + photoH - 140, W - 128, 140);
      ctx.restore();

      // photo caption
      ctx.fillStyle = "#F3EAD9";
      ctx.font = "600 42px Georgia, serif";
      ctx.fillText(data.title, 64, photoY + photoH + 84);
      ctx.fillStyle = "rgba(201,177,140,0.8)";
      ctx.font = "400 22px 'Courier New', monospace";
      ctx.fillText(data.subtitle.toUpperCase(), 64, photoY + photoH + 122);

      // overview rows
      let oy = photoY + photoH + 180;
      ctx.strokeStyle = "rgba(185,139,86,0.25)";
      ctx.lineWidth = 1;
      for (const row of data.overview) {
        ctx.beginPath();
        ctx.moveTo(64, oy);
        ctx.lineTo(W - 64, oy);
        ctx.stroke();
        ctx.fillStyle = "rgba(201,177,140,0.75)";
        ctx.font = "500 22px 'Courier New', monospace";
        ctx.fillText(row.label.toUpperCase(), 64, oy + 62);
        ctx.fillStyle = "#F3EAD9";
        ctx.font = "500 28px Georgia, serif";
        ctx.fillText(row.value, W - 64, oy + 62, W - 128 - 430);
        oy += 96;
      }

      // divider
      const dividerY = oy + 34;
      ctx.strokeStyle = "rgba(185,139,86,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 220, dividerY);
      ctx.lineTo(W / 2 + 220, dividerY);
      ctx.stroke();

      // score
      const scoreY = dividerY + 120;
      ctx.fillStyle = "#CCA066";
      ctx.font = "700 130px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(data.score, W / 2, scoreY);
      if (data.scoreSuffix) {
        ctx.fillStyle = "rgba(201,177,140,0.75)";
        ctx.font = "500 28px 'Courier New', monospace";
        ctx.fillText(data.scoreSuffix, W / 2, scoreY + 44);
      }
      ctx.fillStyle = "#F3EAD9";
      ctx.font = "600 26px 'Courier New', monospace";
      ctx.fillText(data.scoreLabel.toUpperCase(), W / 2, scoreY + 96);
      ctx.textAlign = "left";

      // footer
      ctx.fillStyle = "rgba(201,177,140,0.6)";
      ctx.font = "500 20px 'Courier New', monospace";
      ctx.fillText(data.footer, 64, H - 56);

      if (!cancelled) {
        setPreview(canvas.toDataURL("image/png"));
      }
      setRendering(false);
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [open, data]);

  const download = async () => {
    if (!preview) return;
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.download = data?.fileName || "zervey-result.png";
      link.href = preview;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const share = async () => {
    if (!preview || !data) return;
    try {
      const blob = await (await fetch(preview)).blob();
      const file = new File([blob], data.fileName, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "My ZERVEY result", text: data.shareText, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "My ZERVEY result", text: data.shareText });
      } else {
        await navigator.clipboard.writeText(data.shareText);
      }
    } catch {
      /* user cancelled share — ignore */
    }
  };

  return (
    <AnimatePresence>
      {open && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md glass-card overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border-primary)]/60">
              <div>
                <span className="section-number">SHAREABLE CARD</span>
                <h2 className="type-subhead text-[var(--text-primary)] mt-1">YOUR RESULT CARD</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close share card"
                className="w-9 h-9 rounded-sm border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-aurum-500/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col items-center gap-4" data-lenis-prevent>
              <canvas ref={canvasRef} className="hidden" />
              <div className="relative w-full max-w-[300px] aspect-[4/5] overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Result card preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-[var(--accent-aurum)] animate-spin" />
                    <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest uppercase">
                      RENDERING CARD
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button onClick={download} disabled={!preview || downloading} className="btn-nexus flex-1 !py-3 text-xs">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  DOWNLOAD PNG
                </button>
                <button onClick={share} disabled={!preview} className="btn-outline flex-1 !py-3 text-xs">
                  <Share2 className="w-4 h-4" />
                  SHARE
                </button>
              </div>

              <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest uppercase text-center">
                PHOTO + OVERVIEW + SCORE &middot; READY FOR INSTAGRAM
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
