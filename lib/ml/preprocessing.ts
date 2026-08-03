export interface PreprocessReport {
  canvas: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
  downscaled: boolean;
  gammaApplied: number | null;
  brightness: number;
  sharpness: number;
}

export interface QuickGateReport {
  usable: boolean;
  issues: string[];
}

export function getSourceSize(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): { width: number; height: number } {
  if (source instanceof HTMLVideoElement)
    return { width: source.videoWidth || 0, height: source.videoHeight || 0 };
  if (source instanceof HTMLImageElement)
    return { width: source.naturalWidth || 0, height: source.naturalHeight || 0 };
  return { width: source.width, height: source.height };
}

/**
 * Draw the source onto a downscaled canvas (max dimension 1600px).
 * Prevents oversized phone photos from blowing up canvas memory, slowing
 * getImageData, or exceeding canvas limits in the browser.
 */
export function prepareCanvas(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  maxDim = 1600
): HTMLCanvasElement {
  const { width: sw, height: sh } = getSourceSize(source);
  if (!sw || !sh) throw new Error("Could not read the photo dimensions.");

  const scale = Math.min(1, maxDim / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function sourceSize(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): { width: number; height: number } {
  if (source instanceof HTMLImageElement)
    return { width: source.naturalWidth, height: source.naturalHeight };
  if (source instanceof HTMLVideoElement)
    return { width: source.videoWidth, height: source.videoHeight };
  return { width: source.width, height: source.height };
}

function sampleLuminance(
  canvas: HTMLCanvasElement,
  size = 96
): { data: Uint8Array; w: number; h: number; mean: number; std: number } {
  const ctx = canvas.getContext("2d");
  const empty = { data: new Uint8Array(0), w: 0, h: 0, mean: 0, std: 0 };
  if (!ctx) return empty;

  const small = document.createElement("canvas");
  small.width = size;
  small.height = size;
  const sctx = small.getContext("2d");
  if (!sctx) return empty;

  try {
    sctx.drawImage(canvas, 0, 0, size, size);
    const img = sctx.getImageData(0, 0, size, size);
    const data = new Uint8Array(size * size);
    let sum = 0;
    for (let i = 0; i < size * size; i++) {
      const r = img.data[i * 4];
      const g = img.data[i * 4 + 1];
      const b = img.data[i * 4 + 2];
      data[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += data[i];
    }
    const mean = sum / (size * size);
    let sq = 0;
    for (let i = 0; i < data.length; i++) sq += (data[i] - mean) ** 2;
    return { data, w: size, h: size, mean, std: Math.sqrt(sq / data.length) };
  } catch {
    return empty;
  }
}

function edgeIntensity(data: Uint8Array, w: number, h: number): number {
  if (data.length === 0) return 0;
  let edge = 0;
  let count = 0;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w - 1; x++) {
      edge += Math.abs(data[row + x] - data[row + x + 1]);
      count++;
    }
  }
  return edge / count;
}

function applyGamma(
  canvas: HTMLCanvasElement,
  gamma: number
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const octx = out.getContext("2d");
  const ictx = canvas.getContext("2d");
  if (!octx || !ictx) return canvas;

  try {
    const img = ictx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const v = data[i + c] / 255;
        data[i + c] = Math.round(255 * Math.pow(v, gamma));
      }
    }
    octx.putImageData(img, 0, 0);
    return out;
  } catch {
    return canvas;
  }
}

/**
 * Gate 1 — resize. Downscales oversized photos to keep MediaPipe fast and
 * within canvas limits, and draws into a fresh canvas (browser applies EXIF
 * orientation during drawImage).
 */
function downscale(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  maxDim: number
): { canvas: HTMLCanvasElement; downscaled: boolean } {
  const { width: sw, height: sh } = sourceSize(source);
  if (!sw || !sh) throw new Error("Could not read the photo dimensions.");

  const scale = Math.min(1, maxDim / Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return { canvas, downscaled: scale < 1 };
}

/**
 * Gate 2 — auto-exposure. Applies a gentle gamma lift/crush when the photo is
 * meaningfully under- or over-exposed, which materially improves landmark
 * detection on dark camera phone photos.
 */
function autoGamma(canvas: HTMLCanvasElement): {
  canvas: HTMLCanvasElement;
  gamma: number | null;
} {
  const { mean } = sampleLuminance(canvas);
  if (mean < 40) {
    const gamma = Math.max(0.85, 40 / Math.max(mean, 16));
    return { canvas: applyGamma(canvas, gamma), gamma };
  }
  if (mean > 235) {
    const gamma = Math.min(1.15, 235 / Math.max(mean, 1));
    return { canvas: applyGamma(canvas, gamma), gamma };
  }
  return { canvas, gamma: null };
}

/**
 * Gate 3 — pre-detection quality check. Fast brightness/sharpness pass that
 * rejects hopeless photos before the expensive MediaPipe run.
 */
export function quickQualityGate(canvas: HTMLCanvasElement): QuickGateReport {
  const { mean, std, data, w, h } = sampleLuminance(canvas);
  const issues: string[] = [];

  if (data.length > 0) {
    if (mean < 22) issues.push("Photo is too dark to analyze reliably — increase the lighting");
    else if (mean > 248) issues.push("Photo is overexposed — reduce the brightness");
    if (std < 8) issues.push("Photo has almost no contrast — reposition the lighting");
    const edge = edgeIntensity(data, w, h);
    if (edge < 1.1) issues.push("Photo is too blurry — steady the camera");
  }

  return { usable: issues.length === 0, issues };
}

export function preprocessImage(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  maxDim = 1280
): PreprocessReport {
  const { width: originalWidth, height: originalHeight } = sourceSize(source);
  const { canvas: resized, downscaled } = downscale(source, maxDim);
  const { canvas: adjusted, gamma } = autoGamma(resized);
  const stats = sampleLuminance(adjusted);

  return {
    canvas: adjusted,
    originalWidth,
    originalHeight,
    downscaled,
    gammaApplied: gamma,
    brightness: stats.mean,
    sharpness: edgeIntensity(stats.data, stats.w, stats.h),
  };
}
