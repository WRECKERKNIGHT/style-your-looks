import * as THREE from "three";
import { buildRingStack } from "./geometry";

export interface BodyParams {
  gender: "male" | "female";
  height: number; // cm, 150-200
  build: number; // 0..1 muscularity
  mass: number; // 0..1 heaviness
  shoulders: number; // 0..1
  waist: number; // 0..1 slimness (higher = slimmer)
  hips: number; // 0..1
}

export interface BodyMeasurements {
  gender: "male" | "female";
  H: number;
  soleY: number;
  ankleY: number;
  kneeY: number;
  crotchY: number;
  hipY: number;
  waistY: number;
  chestY: number;
  shoulderY: number;
  neckY: number;
  chinY: number;
  headTopY: number;
  neckHalf: number;
  shoulderHalf: number;
  chestHalf: number;
  waistHalf: number;
  hipHalf: number;
  chestDepth: number;
  waistDepth: number;
  hipDepth: number;
  armLength: number;
  armRadius: number;
  forearmRadius: number;
  thighRadius: number;
  shinRadius: number;
  headRadius: number;
  headHeight: number;
}

export function computeMeasurements(p: BodyParams): BodyMeasurements {
  const H = Math.max(1.4, Math.min(2.1, p.height / 100));
  const male = p.gender === "male";
  const { build, mass, shoulders, waist, hips } = p;

  const soleY = -0.5 * H;
  const ankleY = -0.47 * H;
  const kneeY = -0.27 * H;
  const crotchY = -0.055 * H;
  const hipY = 0;
  const waistY = 0.085 * H;
  const chestY = 0.195 * H;
  const shoulderY = 0.295 * H;
  const neckY = 0.315 * H;
  const chinY = 0.365 * H;
  const headTopY = 0.5 * H;

  const neckHalf = (male ? 0.025 : 0.022) * H + build * 0.002 * H;
  const shoulderHalf =
    (male ? 0.052 : 0.046) * H + shoulders * 0.012 * H + build * 0.006 * H;
  const chestHalf = shoulderHalf * 0.86 + mass * 0.006 * H + build * 0.005 * H;
  const waistHalf =
    (male ? 0.038 : 0.033) * H - waist * 0.007 * H + mass * 0.013 * H;
  const hipHalf =
    (male ? 0.046 : 0.054) * H + hips * 0.01 * H + mass * 0.01 * H;

  const chestDepth = chestHalf * (male ? 0.6 : 0.72) + build * 0.006 * H;
  const waistDepth = waistHalf * (male ? 0.58 : 0.62);
  const hipDepth = hipHalf * (male ? 0.66 : 0.72);

  const armLength = 0.32 * H;
  const armRadius = (0.018 + build * 0.007 + mass * 0.005) * H;
  const forearmRadius = armRadius * 0.78;
  const thighRadius = (0.03 + mass * 0.008 + build * 0.003) * H;
  const shinRadius = thighRadius * 0.72;

  return {
    gender: p.gender,
    H,
    soleY,
    ankleY,
    kneeY,
    crotchY,
    hipY,
    waistY,
    chestY,
    shoulderY,
    neckY,
    chinY,
    headTopY,
    neckHalf,
    shoulderHalf,
    chestHalf,
    waistHalf,
    hipHalf,
    chestDepth,
    waistDepth,
    hipDepth,
    armLength,
    armRadius,
    forearmRadius,
    thighRadius,
    shinRadius,
    headRadius: (male ? 0.042 : 0.04) * H,
    headHeight: 0.135 * H,
  };
}

/** Half-width of the torso silhouette at a given world y. */
export function torsoHalfWidth(m: BodyMeasurements, y: number): number {
  const { crotchY, hipY, waistY, chestY, shoulderY, neckY } = m;
  if (y < crotchY) return 0;
  if (y < hipY) return m.hipHalf * (1 + (y - hipY) / (hipY - crotchY) * 0.06);
  if (y < waistY) return lerp(m.hipHalf, m.waistHalf, (y - hipY) / (waistY - hipY));
  if (y < chestY) return lerp(m.waistHalf, m.chestHalf, (y - waistY) / (chestY - waistY));
  if (y < shoulderY) return lerp(m.chestHalf, m.shoulderHalf, (y - chestY) / (shoulderY - chestY));
  if (y < neckY) return lerp(m.shoulderHalf, m.neckHalf, (y - shoulderY) / (neckY - shoulderY));
  return m.neckHalf;
}

/** Half-depth of the torso silhouette at a given world y. */
export function torsoHalfDepth(m: BodyMeasurements, y: number): number {
  const { hipY, waistY, chestY, shoulderY } = m;
  if (y < hipY) return m.hipDepth;
  if (y < waistY) return lerp(m.hipDepth, m.waistDepth, (y - hipY) / (waistY - hipY));
  if (y < chestY) return lerp(m.waistDepth, m.chestDepth, (y - waistY) / (chestY - waistY));
  if (y < shoulderY) return lerp(m.chestDepth, m.chestDepth, 0.5);
  return m.chestDepth;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function addCapsule(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  material: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const cap = new THREE.CapsuleGeometry(radius, Math.max(0.0001, length - radius * 2), 8, 16);
  const mesh = new THREE.Mesh(cap, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  const up = new THREE.Vector3(0, 1, 0);
  mesh.quaternion.setFromUnitVectors(up, dir.normalize());
  parent.add(mesh);
  return mesh;
}

/**
 * Build the full parametric human body. Origin sits at hip center, +Y up.
 * The avatar is built from smooth primitive shells so it renders with zero
 * external assets on any device.
 */
export function buildAvatar(p: BodyParams, material: THREE.Material): THREE.Group {
  const m = computeMeasurements(p);
  const root = new THREE.Group();

  // --- Torso -------------------------------------------------------------
  const torso = new THREE.Mesh(
    buildRingStack(
      (y) => torsoHalfWidth(m, y),
      (y) => torsoHalfDepth(m, y),
      m.crotchY,
      m.shoulderY,
      { rings: 28, segments: 48, capBottom: true }
    ),
    material
  );
  root.add(torso);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(m.neckHalf * 0.92, m.neckHalf, m.shoulderY * 0.16 + 0.02, 24), material);
  neck.position.y = m.shoulderY + (m.neckY - m.shoulderY) * 0.5;
  root.add(neck);

  // Deltoid caps to smooth shoulders
  for (const s of [-1, 1]) {
    const delt = new THREE.Mesh(new THREE.SphereGeometry(m.shoulderHalf * 0.5, 24, 18), material);
    delt.position.set(s * m.shoulderHalf * 0.86, m.shoulderY * 0.98, 0);
    delt.scale.set(1, 1.05, 0.72);
    root.add(delt);
  }

  // --- Head --------------------------------------------------------------
  const head = new THREE.Mesh(new THREE.SphereGeometry(m.headRadius, 32, 24), material);
  head.position.y = m.chinY + m.headHeight * 0.46;
  head.scale.set(1, 1.18, 0.92);
  root.add(head);

  // --- Arms --------------------------------------------------------------
  const armMat = material;
  for (const s of [-1, 1]) {
    const shoulder = new THREE.Vector3(s * m.shoulderHalf * 0.98, m.shoulderY * 0.97, 0);
    const elbow = new THREE.Vector3(
      s * (m.shoulderHalf * 0.98 + 0.015 * m.H),
      m.shoulderY * 0.97 - m.armLength * 0.46,
      0
    );
    const wrist = new THREE.Vector3(
      s * (m.shoulderHalf * 0.98 + 0.018 * m.H),
      m.shoulderY * 0.97 - m.armLength,
      0
    );
    addCapsule(root, shoulder, elbow, m.armRadius, armMat);
    addCapsule(root, elbow, wrist, m.forearmRadius, armMat);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(m.forearmRadius * 0.95, 16, 12), armMat);
    hand.position.copy(wrist);
    hand.scale.set(1, 1.35, 0.7);
    root.add(hand);
  }

  // --- Legs --------------------------------------------------------------
  for (const s of [-1, 1]) {
    const hip = new THREE.Vector3(s * m.hipHalf * 0.72, m.crotchY, 0);
    const knee = new THREE.Vector3(s * m.hipHalf * 0.78, m.kneeY, 0);
    const ankle = new THREE.Vector3(s * m.hipHalf * 0.68, m.ankleY, 0);
    addCapsule(root, hip, knee, m.thighRadius, material);
    addCapsule(root, knee, ankle, m.shinRadius, material);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(m.H * 0.03, m.H * 0.02, m.H * 0.012), material);
    foot.position.set(s * m.hipHalf * 0.66, m.soleY + m.H * 0.012, m.H * 0.006);
    root.add(foot);
  }

  return root;
}
