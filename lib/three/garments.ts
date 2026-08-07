import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { buildRingStack, garmentMaterial, type RingStackOptions } from "./geometry";
import {
  armPoints,
  computeMeasurements,
  torsoHalfWidth,
  torsoHalfDepth,
  type BodyMeasurements,
  type BodyParams,
} from "./avatar";

export type GarmentKind =
  | "tshirt"
  | "polo"
  | "longsleeve"
  | "henley"
  | "turtleneck"
  | "tank"
  | "flannel"
  | "jacket"
  | "bomber"
  | "puffer"
  | "overcoat"
  | "hoodie"
  | "blazer"
  | "pants"
  | "jeans"
  | "joggers"
  | "cargo"
  | "sweatpants"
  | "shorts"
  | "dress"
  | "skirt";
export type FabricPattern = "solid" | "stripe" | "check" | "denim" | "camo" | "knit" | "quilt" | "heather";
export type GarmentLayer = "top" | "bottom" | "outerwear" | "dress";

export interface GarmentSpec {
  id: string;
  name: string;
  kind: GarmentKind;
  layer: GarmentLayer;
  colors: string[];
  pattern: FabricPattern;
}

export interface GarmentOptions {
  kind: GarmentKind;
  color: string;
  pattern?: FabricPattern;
  fit?: number; // meters of ease; negative = tight
}

const gltfCache = new Map<string, Promise<THREE.Group>>();

/**
 * Loads a glTF/GLB garment from a URL (local bundle or remote CDN), cached by
 * URL and returned as a fresh clone per caller. Callers that need a full body
 * fallback can catch the rejection and use buildGarment() instead.
 */
export async function loadGarmentGltf(url: string): Promise<THREE.Group> {
  let pending = gltfCache.get(url);
  if (!pending) {
    pending = new Promise<THREE.Group>((resolve, reject) => {
      new GLTFLoader().load(
        url,
        (gltf) => resolve(gltf.scene),
        undefined,
        (err) => reject(err instanceof Error ? err : new Error("Failed to load GLB garment"))
      );
    });
    gltfCache.set(url, pending);
  }
  const scene = await pending;
  return scene.clone(true);
}

export const GARMENT_CATALOG: GarmentSpec[] = [
  { id: "tshirt-white", name: "Classic Tee", kind: "tshirt", layer: "top", colors: ["#F2F0EB", "#2A2622", "#B23A2E", "#3E5F8A", "#6B7A45"], pattern: "solid" },
  { id: "tshirt-stripe", name: "Striped Tee", kind: "tshirt", layer: "top", colors: ["#E9E4D8", "#8AA0B8", "#B23A2E"], pattern: "stripe" },
  { id: "polo", name: "Polo", kind: "polo", layer: "top", colors: ["#7A9E6B", "#3E5F8A", "#C8963E"], pattern: "solid" },
  { id: "longsleeve", name: "Long Sleeve", kind: "longsleeve", layer: "top", colors: ["#2A2622", "#F2F0EB", "#6B4A3A"], pattern: "solid" },
  { id: "henley", name: "Henley", kind: "henley", layer: "top", colors: ["#6B7A45", "#8A5F3D", "#3A3A3A"], pattern: "heather" },
  { id: "turtleneck", name: "Turtleneck", kind: "turtleneck", layer: "top", colors: ["#2A2622", "#8A2E3A", "#3E5F8A"], pattern: "solid" },
  { id: "tank", name: "Tank Top", kind: "tank", layer: "top", colors: ["#F2F0EB", "#B23A2E", "#3E5F8A"], pattern: "solid" },
  { id: "flannel", name: "Flannel Shirt", kind: "flannel", layer: "top", colors: ["#8A4A3A", "#4A3E36", "#3E5F8A"], pattern: "check" },
  { id: "hoodie", name: "Hoodie", kind: "hoodie", layer: "outerwear", colors: ["#3A3A3A", "#6B4A3A", "#3E5F8A"], pattern: "solid" },
  { id: "jacket-denim", name: "Denim Jacket", kind: "jacket", layer: "outerwear", colors: ["#5B6B8C", "#3E4A63", "#7A8AA8"], pattern: "denim" },
  { id: "jacket-leather", name: "Leather Jacket", kind: "jacket", layer: "outerwear", colors: ["#241812", "#4A2E1E", "#2A1E14"], pattern: "solid" },
  { id: "bomber", name: "Bomber Jacket", kind: "bomber", layer: "outerwear", colors: ["#5A6B4A", "#2E2A24", "#4A4A5A"], pattern: "solid" },
  { id: "puffer", name: "Puffer Vest", kind: "puffer", layer: "outerwear", colors: ["#C8963E", "#3E5F8A", "#2A2622"], pattern: "quilt" },
  { id: "overcoat", name: "Overcoat", kind: "overcoat", layer: "outerwear", colors: ["#3A3630", "#2E2A24", "#5A5248"], pattern: "solid" },
  { id: "blazer", name: "Blazer", kind: "blazer", layer: "outerwear", colors: ["#2A2622", "#4A3E36", "#3E5F8A"], pattern: "solid" },
  { id: "pants", name: "Chinos", kind: "pants", layer: "bottom", colors: ["#8A7A5F", "#4A4438", "#2E2A24"], pattern: "solid" },
  { id: "jeans", name: "Jeans", kind: "jeans", layer: "bottom", colors: ["#46588A", "#5B6B8C", "#1E2A44"], pattern: "denim" },
  { id: "cargo", name: "Cargo Pants", kind: "cargo", layer: "bottom", colors: ["#6B7A45", "#8A7A5F", "#2E2A24"], pattern: "solid" },
  { id: "joggers", name: "Joggers", kind: "joggers", layer: "bottom", colors: ["#3A3A3A", "#5A4A3A", "#2A2A3A"], pattern: "solid" },
  { id: "sweatpants", name: "Sweatpants", kind: "sweatpants", layer: "bottom", colors: ["#4A4A55", "#5A4A3A", "#3A3A3A"], pattern: "heather" },
  { id: "shorts", name: "Shorts", kind: "shorts", layer: "bottom", colors: ["#6B7A45", "#8A7A5F", "#3E5F8A"], pattern: "solid" },
  { id: "dress", name: "A-Line Dress", kind: "dress", layer: "dress", colors: ["#8A2E3A", "#3E5F8A", "#2A2622"], pattern: "solid" },
  { id: "skirt", name: "Pleated Skirt", kind: "skirt", layer: "dress", colors: ["#5A3A4A", "#3E5F8A", "#6B7A45"], pattern: "check" },
];

function sleeveCapsule(
  parent: THREE.Object3D,
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  material: THREE.Material
) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  const geo = new THREE.CapsuleGeometry(radius, Math.max(0.0001, length - radius * 2), 8, 16);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(mesh);
}

function collar(parent: THREE.Object3D, y: number, radius: number, color: string, m: BodyMeasurements) {
  const mat = garmentMaterial(color, "solid");
  const torus = new THREE.Mesh(new THREE.TorusGeometry(radius, m.H * 0.007, 10, 32), mat);
  torus.position.y = y;
  torus.rotation.x = Math.PI / 2;
  torus.scale.set(1, 0.72, 1);
  parent.add(torus);
}

function waistband(parent: THREE.Object3D, y: number, width: number, depth: number, color: string, m: BodyMeasurements) {
  const mat = garmentMaterial(color, "solid");
  const ring = new THREE.Mesh(new THREE.TorusGeometry(width * 0.92, m.H * 0.008, 8, 32), mat);
  ring.position.y = y;
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(1, depth / width, 1);
  parent.add(ring);
}

function legShells(
  parent: THREE.Object3D,
  m: BodyMeasurements,
  top: number,
  bottom: number,
  fit: number,
  material: THREE.Material,
  taperTop?: number
) {
  const thighR = m.thighRadius + fit;
  const shinR = m.shinRadius + fit;
  for (const s of [-1, 1]) {
    const hip = new THREE.Vector3(s * m.hipHalf * 0.72, m.crotchY, 0);
    const knee = new THREE.Vector3(s * m.hipHalf * 0.78, m.kneeY, 0);
    const ankle = new THREE.Vector3(s * m.hipHalf * 0.68, m.ankleY, 0);
    const topR = taperTop !== undefined ? taperTop : thighR;
    sleeveCapsule(parent, hip, knee, topR, material);
    sleeveCapsule(parent, knee, ankle, shinR, material);
  }
}

export function buildGarment(params: BodyParams, options: GarmentOptions): THREE.Group {
  const m = computeMeasurements(params);
  const root = new THREE.Group();
  const fit = options.fit ?? 0.008;
  const pattern = options.pattern ?? "solid";
  const color = options.color;
  const mat = garmentMaterial(color, pattern);
  const matDark = garmentMaterial(color, pattern, 0.95);
  const H = m.H;

  switch (options.kind) {
    case "tshirt":
    case "polo":
    case "longsleeve":
    case "henley":
    case "turtleneck":
    case "tank":
    case "flannel": {
      const kind = options.kind;
      const isPolo = kind === "polo";
      const isTank = kind === "tank";
      const isTurtle = kind === "turtleneck";
      const isHenley = kind === "henley";
      const isFlannel = kind === "flannel";
      const isLong = kind === "longsleeve" || isHenley || isTurtle || isFlannel;
      const topY = m.shoulderY * 0.99;
      const hemY = m.waistY - 0.02 * H;
      const torso = new THREE.Mesh(
        buildRingStack(
          (y) => torsoHalfWidth(m, y) + fit,
          (y) => torsoHalfDepth(m, y) + fit * 0.8,
          hemY,
          topY,
          { rings: 16, segments: 40, capTop: false } as RingStackOptions
        ),
        mat
      );
      root.add(torso);
      // sleeves
      if (!isTank) {
        const sleeveR = m.armRadius + fit;
        for (const s of [-1, 1]) {
          const { shoulder, elbow, wrist } = armPoints(m, s);
          const end = isLong ? wrist : elbow;
          sleeveCapsule(root, shoulder, end, sleeveR, mat);
        }
      }
      // collar / neckline
      if (isTurtle) {
        const collarMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(m.neckHalf * 0.85 + fit, m.neckHalf * 0.85 + fit, 0.045 * H, 24, 1, true),
          matDark
        );
        collarMesh.position.y = topY + 0.03 * H;
        root.add(collarMesh);
      } else if (isPolo || isHenley || isFlannel) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(m.neckHalf * 0.95 + fit, m.neckHalf * 0.8 + fit, 0.02 * H, 24, 1, true), mat);
        c.position.y = topY + 0.012 * H;
        root.add(c);
        // front placket
        const pl = new THREE.Mesh(new THREE.BoxGeometry(0.012 * H, 0.03 * H, 0.004 * H), matDark);
        pl.position.set(0, (topY + hemY) / 2, m.chestDepth + fit * 0.8 + 0.002 * H);
        root.add(pl);
        if (isHenley || isFlannel) {
          const btnMat = garmentMaterial("#E9E4D8", "solid");
          for (const s of [-1, 1]) {
            const btn = new THREE.Mesh(new THREE.SphereGeometry(H * 0.004, 10, 8), btnMat);
            btn.position.set(s * 0.004 * H, topY - 0.025 * H - 0.012 * H, m.chestDepth + fit * 0.8 + 0.0035 * H);
            root.add(btn);
          }
        }
      } else if (isTank) {
        // shoulder straps
        const strapMat = garmentMaterial(color, "solid");
        for (const s of [-1, 1]) {
          const strap = new THREE.Mesh(new THREE.BoxGeometry(H * 0.008, 0.022 * H, H * 0.004), strapMat);
          strap.position.set(s * m.shoulderHalf * 0.52, topY + 0.012 * H, 0);
          root.add(strap);
        }
      } else {
        collar(root, topY + 0.01 * H, m.neckHalf * 0.9 + fit, color, m);
      }
      break;
    }
    case "jacket":
    case "bomber":
    case "puffer":
    case "overcoat":
    case "blazer": {
      const isBlazer = options.kind === "blazer";
      const isOvercoat = options.kind === "overcoat";
      const isBomber = options.kind === "bomber";
      const isPuffer = options.kind === "puffer";
      const topY = m.shoulderY * 1.01;
      const hemY = isOvercoat ? m.kneeY + 0.04 * H : isBlazer ? m.hipY - 0.005 * H : isBomber ? m.hipY - 0.012 * H : m.hipY - 0.01 * H;
      const fit2 = isOvercoat ? 0.02 : isBlazer ? 0.014 : isPuffer ? 0.022 : 0.012;
      const torso = new THREE.Mesh(
        buildRingStack(
          (y) => torsoHalfWidth(m, y) + fit2,
          (y) => torsoHalfDepth(m, y) + fit2 * 0.8,
          hemY,
          topY,
          { rings: 18, segments: 40 } as RingStackOptions
        ),
        mat
      );
      root.add(torso);
      const sleeveR = m.armRadius + fit2;
      for (const s of [-1, 1]) {
        const { shoulder, wrist } = armPoints(m, s);
        sleeveCapsule(root, shoulder, wrist, sleeveR, mat);
      }
      collar(root, topY + 0.012 * H, m.neckHalf * 0.95 + fit2, color, m);
      if (isBomber) {
        // ribbed stand collar + waist + cuffs
        const ribMat = garmentMaterial(color, "solid", 0.75);
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(m.neckHalf * 1.0 + fit2, m.neckHalf * 0.9 + fit2, 0.035 * H, 24, 1, true), ribMat);
        stand.position.y = topY + 0.026 * H;
        root.add(stand);
        waistband(root, hemY + 0.008 * H, torsoHalfWidth(m, hemY) + fit2, torsoHalfDepth(m, hemY) + fit2 * 0.8, color, m);
        for (const s of [-1, 1]) {
          const { wrist } = armPoints(m, s);
          const cuff = new THREE.Mesh(new THREE.TorusGeometry(m.forearmRadius + fit2, H * 0.007, 8, 20), ribMat);
          cuff.position.copy(wrist);
          cuff.rotation.x = Math.PI / 2;
          root.add(cuff);
        }
        const zipper = new THREE.Mesh(new THREE.BoxGeometry(H * 0.003, (topY - hemY) * 0.9, H * 0.004), garmentMaterial("#2A2622", "solid"));
        zipper.position.set(0, (topY + hemY) / 2, m.chestDepth + fit2 * 0.8 + H * 0.002);
        root.add(zipper);
      } else if (isOvercoat) {
        // peaked lapels
        const lapelMat = garmentMaterial(color, "solid");
        for (const s of [-1, 1]) {
          const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.016 * H, 0.07 * H, 0.005 * H), lapelMat);
          lapel.position.set(s * 0.02 * H, topY - 0.045 * H, m.chestDepth + fit2 * 0.8 + 0.002 * H);
          lapel.rotation.z = s * -0.18;
          root.add(lapel);
        }
        const buttons = garmentMaterial("#8A5F3D", "solid");
        for (let i = 0; i < 3; i++) {
          const btn = new THREE.Mesh(new THREE.SphereGeometry(H * 0.0045, 10, 8), buttons);
          btn.position.set(0, topY - 0.1 * H - i * 0.07 * H, m.chestDepth + fit2 * 0.8 + 0.0035 * H);
          root.add(btn);
        }
      } else if (!isPuffer) {
        // front zip/buttons line
        const zipper = new THREE.Mesh(new THREE.BoxGeometry(H * 0.003, (topY - hemY) * 0.9, H * 0.004), garmentMaterial(isBlazer ? color : "#2A2622", "solid"));
        zipper.position.set(0, (topY + hemY) / 2, m.chestDepth + fit2 * 0.8 + H * 0.002);
        root.add(zipper);
      } else {
        // puffer: quilted front pockets + storm flap
        const pocketMat = garmentMaterial(color, "solid");
        for (const s of [-1, 1]) {
          const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.035 * H, 0.05 * H, 0.012 * H), pocketMat);
          pocket.position.set(s * 0.05 * H, (topY + hemY) / 2, m.chestDepth + fit2 * 0.8 + 0.004 * H);
          root.add(pocket);
        }
        const zipper = new THREE.Mesh(new THREE.BoxGeometry(H * 0.0035, (topY - hemY) * 0.9, H * 0.004), garmentMaterial("#2A2622", "solid"));
        zipper.position.set(0, (topY + hemY) / 2, m.chestDepth + fit2 * 0.8 + H * 0.004);
        root.add(zipper);
      }
      break;
    }
    case "hoodie": {
      const topY = m.shoulderY * 1.01;
      const hemY = m.hipY - 0.008 * H;
      const fit2 = 0.016;
      const torso = new THREE.Mesh(
        buildRingStack(
          (y) => torsoHalfWidth(m, y) + fit2,
          (y) => torsoHalfDepth(m, y) + fit2 * 0.8,
          hemY,
          topY,
          { rings: 18, segments: 40 } as RingStackOptions
        ),
        mat
      );
      root.add(torso);
      const sleeveR = m.armRadius + fit2;
      for (const s of [-1, 1]) {
        const { shoulder, wrist } = armPoints(m, s);
        sleeveCapsule(root, shoulder, wrist, sleeveR, mat);
      }
      // hood
      const hood = new THREE.Mesh(new THREE.SphereGeometry(m.neckHalf * 1.25 + fit2, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      hood.position.set(0, topY + 0.03 * H, m.chestDepth * -0.25);
      hood.rotation.x = Math.PI * 0.08;
      root.add(hood);
      collar(root, topY + 0.012 * H, m.neckHalf * 1.02 + fit2, color, m);
      // drawstrings
      const strMat = garmentMaterial("#F2F0EB", "solid");
      for (const s of [-1, 1]) {
        const str = new THREE.Mesh(new THREE.CylinderGeometry(H * 0.003, H * 0.003, 0.07 * H, 8), strMat);
        str.position.set(s * m.neckHalf * 0.35, topY - 0.02 * H, m.chestDepth + fit2 * 0.8 + 0.004 * H);
        root.add(str);
      }
      break;
    }
    case "pants":
    case "jeans":
    case "joggers":
    case "cargo":
    case "sweatpants": {
      const matP = garmentMaterial(color, options.kind === "jeans" ? "denim" : pattern);
      legShells(root, m, m.waistY, m.ankleY, fit, matP);
      waistband(root, m.waistY - 0.01 * H, torsoHalfWidth(m, m.waistY) + fit, torsoHalfDepth(m, m.waistY) + fit * 0.8, color, m);
      if (options.kind === "joggers" || options.kind === "sweatpants") {
        const ribMat = garmentMaterial(color, "solid", 0.75);
        for (const s of [-1, 1]) {
          const cuff = new THREE.Mesh(new THREE.TorusGeometry(m.shinRadius + fit, H * 0.006, 8, 24), ribMat);
          cuff.position.set(s * m.hipHalf * 0.68, m.ankleY + 0.01 * H, 0);
          cuff.rotation.x = Math.PI / 2;
          root.add(cuff);
        }
        if (options.kind === "sweatpants") {
          const draw = new THREE.Mesh(new THREE.CylinderGeometry(H * 0.003, H * 0.003, 0.08 * H, 8), matDark);
          draw.position.set(0, m.waistY + 0.005 * H, torsoHalfDepth(m, m.waistY) + fit * 0.8 + 0.004 * H);
          draw.rotation.x = 0.12;
          root.add(draw);
        }
      } else if (options.kind === "cargo") {
        // boxy thigh cargo pockets
        const pocketMat = garmentMaterial(color, "solid");
        for (const s of [-1, 1]) {
          for (let i = 0; i < 2; i++) {
            const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.03 * H, 0.035 * H, 0.014 * H), pocketMat);
            pocket.position.set(s * (m.hipHalf * 0.62 + 0.006 * H), m.kneeY + 0.12 * H + i * 0.035 * H, 0);
            root.add(pocket);
          }
        }
      }
      break;
    }
    case "shorts": {
      const matP = garmentMaterial(color, pattern);
      const cutY = m.kneeY + 0.16 * H;
      for (const s of [-1, 1]) {
        const hip = new THREE.Vector3(s * m.hipHalf * 0.72, m.crotchY, 0);
        const knee = new THREE.Vector3(s * m.hipHalf * 0.78, cutY, 0);
        sleeveCapsule(root, hip, knee, m.thighRadius + fit, matP);
      }
      waistband(root, m.waistY - 0.01 * H, torsoHalfWidth(m, m.waistY) + fit, torsoHalfDepth(m, m.waistY) + fit * 0.8, color, m);
      break;
    }
    case "dress":
    case "skirt": {
      const isDress = options.kind === "dress";
      const topY = isDress ? m.shoulderY * 1.0 : m.waistY - 0.005 * H;
      const hemY = isDress ? m.kneeY + 0.04 * H : m.kneeY + 0.08 * H;
      const flare = isDress ? 0.045 : 0.03;
      const topHalf = torsoHalfWidth(m, topY);
      const dress = new THREE.Mesh(
        buildRingStack(
          (y) => {
            const base = isDress ? torsoHalfWidth(m, Math.max(y, m.chestY)) : torsoHalfWidth(m, m.waistY);
            return base + fit + flare * (1 - (y - topY) / (hemY - topY)) * 0 + flare * ((y - topY) / (hemY - topY)) * m.H * 0.5;
          },
          (y) => torsoHalfDepth(m, isDress ? Math.max(y, m.chestY) : m.waistY) + fit * 0.8,
          hemY,
          topY,
          { rings: 22, segments: 44 } as RingStackOptions
        ),
        mat
      );
      root.add(dress);
      if (isDress) {
        // thin straps
        const strapMat = garmentMaterial(color, "solid");
        for (const s of [-1, 1]) {
          const strap = new THREE.Mesh(new THREE.BoxGeometry(H * 0.004, 0.02 * H, H * 0.004), strapMat);
          strap.position.set(s * m.shoulderHalf * 0.6, topY + 0.012 * H, 0);
          root.add(strap);
        }
      } else {
        waistband(root, topY + 0.01 * H, topHalf + fit, torsoHalfDepth(m, m.waistY) + fit * 0.8, color, m);
      }
      break;
    }
  }

  return root;
}
