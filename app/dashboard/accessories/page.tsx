"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { glassesPosition } from "@/lib/ml/face-landmarks";
import { motion } from "framer-motion";
import { Glasses, ArrowRight, Download, Trash2 } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface GlassesStyle {
  id: string;
  name: string;
  shape: "aviator" | "wayfarer" | "round" | "rectangle" | "cat-eye" | "browline";
  color: string;
  lensColor: string;
}

const GLASSES_STYLES: GlassesStyle[] = [
  { id: "av-1", name: "Classic Aviator", shape: "aviator", color: "#C0C0C0", lensColor: "rgba(0,0,0,0.3)" },
  { id: "av-2", name: "Gold Aviator", shape: "aviator", color: "#DAA520", lensColor: "rgba(139,69,19,0.2)" },
  { id: "wf-1", name: "Black Wayfarer", shape: "wayfarer", color: "#1A1A1A", lensColor: "rgba(0,0,0,0.25)" },
  { id: "wf-2", name: "Tortoise Wayfarer", shape: "wayfarer", color: "#8B4513", lensColor: "rgba(139,69,19,0.15)" },
  { id: "rn-1", name: "Round Wire", shape: "round", color: "#C0C0C0", lensColor: "rgba(0,0,0,0.1)" },
  { id: "rn-2", name: "Round Black", shape: "round", color: "#2D2D2D", lensColor: "rgba(0,0,0,0.2)" },
  { id: "rc-1", name: "Slim Rectangle", shape: "rectangle", color: "#4A4A4A", lensColor: "rgba(0,0,0,0.2)" },
  { id: "ce-1", name: "Cat Eye Gold", shape: "cat-eye", color: "#DAA520", lensColor: "rgba(139,69,19,0.15)" },
  { id: "br-1", name: "Browline Classic", shape: "browline", color: "#1A1A1A", lensColor: "rgba(0,0,0,0.25)" },
  { id: "br-2", name: "Browline Navy", shape: "browline", color: "#1B2838", lensColor: "rgba(27,40,56,0.2)" },
];

function drawGlasses(ctx: CanvasRenderingContext2D, style: GlassesStyle, centerX: number, eyeY: number, eyeWidth: number) {
  const lensW = eyeWidth * 0.65;
  const lensH = lensW * 0.55;
  const bridge = lensW * 0.15;
  ctx.save();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = style.lensColor;
  const leftX = centerX - bridge / 2 - lensW;
  const rightX = centerX + bridge / 2;

  if (style.shape === "aviator") {
    [leftX, rightX].forEach((x) => { ctx.beginPath(); ctx.ellipse(x + lensW / 2, eyeY, lensW / 2, lensH / 1.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  } else if (style.shape === "wayfarer") {
    [leftX, rightX].forEach((x) => { ctx.beginPath(); ctx.roundRect(x, eyeY - lensH / 2, lensW, lensH, 4); ctx.fill(); ctx.stroke(); });
  } else if (style.shape === "round") {
    [leftX, rightX].forEach((x) => { ctx.beginPath(); ctx.arc(x + lensW / 2, eyeY, lensW / 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  } else if (style.shape === "rectangle") {
    [leftX, rightX].forEach((x) => { ctx.beginPath(); ctx.roundRect(x, eyeY - lensH / 2.5, lensW, lensH / 1.3, 3); ctx.fill(); ctx.stroke(); });
  } else if (style.shape === "cat-eye") {
    [leftX, rightX].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, eyeY + lensH / 3); ctx.quadraticCurveTo(x + lensW / 2, eyeY - lensH / 1.5, x + lensW, eyeY - lensH / 3); ctx.quadraticCurveTo(x + lensW, eyeY + lensH / 2, x, eyeY + lensH / 3); ctx.fill(); ctx.stroke(); });
  } else if (style.shape === "browline") {
    [leftX, rightX].forEach((x) => { ctx.fillStyle = style.color; ctx.beginPath(); ctx.roundRect(x, eyeY - lensH / 2, lensW, lensH * 0.3, [3, 3, 0, 0]); ctx.fill(); ctx.fillStyle = style.lensColor; ctx.beginPath(); ctx.roundRect(x + 1, eyeY - lensH / 2 + lensH * 0.3, lensW - 2, lensH * 0.7, [0, 0, 4, 4]); ctx.fill(); ctx.strokeStyle = style.color; ctx.lineWidth = 1.5; ctx.stroke(); });
  }

  ctx.strokeStyle = style.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(leftX + lensW, eyeY); ctx.lineTo(rightX, eyeY); ctx.stroke();
  const templeLen = eyeWidth * 0.8;
  ctx.beginPath(); ctx.moveTo(leftX, eyeY); ctx.lineTo(leftX - templeLen, eyeY - 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rightX + lensW, eyeY); ctx.lineTo(rightX + lensW + templeLen, eyeY - 8); ctx.stroke();
  ctx.restore();
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function AccessoriesPage() {
  const { uploadedImage, setUploadedImage, faceResult } = useAnalysisStore();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedGlasses, setSelectedGlasses] = useState<GlassesStyle | null>(null);
  const [glassesY, setGlassesY] = useState(0);
  const [glassesScale, setGlassesScale] = useState(1);

  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
    setSelectedGlasses(null);
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = imageData;
  }, [setUploadedImage]);

  useEffect(() => {
    if (uploadedImage) { const img = new Image(); img.onload = () => { imgRef.current = img; }; img.src = uploadedImage; }
  }, [uploadedImage]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;
    const displayWidth = container.clientWidth;
    const displayHeight = Math.min(displayWidth * (img.height / img.width), 560);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    if (selectedGlasses) {
      let centerX: number, eyeY: number, eyeWidth: number;
      if (faceResult && faceResult.landmarks.length > 362) {
        const pos = glassesPosition(faceResult.landmarks, displayWidth, displayHeight);
        centerX = pos.centerX; eyeY = pos.eyeY + glassesY; eyeWidth = pos.totalWidth * glassesScale;
      } else {
        centerX = displayWidth * 0.5; eyeY = displayHeight * 0.36 + glassesY; eyeWidth = displayWidth * 0.35 * glassesScale;
      }
      drawGlasses(ctx, selectedGlasses, centerX, eyeY, eyeWidth);
    }
  }, [selectedGlasses, glassesY, glassesScale, faceResult]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "nexari-glasses.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Glasses preview saved", "success");
  };

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // ACCESSORIES</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Glasses className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            VIRTUAL <span className="text-gradient-aurum">GLASSES.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Try on different glasses frames to find your perfect match.
        </p>
      </motion.div>

      {!uploadedImage ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a photo for glasses try-on" accept="any" />
        </div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div ref={containerRef} className="glass-card overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full" />

            {selectedGlasses && (
              <div className="absolute top-3 right-3 glass-card p-3 space-y-2">
                <p className="type-label text-[var(--text-muted)]">ADJUST</p>
                <div>
                  <label className="type-mono text-[var(--text-muted)]">VERTICAL</label>
                  <input type="range" min={-30} max={30} value={glassesY}
                    onChange={(e) => setGlassesY(parseInt(e.target.value))}
                    className="w-full h-1 accent-[var(--accent-aurum)]" />
                </div>
                <div>
                  <label className="type-mono text-[var(--text-muted)]">SIZE</label>
                  <input type="range" min={0.7} max={1.3} step={0.05} value={glassesScale}
                    onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                    className="w-full h-1 accent-[var(--accent-aurum)]" />
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">SELECT FRAMES</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {GLASSES_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedGlasses(selectedGlasses?.id === style.id ? null : style)}
                  className={`p-3 border text-left transition-all duration-300 ${
                    selectedGlasses?.id === style.id
                      ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                      : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                  }`}
                >
                  <div className="w-full h-8 mb-2" style={{ background: `linear-gradient(135deg, ${style.color} 0%, ${style.lensColor.replace(/[\d.]+\)/, "0.6)")}) 100%)`, border: `2px solid ${style.color}` }} />
                  <p className="text-xs font-body text-[var(--text-primary)] truncate">{style.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setSelectedGlasses(null)} className="btn-outline flex-1 justify-center">
              <Trash2 className="w-4 h-4" />
              REMOVE
            </button>
            <button onClick={downloadResult} disabled={!selectedGlasses}
              className="btn-nexus flex-1 justify-center disabled:opacity-40">
              <Download className="w-4 h-4" />
              SAVE IMAGE
            </button>
            <Link href="/dashboard/hair-preview" className="btn-nexus flex-1 justify-center">
              HAIR PREVIEW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
