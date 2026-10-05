/**
 * Tiny square thumbnails for locally persisted records.
 *
 * History entries store their photo in localStorage, and localStorage is capped
 * at roughly 5MB for the whole origin. A full analysis photo (downscaled to
 * 1600px webp) is ~200-400KB as a data URL, so persisting one per entry blows
 * the quota after a dozen or so analyses and every subsequent save fails —
 * history silently stops recording.
 *
 * A 192px webp is a few KB, which keeps 50 entries comfortably inside the
 * budget and is still larger than the largest thumbnail the history grid draws.
 */

/** Longest edge of a stored thumbnail. Sized for the history grid at 2x. */
export const THUMBNAIL_DIM = 192;
const QUALITY = 0.72;

/** Data URLs larger than this are worth re-encoding; smaller ones pass through. */
const PASSTHROUGH_BYTES = 24 * 1024;

/** Approximate byte length of a base64 data URL payload. */
function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return dataUrl.length;
  const payload = dataUrl.length - comma - 1;
  return Math.floor((payload * 3) / 4);
}

/**
 * Downscale a data URL to a small thumbnail. Resolves to the input unchanged
 * when it is already small enough, is not a data URL, or the environment cannot
 * decode it — a thumbnail is never worth failing a save over.
 */
export function makeThumbnail(dataUrl: string | null | undefined): Promise<string | null> {
  if (!dataUrl || !dataUrl.startsWith("data:image")) return Promise.resolve(dataUrl ?? null);
  if (typeof window === "undefined") return Promise.resolve(dataUrl);
  if (dataUrlBytes(dataUrl) <= PASSTHROUGH_BYTES) return Promise.resolve(dataUrl);

  return new Promise((resolve) => {
    const img = new Image();
    // Object URLs are not involved here, but a decode can still fail on a
    // truncated payload; resolve with the original in every failure path so a
    // history save is never blocked by thumbnail generation.
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      img.onload = null;
      img.onerror = null;
      resolve(value);
    };

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return finish(dataUrl);
      try {
        // Never upscale: a photo already smaller than the thumbnail cap is
        // stored as-is rather than blurred to fill it.
        const scale = Math.min(1, THUMBNAIL_DIM / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return finish(dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let out = canvas.toDataURL("image/webp", QUALITY);
        if (!out.startsWith("data:image/webp")) {
          out = canvas.toDataURL("image/jpeg", QUALITY);
        }
        finish(out);
      } catch {
        finish(dataUrl);
      }
    };
    img.onerror = () => finish(dataUrl);
    img.src = dataUrl;
  });
}