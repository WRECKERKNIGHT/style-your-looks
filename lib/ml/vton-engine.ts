import { detectPoseOnly } from "./body-analyzer";
import { segmentPerson, PersonCategory } from "./segmenter";

export type GarmentType = "top" | "jacket" | "pants";
export type VtonLayer = "original" | "warp" | "final";

export interface VtonRequest {
  photo: HTMLImageElement | HTMLCanvasElement;
  garment: HTMLImageElement | HTMLCanvasElement;
  type: GarmentType;
}

export interface VtonResult {
  original: HTMLCanvasElement;
  warp: HTMLCanvasElement;
  final: HTMLCanvasElement;
  fitSuggestion: string;
  fitReason: string;
  shoulderCm: number;
}

const MAX_SIDE = 1100;

type Mat3 = number[];

function solve8(a: number[][], b: number[]): number[] {
  const n = 8;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = -1;
    for (let r = col; r < n; r++) {
      if (Math.abs(m[r][col]) > 1e-9) { pivot = r; break; }
    }
    if (pivot === -1) throw new Error("Singular homography system.");
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const pv = m[col][col];
    for (let j = col; j <= n; j++) m[col][j] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col];
      if (Math.abs(f) < 1e-12) continue;
      for (let j = col; j <= n; j++) m[r][j] -= f * m[col][j];
    }
  }
  return m.map((row) => row[n]);
}

export function computeHomography(
  sx: number[], sy: number[],
  dx: number[], dy: number[]
): Mat3 {
  const A: number[][] = [];
  const B: number[] = [];
  for (let i = 0; i < 4; i++) {
    const x = sx[i], y = sy[i], X = dx[i], Y = dy[i];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]);
    B.push(X);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]);
    B.push(Y);
  }
  const h = solve8(A, B);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function matInv(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) throw new Error("Non-invertible homography.");
  const id = 1 / det;
  return [
    (e * i - f * h) * id, (c * h - b * i) * id, (b * f - c * e) * id,
    (f * g - d * i) * id, (a * i - c * g) * id, (c * d - a * f) * id,
    (d * h - e * g) * id, (b * g - a * h) * id, (a * e - b * d) * id,
  ];
}

function applyH(m: Mat3, x: number, y: number): [number, number] {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
}

export function warpHomography(
  src: HTMLCanvasElement,
  H: Mat3,
  dest: HTMLCanvasElement
): void {
  const Hinv = matInv(H);
  const sctx = src.getContext("2d")!;
  const sw = src.width;
  const sh = src.height;
  const sdata = sctx.getImageData(0, 0, sw, sh).data;
  const dw = dest.width;
  const dh = dest.height;
  const dctx = dest.getContext("2d")!;
  const out = dctx.createImageData(dw, dh);
  const od = out.data;

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const [sxf, syf] = applyH(Hinv, x, y);
      const o = (y * dw + x) * 4;
      if (sxf < 0 || syf < 0 || sxf >= sw - 1 || syf >= sh - 1) {
        od[o + 3] = 0;
        continue;
      }
      const x0 = Math.floor(sxf);
      const y0 = Math.floor(syf);
      const fx = sxf - x0;
      const fy = syf - y0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x0 + 1) * 4;
      const i01 = ((y0 + 1) * sw + x0) * 4;
      const i11 = ((y0 + 1) * sw + x0 + 1) * 4;
      const a00 = sdata[i00 + 3] / 255;
      const a10 = sdata[i10 + 3] / 255;
      const a01 = sdata[i01 + 3] / 255;
      const a11 = sdata[i11 + 3] / 255;
      const aTop = a00 * (1 - fx) + a10 * fx;
      const aBot = a01 * (1 - fx) + a11 * fx;
      const alpha = aTop * (1 - fy) + aBot * fy;
      if (alpha < 0.02) {
        od[o + 3] = 0;
        continue;
      }
      for (let c = 0; c < 3; c++) {
        const vTop = sdata[i00 + c] * (1 - fx) + sdata[i10 + c] * fx;
        const vBot = sdata[i01 + c] * (1 - fx) + sdata[i11 + c] * fx;
        od[o + c] = (vTop * (1 - fy) + vBot * fy);
      }
      od[o + 3] = alpha * 255;
    }
  }
  dctx.putImageData(out, 0, 0);
}

export function fitFromShoulder(shoulderCm: number): { size: string; reason: string } {
  const size =
    shoulderCm < 40 ? "S" : shoulderCm < 45 ? "M" : shoulderCm < 50 ? "L" : shoulderCm < 55 ? "XL" : "XXL";
  const reason =
    shoulderCm < 40
      ? `At ${shoulderCm}cm shoulders, S gives a relaxed, structured fit.`
      : shoulderCm < 45
      ? `At ${shoulderCm}cm shoulders, M sits cleanly at the shoulder seam.`
      : shoulderCm < 50
      ? `At ${shoulderCm}cm shoulders, L offers a roomy athletic fit.`
      : shoulderCm < 55
      ? `At ${shoulderCm}cm shoulders, XL fits without pulling at the seams.`
      : `At ${shoulderCm}cm shoulders, XXL keeps a comfortable drape.`;
  return { size, reason };
}

function maskCoverage(mask: HTMLCanvasElement): number {
  const mctx = mask.getContext("2d")!;
  const data = mctx.getImageData(0, 0, mask.width, mask.height).data;
  let on = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) on++;
  return on / (mask.width * mask.height);
}

function scaleImage(
  img: HTMLImageElement | HTMLCanvasElement
): { canvas: HTMLCanvasElement; scale: number } {
  const canvas = document.createElement("canvas");
  const iw = "naturalWidth" in img ? img.naturalWidth : img.width;
  const ih = "naturalHeight" in img ? img.naturalHeight : img.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(iw, ih));
  canvas.width = Math.round(iw * scale);
  canvas.height = Math.round(ih * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, scale };
}

export async function runVton(req: VtonRequest): Promise<VtonResult> {
  const { photo, garment, type } = req;
  const base = scaleImage(photo);
  const canvas = base.canvas;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d")!;

  const pose = await detectPoseOnly(canvas);
  const seg = await segmentPerson(canvas);

  if (maskCoverage(seg.personMask) < 0.01) {
    throw new Error("No person detected in this photo — upload a full-body shot.");
  }

  const segCv = document.createElement("canvas");
  segCv.width = w;
  segCv.height = h;
  const sctx = segCv.getContext("2d")!;
  sctx.drawImage(seg.clothesMask, 0, 0, seg.width, seg.height, 0, 0, w, h);
  sctx.globalCompositeOperation = "source-over";
  sctx.drawImage(seg.skinMask, 0, 0, seg.width, seg.height, 0, 0, w, h);
  sctx.drawImage(seg.personMask, 0, 0, seg.width, seg.height, 0, 0, w, h);

  const P = (i: number) => pose[i] ? [pose[i][0] * w, pose[i][1] * h] as [number, number] : null;
  const ls = P(11);
  const rs = P(12);
  const lh = P(23);
  const rh = P(24);
  const lAnk = P(27);
  const rAnk = P(28);

  let quad: [number, number][];
  if (!ls || !rs || !lh || !rh) {
    quad = [[0.2 * w, 0.3 * h], [0.8 * w, 0.3 * h], [0.8 * w, 0.7 * h], [0.2 * w, 0.7 * h]];
  } else if (type === "pants") {
    const waistL: [number, number] = [lh[0], lh[1]];
    const waistR: [number, number] = [rh[0], rh[1]];
    const ankleL: [number, number] = lAnk ? [lAnk[0], lAnk[1]] : [lh[0], lh[1] + 0.5 * h];
    const ankleR: [number, number] = rAnk ? [rAnk[0], rAnk[1]] : [rh[0], rh[1] + 0.5 * h];
    quad = [waistL, waistR, ankleR, ankleL];
  } else {
    const oversize = type === "jacket" ? 1.08 : 1.02;
    const midX = (ls[0] + rs[0]) / 2;
    const midY = (ls[1] + rs[1]) / 2;
    const shoulderSpan = Math.hypot(rs[0] - ls[0], rs[1] - ls[1]) * oversize;
    const halfSpan = shoulderSpan / 2;
    const neckY = midY - shoulderSpan * 0.12;
    const topL: [number, number] = [midX - halfSpan, neckY];
    const topR: [number, number] = [midX + halfSpan, neckY];
    const hipSpan = Math.hypot(rh[0] - lh[0], rh[1] - lh[1]) * oversize * 0.96;
    const halfHip = hipSpan / 2;
    const hipY = (lh[1] + rh[1]) / 2;
    const botL: [number, number] = [midX - halfHip, hipY];
    const botR: [number, number] = [midX + halfHip, hipY];
    quad = [topL, topR, botR, botL];
  }

  const garmentCv = scaleImage(garment);
  const gw = garmentCv.canvas.width;
  const gh = garmentCv.canvas.height;

  const srcCorners = [0, 0, gw, 0, gw, gh, 0, gh];
  const destCorners = [quad[0][0], quad[0][1], quad[1][0], quad[1][1], quad[2][0], quad[2][1], quad[3][0], quad[3][1]];
  const H = computeHomography(
    [srcCorners[0], srcCorners[2], srcCorners[4], srcCorners[6]],
    [srcCorners[1], srcCorners[3], srcCorners[5], srcCorners[7]],
    [destCorners[0], destCorners[2], destCorners[4], destCorners[6]],
    [destCorners[1], destCorners[3], destCorners[5], destCorners[7]]
  );

  const warp = document.createElement("canvas");
  warp.width = w;
  warp.height = h;
  warpHomography(garmentCv.canvas, H, warp);

  const torsoPath = (g: CanvasRenderingContext2D) => {
    g.beginPath();
    g.moveTo(quad[0][0], quad[0][1]);
    g.lineTo(quad[1][0], quad[1][1]);
    g.lineTo(quad[2][0], quad[2][1]);
    g.lineTo(quad[3][0], quad[3][1]);
    g.closePath();
  };

  const clipCv = document.createElement("canvas");
  clipCv.width = w;
  clipCv.height = h;
  const cctx = clipCv.getContext("2d")!;
  cctx.drawImage(seg.personMask, 0, 0, seg.width, seg.height, 0, 0, w, h);
  cctx.globalCompositeOperation = "source-in";
  torsoPath(cctx);
  cctx.fillStyle = "rgba(255,255,255,1)";
  cctx.fill();

  const warpClip = document.createElement("canvas");
  warpClip.width = w;
  warpClip.height = h;
  const wctx = warpClip.getContext("2d")!;
  wctx.drawImage(clipCv, 0, 0);
  wctx.globalCompositeOperation = "destination-in";
  wctx.drawImage(warp, 0, 0);

  const target = document.createElement("canvas");
  target.width = w;
  target.height = h;
  const tctx = target.getContext("2d")!;
  tctx.drawImage(canvas, 0, 0);

  let meanLum = 0;
  let meanCount = 0;
  const idata = tctx.getImageData(0, 0, w, h).data;
  const cats = seg.categories;
  const cw = seg.width;
  const ch = seg.height;
  for (let y = 0; y < h; y++) {
    const my = Math.min(ch - 1, Math.floor((y / h) * ch));
    for (let x = 0; x < w; x++) {
      const mx = Math.min(cw - 1, Math.floor((x / w) * cw));
      if (cats[my * cw + mx] === PersonCategory.Clothes) {
        const o = (y * w + x) * 4;
        meanLum += 0.2126 * idata[o] + 0.7152 * idata[o + 1] + 0.0722 * idata[o + 2];
        meanCount++;
      }
    }
  }
  const targetLum = meanCount ? meanLum / meanCount : 128;

  let garmentLum = 0;
  let gCount = 0;
  const gdata = warpClip.getContext("2d")!.getImageData(0, 0, w, h).data;
  for (let i = 0; i < gdata.length; i += 4) {
    if (gdata[i + 3] > 0) {
      garmentLum += 0.2126 * gdata[i] + 0.7152 * gdata[i + 1] + 0.0722 * gdata[i + 2];
      gCount++;
    }
  }
  const garmentLumAvg = gCount ? garmentLum / gCount : 128;
  const brightness = Math.max(0.5, Math.min(1.6, targetLum / Math.max(1, garmentLumAvg)));

  const final = document.createElement("canvas");
  final.width = w;
  final.height = h;
  const fctx = final.getContext("2d")!;
  fctx.drawImage(canvas, 0, 0);
  fctx.save();
  fctx.filter = `brightness(${brightness})`;
  fctx.drawImage(warpClip, 0, 0);
  fctx.restore();

  const shoulderPx = ls && rs ? Math.hypot(rs[0] - ls[0], rs[1] - ls[1]) : w * 0.3;
  const shoulderCm = Math.round((shoulderPx / h) * 170);
  const { size, reason } = fitFromShoulder(shoulderCm);

  return {
    original: canvas,
    warp: warpClip,
    final,
    fitSuggestion: size,
    fitReason: reason,
    shoulderCm,
  };
}
