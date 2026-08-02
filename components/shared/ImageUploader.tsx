"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, ZoomIn, Maximize2 } from "lucide-react";
import { useToastStore } from "./Toast";

interface ImageUploaderProps {
  onImageUpload?: (imageData: string) => void;
  onImageSelect?: (file: File) => void;
  onWebcamCapture?: (imageData: string) => void;
  className?: string;
  maxSizeMB?: number;
  aspectRatio?: "square" | "portrait" | "landscape" | "any";
  label?: string;
  accept?: "any" | "face" | "full-body";
}

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  any: "",
};

const acceptMessages: Record<NonNullable<ImageUploaderProps["accept"]>, string> = {
  any: "JPEG, PNG, WebP",
  face: "Front-facing face photo",
  "full-body": "Full-body photo",
};

export function ImageUploader({
  onImageUpload,
  onImageSelect,
  className = "",
  maxSizeMB = 10,
  aspectRatio = "any",
  label = "Drop your photo here",
  accept = "any",
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
        const result = e.target?.result as string;
        setPreview(result);
        onImageUpload?.(result);
      };
      reader.readAsDataURL(file);

      setFileName(file.name);
      setFileSize(formatSize(file.size));
      onImageSelect?.(file);
      addToast("Image loaded successfully", "success");
    },
    [onImageUpload, onImageSelect, maxSizeMB, addToast]
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
            className={`relative cursor-pointer border-2 border-dashed transition-all duration-500 ${aspectRatioClasses[aspectRatio]} min-h-[320px] flex flex-col items-center justify-center gap-5 p-10 ${
              dragOver
                ? "border-aurum-500 bg-aurum-500/[0.04] shadow-aurum"
                : "border-light-border/30 dark:border-cosmic-border/30 bg-light-base/30 dark:bg-cosmic-base/30 backdrop-blur-sm hover:border-aurum-500/40 hover:bg-light-surface/50 dark:hover:bg-cosmic-surface/50"
            }`}
            style={{
              background: dragOver ? undefined : "linear-gradient(135deg, rgba(185,139,86,0.03) 0%, transparent 100%)",
            }}
          >
            <motion.div
              animate={dragOver ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }}
              className="w-20 h-20 border border-light-border/20 dark:border-cosmic-border/20 bg-light-surface/50 dark:bg-cosmic-surface/50 backdrop-blur-sm flex items-center justify-center rounded-sm"
            >
              <Upload className="w-8 h-8 text-aurum-500/60" />
            </motion.div>

            <div className="text-center">
              <p className="font-body text-base text-nexus-800 dark:text-white font-medium mb-1">
                {label}
              </p>
              <p className="type-mono text-[0.6rem] text-nexus-400/40 dark:text-cosmic-muted/40 tracking-widest">
                {acceptMessages[accept]} &bull; Max {maxSizeMB}MB
              </p>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="h-px w-8 bg-light-border/15 dark:bg-cosmic-border/15" />
              <span className="type-mono text-[0.5rem] text-nexus-400/30 dark:text-cosmic-muted/30 tracking-widest">OR</span>
              <div className="h-px w-8 bg-light-border/15 dark:bg-cosmic-border/15" />
            </div>

            <button
              type="button"
              className="btn-outline text-xs py-2.5 px-6 border-aurum-500/50 text-aurum-500 hover:bg-aurum-500/10"
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
            className="relative overflow-hidden border border-light-border/20 dark:border-cosmic-border/20 bg-light-surface/50 dark:bg-cosmic-surface/50 backdrop-blur-sm rounded-sm card-nexus"
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
              <div className="absolute inset-0 bg-gradient-to-t from-nexus-800/30 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="w-8 h-8 bg-light-surface/80 dark:bg-cosmic-surface/80 backdrop-blur-sm border border-light-border/20 dark:border-cosmic-border/20 flex items-center justify-center hover:bg-light-surface dark:hover:bg-cosmic-surface transition-colors rounded-sm"
              >
                {isZoomed ? (
                  <Maximize2 className="w-3.5 h-3.5 text-nexus-400/60 dark:text-cosmic-muted/60" />
                ) : (
                  <ZoomIn className="w-3.5 h-3.5 text-nexus-400/60 dark:text-cosmic-muted/60" />
                )}
              </button>
              <button
                onClick={handleClear}
                className="w-8 h-8 bg-light-surface/80 dark:bg-cosmic-surface/80 backdrop-blur-sm border border-light-border/20 dark:border-cosmic-border/20 flex items-center justify-center hover:bg-light-surface dark:hover:bg-cosmic-surface transition-colors rounded-sm"
              >
                <X className="w-3.5 h-3.5 text-nexus-400/60 dark:text-cosmic-muted/60" />
              </button>
            </div>

            {fileName && (
              <div className="absolute bottom-0 left-0 right-0 bg-light-surface/80 dark:bg-cosmic-surface/80 backdrop-blur-sm border-t border-light-border/20 dark:border-cosmic-border/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-aurum-600/60 shrink-0" />
                  <span className="type-mono text-[0.6rem] text-nexus-400/60 dark:text-cosmic-muted/60 truncate">
                    {fileName}
                  </span>
                </div>
                <span className="type-mono text-[0.55rem] text-nexus-400/40 dark:text-cosmic-muted/40 shrink-0 ml-3">
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
