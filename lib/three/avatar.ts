import * as THREE from 'three';
import { buildMannequinGeometry } from './mannequinMesh';

export interface BodyParams {
  gender: 'male' | 'female';
  height: number; // cm, 150-200
  build: number; // 0..1 muscularity
  mass: number; // 0..1 heaviness
  shoulders: number; // 0..1
  waist: number; // 0..1 slimness (higher = slimmer)
  hips: number; // 0..1
}

export interface BodyMeasurements {
  gender: 'male' | 'female';
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
  const male = p.gender === 'male';
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
  const shoulderHalf = (male ? 0.052 : 0.046) * H + shoulders * 0.012 * H + build * 0.006 * H;
  const chestHalf = shoulderHalf * 0.86 + mass * 0.006 * H + build * 0.005 * H;
  const waistHalf = (male ? 0.038 : 0.033) * H - waist * 0.007 * H + mass * 0.013 * H;
  const hipHalf = (male ? 0.046 : 0.054) * H + hips * 0.01 * H + mass * 0.01 * H;

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
  if (y < hipY) return m.hipHalf * (1 + ((y - hipY) / (hipY - crotchY)) * 0.06);
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

export interface ArmPoints {
  shoulder: THREE.Vector3;
  elbow: THREE.Vector3;
  wrist: THREE.Vector3;
}

/**
 * Mannequin pose for one arm side (`s` = -1 left / +1 right). Shared by the
 * body builder and garment sleeves so sleeves always cover the posed arm.
 * Arms stand in a gentle A-pose with hands angled slightly forward, like a
 * clothing-store mannequin.
 */
export function armPoints(m: BodyMeasurements, s: number): ArmPoints {
  const shoulder = new THREE.Vector3(s * m.shoulderHalf * 0.98, m.shoulderY * 0.97, 0);
  const elbow = new THREE.Vector3(
    s * (m.shoulderHalf * 1.04 + 0.016 * m.H),
    m.shoulderY * 0.97 - m.armLength * 0.42,
    0,
  );
  const wrist = new THREE.Vector3(
    s * (m.shoulderHalf * 1.06 + 0.032 * m.H),
    m.shoulderY * 0.97 - m.armLength * 0.86,
    0.012 * m.H,
  );
  return { shoulder, elbow, wrist };
}

/**
 * Build the parametric clothing-store mannequin. Origin sits at hip center,
 * +Y up. The body is a SINGLE seamless watertight surface (implicit surface
 * meshed from a skeleton SDF) with a featureless head and A-pose arms, so
 * garments drape like on a store mannequin and there are no inter-part gaps.
 * All geometry is generated at runtime — zero external assets.
 */
export function buildAvatar(p: BodyParams, material: THREE.Material): THREE.Group {
  const m = computeMeasurements(p);
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(buildMannequinGeometry(m), material);
  root.add(mesh);
  return root;
}
