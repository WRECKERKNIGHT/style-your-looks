import * as THREE from "three";
import { computeMeasurements, type BodyParams } from "./avatar";

export type BeardStyleId =
  | "none"
  | "stubble"
  | "goatee"
  | "soul-patch"
  | "mustache"
  | "chinstrap"
  | "van-dyke"
  | "full"
  | "fuller"
  | "ducktail";

export interface BeardSpec {
  id: BeardStyleId;
  name: string;
  jawRows: number;
  jawRadius: number; // fraction of H per clump
  jawGap: number; // fraction of H, z offset off the face
  mustache: boolean;
  chin: boolean;
  chinRadius: number;
  cheeks: boolean;
  sparse?: boolean;
  extended?: boolean;
}

export const BEARD_STYLES: BeardSpec[] = [
  { id: "none", name: "Clean Shaven", jawRows: 0, jawRadius: 0, jawGap: 0, mustache: false, chin: false, chinRadius: 0, cheeks: false },
  { id: "stubble", name: "Stubble", jawRows: 1, jawRadius: 0.008, jawGap: 0.002, mustache: false, chin: false, chinRadius: 0, cheeks: true, sparse: true },
  { id: "goatee", name: "Goatee", jawRows: 0, jawRadius: 0, jawGap: 0, mustache: true, chin: true, chinRadius: 0.013, cheeks: false },
  { id: "soul-patch", name: "Soul Patch", jawRows: 0, jawRadius: 0, jawGap: 0, mustache: false, chin: true, chinRadius: 0.008, cheeks: false },
  { id: "mustache", name: "Mustache", jawRows: 0, jawRadius: 0, jawGap: 0, mustache: true, chin: false, chinRadius: 0, cheeks: false },
  { id: "chinstrap", name: "Chinstrap", jawRows: 1, jawRadius: 0.01, jawGap: 0.003, mustache: false, chin: false, chinRadius: 0, cheeks: false },
  { id: "van-dyke", name: "Van Dyke", jawRows: 0, jawRadius: 0, jawGap: 0, mustache: true, chin: true, chinRadius: 0.012, cheeks: false },
  { id: "full", name: "Full Beard", jawRows: 2, jawRadius: 0.013, jawGap: 0.004, mustache: true, chin: true, chinRadius: 0.012, cheeks: true },
  { id: "fuller", name: "Fuller Beard", jawRows: 3, jawRadius: 0.016, jawGap: 0.005, mustache: true, chin: true, chinRadius: 0.014, cheeks: true },
  { id: "ducktail", name: "Ducktail", jawRows: 3, jawRadius: 0.015, jawGap: 0.005, mustache: true, chin: true, chinRadius: 0.014, cheeks: true, extended: true },
];

export const BEARD_COLORS: { id: string; name: string; color: string }[] = [
  { id: "black", name: "Black", color: "#17140F" },
  { id: "dark-brown", name: "Dark Brown", color: "#2E2118" },
  { id: "chestnut", name: "Chestnut", color: "#5A3A24" },
  { id: "auburn", name: "Auburn", color: "#7A3E2E" },
  { id: "ginger", name: "Ginger", color: "#A6502E" },
  { id: "blonde", name: "Blonde", color: "#C8963E" },
  { id: "grey", name: "Silver Grey", color: "#9A958A" },
  { id: "white", name: "White", color: "#E4DDD2" },
];

function beardMaterial(color: string): THREE.Material {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.88,
    metalness: 0.0,
    clearcoat: 0.05,
  });
}

/**
 * Build a parametric beard fitted to the avatar's head. Facial hair is
 * rendered as a cluster of small shells that hug the front-lower face, so no
 * texture or external asset is needed and each style stays fully editable.
 */
export function buildBeard(params: BodyParams, style: BeardStyleId, color: string): THREE.Group {
  const m = computeMeasurements(params);
  const spec = BEARD_STYLES.find((s) => s.id === style) ?? BEARD_STYLES[0];
  const root = new THREE.Group();
  if (spec.id === "none" || (spec.jawRows <= 0 && !spec.mustache && !spec.chin && !spec.cheeks)) {
    return root;
  }

  const H = m.H;
  const R = m.headRadius;
  const Ry = R * 1.2;
  const Rz = R * 0.9;
  const headCY = m.chinY + m.headHeight * 0.46;
  const mat = beardMaterial(color);

  const faceFrontZ = (y: number) => {
    const dy = (y - headCY) / Ry;
    if (Math.abs(dy) >= 1) return 0;
    return Rz * Math.sqrt(1 - dy * dy);
  };

  const addClump = (x: number, y: number, z: number, radius: number, tall = 1, scale = 1) => {
    const clump = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), mat);
    clump.position.set(x, y, z);
    if (tall !== 1 || scale !== 1) clump.scale.set(scale, tall, scale);
    root.add(clump);
  };

  // Jaw arc: t = 0 at the chin, t = 1 at the cheekbone.
  const jawArc = (side: number, rows: number, radius: number, gap: number, sparse?: boolean) => {
    const count = sparse ? 5 : 8;
    for (let r = 0; r < rows; r++) {
      const rowT = rows === 1 ? 0 : r / (rows - 1);
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const y = (0.363 + 0.079 * t) * H + rowT * 0.006 * H;
        const x = side * R * (0.05 + 0.6 * t) * (1 + rowT * 0.18);
        const z = faceFrontZ(y) + gap + rowT * 0.006 * H;
        addClump(x, y, z, radius * (1 + rowT * 0.25), 1, 1 + rowT * 0.2);
      }
    }
  };

  const chinCluster = (radius: number, tall = 1) => {
    const cy = 0.368 * H;
    const cz = faceFrontZ(cy) + 0.012 * H;
    addClump(0, cy, cz, radius, tall);
    addClump(-0.012 * H, cy + 0.003 * H, cz, radius * 0.75);
    addClump(0.012 * H, cy + 0.003 * H, cz, radius * 0.75);
  };

  const mustache = () => {
    const my = 0.412 * H;
    const mz = faceFrontZ(my) + 0.006 * H;
    for (const s of [-1, 1]) {
      const pts: [number, number][] = [
        [0.02, 0],
        [0.036, -0.002],
        [0.05, 0.004],
      ];
      for (const [dx, dy] of pts) {
        addClump(s * dx * H, my + dy * H, mz + Math.abs(dx) * 0.05, 0.011 * H, 1.25);
      }
    }
  };

  const cheekPatches = (radius: number) => {
    for (const s of [-1, 1]) {
      for (const [fy, fzOff, r] of [
        [0.424, 0.003, radius * 0.85],
        [0.435, 0.004, radius * 0.7],
      ] as [number, number, number][]) {
        const y = fy * H;
        addClump(s * 0.55 * R, y, faceFrontZ(y) + fzOff, r);
      }
    }
  };

  if (spec.jawRows > 0) {
    for (const s of [-1, 1]) {
      jawArc(s, spec.jawRows, spec.jawRadius, spec.jawGap, spec.sparse);
    }
  }
  if (spec.cheeks) cheekPatches(spec.jawRadius || 0.012);
  if (spec.mustache) mustache();
  if (spec.chin) chinCluster(spec.chinRadius, spec.id === "van-dyke" ? 1.7 : 1.15);

  if (spec.extended) {
    const ext = new THREE.Mesh(new THREE.CapsuleGeometry(0.011 * H, 0.022 * H, 6, 12), mat);
    ext.position.set(0, 0.35 * H, 0.014 * H);
    ext.rotation.x = 0.12;
    root.add(ext);
  }

  return root;
}
