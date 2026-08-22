"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  error: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  captureFrame: () => HTMLCanvasElement | null;
}

function describeWebcamError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "camera permission was denied. Allow camera access in your browser settings and try again.";
    case "NotFoundError":
      return "no camera was found. Connect a webcam or upload a photo instead.";
    case "NotReadableError":
    case "TrackStartError":
      return "the camera is already in use by another app. Close it and try again.";
    case "OverconstrainedError":
      return "the camera does not support the requested video mode.";
    default:
      return err instanceof Error && err.message
        ? err.message
        : "we could not access the camera on this device.";
  }
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startWebcam = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "this browser or context does not support camera access. Use a photo upload instead."
      );
      return;
    }

    // Always release a previous stream first so we never leak the camera when
    // re-acquiring (e.g. after a play() rejection).
    stopWebcam();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
    } catch (err) {
      setIsStreaming(false);
      setError(describeWebcamError(err));
      return;
    }

    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      // The <video> element is not mounted yet — release immediately rather
      // than keeping a live stream nobody can see.
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    // Stop gracefully if the user revokes permission or unplugs the camera.
    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        if (streamRef.current === stream) stopWebcam();
      });
    });

    video.srcObject = stream;
    try {
      await video.play();
      setIsStreaming(true);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      video.srcObject = null;
      setIsStreaming(false);
      setError("the browser blocked video playback. Click the page and try again.");
    }
  }, [stopWebcam]);

  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current || !isStreaming) return null;

    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return canvas;
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return {
    videoRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    captureFrame,
  };
}
