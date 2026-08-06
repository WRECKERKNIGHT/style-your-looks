import * as THREE from "three";

/**
 * Build a smooth shell (sleeve, skirt, torso...) from a stack of elliptical rings.
 * Rings run bottom -> top along +Y. Each ring is an ellipse with half-width `x`
 * and half-depth `z`, both resolved per-y so garments track body shape.
 */
export interface RingStackOptions {
  rings?: number;
  segments?: number;
  capBottom?: boolean;
  capTop?: boolean;
}

export function buildRingStack(
  widthFn: (y: number) => number,
  depthFn: (y: number) => number,
  yStart: number,
  yEnd: number,
  options: RingStackOptions = {}
): THREE.BufferGeometry {
  const { rings = 24, segments = 48, capBottom = false, capTop = false } = options;
  const positions: number[] = [];
  const uvs: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const t = rings === 0 ? 0 : r / rings;
    const y = yStart + (yEnd - yStart) * t;
    const w = widthFn(y);
    const d = depthFn(y);
    for (let s = 0; s < segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      positions.push(c * w, y, sn * d);
      uvs.push(s / segments, t);
    }
  }

  const indices: number[] = [];
  for (let r = 0; r < rings; r++) {
    const rowA = r * segments;
    const rowB = (r + 1) * segments;
    for (let s = 0; s < segments; s++) {
      const s2 = (s + 1) % segments;
      const a = rowA + s;
      const b = rowA + s2;
      const c = rowB + s;
      const d = rowB + s2;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const segCount = segments;
  const bottomY = yStart;
  const topY = yEnd;

  if (capBottom) {
    const center = positions.length / 3;
    positions.push(0, bottomY, 0);
    uvs.push(0.5, 0);
    for (let s = 0; s < segCount; s++) {
      const s2 = (s + 1) % segCount;
      indices.push(center, s2, s);
    }
  }
  if (capTop) {
    const center = positions.length / 3;
    const topRow = rings * segCount;
    positions.push(0, topY, 0);
    uvs.push(0.5, 1);
    for (let s = 0; s < segCount; s++) {
      const s2 = (s + 1) % segCount;
      indices.push(topRow + s, topRow + s2, center);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Conformal garment shell: takes a body measurement function and returns a
 * width/depth function that hugs the body with a fit offset.
 */
export function fitShell(
  measurements: {
    halfWidth: (y: number) => number;
    halfDepth: (y: number) => number;
  },
  offset: number
): {
  width: (y: number) => number;
  depth: (y: number) => number;
} {
  return {
    width: (y: number) => measurements.halfWidth(y) + offset,
    depth: (y: number) => measurements.halfDepth(y) + offset * 0.8,
  };
}

/** Canvas-based fabric texture: solid, stripe, check, denim, camo, knit. */
export function fabricTexture(color: string, pattern: "solid" | "stripe" | "check" | "denim" | "camo" | "knit"): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  const adjust = (hex: string, amt: number) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return `rgb(${r},${g},${b})`;
  };

  if (pattern === "solid") {
    ctx.fillStyle = adjust(color, 8);
    for (let i = 0; i < 260; i++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
  } else if (pattern === "stripe") {
    ctx.fillStyle = adjust(color, -18);
    for (let x = 0; x < size; x += 16) ctx.fillRect(x, 0, 7, size);
  } else if (pattern === "check") {
    ctx.fillStyle = adjust(color, -22);
    for (let x = 0; x < size; x += 32) {
      for (let y = 0; y < size; y += 32) {
        if (((x + y) / 32) % 2 === 0) ctx.fillRect(x, y, 32, 32);
      }
    }
  } else if (pattern === "denim") {
    ctx.strokeStyle = adjust(color, -20);
    ctx.lineWidth = 2;
    for (let x = -size; x < size * 2; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 8, size);
      ctx.stroke();
    }
  } else if (pattern === "camo") {
    const blobs = ["#4a4a3a", "#5c5c44", "#6b6b4f", "#3e3e30"];
    for (const b of blobs) {
      ctx.fillStyle = b;
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, Math.random() * size, 10 + Math.random() * 14, 7 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === "knit") {
    ctx.strokeStyle = adjust(color, -14);
    ctx.lineWidth = 2;
    for (let y = 0; y < size; y += 8) {
      ctx.beginPath();
      for (let x = 0; x <= size; x += 4) {
        const yy = y + (Math.floor(x / 8) % 2 === 0 ? 3 : -3);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft warm rim light material shared across the studio. */
export function garmentMaterial(color: string, pattern: "solid" | "stripe" | "check" | "denim" | "camo" | "knit", roughness = 0.9): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    roughness,
    metalness: 0.0,
    map: fabricTexture(color, pattern),
  });
  mat.color.setHex(0xffffff);
  return mat;
}
