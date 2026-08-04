export type ProductBackground = "transparent" | "white" | "black";

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: "glasses" | "top" | "jacket" | "pants";
  image: string;
  source: string;
  background: ProductBackground;
  credit: string;
}

export const PRODUCT_CATALOG: ProductItem[] = [
  {
    id: "gl-1",
    name: "Classic Aviator Sunglasses",
    brand: "Product render",
    category: "glasses",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Sunglasses-1_retouch.png",
    source: "upload.wikimedia.org",
    background: "transparent",
    credit: "Sunglasses-1 retouch — Wikimedia Commons",
  },
  {
    id: "gl-2",
    name: "Hawkers Classic Sunglasses",
    brand: "Hawkers",
    category: "glasses",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/62/Hawkers_sunglasses.png",
    source: "upload.wikimedia.org",
    background: "black",
    credit: "Hawkers sunglasses — Wikimedia Commons",
  },
  {
    id: "gl-3",
    name: "Hawkers Blue Sunglasses",
    brand: "Hawkers",
    category: "glasses",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Hawkers_sunglasses_blue_over_white.png",
    source: "upload.wikimedia.org",
    background: "white",
    credit: "Hawkers sunglasses blue over white — Wikimedia Commons",
  },
];

export const GLASSES_PRODUCTS: ProductItem[] = PRODUCT_CATALOG.filter(
  (p) => p.category === "glasses"
);

/**
 * Remove a solid studio background from a product shot using a border
 * flood-fill. Interior pixels (the product itself) are always preserved,
 * so this works for dark products on dark backdrops too.
 */
export function removeProductBackground(
  canvas: HTMLCanvasElement,
  background: ProductBackground
): HTMLCanvasElement {
  if (background === "transparent") return canvas;

  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  const cornerIdx = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + w - 1) * 4];
  let br = 0;
  let bgg = 0;
  let bb = 0;
  for (const o of cornerIdx) {
    br += d[o];
    bgg += d[o + 1];
    bb += d[o + 2];
  }
  br /= 4;
  bgg /= 4;
  bb /= 4;

  const tol = background === "white" ? 52 : 88;

  const bgIdx = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (i: number) => {
    if (bgIdx[i]) return;
    bgIdx[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < w; x++) push(x);
  for (let x = 0; x < w; x++) push((h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) push(y * w);
  for (let y = 1; y < h - 1; y++) push(y * w + w - 1);

  while (stack.length) {
    const i = stack.pop()!;
    const o = i * 4;
    const dr = d[o] - br;
    const dg = d[o + 1] - bgg;
    const db = d[o + 2] - bb;
    if (dr * dr + dg * dg + db * db > tol * tol) continue;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  for (let i = 0; i < w * h; i++) {
    if (!bgIdx[i]) continue;
    let border = false;
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0 && !bgIdx[i - 1]) border = true;
    else if (x < w - 1 && !bgIdx[i + 1]) border = true;
    else if (y > 0 && !bgIdx[i - w]) border = true;
    else if (y < h - 1 && !bgIdx[i + w]) border = true;
    const o = i * 4;
    if (border) {
      d[o + 3] = Math.min(d[o + 3], 90);
    } else {
      d[o + 3] = 0;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Guess whether an arbitrary product photo sits on a solid light/dark studio
 * background so we can strip it before warping.
 */
export function detectProductBackground(canvas: HTMLCanvasElement): ProductBackground {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const px = ctx.getImageData(0, 0, w, h).data;
  const corners = [
    (0 * w + 0) * 4,
    (0 * w + w - 1) * 4,
    ((h - 1) * w + 0) * 4,
    ((h - 1) * w + w - 1) * 4,
  ];
  let sum = 0;
  let anyAlpha = false;
  for (const o of corners) {
    sum += (px[o] + px[o + 1] + px[o + 2]) / 3;
    if (px[o + 3] < 200) anyAlpha = true;
  }
  if (anyAlpha) return "transparent";
  const avg = sum / corners.length;
  if (avg > 220) return "white";
  if (avg < 45) return "black";
  return "transparent";
}

/**
 * Load a product image from a remote URL into an un-tainted canvas with the
 * studio background stripped (if any).
 */
export function loadProductImage(
  item: ProductItem,
  maxSide = 900
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(removeProductBackground(canvas, item.background));
    };
    img.onerror = () => reject(new Error(`Failed to load product image: ${item.image}`));
    img.src = item.image;
  });
}

/**
 * Load an arbitrary remote product photo and auto-strip a studio background.
 */
export function loadRemoteProductImage(
  url: string,
  maxSide = 900
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(removeProductBackground(canvas, detectProductBackground(canvas)));
    };
    img.onerror = () => reject(new Error(`Could not load image from that URL (blocked or invalid).`));
    img.src = url;
  });
}
