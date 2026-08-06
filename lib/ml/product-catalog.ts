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

/** Encode a standalone SVG as a same-origin data URI that canvas can read untainted. */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function glassLens(
  style: "aviator" | "round" | "rectangle" | "wayfarer",
  cx: number,
  cy: number
): string {
  const rim = "#C8963E";
  const dark = "rgba(18,12,6,0.55)";
  const outline = 'stroke="#0D0A06" stroke-width="2.5"';
  const shine = 'fill="rgba(242,217,168,0.18)"';
  switch (style) {
    case "aviator": {
      // Teardrop lens
      return `
        <path d="M${cx - 60} ${cy - 26} Q ${cx - 52} ${cy - 56} ${cx + 6} ${cy - 58} L ${cx + 60} ${cy - 26} L ${cx + 54} ${cy + 34} Q ${cx + 30} ${cy + 54} ${cx} ${cy + 54} Q ${cx - 30} ${cy + 54} ${cx - 54} ${cy + 34} Z"
          fill="${dark}" ${outline} stroke="${rim}" stroke-width="3"/>
        <path d="M${cx - 40} ${cy - 34} Q ${cx - 8} ${cy - 44} ${cx + 34} ${cy - 34} Q ${cx + 20} ${cy - 10} ${cx} ${cy - 8} Q ${cx - 22} ${cy - 10} ${cx - 40} ${cy - 34} Z" ${shine}/>`;
    }
    case "round": {
      return `
        <circle cx="${cx}" cy="${cy}" r="46" fill="${dark}" ${outline} stroke="${rim}" stroke-width="3.5"/>
        <circle cx="${cx - 18}" cy="${cy - 14}" r="16" ${shine}/>`;
    }
    case "rectangle": {
      return `
        <rect x="${cx - 58}" y="${cy - 34}" width="116" height="68" rx="12" fill="${dark}" ${outline} stroke="${rim}" stroke-width="3.5"/>
        <rect x="${cx - 42}" y="${cy - 20}" width="34" height="12" rx="6" ${shine}/>`;
    }
    case "wayfarer": {
      return `
        <path d="M${cx - 60} ${cy - 38} Q ${cx} ${cy - 52} ${cx + 60} ${cy - 38} L ${cx + 52} ${cy + 34} Q ${cx} ${cy + 46} ${cx - 52} ${cy + 34} Z"
          fill="${dark}" ${outline} stroke="${rim}" stroke-width="3.5"/>
        <path d="M${cx - 30} ${cy - 30} L ${cx + 30} ${cy - 30} L ${cx + 22} ${cy - 6} L ${cx - 22} ${cy - 6} Z" fill="rgba(26,18,10,0.28)"/>`;
    }
  }
}

function glassesSvg(style: "aviator" | "round" | "rectangle" | "wayfarer", name: string): string {
  const lx = 128;
  const rx = 292;
  const cy = 92;
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 190" width="420" height="190">
  <g>
    ${glassLens(style, lx, cy)}
    ${glassLens(style, rx, cy)}
    <path d="M${lx + 58} ${cy - 34} Q 210 ${cy + 14} ${rx - 58} ${cy - 34}" fill="none" stroke="#C8963E" stroke-width="5" stroke-linecap="round"/>
    <path d="M${lx - 60} ${cy - 30} L ${lx - 104} ${cy - 66}" stroke="#C8963E" stroke-width="5" stroke-linecap="round"/>
    <path d="M${rx + 60} ${cy - 30} L ${rx + 104} ${cy - 66}" stroke="#C8963E" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`);
}

function clothingSvg(kind: "top" | "jacket" | "pants", colors: [string, string, string], name: string): string {
  const body = colors[0];
  const shade = colors[1];
  const accent = colors[2];
  let inner = "";
  if (kind === "top") {
    inner = `
      <path d="M95 82 L150 40 L205 82 L228 112 L198 132 L186 122 L186 262 L114 262 L114 122 L102 132 L72 112 Z" fill="${body}" stroke="#0D0A06" stroke-width="3" stroke-linejoin="round"/>
      <path d="M95 82 L72 112 L102 132 Z" fill="${shade}" opacity="0.85"/>
      <path d="M205 82 L228 112 L198 132 Z" fill="${shade}" opacity="0.85"/>
      <path d="M150 42 L150 110 L133 118 L133 66 Z" fill="${shade}" opacity="0.7"/>
      <path d="M150 42 L150 110 L167 118 L167 66 Z" fill="${shade}" opacity="0.45"/>
      <path d="M146 96 L154 96 L154 112 L146 112 Z" fill="${accent}"/>
      <rect x="150" y="150" width="8" height="112" fill="${accent}" opacity="0.55"/>`;
  } else if (kind === "jacket") {
    inner = `
      <path d="M94 96 L150 52 L206 96 L232 128 L206 150 L196 140 L190 150 L196 262 L104 262 L110 150 L104 140 L94 150 L68 128 Z" fill="${body}" stroke="#0D0A06" stroke-width="3" stroke-linejoin="round"/>
      <path d="M104 262 L104 150 L150 148 L196 150 L196 262 Z" fill="${shade}" opacity="0.55"/>
      <path d="M150 52 L150 148" stroke="#0D0A06" stroke-width="3"/>
      <path d="M94 96 L68 128 L94 150 Z" fill="${shade}" opacity="0.85"/>
      <path d="M206 96 L232 128 L206 150 Z" fill="${shade}" opacity="0.85"/>
      <path d="M94 96 L150 52 L150 148 Z" fill="${accent}" opacity="0.5"/>
      <circle cx="150" cy="120" r="6" fill="${accent}"/>
      <rect x="100" y="170" width="100" height="5" rx="2.5" fill="${accent}" opacity="0.6"/>
      <rect x="100" y="196" width="100" height="5" rx="2.5" fill="${accent}" opacity="0.6"/>`;
  } else {
    inner = `
      <path d="M96 70 L204 70 L214 262 L162 262 L150 150 L138 262 L86 262 Z" fill="${body}" stroke="#0D0A06" stroke-width="3" stroke-linejoin="round"/>
      <path d="M96 70 L204 70 L196 120 L104 120 Z" fill="${shade}" opacity="0.8"/>
      <path d="M150 70 L150 150" stroke="#0D0A06" stroke-width="2.5" stroke-dasharray="8 6"/>
      <rect x="104" y="132" width="92" height="6" rx="3" fill="${accent}" opacity="0.7"/>
      <path d="M104 120 L150 150 L150 262" fill="none" stroke="${shade}" stroke-width="2" opacity="0.7"/>
      <path d="M196 120 L150 150 L150 262" fill="none" stroke="${shade}" stroke-width="2" opacity="0.7"/>`;
  }
  return svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <g>${inner}</g>
</svg>`);
}

/**
 * Curated on-device catalog. Every image is an inline SVG data URI so the
 * catalog renders offline, never breaks on hotlinked hosts, and stays
 * untainted for canvas warping.
 */
export const PRODUCT_CATALOG: ProductItem[] = [
  {
    id: "gl-1",
    name: "Classic Aviator Sunglasses",
    brand: "ZERVEY Studio",
    category: "glasses",
    image: glassesSvg("aviator", "Aviator"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "gl-2",
    name: "Round Frames",
    brand: "ZERVEY Studio",
    category: "glasses",
    image: glassesSvg("round", "Round"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "gl-3",
    name: "Rectangle Frames",
    brand: "ZERVEY Studio",
    category: "glasses",
    image: glassesSvg("rectangle", "Rectangle"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "gl-4",
    name: "Wayfarer Frames",
    brand: "ZERVEY Studio",
    category: "glasses",
    image: glassesSvg("wayfarer", "Wayfarer"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "top-1",
    name: "Classic Crew Tee",
    brand: "ZERVEY Studio",
    category: "top",
    image: clothingSvg("top", ["#F2F0EB", "#D8D2C4", "#C8963E"], "Crew Tee"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "top-2",
    name: "Navy Tee",
    brand: "ZERVEY Studio",
    category: "top",
    image: clothingSvg("top", ["#3E5F8A", "#2C4466", "#C8963E"], "Navy Tee"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "top-3",
    name: "Burgundy Tee",
    brand: "ZERVEY Studio",
    category: "top",
    image: clothingSvg("top", ["#8A2E3A", "#6A2230", "#C8963E"], "Burgundy Tee"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "jacket-1",
    name: "Denim Jacket",
    brand: "ZERVEY Studio",
    category: "jacket",
    image: clothingSvg("jacket", ["#5B6B8C", "#3E4A63", "#C8963E"], "Denim Jacket"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "jacket-2",
    name: "Leather Jacket",
    brand: "ZERVEY Studio",
    category: "jacket",
    image: clothingSvg("jacket", ["#241812", "#4A2E1E", "#C8963E"], "Leather Jacket"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "jacket-3",
    name: "Charcoal Blazer",
    brand: "ZERVEY Studio",
    category: "jacket",
    image: clothingSvg("jacket", ["#2A2622", "#4A3E36", "#C8963E"], "Blazer"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "pants-1",
    name: "Chinos",
    brand: "ZERVEY Studio",
    category: "pants",
    image: clothingSvg("pants", ["#8A7A5F", "#6B5E46", "#C8963E"], "Chinos"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
  {
    id: "pants-2",
    name: "Indigo Jeans",
    brand: "ZERVEY Studio",
    category: "pants",
    image: clothingSvg("pants", ["#46588A", "#2E3C5C", "#C8963E"], "Jeans"),
    source: "bundled vector",
    background: "transparent",
    credit: "ZERVEY vector render",
  },
];

export const GLASSES_PRODUCTS: ProductItem[] = PRODUCT_CATALOG.filter(
  (p) => p.category === "glasses"
);

export const GARMENT_PRODUCTS = (
  kind: "top" | "jacket" | "pants"
): ProductItem[] => PRODUCT_CATALOG.filter((p) => p.category === kind);

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
 * Load a product image into an un-tainted canvas with the studio background
 * stripped (if any). Bundled SVG data-URIs load synchronously-ish and never
 * require cross-origin access.
 */
export function loadProductImage(
  item: ProductItem,
  maxSide = 900
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!item.image.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(removeProductBackground(canvas, item.background));
    };
    img.onerror = () => reject(new Error(`Failed to load product image: ${item.name}`));
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
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(removeProductBackground(canvas, detectProductBackground(canvas)));
    };
    img.onerror = () => reject(new Error(`Could not load image from that URL (blocked or invalid).`));
    img.src = url;
  });
}
