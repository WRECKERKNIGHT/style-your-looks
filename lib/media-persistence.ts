import type {
  AnalysisSource,
  BodyAnalysisResult,
  ColorAnalysisResult,
  FaceAnalysisResult,
  OutfitRecommendation,
} from "@/store/analysis-store";
import type { AnalysisProfile } from "@/lib/ml/scoring";

export const MEDIA_SIGNAL_KEY = "zervey:media:sync";

export interface MediaSnapshot {
  uploadedImage: string | null;
  fullBodyImage: string | null;
  source: AnalysisSource;
  genderProfile: AnalysisProfile;
  faceResult: FaceAnalysisResult | null;
  bodyResult: BodyAnalysisResult | null;
  colorAnalysis: ColorAnalysisResult | null;
  outfitRecommendations: OutfitRecommendation[];
  savedAt: number;
}

const DB_NAME = "zervey-media";
const DB_VERSION = 1;
const STORE = "kv";
const MEDIA_KEY = "media";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadMediaSnapshot(): Promise<MediaSnapshot | null> {
  try {
    const db = await openDb();
    return await new Promise<MediaSnapshot | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(MEDIA_KEY);
      req.onsuccess = () => resolve((req.result as MediaSnapshot) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveMediaSnapshot(snapshot: MediaSnapshot): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(snapshot, MEDIA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Non-fatal: persistence is best-effort.
  }
}

export async function clearMediaSnapshot(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(MEDIA_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Non-fatal: persistence is best-effort.
  }
}

export function mediaSignature(snapshot: MediaSnapshot): string {
  const json = JSON.stringify({
    u: snapshot.uploadedImage,
    b: snapshot.fullBodyImage,
    s: snapshot.source,
    g: snapshot.genderProfile,
  });
  let h = 5381;
  for (let i = 0; i < json.length; i += 1) {
    h = ((h << 5) + h + json.charCodeAt(i)) | 0;
  }
  return String(h);
}
