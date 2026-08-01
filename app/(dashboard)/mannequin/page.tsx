"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Shirt, Undo2, Redo2, Download, ArrowRight, RotateCcw } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

type MannequinPose = "front" | "three-quarter" | "side";
type BodyType = "hourglass" | "rectangle" | "triangle" | "inverted-triangle" | "oval";
type GarmentType = "top" | "bottom" | "dress" | "outerwear";

interface Garment {
  id: string;
  type: GarmentType;
  name: string;
  color: string;
  pattern: "solid" | "stripe" | "check" | "floral";
}

const GARMENTS: Garment[] = [
  { id: "g1", type: "top", name: "Classic White Tee", color: "#F5F0EB", pattern: "solid" },
  { id: "g2", type: "top", name: "Black Turtleneck", color: "#2D2D2D", pattern: "solid" },
  { id: "g3", type: "top", name: "Navy Blazer", color: "#1B2838", pattern: "solid" },
  { id: "g4", type: "top", name: "Striped Crew", color: "#4A6FA5", pattern: "stripe" },
  { id: "g5", type: "bottom", name: "Slim Jeans", color: "#3B5998", pattern: "solid" },
  { id: "g6", type: "bottom", name: "Beige Trousers", color: "#D4C5A9", pattern: "solid" },
  { id: "g7", type: "bottom", name: "Black Skirt", color: "#1A1A1A", pattern: "solid" },
  { id: "g8", type: "dress", name: "Little Black Dress", color: "#1A1A1A", pattern: "solid" },
  { id: "g9", type: "dress", name: "Floral Midi", color: "#E8738A", pattern: "floral" },
  { id: "g10", type: "outerwear", name: "Trench Coat", color: "#C4A97D", pattern: "solid" },
  { id: "g11", type: "outerwear", name: "Leather Jacket", color: "#3C3C3C", pattern: "solid" },
];

function drawMannequin(ctx: CanvasRenderingContext2D, w: number, h: number, pose: MannequinPose, body: BodyType, garments: Garment[]) {
  ctx.save();
  const cx = w / 2;
  const scale = Math.min(w, h) / 500;
  ctx.translate(cx, h * 0.05);
  ctx.scale(scale, scale);

  const shoulders = pose === "side" ? 60 : 90;
  const waist = body === "hourglass" ? 50 : body === "rectangle" ? 65 : body === "inverted-triangle" ? 55 : body === "oval" ? 75 : 55;
  const hips = body === "triangle" ? 95 : body === "hourglass" ? 85 : 75;
  const height = 400;
  const cp = pose === "three-quarter" ? 0.85 : 1;

  function drawBody() {
    ctx.strokeStyle = "rgba(108,43,217,0.25)";
    ctx.lineWidth = 1.5;
    ctx.fillStyle = "rgba(255,255,255,0.06)";

    ctx.beginPath();
    ctx.moveTo(-shoulders * cp, 20);
    ctx.quadraticCurveTo(-shoulders * cp, 40, -waist * cp, 120);
    ctx.quadraticCurveTo(-hips * cp, 180, -hips * cp * 0.95, 280);
    ctx.lineTo(-hips * cp * 0.7, 350);
    ctx.lineTo(hips * cp * 0.7, 350);
    ctx.lineTo(hips * cp * 0.95, 280);
    ctx.quadraticCurveTo(hips * cp, 180, waist * cp, 120);
    ctx.quadraticCurveTo(shoulders * cp, 40, shoulders * cp, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 5, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function drawGarmentOnBody(g: Garment, index: number) {
    ctx.save();
    const baseY = 20 + index * 8;

    if (g.type === "top" || g.type === "outerwear") {
      const isOuter = g.type === "outerwear";
      const w2 = (isOuter ? shoulders + 8 : shoulders) * cp;
      const wMid = waist * cp;
      const endY = 160;
      ctx.beginPath();
      ctx.moveTo(-w2, baseY);
      ctx.quadraticCurveTo(-w2, 60, -wMid, endY);
      ctx.lineTo(wMid, endY);
      ctx.quadraticCurveTo(w2, 60, w2, baseY);
      ctx.closePath();

      if (g.pattern === "stripe") {
        const grad = ctx.createLinearGradient(0, baseY, 0, endY);
        grad.addColorStop(0, g.color); grad.addColorStop(0.5, adjustColor(g.color, -20)); grad.addColorStop(1, g.color);
        ctx.fillStyle = grad;
      } else if (g.pattern === "check") {
        ctx.fillStyle = g.color;
        ctx.fill();
        ctx.strokeStyle = adjustColor(g.color, -30);
        ctx.lineWidth = 1;
        for (let y = baseY; y < endY; y += 12) { ctx.beginPath(); ctx.moveTo(-w2, y); ctx.lineTo(w2, y); ctx.stroke(); }
        for (let x = -w2; x < w2; x += 18) { ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, endY); ctx.stroke(); }
      } else {
        ctx.fillStyle = g.color;
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    if (g.type === "bottom" || g.type === "dress") {
      const isDress = g.type === "dress";
      const topY = isDress ? 100 : 150;
      const wTop = isDress ? waist * cp : hips * cp * 0.8;
      const wBot = isDress ? hips * cp * 0.95 : hips * cp * 0.85;
      const endY = isDress ? 290 : 280;

      ctx.beginPath();
      ctx.moveTo(-wTop, topY);
      ctx.quadraticCurveTo(-wBot * 0.9, 200, -wBot, endY);
      ctx.lineTo(wBot, endY);
      ctx.quadraticCurveTo(wBot * 0.9, 200, wTop, topY);
      ctx.closePath();
      ctx.fillStyle = g.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBody();
  garments.forEach((g, i) => drawGarmentOnBody(g, i));
  ctx.restore();
}

function adjustColor(hex: string, amt: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function MannequinPage() {
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pose, setPose] = useState<MannequinPose>("front");
  const [bodyType, setBodyType] = useState<BodyType>("hourglass");
  const [garments, setGarments] = useState<Garment[]>([]);
  const [undoStack, setUndoStack] = useState<Garment[][]>([]);
  const [redoStack, setRedoStack] = useState<Garment[][]>([]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = Math.min(w * 1.1, 600);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawMannequin(ctx, w, h, pose, bodyType, garments);
  }, [pose, bodyType, garments]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  const addGarment = useCallback((g: Garment) => {
    setUndoStack(prev => [...prev, garments]);
    setRedoStack([]);
    setGarments(prev => [...prev, g]);
  }, [garments]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(prev => [...prev, garments]);
    setGarments(prev);
  }, [undoStack, garments]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, garments]);
    setGarments(next);
  }, [redoStack, garments]);

  const reset = useCallback(() => {
    setUndoStack(prev => [...prev, garments]);
    setRedoStack([]);
    setGarments([]);
  }, [garments]);

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "nexari-mannequin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Mannequin saved", "success");
  };

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // MANNEQUIN</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Shirt className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            DIGITAL <span className="text-gradient-aurum">MANNEQUIN.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Build outfits on a virtual model.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <canvas ref={canvasRef} className="w-full" />
            <div className="flex items-center justify-center gap-3 p-4 border-t border-[var(--border-primary)]">
              {(["front", "three-quarter", "side"] as MannequinPose[]).map(p => (
                <button key={p} onClick={() => setPose(p)}
                  className={`px-3 py-1 text-xs border transition-all ${
                    pose === p ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]" : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40"
                  }`}>{p.replace("-", " ").toUpperCase()}</button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 p-4 border-t border-[var(--border-primary)] flex-wrap">
              {(["hourglass", "rectangle", "triangle", "inverted-triangle", "oval"] as BodyType[]).map(bt => (
                <button key={bt} onClick={() => setBodyType(bt)}
                  className={`px-3 py-1 text-xs border transition-all ${
                    bodyType === bt ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]" : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--accent-aurum)]/40"
                  }`}>{bt.replace("-", " ").toUpperCase()}</button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="type-label text-[var(--text-primary)]">LAYERS</h3>
              <div className="flex gap-1">
                <button onClick={undo} disabled={undoStack.length === 0}
                  className="p-1.5 border border-[var(--border-primary)] disabled:opacity-30"><Undo2 className="w-3.5 h-3.5" /></button>
                <button onClick={redo} disabled={redoStack.length === 0}
                  className="p-1.5 border border-[var(--border-primary)] disabled:opacity-30"><Redo2 className="w-3.5 h-3.5" /></button>
                <button onClick={reset} disabled={garments.length === 0}
                  className="p-1.5 border border-[var(--border-primary)] disabled:opacity-30"><RotateCcw className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {garments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">No garments added</p>
              ) : (
                garments.map((g, i) => (
                  <div key={`${g.id}-${i}`} className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                    <div className="w-3 h-3 rounded" style={{ background: g.color }} />
                    <span>{g.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="type-label text-[var(--text-primary)] mb-3">GARMENTS</h3>
            {(["top", "bottom", "dress", "outerwear"] as GarmentType[]).map(type => (
              <details key={type} className="mb-2">
                <summary className="type-mono text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent-aurum)]">{type.toUpperCase()}</summary>
                <div className="mt-1 space-y-1 pl-2">
                  {GARMENTS.filter(g => g.type === type).map(g => (
                    <button key={g.id} onClick={() => addGarment(g)}
                      className="w-full text-left text-xs text-[var(--text-primary)] p-1.5 border border-[var(--border-primary)] hover:border-[var(--accent-aurum)]/40 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: g.color }} />
                      {g.name}
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <button onClick={downloadResult} className="btn-nexus w-full justify-center">
            <Download className="w-4 h-4" /> SAVE IMAGE
          </button>
          <Link href="/dashboard/recommendations" className="btn-outline w-full justify-center">
            RECOMMENDATIONS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
