"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Palette, Download, Trash2, ArrowRight } from "lucide-react";

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

function applyHairColor(
  ctx: CanvasRenderingContext2D,
  displayWidth: number,
  displayHeight: number,
  color: HairColor
) {
  ctx.save();

  const topY = displayHeight * 0.05;
  const bottomY = displayHeight * 0.32;
  const leftX = displayWidth * 0.15;
  const rightX = displayWidth * 0.85;

  ctx.beginPath();
  ctx.moveTo(leftX, bottomY);
  ctx.quadraticCurveTo(displayWidth * 0.2, topY, displayWidth * 0.5, topY);
  ctx.quadraticCurveTo(displayWidth * 0.8, topY, rightX, bottomY);
  ctx.quadraticCurveTo(displayWidth * 0.7, bottomY + displayHeight * 0.05, displayWidth * 0.5, bottomY + displayHeight * 0.03);
  ctx.quadraticCurveTo(displayWidth * 0.3, bottomY + displayHeight * 0.05, leftX, bottomY);
  ctx.closePath();

  ctx.fillStyle = color.overlay;
  ctx.globalCompositeOperation = "overlay";
  ctx.fill();

  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = color.overlay;
  ctx.fill();

  ctx.restore();
}

export default function HairPreviewPage() {
  const { uploadedImage, setUploadedImage } = useAnalysisStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<HairColor | null>(null);
  const [intensity, setIntensity] = useState(0.7);

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setUploadedImage(imageData);
      setSelectedColor(null);
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = imageData;
    },
    [setUploadedImage]
  );

  useEffect(() => {
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => { imgRef.current = img; };
      img.src = uploadedImage;
    }
  }, [uploadedImage]);

  useEffect(() => {
    renderCanvas();
  }, [selectedColor, intensity]);

  function renderCanvas() {
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
      applyHairColor(ctx, displayWidth, displayHeight, selectedColor);
      ctx.globalAlpha = 1;
    }
  }

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `aurastyle-hair-${selectedColor?.id || "preview"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // HAIR</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Palette className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            HAIR <span className="text-gradient-gold">PREVIEW.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl">
          See how different hair colors look on you before committing.
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader
          onImageUpload={handleImageUpload}
          label="Upload a photo for hair color preview"
          accept="any"
        />
      ) : (
        <div className="space-y-8">
          <div ref={containerRef} className="bg-cream border border-tan overflow-hidden relative rounded-sm">
            <canvas ref={canvasRef} className="w-full" />

            {selectedColor && (
              <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm border border-tan rounded-sm p-3 space-y-2">
                <p className="text-[0.6rem] font-mono text-coffee tracking-widest">INTENSITY</p>
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.05}
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-24 h-1 accent-amber"
                />
                <p className="text-[0.55rem] font-mono text-coffee">{Math.round(intensity * 100)}%</p>
              </div>
            )}
          </div>

          <div className="bg-cream border border-tan p-6 vintage-border rounded-sm">
            <h3 className="text-sm font-display font-bold text-espresso tracking-widest mb-4">SELECT HAIR COLOR</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(selectedColor?.id === color.id ? null : color)}
                  className={`p-3 border text-center transition-all rounded-sm ${
                    selectedColor?.id === color.id
                      ? "border-amber bg-amber/10 shadow-gold"
                      : "border-tan hover:border-amber/40 bg-parchment card-hover"
                  }`}
                >
                  <div
                    className="w-full h-8 mb-2 rounded-full border border-tan"
                    style={{ backgroundColor: color.color }}
                  />
                  <p className="text-[0.65rem] font-body text-espresso">{color.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedColor(null)}
              className="flex-1 py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-tan rounded-sm"
            >
              <Trash2 className="w-4 h-4" />
              REMOVE
            </button>
            <button
              onClick={downloadResult}
              disabled={!selectedColor}
              className="flex-1 py-4 bg-olive text-cream font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-sm shadow-elegant disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              SAVE IMAGE
            </button>
            <Link
              href="/dashboard/accessories"
              className="flex-1 py-4 bg-amber text-cream font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-sm shadow-gold"
            >
              GLASSES <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
