import type { PersonSegmentation } from "@/lib/ml/segmenter";

export interface CompositeOptions {
  displayWidth: number;
  displayHeight: number;
}

/**
 * Composites an accessory/product overlay over a base photo, then re-cuts the
 * base photo's hair back on top so accessories tuck *under* the hairline
 * instead of floating over it. Falls back to a plain composite when no
 * segmentation is available yet.
 */
export function compositeUnderHair(
  base: HTMLImageElement | HTMLCanvasElement,
  overlay: HTMLImageElement | HTMLCanvasElement | null,
  seg: PersonSegmentation | null,
  opts: CompositeOptions
): HTMLCanvasElement | null {
  if (!overlay) return null;
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(opts.displayWidth));
  out.height = Math.max(1, Math.round(opts.displayHeight));
  const ctx = out.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(base, 0, 0, out.width, out.height);
  ctx.drawImage(overlay, 0, 0, out.width, out.height);

  if (seg) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(seg.hairMask, 0, 0, out.width, out.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(seg.hairMask, 0, 0, out.width, out.height);
    ctx.restore();
  }

  return out;
}

/**
 * Builds a hair-only compositing mask scaled to a display size, for pipelines
 * that need to paint hair back over the product separately.
 */
export function drawHairMask(
  seg: PersonSegmentation,
  opts: CompositeOptions
): HTMLCanvasElement | null {
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(opts.displayWidth));
  out.height = Math.max(1, Math.round(opts.displayHeight));
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(seg.hairMask, 0, 0, out.width, out.height);
  return out;
}
