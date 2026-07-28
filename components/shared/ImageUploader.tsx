"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, ZoomIn, Maximize2 } from "lucide-react";
import { useToastStore } from "./Toast";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
  maxSizeMB?: number;
  aspectRatio?: "square" | "portrait" | "landscape" | "any";
}

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  any: "",
};

export function ImageUploader({
  onImageSelect,
  className = "",
  maxSizeMB = 10,
  aspectRatio = "any",
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        addToast("Please select an image file", "error");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        addToast(`Image must be under ${maxSizeMB}MB`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setFileName(file.name);
      setFileSize(formatSize(file.size));
      onImageSelect(file);
      addToast("Image loaded successfully", "success");
    },
    [onImageSelect, maxSizeMB, addToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFileName("");
    setFileSize("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer border-2 border-dashed transition-all duration-500 ${aspectRatioClasses[aspectRatio]} min-h-[280px] flex flex-col items-center justify-center gap-5 p-10 ${
              dragOver
                ? "border-amber bg-amber/[0.04] shadow-gold"
                : "border-tan/30 bg-parchment/30 hover:border-amber/40 hover:bg-cream/50"
            }`}
          >
            <motion.div
              animate={dragOver ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }}
              className="w-16 h-16 border border-tan/20 bg-cream/50 flex items-center justify-center"
            >
              <Upload className="w-7 h-7 text-amber/60" />
            </motion.div>

            <div className="text-center">
              <p className="font-body text-base text-espresso font-medium mb-1">
                Drop your photo here
              </p>
              <p className="type-mono text-[0.6rem] text-coffee/40 tracking-widest">
                JPEG, PNG, WebP &bull; Max {maxSizeMB}MB
              </p>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="h-px w-8 bg-tan/15" />
              <span className="type-mono text-[0.5rem] text-coffee/30 tracking-widest">OR</span>
              <div className="h-px w-8 bg-tan/15" />
            </div>

            <button
              type="button"
              className="btn-elegant text-xs py-2.5 px-6"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Browse Files
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative overflow-hidden border border-tan/20 bg-cream/50"
          >
            <div
              className={`relative ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"} ${aspectRatioClasses[aspectRatio]}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={preview}
                alt="Upload preview"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="w-8 h-8 bg-cream/80 backdrop-blur-sm border border-tan/20 flex items-center justify-center hover:bg-cream transition-colors"
              >
                {isZoomed ? (
                  <Maximize2 className="w-3.5 h-3.5 text-coffee/60" />
                ) : (
                  <ZoomIn className="w-3.5 h-3.5 text-coffee/60" />
                )}
              </button>
              <button
                onClick={handleClear}
                className="w-8 h-8 bg-cream/80 backdrop-blur-sm border border-tan/20 flex items-center justify-center hover:bg-cream transition-colors"
              >
                <X className="w-3.5 h-3.5 text-coffee/60" />
              </button>
            </div>

            {fileName && (
              <div className="absolute bottom-0 left-0 right-0 bg-cream/80 backdrop-blur-sm border-t border-tan/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-olive/60 shrink-0" />
                  <span className="type-mono text-[0.6rem] text-coffee/60 truncate">
                    {fileName}
                  </span>
                </div>
                <span className="type-mono text-[0.55rem] text-coffee/40 shrink-0 ml-3">
                  {fileSize}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
