import * as THREE from 'three';
import { armPoints, torsoHalfWidth, torsoHalfDepth, type BodyMeasurements } from './avatar';

/**
 * Single-surface mannequin mesh.
 *
 * The store-mannequin body is defined as an implicit surface (a signed
 * distance field) and extracted with cell-center marching tetrahedra, so the
 * whole figure — torso, hips, buttocks, bust, shoulders, arms, legs, feet and
 * featureless head — comes out as ONE watertight mesh. There are no separate
 * part meshes, so inter-part gaps and seams are structurally impossible.
 *
 * Skeleton primitive SDFs (ellipse column + capsules + ellipsoids) are blended
 * with a polynomial smooth-min, first for the gross figure (k1) and then for
 * small details like the bust, jaw and hands (k2), keeping the silhouette
 * clean while detail stays crisp.
 */

/** Base grid cell size in world units (metres). */
const CELL = 0.015;

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Inigo Quilez polynomial smooth-min (a soft union of two fields). */
function smin(a: number, b: number, k: number): number {
  const h = clamp01(0.5 + (0.5 * (b - a)) / k);
  return b + (a - b) * h - k * h * (1 - h);
}

type SdfFn = (x: number, y: number, z: number) => number;

/** Flat primitive tags (see makeMannequinField). */
const PRIM_ELLIPSOID = 0;
const PRIM_CAPSULE = 1;
/** Stride of one primitive in the parameter array: [type, 7 params]. */
const PRIM_STRIDE = 8;

/**
 * Evaluate one flat primitive from parameter array `p` at offset `o`.
 * Ellipsoid params: [0, cx,cy,cz, ax,ay,az, minR]; capsule params:
 * [1, ax,ay,az, bx,by,bz, r]. Inlining the ~26 primitives into a single
 * function avoids per-sample closure-call overhead, which dominates build time.
 */
function primEval(p: Float64Array, o: number, x: number, y: number, z: number): number {
  const cx = p[o + 1];
  const cy = p[o + 2];
  const cz = p[o + 3];
  if (p[o] === PRIM_ELLIPSOID) {
    const ax = p[o + 4];
    const ay = p[o + 5];
    const az = p[o + 6];
    const dx = (x - cx) / ax;
    const dy = (y - cy) / ay;
    const dz = (z - cz) / az;
    return (Math.sqrt(dx * dx + dy * dy + dz * dz) - 1) * p[o + 7];
  }
  const bx = p[o + 4];
  const by = p[o + 5];
  const bz = p[o + 6];
  const dx = bx - cx;
  const dy = by - cy;
  const dz = bz - cz;
  const len2 = dx * dx + dy * dy + dz * dz;
  const t = len2 > 0 ? clamp01(((x - cx) * dx + (y - cy) * dy + (z - cz) * dz) / len2) : 0;
  const qx = x - (cx + dx * t);
  const qy = y - (cy + dy * t);
  const qz = z - (cz + dz * t);
  return Math.sqrt(qx * qx + qy * qy + qz * qz) - p[o + 7];
}

/**
 * Rounded vertical elliptical column from y=lo to y=hi. At every height the
 * zero set is exactly the ellipse of half-width torsoHalfWidth(y) and
 * half-depth torsoHalfDepth(y), so garments that hug those two functions fit
 * the finished body with uniform clearance. The ends round off like a capsule.
 */
function torsoColumn(m: BodyMeasurements): SdfFn {
  const lo = m.crotchY;
  const hi = m.shoulderY;
  const span = hi - lo;
  return (x, y, z) => {
    const t = clamp01((y - lo) / span);
    const w = torsoHalfWidth(m, lo + span * t);
    const d = torsoHalfDepth(m, lo + span * t);
    const er = Math.sqrt((x / w) * (x / w) + (z / d) * (z / d));
    const r = Math.min(w, d);
    const lat = (er - 1) * r;
    const yDist = Math.max(lo - y, y - hi, 0);
    const cap = Math.hypot(Math.max(lat, 0), yDist) - r;
    return Math.max(lat, cap);
  };
}

export interface MannequinField {
  /** Signed distance to the mannequin surface at (x,y,z) — negative inside. */
  sdf: (x: number, y: number, z: number) => number;
}

/** Build the mannequin distance field for a given set of measurements. */
export function makeMannequinField(m: BodyMeasurements): MannequinField {
  const H = m.H;
  const k1 = 0.011 * H;
  const k2 = 0.004 * H;
  const female = m.gender === 'female';

  const gross: number[] = [];
  const details: number[] = [];
  const ellipsoid = (
    arr: number[],
    cx: number,
    cy: number,
    cz: number,
    ax: number,
    ay: number,
    az: number,
  ) => arr.push(PRIM_ELLIPSOID, cx, cy, cz, ax, ay, az, Math.min(ax, ay, az));
  const capsule = (
    arr: number[],
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    r: number,
  ) => arr.push(PRIM_CAPSULE, ax, ay, az, bx, by, bz, r);

  // Pelvis — fills the space between the legs so the crotch reads as one form.
  ellipsoid(gross, 0, m.crotchY + 0.03 * H, 0, m.hipHalf * 0.85, 0.04 * H, m.hipDepth * 0.9);

  // Buttocks — rounded rear volume, stronger on female figures.
  const butt = female ? 1 : 0.75;
  ellipsoid(
    gross,
    0,
    m.hipY - 0.014 * H,
    -m.hipDepth * 0.9,
    m.hipHalf * 0.9 * butt,
    0.045 * H,
    m.hipDepth * 0.38 * butt,
  );

  // Neck — a tapered column reaching from the shoulders to the head's underside.
  capsule(gross, 0, m.neckY * 0.98, 0, 0, m.chinY + 0.01 * H, 0, m.neckHalf * 0.9);

  // Featureless mannequin head — a smooth ovoid, no facial features. The
  // ellipsoid is centred so its top reaches headTopY (a touch beyond, to
  // absorb the smooth-min pull-down from the neck and jaw).
  const headCY = m.chinY + m.headHeight * 0.5;
  ellipsoid(gross, 0, headCY, 0, m.headRadius * 0.98, m.headHeight * 0.52, m.headRadius * 0.9);

  // Deltoids — bridge the arm capsules into the torso shoulder line.
  for (const s of [-1, 1]) {
    ellipsoid(
      gross,
      s * m.shoulderHalf * 0.9,
      m.shoulderY - 0.005 * H,
      0,
      m.shoulderHalf * 0.26,
      m.shoulderHalf * 0.34,
      m.chestDepth * 0.5,
    );
  }

  // Arms — upper + forearm capsules along the mannequin A-pose skeleton.
  for (const s of [-1, 1]) {
    const { shoulder, elbow, wrist } = armPoints(m, s);
    capsule(gross, shoulder.x, shoulder.y, shoulder.z, elbow.x, elbow.y, elbow.z, m.armRadius);
    capsule(gross, elbow.x, elbow.y, elbow.z, wrist.x, wrist.y, wrist.z, m.forearmRadius);
  }

  // Legs — thigh + shin capsules on the standing skeleton.
  for (const s of [-1, 1]) {
    const hip = [s * m.hipHalf * 0.72, m.hipY - 0.005 * H, 0] as const;
    const knee = [s * m.hipHalf * 0.78, m.kneeY, 0] as const;
    const ankle = [s * m.hipHalf * 0.68, m.ankleY, 0] as const;
    capsule(gross, hip[0], hip[1], hip[2], knee[0], knee[1], knee[2], m.thighRadius);
    capsule(gross, knee[0], knee[1], knee[2], ankle[0], ankle[1], ankle[2], m.shinRadius);

    // Foot — a low rounded wedge with the sole resting on soleY.
    ellipsoid(
      gross,
      s * m.hipHalf * 0.62,
      m.soleY + 0.016 * H,
      0.012 * H,
      0.026 * H,
      0.016 * H,
      0.038 * H,
    );
  }

  // Bust — subtle female chest volume, sized so its front surface stays
  // inside the tightest garment shell (chestDepth + t-shirt fit) so no style
  // visibly clips the chest.
  if (female) {
    for (const s of [-1, 1]) {
      ellipsoid(
        details,
        s * 0.045 * H,
        m.chestY - 0.02 * H,
        m.chestDepth * 0.7,
        0.032 * H,
        0.028 * H,
        m.chestDepth * 0.3 + 0.003,
      );
    }
  }

  // Subtle jaw silhouette so the head reads as a (featureless) face without
  // any features, and so beard styles have a surface to hug.
  ellipsoid(
    details,
    0,
    m.chinY + m.headHeight * 0.03,
    m.headRadius * 0.62,
    m.headRadius * 0.58,
    m.headHeight * 0.18,
    m.headRadius * 0.3,
  );

  // Elbow + knee knuckles.
  for (const s of [-1, 1]) {
    const { elbow } = armPoints(m, s);
    ellipsoid(
      details,
      elbow.x,
      elbow.y,
      elbow.z,
      m.forearmRadius * 0.9,
      m.forearmRadius * 0.9,
      m.forearmRadius * 0.9,
    );
    ellipsoid(
      details,
      s * m.hipHalf * 0.78,
      m.kneeY,
      0,
      m.shinRadius * 0.85,
      m.shinRadius * 0.85,
      m.shinRadius * 0.85,
    );
  }

  // Mitten hands — smooth, no fingers.
  for (const s of [-1, 1]) {
    const { wrist } = armPoints(m, s);
    ellipsoid(
      details,
      wrist.x + s * 0.006 * H,
      wrist.y - 0.004 * H,
      wrist.z + 0.011 * H,
      m.forearmRadius * 0.95,
      m.forearmRadius * 1.45,
      m.forearmRadius * 0.8,
    );
  }

  const g = Float64Array.from(gross);
  const d = Float64Array.from(details);
  const gn = g.length / PRIM_STRIDE;
  const dn = d.length / PRIM_STRIDE;
  const column = torsoColumn(m);
  const skipDetail = -4 * k2;

  return {
    sdf: (x, y, z) => {
      let v = column(x, y, z);
      for (let i = 0; i < gn; i++) v = smin(v, primEval(g, i * PRIM_STRIDE, x, y, z), k1);
      // Details only shape the surface; deep inside the body they can never
      // flip the sign, so skip them there to cut per-sample cost.
      if (v > skipDetail)
        for (let i = 0; i < dn; i++) v = smin(v, primEval(d, i * PRIM_STRIDE, x, y, z), k2);
      return v;
    },
  };
}

/** Convenience wrapper: signed distance to the mannequin surface at (x,y,z). */
export function mannequinSdf(m: BodyMeasurements, x: number, y: number, z: number): number {
  return makeMannequinField(m).sdf(x, y, z);
}

/** Numeric gradient of a mannequin field at (x,y,z) (unit vector). */
function sdfGradient(
  field: MannequinField,
  x: number,
  y: number,
  z: number,
  h: number,
): [number, number, number] {
  const inv2 = 1 / (2 * h);
  const gx = (field.sdf(x + h, y, z) - field.sdf(x - h, y, z)) * inv2;
  const gy = (field.sdf(x, y + h, z) - field.sdf(x, y - h, z)) * inv2;
  const gz = (field.sdf(x, y, z + h) - field.sdf(x, y, z - h)) * inv2;
  const len = Math.hypot(gx, gy, gz) || 1;
  return [gx / len, gy / len, gz / len];
}

/** World-space bounding box that comfortably encloses the whole figure. */
function bodyBounds(
  m: BodyMeasurements,
  pad: number,
): { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number } {
  const H = m.H;
  const female = m.gender === 'female';

  let xMax = Math.max(
    m.shoulderHalf * 1.05,
    m.hipHalf * 0.95,
    Math.abs(m.hipHalf) * 0.62 + 0.026 * H,
  );
  let zMax = Math.max(
    m.chestDepth + (female ? 0.075 * H : 0.012 * H),
    0.012 * H + 0.038 * H,
    m.neckHalf * 0.95,
  );
  let zMin = -(m.hipDepth * 1.2 + 0.02 * H);

  for (const s of [-1, 1]) {
    const { shoulder, elbow, wrist } = armPoints(m, s);
    xMax = Math.max(
      xMax,
      Math.abs(shoulder.x),
      Math.abs(elbow.x),
      Math.abs(wrist.x) + m.forearmRadius * 1.1,
    );
    zMax = Math.max(zMax, wrist.z + 0.011 * H + m.forearmRadius * 0.95);
  }

  return {
    x0: -xMax - pad,
    x1: xMax + pad,
    y0: m.soleY - pad,
    y1: m.headTopY + pad,
    z0: zMin - pad,
    z1: zMax + pad,
  };
}

const CORNERS: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
];

// One face per axis direction; the corner order (and thus the shared diagonal)
// is identical for every cell that touches that face, which keeps the mesh
// watertight across cell boundaries.
const FACES: [number, number, number, number][] = [
  [0, 2, 6, 4], // -x
  [1, 5, 7, 3], // +x
  [0, 1, 5, 4], // -y
  [2, 3, 7, 6], // +y
  [0, 1, 3, 2], // -z
  [4, 5, 7, 6], // +z
];

/**
 * Build the seamless mannequin geometry. Origin at hip centre, +Y up, +Z
 * forward (matching the rest of the studio). Returns a watertight indexed
 * mesh with smooth normals; no UVs are emitted because the mannequin uses a
 * plain satin PBR material.
 */
export function buildMannequinGeometry(m: BodyMeasurements): THREE.BufferGeometry {
  const pad = CELL * 2;
  const b = bodyBounds(m, pad);
  let cs = CELL;

  // Keep the sample budget bounded for extreme body parameters.
  for (let i = 0; i < 6; i++) {
    const nx = Math.ceil((b.x1 - b.x0) / cs);
    const ny = Math.ceil((b.y1 - b.y0) / cs);
    const nz = Math.ceil((b.z1 - b.z0) / cs);
    if ((nx + 1) * (ny + 1) * (nz + 1) <= 1_300_000) break;
    cs *= 1.2;
  }
  const nx = Math.ceil((b.x1 - b.x0) / cs);
  const ny = Math.ceil((b.y1 - b.y0) / cs);
  const nz = Math.ceil((b.z1 - b.z0) / cs);

  const field = makeMannequinField(m);

  const nx1 = nx + 1;
  const ny1 = ny + 1;
  const fieldArr = new Float32Array(nx1 * ny1 * (nz + 1));
  const fidx = (ix: number, iy: number, iz: number) => (iz * ny1 + iy) * nx1 + ix;

  for (let iz = 0; iz <= nz; iz++) {
    const z = b.z0 + iz * cs;
    for (let iy = 0; iy <= ny; iy++) {
      const y = b.y0 + iy * cs;
      const row = iz * ny1 + iy;
      for (let ix = 0; ix <= nx; ix++) {
        fieldArr[row * nx1 + ix] = field.sdf(b.x0 + ix * cs, y, z);
      }
    }
  }

  /** Unit normal at a point, via central differences of the sampled field. */
  const grad = (x: number, y: number, z: number): [number, number, number] => {
    const ix = Math.max(1, Math.min(nx - 1, Math.round((x - b.x0) / cs)));
    const iy = Math.max(1, Math.min(ny - 1, Math.round((y - b.y0) / cs)));
    const iz = Math.max(1, Math.min(nz - 1, Math.round((z - b.z0) / cs)));
    const gx = (fieldArr[fidx(ix + 1, iy, iz)] - fieldArr[fidx(ix - 1, iy, iz)]) / (2 * cs);
    const gy = (fieldArr[fidx(ix, iy + 1, iz)] - fieldArr[fidx(ix, iy - 1, iz)]) / (2 * cs);
    const gz = (fieldArr[fidx(ix, iy, iz + 1)] - fieldArr[fidx(ix, iy, iz - 1)]) / (2 * cs);
    const len = Math.hypot(gx, gy, gz) || 1;
    return [gx / len, gy / len, gz / len];
  };

  const rawPos: number[] = [];
  const keepMargin = cs * 0.6;

  const lexGreater = (a: number[], b: number[]): boolean =>
    a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] > b[2];

  /**
   * Crossing of edge (p0,p1) with the isosurface. Operands are sorted by
   * world position so the SAME grid edge always produces byte-identical
   * floats no matter which cell or tet evaluates it — which lets exact-key
   * vertex dedup weld the mesh into a watertight manifold.
   */
  const crossing = (p0: number[], v0: number, p1: number[], v1: number): number[] => {
    if (lexGreater(p0, p1)) {
      const tmp = p0;
      p0 = p1;
      p1 = tmp;
      const tv = v0;
      v0 = v1;
      v1 = tv;
    }
    const t = v0 / (v0 - v1);
    return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t];
  };

  const pushTri = (a: number[], bb: number[], c: number[]) => {
    rawPos.push(a[0], a[1], a[2], bb[0], bb[1], bb[2], c[0], c[1], c[2]);
  };

  const extractTet = (pts: number[][], vals: number[]) => {
    let neg = 0;
    for (let i = 0; i < 4; i++) if (vals[i] < 0) neg++;
    if (neg === 0 || neg === 4) return;

    if (neg === 1 || neg === 3) {
      let lone = 0;
      if (neg === 1) {
        for (let i = 0; i < 4; i++) if (vals[i] < 0) lone = i;
      } else {
        for (let i = 0; i < 4; i++) if (vals[i] >= 0) lone = i;
      }
      pushTri(
        crossing(pts[lone], vals[lone], pts[(lone + 1) & 3], vals[(lone + 1) & 3]),
        crossing(pts[lone], vals[lone], pts[(lone + 2) & 3], vals[(lone + 2) & 3]),
        crossing(pts[lone], vals[lone], pts[(lone + 3) & 3], vals[(lone + 3) & 3]),
      );
      return;
    }

    // Two negative, two positive: a quad cut into two triangles.
    let n0 = 0,
      n1 = 0,
      p0 = 0,
      p1 = 0;
    let ni = 0,
      pi = 0;
    for (let i = 0; i < 4; i++) {
      if (vals[i] < 0) {
        if (ni === 0) n0 = i;
        else n1 = i;
        ni++;
      } else {
        if (pi === 0) p0 = i;
        else p1 = i;
        pi++;
      }
    }
    const c00 = crossing(pts[n0], vals[n0], pts[p0], vals[p0]);
    const c01 = crossing(pts[n0], vals[n0], pts[p1], vals[p1]);
    const c10 = crossing(pts[n1], vals[n1], pts[p0], vals[p0]);
    const c11 = crossing(pts[n1], vals[n1], pts[p1], vals[p1]);
    pushTri(c00, c10, c01);
    pushTri(c10, c11, c01);
  };

  const cellPts: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const cellVals = new Array<number>(8).fill(0);

  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const ox = b.x0 + ix * cs;
        const oy = b.y0 + iy * cs;
        const oz = b.z0 + iz * cs;

        let sum = 0;
        let allPos = true;
        let allNeg = true;
        let near = false;
        for (let k = 0; k < 8; k++) {
          const dx = CORNERS[k][0];
          const dy = CORNERS[k][1];
          const dz = CORNERS[k][2];
          const v = fieldArr[fidx(ix + dx, iy + dy, iz + dz)];
          // Canonical lattice positions: computed from the ABSOLUTE lattice
          // index so every cell sees byte-identical floats for a shared corner
          // (b.x0 + (ix+1)*cs in one cell === b.x0 + (ix+1)*cs in the next),
          // which is what lets exact-key dedup weld the mesh watertight.
          cellPts[k][0] = b.x0 + (ix + dx) * cs;
          cellPts[k][1] = b.y0 + (iy + dy) * cs;
          cellPts[k][2] = b.z0 + (iz + dz) * cs;
          cellVals[k] = v;
          sum += v;
          if (v > 0) allNeg = false;
          else if (v < 0) allPos = false;
          if (Math.abs(v) < keepMargin) near = true;
        }
        // Skip cells that are clearly empty; keep cells near the surface.
        if ((allPos || allNeg) && !near) continue;

        const cVal = sum / 8;
        const cPt: number[] = [ox + cs / 2, oy + cs / 2, oz + cs / 2];

        for (let f = 0; f < FACES.length; f++) {
          const a = FACES[f][0];
          const bb = FACES[f][1];
          const cc = FACES[f][2];
          const dd = FACES[f][3];
          extractTet(
            [cPt, cellPts[a], cellPts[bb], cellPts[cc]],
            [cVal, cellVals[a], cellVals[bb], cellVals[cc]],
          );
          extractTet(
            [cPt, cellPts[cc], cellPts[dd], cellPts[a]],
            [cVal, cellVals[cc], cellVals[dd], cellVals[a]],
          );
        }
      }
    }
  }

  // Deduplicate vertices (exact keys — shared edges are byte-identical) and
  // orient every triangle outward using the sampled field gradient.
  const verts: number[] = [];
  const normals: number[] = [];
  const index: number[] = [];
  const vertLookup = new Map<string, number>();

  const vertIndex = (x: number, y: number, z: number): number => {
    const key = x + ',' + y + ',' + z;
    const found = vertLookup.get(key);
    if (found !== undefined) return found;
    const i = verts.length / 3;
    verts.push(x, y, z);
    const [gx, gy, gz] = grad(x, y, z);
    normals.push(gx, gy, gz);
    vertLookup.set(key, i);
    return i;
  };

  for (let t = 0; t < rawPos.length; t += 9) {
    const ax = rawPos[t],
      ay = rawPos[t + 1],
      az = rawPos[t + 2];
    const bx = rawPos[t + 3],
      by = rawPos[t + 4],
      bz = rawPos[t + 5];
    const cx = rawPos[t + 6],
      cy = rawPos[t + 7],
      cz = rawPos[t + 8];

    const [gx, gy, gz] = grad((ax + bx + cx) / 3, (ay + by + cy) / 3, (az + bz + cz) / 3);

    const fnx = (by - ay) * (cz - az) - (bz - az) * (cy - ay);
    const fny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
    const fnz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

    const ia = vertIndex(ax, ay, az);
    const ib = vertIndex(bx, by, bz);
    const ic = vertIndex(cx, cy, cz);
    if (fnx * gx + fny * gy + fnz * gz < 0) index.push(ia, ic, ib);
    else index.push(ia, ib, ic);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(index);
  return geo;
}
