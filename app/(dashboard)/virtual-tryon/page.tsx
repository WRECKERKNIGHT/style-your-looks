"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { SAMPLE_CLOTHING, type ClothingItem } from "@/lib/ml/virtual-tryon";
import { clothingPositions, type Point } from "@/lib/ml/face-landmarks";
import { motion } from "framer-motion";
import { Shirt, Trash2, RotateCcw, Download, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface PlacedItem extends ClothingItem {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

export default function VirtualTryOnPage() {
  const { uploadedImage, setUploadedImage, faceResult } = useAnalysisStore();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<PlacedItem[]>([]);
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

  useEffect(() => {
    renderCanvas();
  }, [selectedItems, scale, faceResult]);

  function renderCanvas() {
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

      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(item.x, item.y, item.width, item.height, radius);
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, item.width * 0.08)}px "DM Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, item.x + item.width / 2, item.y + item.height / 2);

      ctx.restore();
    });
  }

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
      pos = positions[item.category as keyof typeof positions] || positions.top;
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
  };

  const removeClothingItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
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
      prev.map((item, i) =>
        i === dragIndex
          ? { ...item, x: mx - dragOffset.x, y: my - dragOffset.y }
          : item
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setDragIndex(null);
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, opacity } : item))
    );
  };

  const handleScaleItem = (id: string, factor: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              width: item.width * factor,
              height: item.height * factor,
              x: item.x - (item.width * factor - item.width) / 2,
              y: item.y - (item.height * factor - item.height) / 2,
            }
          : item
      )
    );
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "aurastyle-tryon.png";
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
      <div>
        <span className="section-number">EST. MMXXIV // TRY-ON</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Shirt className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            VIRTUAL <span className="text-gradient-gold">TRY-ON.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Upload your photo and overlay clothing items to preview your look.
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader
          onImageUpload={handleImageUpload}
          label="Upload a photo for try-on"
          accept="any"
        />
      ) : (
        <div className="space-y-8">
          {/* Preview Canvas */}
          <div
            ref={containerRef}
            className="bg-cream border border-tan overflow-hidden relative rounded-sm"
          >
            <canvas
              ref={canvasRef}
              className="w-full cursor-move"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />

            {/* Active items panel */}
            {selectedItems.length > 0 && (
              <div className="absolute top-3 right-3 bg-cream/95 backdrop-blur-sm border border-tan rounded-sm p-3 space-y-2 max-w-[200px]">
                <p className="text-[0.6rem] font-mono text-coffee tracking-widest">LAYERS</p>
                {selectedItems.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 border border-tan rounded-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-body text-espresso truncate flex-1">{item.name}</span>
                      <button
                        onClick={() => removeClothingItem(item.id)}
                        className="text-coffee hover:text-burgundy transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={item.opacity ?? 0.65}
                        onChange={(e) => handleOpacityChange(item.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-amber"
                      />
                      <button
                        onClick={() => handleScaleItem(item.id, 0.9)}
                        className="text-coffee hover:text-amber transition-colors"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleScaleItem(item.id, 1.1)}
                        className="text-coffee hover:text-amber transition-colors"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[0.55rem] font-mono text-coffee/60 tracking-wider">
                <Move className="w-3 h-3" />
                DRAG TO REPOSITION
              </div>
            )}
          </div>

          {/* Clothing Selection */}
          <div className="bg-cream border border-tan p-8 vintage-border rounded-sm">
            <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-6">SELECT ITEMS TO TRY</h3>
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <h4 className="text-xs font-body text-coffee tracking-widest uppercase mb-4 font-semibold">{cat.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {SAMPLE_CLOTHING.filter((i) => i.category === cat.key).map((item) => {
                      const isSelected = selectedItems.some((s) => s.id === item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() =>
                            isSelected
                              ? removeClothingItem(item.id)
                              : addClothingItem(item)
                          }
                          className={`p-4 border text-left transition-all duration-300 rounded-sm ${
                            isSelected
                              ? "border-amber bg-amber/10 shadow-gold"
                              : "border-tan hover:border-amber/40 bg-parchment card-hover hover:shadow-md"
                          }`}
                        >
                          <div
                            className="w-full h-14 mb-3 border border-tan rounded-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="text-sm font-body text-espresso truncate">
                            {item.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedItems([])}
              className="flex-1 py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-tan rounded-sm"
            >
              <RotateCcw className="w-4 h-4" />
              CLEAR SELECTION
            </button>
            <button
              onClick={downloadResult}
              disabled={selectedItems.length === 0}
              className="flex-1 py-4 bg-olive text-cream font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 rounded-sm shadow-elegant disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              SAVE LOOK
            </button>
            <button
              onClick={() => {
                useAnalysisStore.getState().setUploadedImage(null);
                setSelectedItems([]);
              }}
              className="flex-1 py-4 bg-amber hover:bg-amber-light text-cream font-body text-base tracking-wider uppercase transition-colors rounded-sm shadow-gold"
            >
              NEW PHOTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
