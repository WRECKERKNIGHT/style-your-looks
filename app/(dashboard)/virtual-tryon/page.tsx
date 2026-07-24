"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { SAMPLE_CLOTHING, type ClothingItem } from "@/lib/ml/virtual-tryon";
import { motion } from "framer-motion";
import { Shirt, GripVertical, Trash2, RotateCcw } from "lucide-react";

export default function VirtualTryOnPage() {
  const { uploadedImage, setUploadedImage } = useAnalysisStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);

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
    { key: "top", label: "Tops" },
    { key: "bottom", label: "Bottoms" },
    { key: "outerwear", label: "Outerwear" },
    { key: "accessory", label: "Accessories" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Shirt className="w-6 h-6 text-[#C89D7C]" />
          <h1 className="text-2xl font-bold text-[#3C2A21]">Virtual Try-On</h1>
        </div>
        <p className="text-[#8B7D6B]">
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
        <div className="space-y-6">
          {/* Preview Canvas */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Try-on preview"
              className="w-full max-h-[500px] object-contain bg-[#F4EFEA]"
            />

            {/* Color overlay previews */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-[#E8E0D8]"
                >
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-[#3C2A21]">{item.name}</span>
                  <button
                    onClick={() => removeClothingItem(item.id)}
                    className="text-[#8B7D6B] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clothing Selection */}
          <div className="bg-white rounded-2xl border border-[#E8E0D8] p-6">
            <h3 className="font-semibold text-[#3C2A21] mb-4">Select Items to Try</h3>
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <h4 className="text-sm font-medium text-[#8B7D6B] mb-3">{cat.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-[#C89D7C] bg-[#C89D7C]/10"
                              : "border-[#E8E0D8] hover:border-[#C89D7C]/50 bg-[#FDFBF7]"
                          }`}
                        >
                          <div
                            className="w-full h-12 rounded-lg mb-2 border border-[#E8E0D8]"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="text-xs font-medium text-[#3C2A21] truncate">
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
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedItems([])}
              className="flex-1 py-3 bg-[#F4EFEA] hover:bg-[#EDE5DC] text-[#3C2A21] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Selection
            </button>
            <button
              onClick={() => {
                useAnalysisStore.getState().setUploadedImage(null);
                setSelectedItems([]);
              }}
              className="flex-1 py-3 bg-[#3C2A21] hover:bg-[#2B1E16] text-white rounded-xl font-medium transition-colors"
            >
              Upload New Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
