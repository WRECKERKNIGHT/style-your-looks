const LOCAL_WASM_BASE = "/mediapipe/wasm";
const CDN_WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";

const LOCAL_MODEL_ROOT = "/models";

interface ModelSource {
  /** File name inside /public/models that ships with the app. */
  localFile?: string;
  /** Remote fallback used when the local asset is missing (e.g. stripped deploy). */
  cdnUrl: string;
}

export const MODEL_SOURCES = {
  faceLandmarker: {
    localFile: "face_landmarker.task",
    cdnUrl:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  },
  poseLandmarker: {
    localFile: "pose_landmarker_heavy.task",
    cdnUrl:
      "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
  },
  selfieMulticlass: {
    localFile: "selfie_multiclass_256x256.tflite",
    cdnUrl:
      "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
  },
} satisfies Record<string, ModelSource>;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function urlExists(url: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await withTimeout(fetch(url, { method: "HEAD", cache: "no-store" }), 5000);
    return res.ok;
  } catch {
    return false;
  }
}

let wasmBasePromise: Promise<string> | null = null;

/**
 * Resolve the MediaPipe WASM fileset base URL. Prefers the copy bundled with
 * the app (/public/mediapipe/wasm) so analysis works even when third-party
 * CDNs are unreachable, and falls back to jsdelivr otherwise.
 */
export function resolveWasmBase(): Promise<string> {
  if (!wasmBasePromise) {
    wasmBasePromise = (async () => {
      const probe = `${LOCAL_WASM_BASE}/vision_wasm_internal.js`;
      if (await urlExists(probe)) return LOCAL_WASM_BASE;
      console.warn("[zervey-ml] bundled WASM unavailable — using CDN fallback");
      return CDN_WASM_BASE;
    })();
  }
  return wasmBasePromise;
}

const modelUrlCache = new Map<string, Promise<string>>();

/**
 * Resolve a model asset URL, preferring the bundled copy under /public/models
 * and falling back to the original Google Storage URL.
 */
export function resolveModelUrl(source: ModelSource): Promise<string> {
  const key = source.localFile ?? source.cdnUrl;
  let cached = modelUrlCache.get(key);
  if (!cached) {
    cached = (async () => {
      if (source.localFile) {
        const local = `${LOCAL_MODEL_ROOT}/${source.localFile}`;
        if (await urlExists(local)) return local;
      }
      console.warn(`[zervey-ml] bundled model ${key ?? ""} unavailable — using CDN fallback`);
      return source.cdnUrl;
    })();
    modelUrlCache.set(key, cached);
  }
  return cached;
}
