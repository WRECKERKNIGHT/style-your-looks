"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera } from "lucide-react";
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
            className="w-full object-cover max-h-[560px] rounded-sm"
          />
          <button
            onClick={() => {
              setPreview(null);
            }}
            className="absolute top-4 right-4 bg-cream/95 backdrop-blur-sm p-2.5 hover:bg-parchment transition-colors border border-tan rounded-full shadow-elegant"
          >
            <svg className="w-4 h-4 text-espresso" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300 rounded-sm",
            "hover:border-amber/50 hover:bg-parchment",
            isDragActive
              ? "border-amber bg-amber/5 scale-[1.01]"
              : "border-tan bg-cream"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-5">
            <div
              className={cn(
                "w-20 h-20 flex items-center justify-center transition-colors rounded-full",
                isDragActive ? "bg-amber/15" : "bg-parchment border border-tan"
              )}
            >
              <Upload
                className={cn(
                  "w-9 h-9 transition-colors",
                  isDragActive ? "text-amber" : "text-coffee"
                )}
              />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-espresso tracking-wider">{label}</p>
              <p className="text-base text-coffee font-body mt-2">{acceptHint}</p>
            </div>
            {isDragActive && (
              <p className="text-base text-amber font-body font-semibold">DROP YOUR PHOTO HERE</p>
            )}
          </div>
        </div>
      )}

      {onWebcamCapture && !preview && (
        <button
          onClick={onWebcamCapture}
          className="mt-5 w-full flex items-center justify-center gap-2 py-4 px-6 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors border border-tan rounded-sm"
        >
          <Camera className="w-5 h-5" />
          USE WEBCAM INSTEAD
        </button>
      )}
    </div>
  );
}
