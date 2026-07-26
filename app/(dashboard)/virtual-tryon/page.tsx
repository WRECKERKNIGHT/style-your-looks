"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { SAMPLE_CLOTHING, type ClothingItem } from "@/lib/ml/virtual-tryon";
import { motion } from "framer-motion";
import { Shirt, Trash2, RotateCcw } from "lucide-react";

export default function VirtualTryOnPage() {
  const { uploadedImage, setUploadedImage } = useAnalysisStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);

  const handleImageUpload = useCallback(
    (imageData: string) => {
      setUploadedImage(imageData);
    },
    [setUploadedImage]
  );

  const addClothingItem = (item: ClothingItem) => {
    if (!selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const removeClothingItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
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
          <div className="bg-cream border border-tan overflow-hidden relative rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Try-on preview"
              className="w-full max-h-[560px] object-contain bg-parchment"
            />

            {/* Color overlay previews */}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-cream/95 backdrop-blur-sm px-4 py-2 border border-tan rounded-sm shadow-elegant"
                >
                  <div
                    className="w-5 h-5 border border-tan rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-body text-espresso">{item.name}</span>
                  <button
                    onClick={() => removeClothingItem(item.id)}
                    className="text-coffee hover:text-burgundy transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
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
                          className={`p-4 border text-left transition-all rounded-sm ${
                            isSelected
                              ? "border-amber bg-amber/10 shadow-gold"
                              : "border-tan hover:border-amber/40 bg-parchment card-hover"
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
              onClick={() => {
                useAnalysisStore.getState().setUploadedImage(null);
                setSelectedItems([]);
              }}
              className="flex-1 py-4 bg-amber hover:bg-amber-light text-cream font-body text-base tracking-wider uppercase transition-colors rounded-sm shadow-gold"
            >
              UPLOAD NEW PHOTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
