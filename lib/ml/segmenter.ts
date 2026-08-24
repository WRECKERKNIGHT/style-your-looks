import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";
import { resolveModelUrl, resolveWasmBase, invalidateAssetResolution, MODEL_SOURCES } from "./engine-assets";

export enum PersonCategory {
  Background = 0,
  Hair = 1,
  BodySkin = 2,
  FaceSkin = 3,
  Clothes = 4,
  Others = 5,
}

let segmenter: ImageSegmenter | null = null;
let initPromise: Promise<ImageSegmenter> | null = null;

async function createSegmenter(delegate: "GPU" | "CPU"): Promise<ImageSegmenter> {
  const [vision, modelUrl] = await Promise.all([
    resolveWasmBase().then((base) => FilesetResolver.forVisionTasks(base)),
    resolveModelUrl(MODEL_SOURCES.selfieMulticlass),
  ]);
  return ImageSegmenter.createFromOptions(vision, {
    baseOptions: { modelAssetPath: modelUrl, delegate },
    runningMode: "IMAGE",
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
}

export async function initializeSegmenter(): Promise<ImageSegmenter> {
  if (segmenter) return segmenter;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let lastErr: unknown;
    for (const delegate of ["GPU", "CPU"] as const) {
      try {
        segmenter = await createSegmenter(delegate);
        return segmenter;
      } catch (err) {
        lastErr = err;
        console.warn(`Image segmenter ${delegate} delegate failed — trying next fallback:`, err);
      }
    }
    initPromise = null;
    throw lastErr instanceof Error ? lastErr : new Error("Failed to initialise image segmenter");
  })();

  return initPromise;
}

export interface PersonSegmentation {
  width: number;
  height: number;
  categories: Uint8Array;
  personMask: HTMLCanvasElement;
  hairMask: HTMLCanvasElement;
  clothesMask: HTMLCanvasElement;
  skinMask: HTMLCanvasElement;
}

function maskCanvas(categories: Uint8Array, width: number, height: number, keep: (c: number) => boolean): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(width, height);
  for (let i = 0; i < categories.length; i++) {
    const a = keep(categories[i]) ? 255 : 0;
    img.data[i * 4 + 3] = a;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export async function segmentPerson(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<PersonSegmentation> {
  let seg: ImageSegmenter;
  try {
    seg = await initializeSegmenter();
  } catch (firstErr) {
    // Self-heal: rebuild from a clean slate (fresh engine + re-probed assets).
    console.warn("Segmenter init failed — retrying with clean asset resolution:", firstErr);
    resetSegmenterEngine();
    try {
      seg = await initializeSegmenter();
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
  try {
    return runSegmentation(seg, imageSource);
  } catch (err) {
    // Mid-session death (GPU context lost): one CPU rebuild + retry.
    console.warn("Segmentation failed mid-run — rebuilding on CPU:", err);
    resetSegmenterEngine();
    const rebuilt = await createSegmenter("CPU");
    segmenter = rebuilt;
    return runSegmentation(rebuilt, imageSource);
  }
}

function runSegmentation(
  seg: ImageSegmenter,
  imageSource: HTMLImageElement | HTMLCanvasElement
): PersonSegmentation {
  const result = seg.segment(imageSource);
  const mask = result.categoryMask;
  try {
    if (!mask) {
      throw new Error("Segmentation model returned no mask.");
    }
    const categories = mask.getAsUint8Array();
    const width = mask.width;
    const height = mask.height;
    return {
      width,
      height,
      categories,
      personMask: maskCanvas(categories, width, height, (c) => c !== PersonCategory.Background),
      hairMask: maskCanvas(categories, width, height, (c) => c === PersonCategory.Hair),
      clothesMask: maskCanvas(categories, width, height, (c) => c === PersonCategory.Clothes),
      skinMask: maskCanvas(categories, width, height, (c) => c === PersonCategory.BodySkin || c === PersonCategory.FaceSkin),
    };
  } finally {
    result.close();
  }
}

/**
 * Tear down the cached segmenter so the next call rebuilds fresh — used by
 * self-heal paths when inference starts failing mid-session.
 */
export function resetSegmenterEngine(): void {
  try {
    segmenter?.close();
  } catch {
    // context may already be gone
  }
  segmenter = null;
  initPromise = null;
  invalidateAssetResolution();
}
