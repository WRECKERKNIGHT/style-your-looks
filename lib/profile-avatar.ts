const AVATAR_STORAGE_KEY = "zervey:profile-avatar";
const AVATAR_CHANGED_EVENT = "zervey:avatar-changed";

/** Locally persisted profile picture. Overrides the Supabase-linked avatar when set. */
export function loadProfileAvatar(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveProfileAvatar(dataUrl: string): void {
  try {
    window.localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl);
  } catch {
    // Storage full or blocked — ignore, avatar simply won't persist.
  }
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
}

export function clearProfileAvatar(): void {
  try {
    window.localStorage.removeItem(AVATAR_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT));
}

/** Keeps every avatar-consuming component in sync across tabs and mounts. */
export function subscribeProfileAvatar(cb: () => void): () => void {
  window.addEventListener(AVATAR_CHANGED_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(AVATAR_CHANGED_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const AVATAR_SIZE = 256;

/** Downscale a picked image file to a compact square data URL. */
export function fileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = AVATAR_SIZE / side;
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (AVATAR_SIZE - dw) / 2, (AVATAR_SIZE - dh) / 2, dw, dh);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = URL.createObjectURL(file);
  });
}
