import * as THREE from "three";
import { computeMeasurements, type BodyParams } from "./avatar";

export type HairStyleId =
  | "none"
  | "buzz"
  | "crew"
  | "crop"
  | "textured"
  | "quiff"
  | "slick"
  | "pompadour"
  | "spikes"
  | "undercut"
  | "long"
  | "ponytail"
  | "bun"
  | "mohawk"
  | "afro";

export interface HairSpec {
  id: HairStyleId;
  name: string;
  volume: number; // 0..1 cap volume
  capAngle: number; // degrees of head covered (top -> edge)
  extras: string[]; // descriptive tags
}

export const HAIR_STYLES: HairSpec[] = [
  { id: "none", name: "None", volume: 0, capAngle: 0, extras: [] },
  { id: "buzz", name: "Buzz Cut", volume: 0.12, capAngle: 120, extras: [] },
  { id: "crew", name: "Crew Cut", volume: 0.22, capAngle: 118, extras: [] },
  { id: "crop", name: "Cropped Fringe", volume: 0.3, capAngle: 120, extras: ["fringe"] },
  { id: "textured", name: "Textured Top", volume: 0.45, capAngle: 125, extras: [] },
  { id: "undercut", name: "Undercut", volume: 0.42, capAngle: 105, extras: [] },
  { id: "quiff", name: "Quiff", volume: 0.5, capAngle: 125, extras: ["front"] },
  { id: "slick", name: "Slick Back", volume: 0.42, capAngle: 128, extras: ["front"] },
  { id: "pompadour", name: "Pompadour", volume: 0.65, capAngle: 128, extras: ["front", "big"] },
  { id: "spikes", name: "Spikes", volume: 0.4, capAngle: 120, extras: ["spikes"] },
  { id: "mohawk", name: "Mohawk", volume: 0.35, capAngle: 100, extras: ["ridge"] },
  { id: "long", name: "Long & Flowing", volume: 0.5, capAngle: 150, extras: ["long"] },
  { id: "ponytail", name: "Ponytail", volume: 0.42, capAngle: 126, extras: ["tail"] },
  { id: "bun", name: "Man Bun", volume: 0.42, capAngle: 126, extras: ["bun"] },
  { id: "afro", name: "Afro", volume: 1.0, capAngle: 150, extras: ["big"] },
];

export const HAIR_COLORS: { id: string; name: string; color: string }[] = [
  { id: "black", name: "Black", color: "#17140F" },
  { id: "dark-brown", name: "Dark Brown", color: "#2E2118" },
  { id: "chestnut", name: "Chestnut", color: "#5A3A24" },
  { id: "auburn", name: "Auburn", color: "#7A3E2E" },
  { id: "ginger", name: "Ginger", color: "#A6502E" },
  { id: "blonde", name: "Blonde", color: "#C8963E" },
  { id: "platinum", name: "Platinum", color: "#D9CBB0" },
  { id: "grey", name: "Silver Grey", color: "#9A958A" },
  { id: "pastel-pink", name: "Pastel Pink", color: "#E3A8A0" },
  { id: "teal", name: "Teal", color: "#3E7A86" },
  { id: "blue", name: "Blue", color: "#3E5FA8" },
  { id: "violet", name: "Violet", color: "#6A4AA8" },
];

function hairMaterial(color: string): THREE.Material {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
  });
}

/** Build a parametric hairstyle fitted to the avatar's head. */
export function buildHair(params: BodyParams, style: HairStyleId, color: string): THREE.Group {
  const m = computeMeasurements(params);
  const spec = HAIR_STYLES.find((h) => h.id === style) ?? HAIR_STYLES[0];
  const root = new THREE.Group();
  if (spec.id === "none" || spec.capAngle <= 0) return root;

  const headCY = m.chinY + m.headHeight * 0.46;
  const R = m.headRadius * 1.18;
  const mat = hairMaterial(color);
  const thickness = m.headRadius * 0.028 * (0.5 + spec.volume);

  // --- Cap ---------------------------------------------------------------
  const thetaMax = (spec.capAngle * Math.PI) / 180;
  const pts: THREE.Vector2[] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = thetaMax * t;
    const r = R * Math.sin(theta) + thickness * (1 - t * 0.65);
    const y = R * Math.cos(theta);
    pts.push(new THREE.Vector2(r, y));
  }
  const capGeo = new THREE.LatheGeometry(pts, 40);
  const cap = new THREE.Mesh(capGeo, mat);
  cap.position.y = headCY;
  cap.scale.z = 0.92;
  root.add(cap);

  const Rz = R * 0.92; // head depth radius after aspect

  // --- Extras -------------------------------------------------------------
  if (spec.extras.includes("front")) {
    const big = spec.extras.includes("big");
    const blob = new THREE.Mesh(new THREE.SphereGeometry(R * 0.34 * (big ? 1.3 : 1), 24, 18), mat);
    const ly = R * 0.3;
    const lz = Math.sqrt(R * R - ly * ly) * 0.92;
    blob.position.set(0, headCY + ly + R * 0.08 * (big ? 0.4 : 0.1), lz - blob.geometry.parameters.radius * 0.55);
    blob.scale.set(1, 1.15, 0.95);
    blob.rotation.x = -0.35;
    root.add(blob);
  }

  if (spec.extras.includes("spikes")) {
    const count = 13;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const theta = Math.PI * 0.12 + t * Math.PI * 0.76; // top hemisphere
      const phi = (i * 2.399963) % (Math.PI * 2);
      const rr = R * Math.sin(theta);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(R * 0.02, R * 0.09, 6), mat);
      const sx = rr * Math.cos(phi);
      const sy = R * Math.cos(theta) + R * 0.03;
      const sz = rr * Math.sin(phi) * 0.92;
      spike.position.set(sx, headCY + sy, sz);
      spike.rotation.z = Math.PI - phi * 0.2;
      spike.rotation.x = 0.25;
      root.add(spike);
    }
  }

  if (spec.extras.includes("ridge")) {
    const ridge = new THREE.Mesh(new THREE.SphereGeometry(R * 0.16, 20, 14), mat);
    ridge.position.set(0, headCY + R * 0.62, -R * 0.06);
    ridge.scale.set(0.5, 1.6, 0.8);
    root.add(ridge);
  }

  if (spec.extras.includes("long")) {
    const flow = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.3, R * 1.1, 6, 18), mat);
    flow.position.set(0, headCY - R * 0.35, -Rz * 0.85);
    flow.rotation.x = 0.25;
    root.add(flow);
  }

  if (spec.extras.includes("tail")) {
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.14, R * 0.7, 6, 14), mat);
    tail.position.set(0, headCY - R * 0.05, -Rz * 0.9);
    tail.rotation.x = 0.5;
    root.add(tail);
  }

  if (spec.extras.includes("bun")) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(R * 0.26, 22, 16), mat);
    bun.position.set(0, headCY + R * 0.5, -Rz * 0.55);
    root.add(bun);
  }

  return root;
}
