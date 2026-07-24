"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUpload: (image: string) => void;
  onWebcamCapture?: () => void;
  label?: string;
  className?: string;
  accept?: "face" | "full-body" | "any";
}

export function ImageUploader({
  onImageUpload,
  onWebcamCapture,
  label = "Upload a photo",
  className,
  accept = "any",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const acceptHint =
    accept === "face"
      ? "Front-facing photo recommended"
      : accept === "full-body"
      ? "Full body photo recommended"
      : "JPEG, PNG, or WebP up to 10MB";

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded"
            className="w-full rounded-2xl object-cover max-h-[500px]"
          />
          <button
            onClick={() => {
              setPreview(null);
            }}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
            "hover:border-[#C89D7C] hover:bg-[#FDFBF7]",
            isDragActive
              ? "border-[#C89D7C] bg-[#FDFBF7] scale-[1.02]"
              : "border-[#E8E0D8] bg-[#F4EFEA]/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                isDragActive ? "bg-[#C89D7C]/20" : "bg-[#F4EFEA]"
              )}
            >
              <Upload
                className={cn(
                  "w-7 h-7 transition-colors",
                  isDragActive ? "text-[#C89D7C]" : "text-[#8B7D6B]"
                )}
              />
            </div>
            <div>
              <p className="text-lg font-medium text-[#3C2A21]">{label}</p>
              <p className="text-sm text-[#8B7D6B] mt-1">{acceptHint}</p>
            </div>
            {isDragActive && (
              <p className="text-sm text-[#C89D7C] font-medium">Drop your photo here</p>
            )}
          </div>
        </div>
      )}

      {onWebcamCapture && !preview && (
        <button
          onClick={onWebcamCapture}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F4EFEA] hover:bg-[#EDE5DC] rounded-xl text-[#3C2A21] font-medium transition-colors"
        >
          <Camera className="w-5 h-5" />
          Use Webcam Instead
        </button>
      )}
    </div>
  );
}
