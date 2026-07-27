"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { Glasses, ArrowRight, Download, Trash2 } from "lucide-react";

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

function drawGlasses(
  ctx: CanvasRenderingContext2D,
  style: GlassesStyle,
  centerX: number,
  eyeY: number,
  eyeWidth: number
) {
  const lensW = eyeWidth * 0.65;
  const lensH = lensW * 0.55;
  const bridge = lensW * 0.15;
  const templeW = lensW * 0.12;

  ctx.save();
  ctx.strokeStyle = style.color;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = style.lensColor;

  const leftX = centerX - bridge / 2 - lensW;
  const rightX = centerX + bridge / 2;

  if (style.shape === "aviator") {
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.ellipse(x + lensW / 2, eyeY, lensW / 2, lensH / 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (style.shape === "wayfarer") {
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.roundRect(x, eyeY - lensH / 2, lensW, lensH, 4);
      ctx.fill();
      ctx.stroke();
    });
  } else if (style.shape === "round") {
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x + lensW / 2, eyeY, lensW / 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (style.shape === "rectangle") {
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.roundRect(x, eyeY - lensH / 2.5, lensW, lensH / 1.3, 3);
      ctx.fill();
      ctx.stroke();
    });
  } else if (style.shape === "cat-eye") {
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, eyeY + lensH / 3);
      ctx.quadraticCurveTo(x + lensW / 2, eyeY - lensH / 1.5, x + lensW, eyeY - lensH / 3);
      ctx.quadraticCurveTo(x + lensW, eyeY + lensH / 2, x, eyeY + lensH / 3);
      ctx.fill();
      ctx.stroke();
    });
  } else if (style.shape === "browline") {
    [leftX, rightX].forEach((x) => {
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.roundRect(x, eyeY - lensH / 2, lensW, lensH * 0.3, [3, 3, 0, 0]);
      ctx.fill();
      ctx.fillStyle = style.lensColor;
      ctx.beginPath();
      ctx.roundRect(x + 1, eyeY - lensH / 2 + lensH * 0.3, lensW - 2, lensH * 0.7, [0, 0, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = style.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  ctx.strokeStyle = style.color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(leftX + lensW, eyeY);
  ctx.lineTo(rightX, eyeY);
  ctx.stroke();

  const templeLen = eyeWidth * 0.8;
  ctx.beginPath();
  ctx.moveTo(leftX, eyeY);
  ctx.lineTo(leftX - templeLen, eyeY - 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightX + lensW, eyeY);
  ctx.lineTo(rightX + lensW + templeLen, eyeY - 8);
  ctx.stroke();

  ctx.restore();
}

export default function AccessoriesPage() {
  const { uploadedImage, setUploadedImage } = useAnalysisStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedGlasses, setSelectedGlasses] = useState<GlassesStyle | null>(null);
  const [glassesY, setGlassesY] = useState(0);
  const [glassesScale, setGlassesScale] = useState(1);

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setUploadedImage(imageData);
      setSelectedGlasses(null);
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
  }, [selectedGlasses, glassesY, glassesScale]);

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

    if (selectedGlasses) {
      const centerX = displayWidth * 0.5;
      const eyeY = displayHeight * 0.36 + glassesY;
      const eyeWidth = displayWidth * 0.35 * glassesScale;

      drawGlasses(ctx, selectedGlasses, centerX, eyeY, eyeWidth);
    }
  }

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "aurastyle-glasses.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // ACCESSORIES</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Glasses className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            VIRTUAL <span className="text-gradient-gold">GLASSES.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl">
          Try on different glasses frames to find your perfect match.
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader
          onImageUpload={handleImageUpload}
          label="Upload a photo for glasses try-on"
          accept="any"
        />
      ) : (
        <div className="space-y-8">
          <div ref={containerRef} className="bg-cream border border-tan overflow-hidden relative rounded-sm">
            <canvas ref={canvasRef} className="w-full" />

            {selectedGlasses && (
              <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm border border-tan rounded-sm p-3 space-y-2">
                <p className="text-[0.6rem] font-mono text-coffee tracking-widest">ADJUST</p>
                <div>
                  <label className="text-[0.55rem] font-mono text-coffee">VERTICAL</label>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    value={glassesY}
                    onChange={(e) => setGlassesY(parseInt(e.target.value))}
                    className="w-full h-1 accent-amber"
                  />
                </div>
                <div>
                  <label className="text-[0.55rem] font-mono text-coffee">SIZE</label>
                  <input
                    type="range"
                    min={0.7}
                    max={1.3}
                    step={0.05}
                    value={glassesScale}
                    onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                    className="w-full h-1 accent-amber"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-cream border border-tan p-6 vintage-border rounded-sm">
            <h3 className="text-sm font-display font-bold text-espresso tracking-widest mb-4">SELECT FRAMES</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {GLASSES_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedGlasses(selectedGlasses?.id === style.id ? null : style)}
                  className={`p-3 border text-left transition-all rounded-sm ${
                    selectedGlasses?.id === style.id
                      ? "border-amber bg-amber/10 shadow-gold"
                      : "border-tan hover:border-amber/40 bg-parchment card-hover"
                  }`}
                >
                  <div
                    className="w-full h-8 mb-2 rounded-sm"
                    style={{
                      background: `linear-gradient(135deg, ${style.color} 0%, ${style.lensColor.replace(/[\d.]+\)/, "0.6)")}) 100%)`,
                      border: `2px solid ${style.color}`,
                    }}
                  />
                  <p className="text-xs font-body text-espresso truncate">{style.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedGlasses(null)}
              className="flex-1 py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-tan rounded-sm"
            >
              <Trash2 className="w-4 h-4" />
              REMOVE
            </button>
            <button
              onClick={downloadResult}
              disabled={!selectedGlasses}
              className="flex-1 py-4 bg-olive text-cream font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-sm shadow-elegant disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              SAVE IMAGE
            </button>
            <Link
              href="/dashboard/hair-preview"
              className="flex-1 py-4 bg-amber text-cream font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-sm shadow-gold"
            >
              HAIR PREVIEW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
