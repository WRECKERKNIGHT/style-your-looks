"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { hairRegion } from "@/lib/ml/face-landmarks";
import { motion } from "framer-motion";
import { Palette, Download, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface HairColor {
  id: string;
  name: string;
  color: string;
  overlay: string;
}

const HAIR_COLORS: HairColor[] = [
  { id: "natural-black", name: "Natural Black", color: "#1A1A1A", overlay: "rgba(26,26,26,0.45)" },
  { id: "dark-brown", name: "Dark Brown", color: "#3C2415", overlay: "rgba(60,36,21,0.4)" },
  { id: "chocolate", name: "Chocolate", color: "#5C3D2E", overlay: "rgba(92,61,46,0.35)" },
  { id: "auburn", name: "Auburn", color: "#8B3A2A", overlay: "rgba(139,58,42,0.35)" },
  { id: "copper", name: "Copper", color: "#B87333", overlay: "rgba(184,115,51,0.35)" },
  { id: "golden-blonde", name: "Golden Blonde", color: "#D4A547", overlay: "rgba(212,165,71,0.3)" },
  { id: "platinum", name: "Platinum", color: "#E8E0D0", overlay: "rgba(232,224,208,0.4)" },
  { id: "ash-blonde", name: "Ash Blonde", color: "#B8A88A", overlay: "rgba(184,168,138,0.35)" },
  { id: "burgundy", name: "Burgundy", color: "#722F37", overlay: "rgba(114,47,55,0.35)" },
  { id: "deep-red", name: "Deep Red", color: "#8B1A1A", overlay: "rgba(139,26,26,0.35)" },
  { id: "frost-blue", name: "Frost Blue", color: "#4682B4", overlay: "rgba(70,130,180,0.3)" },
  { id: "sage-green", name: "Sage Green", color: "#556B2F", overlay: "rgba(85,107,47,0.3)" },
];

function applyHairColor(ctx: CanvasRenderingContext2D, displayWidth: number, displayHeight: number, color: HairColor, landmarks?: number[][]) {
  ctx.save();
  let topY: number, bottomY: number, leftX: number, rightX: number, centerX: number;
  if (landmarks && landmarks.length > 152) {
    const region = hairRegion(landmarks, displayWidth, displayHeight);
    topY = region.topY; bottomY = region.bottomY; leftX = region.leftX; rightX = region.rightX; centerX = region.centerX;
  } else {
    topY = displayHeight * 0.05; bottomY = displayHeight * 0.32; leftX = displayWidth * 0.15; rightX = displayWidth * 0.85; centerX = displayWidth * 0.5;
  }
  ctx.beginPath();
  ctx.moveTo(leftX, bottomY);
  ctx.quadraticCurveTo(leftX + (centerX - leftX) * 0.4, topY, centerX, topY);
  ctx.quadraticCurveTo(rightX - (rightX - centerX) * 0.4, topY, rightX, bottomY);
  ctx.quadraticCurveTo(rightX - (rightX - centerX) * 0.2, bottomY + (bottomY - topY) * 0.08, centerX, bottomY + (bottomY - topY) * 0.05);
  ctx.quadraticCurveTo(leftX + (centerX - leftX) * 0.2, bottomY + (bottomY - topY) * 0.08, leftX, bottomY);
  ctx.closePath();
  ctx.fillStyle = color.overlay;
  ctx.globalCompositeOperation = "overlay";
  ctx.fill();
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = color.overlay;
  ctx.fill();
  ctx.restore();
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HairPreviewPage() {
  const { uploadedImage, setUploadedImage, faceResult } = useAnalysisStore();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<HairColor | null>(null);
  const [intensity, setIntensity] = useState(0.7);

  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
    setSelectedColor(null);
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
    if (selectedColor) {
      ctx.globalAlpha = intensity;
      applyHairColor(ctx, displayWidth, displayHeight, selectedColor, faceResult?.landmarks);
      ctx.globalAlpha = 1;
    }
  }, [selectedColor, intensity, faceResult]);

  useEffect(() => { renderCanvas(); }, [renderCanvas]);

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `zervey-hair-${selectedColor?.id || "preview"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Hair preview saved", "success");
  };

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // HAIR</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Palette className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            HAIR <span className="text-gradient-aurum">PREVIEW.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          See how different hair colors look on you before committing.
        </p>
      </motion.div>

      {!uploadedImage ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a photo for hair color preview" accept="any" />
        </div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div ref={containerRef} className="glass-card overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full" />
            {selectedColor && (
              <div className="absolute top-3 right-3 glass-card p-3 space-y-2">
                <p className="type-label text-[var(--text-muted)]">INTENSITY</p>
                <input type="range" min={0.2} max={1} step={0.05} value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-24 h-1 accent-[var(--accent-aurum)]" />
                <p className="type-mono text-[var(--text-muted)]">{Math.round(intensity * 100)}%</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="type-label text-[var(--text-primary)] mb-4">SELECT HAIR COLOR</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(selectedColor?.id === color.id ? null : color)}
                  className={`p-3 border text-center transition-all duration-300 ${
                    selectedColor?.id === color.id
                      ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                      : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                  }`}
                >
                  <div className="w-full h-8 mb-2 rounded-full border border-[var(--border-primary)]" style={{ backgroundColor: color.color }} />
                  <p className="text-[0.65rem] font-body text-[var(--text-primary)]">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setSelectedColor(null)} className="btn-outline flex-1 justify-center">
              <Trash2 className="w-4 h-4" />
              REMOVE
            </button>
            <button onClick={downloadResult} disabled={!selectedColor}
              className="btn-nexus flex-1 justify-center disabled:opacity-40">
              <Download className="w-4 h-4" />
              SAVE IMAGE
            </button>
            <Link href="/dashboard/accessories" className="btn-nexus flex-1 justify-center">
              GLASSES <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
