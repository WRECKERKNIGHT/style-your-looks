"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { SAMPLE_CLOTHING, drawFabric, type ClothingItem, type FabricType } from "@/lib/ml/virtual-tryon";
import { clothingPositions, type Point } from "@/lib/ml/face-landmarks";
import { motion } from "framer-motion";
import { Shirt, Trash2, RotateCcw, Download, ZoomIn, ZoomOut, Move, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

const FABRICS: { id: FabricType; label: string; pattern: string }[] = [
  { id: "solid", label: "SOLID", pattern: "" },
  { id: "denim", label: "DENIM", pattern: "repeating-linear-gradient(45deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 6px)" },
  { id: "knit", label: "KNIT", pattern: "repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0 3px, transparent 3px 8px)" },
  { id: "linen", label: "LINEN", pattern: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0 1px, transparent 1px 9px), repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 1px, transparent 1px 9px)" },
  { id: "silk", label: "SILK", pattern: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.1) 62%, rgba(255,255,255,0.28))" },
  { id: "leather", label: "LEATHER", pattern: "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.3) 0 4px, transparent 5px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.25) 0 6px, transparent 7px), radial-gradient(circle at 45% 85%, rgba(0,0,0,0.25) 0 3px, transparent 4px)" },
];

interface PlacedItem extends ClothingItem {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function VirtualTryOnPage() {
  const { uploadedImage, setUploadedImage, faceResult } = useAnalysisStore();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<PlacedItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setUploadedImage(imageData);
      setSelectedItems([]);
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

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const container = containerRef.current;
    if (!container) return;

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

    selectedItems.forEach((item) => {
      ctx.save();
      ctx.globalAlpha = item.opacity ?? 0.65;
      drawFabric(ctx, item.x, item.y, item.width, item.height, item.fabric, item.color, 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, item.width * 0.08)}px "Inter", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, item.x + item.width / 2, item.y + item.height / 2);
      ctx.restore();
    });
  }, [selectedItems]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const addClothingItem = (item: ClothingItem) => {
    if (selectedItems.find((i) => i.id === item.id)) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const displayWidth = container.clientWidth;
    const img = imgRef.current;
    if (!img) return;
    const displayHeight = Math.min(displayWidth * (img.height / img.width), 560);

    let pos: { x: number; y: number; width: number; height: number };

    if (faceResult && faceResult.landmarks.length > 0) {
      const positions = clothingPositions(faceResult.landmarks, displayWidth, displayHeight);
      const categoryBoxes: Record<ClothingItem["category"], { x: number; y: number; width: number; height: number }> = {
        top: positions.top,
        bottom: positions.bottom,
        outerwear: positions.outerwear,
        accessory: positions.accessory,
      };
      pos = categoryBoxes[item.category];
    } else {
      const isPortrait = displayHeight > displayWidth;
      if (isPortrait) {
        pos = item.category === "top"
          ? { x: displayWidth * 0.15, y: displayHeight * 0.18, width: displayWidth * 0.7, height: displayHeight * 0.28 }
          : item.category === "bottom"
          ? { x: displayWidth * 0.18, y: displayHeight * 0.46, width: displayWidth * 0.64, height: displayHeight * 0.38 }
          : item.category === "outerwear"
          ? { x: displayWidth * 0.08, y: displayHeight * 0.15, width: displayWidth * 0.84, height: displayHeight * 0.35 }
          : { x: displayWidth * 0.35, y: displayHeight * 0.06, width: displayWidth * 0.3, height: displayHeight * 0.1 };
      } else {
        pos = item.category === "top"
          ? { x: displayWidth * 0.2, y: displayHeight * 0.1, width: displayWidth * 0.6, height: displayHeight * 0.4 }
          : item.category === "bottom"
          ? { x: displayWidth * 0.22, y: displayHeight * 0.5, width: displayWidth * 0.56, height: displayHeight * 0.45 }
          : item.category === "outerwear"
          ? { x: displayWidth * 0.1, y: displayHeight * 0.08, width: displayWidth * 0.8, height: displayHeight * 0.45 }
          : { x: displayWidth * 0.35, y: displayHeight * 0.02, width: displayWidth * 0.3, height: displayHeight * 0.15 };
      }
    }

    setSelectedItems((prev) => [
      ...prev,
      { ...item, x: pos.x, y: pos.y, width: pos.width, height: pos.height, opacity: 0.65 },
    ]);
    setActiveItemId(item.id);
  };

  const removeClothingItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    if (activeItemId === id) setActiveItemId(null);
  };

  const handleFabricChange = (id: string, fabric: FabricType) => {
    setSelectedItems((prev) => prev.map((item) => (item.id === id ? { ...item, fabric } : item)));
  };

  const moveLayer = (id: string, dir: 1 | -1) => {
    setSelectedItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [it] = next.splice(idx, 1);
      next.splice(target, 0, it);
      return next;
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (let i = selectedItems.length - 1; i >= 0; i--) {
      const item = selectedItems[i];
      if (mx >= item.x && mx <= item.x + item.width && my >= item.y && my <= item.y + item.height) {
        setDragIndex(i);
        setDragOffset({ x: mx - item.x, y: my - item.y });
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragIndex === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setSelectedItems((prev) =>
      prev.map((item, i) => i === dragIndex ? { ...item, x: mx - dragOffset.x, y: my - dragOffset.y } : item)
    );
  };

  const handleCanvasMouseUp = () => setDragIndex(null);

  const handleOpacityChange = (id: string, opacity: number) => {
    setSelectedItems((prev) => prev.map((item) => (item.id === id ? { ...item, opacity } : item)));
  };

  const handleScaleItem = (id: string, factor: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, width: item.width * factor, height: item.height * factor, x: item.x - (item.width * factor - item.width) / 2, y: item.y - (item.height * factor - item.height) / 2 }
          : item
      )
    );
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "zervey-tryon.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Try-on image saved", "success");
  };

  const categories = [
    { key: "top", label: "TOPS" },
    { key: "bottom", label: "BOTTOMS" },
    { key: "outerwear", label: "OUTERWEAR" },
    { key: "accessory", label: "ACCESSORIES" },
  ] as const;

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // TRY-ON</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Shirt className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            VIRTUAL <span className="text-gradient-aurum">TRY-ON.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Upload your photo and overlay clothing items to preview your look.
        </p>
      </motion.div>

      {!uploadedImage ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a photo for try-on" accept="any" />
        </div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div ref={containerRef} className="glass-card overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="w-full cursor-move"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />

            {selectedItems.length > 0 && (
              <div className="absolute top-3 right-3 glass-card p-3 space-y-2 max-w-[220px]">
                <p className="type-label text-[var(--text-muted)]">LAYERS</p>
                {selectedItems.map((item) => (
                  <div key={item.id} className={`space-y-1 p-2 border transition-all ${activeItemId === item.id ? "border-[var(--accent-aurum)]" : "border-[var(--border-primary)]"}`}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveItemId(item.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                        <div className="w-3 h-3 border border-[var(--border-primary)] shrink-0" style={{ backgroundColor: item.color, backgroundImage: FABRICS.find((f) => f.id === item.fabric)?.pattern || undefined }} />
                        <span className="text-xs font-body text-[var(--text-primary)] truncate">{item.name}</span>
                      </button>
                      <button onClick={() => moveLayer(item.id, 1)} className="text-[var(--text-muted)] hover:text-[var(--accent-aurum)] transition-colors shrink-0" title="Bring forward">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveLayer(item.id, -1)} className="text-[var(--text-muted)] hover:text-[var(--accent-aurum)] transition-colors shrink-0" title="Send back">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeClothingItem(item.id)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="range" min={0.1} max={1} step={0.05} value={item.opacity ?? 0.65}
                        onChange={(e) => handleOpacityChange(item.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-[var(--accent-aurum)]" />
                      <button onClick={() => handleScaleItem(item.id, 0.9)} className="text-[var(--text-muted)] hover:text-[var(--accent-aurum)] transition-colors"><ZoomOut className="w-3 h-3" /></button>
                      <button onClick={() => handleScaleItem(item.id, 1.1)} className="text-[var(--text-muted)] hover:text-[var(--accent-aurum)] transition-colors"><ZoomIn className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 type-mono text-[color-mix(in_srgb,var(--text-muted)_60%,transparent)]">
                <Move className="w-3 h-3" />
                DRAG TO REPOSITION
              </div>
            )}
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-6">SELECT ITEMS TO TRY</h3>
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <h4 className="type-label text-[var(--text-muted)] mb-4">{cat.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {SAMPLE_CLOTHING.filter((i) => i.category === cat.key).map((item) => {
                      const isSelected = selectedItems.some((s) => s.id === item.id);
                      const fabricMeta = FABRICS.find((f) => f.id === item.fabric);
                      return (
                        <button
                          key={item.id}
                          onClick={() => isSelected ? removeClothingItem(item.id) : addClothingItem(item)}
                          className={`p-4 border text-left transition-all duration-300 ${
                            isSelected
                              ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                              : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                          }`}
                        >
                          <div className="w-full h-14 mb-3 border border-[var(--border-primary)]" style={{ backgroundColor: item.color, backgroundImage: fabricMeta?.pattern || undefined }} />
                          <p className="text-sm font-body text-[var(--text-primary)] truncate">{item.name}</p>
                          <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-1">{fabricMeta?.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="glass-card p-8">
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-2">FABRIC SWAP</h3>
              <p className="text-sm text-[var(--text-muted)] font-body mb-6">
                {activeItemId
                  ? `Applying to: ${selectedItems.find((i) => i.id === activeItemId)?.name ?? "item"}`
                  : "Select a layer (click its name in the LAYERS panel) to change its fabric."}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {FABRICS.map((f) => {
                  const isActive = selectedItems.find((i) => i.id === activeItemId)?.fabric === f.id;
                  return (
                    <button
                      key={f.id}
                      disabled={!activeItemId}
                      onClick={() => activeItemId && handleFabricChange(activeItemId, f.id)}
                      className={`p-3 border text-left transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                        isActive
                          ? "border-[var(--accent-aurum)] bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)]"
                          : "border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] bg-[var(--bg-tertiary)] card-nexus"
                      }`}
                    >
                      <div className="w-full h-12 mb-2 border border-[var(--border-primary)]" style={{ backgroundColor: "#8A6B4F", backgroundImage: f.pattern || undefined }} />
                      <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest">{f.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={() => setSelectedItems([])} className="btn-outline flex-1 justify-center">
              <RotateCcw className="w-4 h-4" />
              CLEAR SELECTION
            </button>
            <button onClick={downloadResult} disabled={selectedItems.length === 0}
              className="btn-nexus flex-1 justify-center disabled:opacity-40">
              <Download className="w-4 h-4" />
              SAVE LOOK
            </button>
            <button onClick={() => { useAnalysisStore.getState().setUploadedImage(null); setSelectedItems([]); }}
              className="btn-nexus flex-1 justify-center">
              NEW PHOTO
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
