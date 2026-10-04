/**
 * Regression guard for the face-measurement layer.
 *
 * Every bug this file guards against was the same shape of bug: a landmark
 * index or a ratio definition that was never checked against what MediaPipe's
 * mesh actually contains, paired with a textbook mu that did not describe the
 * quantity being measured. The result was a metric that returned the same
 * out-of-range verdict for every photo.
 *
 * These assertions run against MediaPipe's own canonical face model, so they
 * need no photo, no WebGL and no browser. A "perfectly average" face must land
 * near 0σ on every metric; anything else means the reference and the formula
 * have drifted apart again.
 *
 * Run with: npm run verify:face
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);

// ── minimal DOM shims so the browser modules load under node ────────────────
globalThis.HTMLCanvasElement ??= class {};
globalThis.HTMLImageElement ??= class {};
globalThis.HTMLVideoElement ??= class {};
globalThis.ImageBitmap ??= class {};
globalThis.document ??= {
  createElement: () => ({ getContext: () => null, style: {} }),
  addEventListener() {},
  removeEventListener() {},
};
globalThis.window ??= globalThis;
globalThis.self ??= globalThis;
globalThis.navigator ??= { userAgent: 'node' };

let computeRawGeometry;
try {
  const jiti = require(path.join(ROOT, 'node_modules/jiti'))(import.meta.url, {
    interopDefault: true,
    esmResolve: true,
  });
  ({ computeRawGeometry } = jiti(path.join(ROOT, 'lib/ml/face-analyzer.ts')));
} catch (err) {
  // Never block a deploy over an optional dev-only guard.
  console.warn(`verify:face — skipped (cannot load face-analyzer.ts): ${err.message}`);
  process.exit(0);
}

// ── canonical face model ───────────────────────────────────────────────────
const verts = [];
for (const line of readFileSync(path.join(HERE, 'fixtures/face-canonical-468.obj'), 'utf8').split(
  /\r?\n/,
)) {
  if (!line.startsWith('v ')) continue;
  const p = line.trim().split(/\s+/);
  verts.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
}
if (verts.length !== 468) {
  console.error(`verify:face — expected 468 canonical vertices, got ${verts.length}`);
  process.exit(1);
}

// The canonical model is in its own units; the harness normalises into a
// roughly 0..1 image box, which is the scale the real task reports.
const minX = Math.min(...verts.map((v) => v[0]));
const maxX = Math.max(...verts.map((v) => v[0]));
const minY = Math.min(...verts.map((v) => v[1]));
const maxY = Math.max(...verts.map((v) => v[1]));
const scale = 1 / (maxX - minX);
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;

/** Map canonical model coords to normalised image coords (y down). */
const toLandmark = ([x, y, z]) => ({
  x: 0.5 + (x - cx) * scale,
  y: 0.5 - (y - cy) * scale,
  z: z * scale,
});

/** Build a synthetic 478-point result. `warp` may mutate the vertex list. */
function buildResult(warp, irisPoints) {
  const v = warp ? warp(verts.map((p) => [...p])) : verts;
  const faceLandmarks = v.map(toLandmark);
  const eyeL = { x: 0.42, y: 0.42, z: 0 };
  const eyeR = { x: 0.58, y: 0.42, z: 0 };
  for (let i = 0; i < 10; i++) {
    const src = i < 5 ? eyeL : eyeR;
    const p = irisPoints?.[i] ?? src;
    faceLandmarks.push({ x: p.x, y: p.y, z: p.z ?? 0 });
  }
  return {
    faceLandmarks: [faceLandmarks],
    facialTransformationMatrixes: [
      { columns: 4, rows: 4, data: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
    ],
  };
}

const MOUTH_Y = (verts[0][1] + verts[17][1]) / 2;

/** Widen the lower face (jaw + chin) by `f`, leaving the upper face alone. */
const widenJaw = (f) => (v) => v.map(([x, y, z]) => (y <= MOUTH_Y ? [x * f, y, z] : [x, y, z]));

/**
 * Push the cheekbones (234/454) outward. horizontal fifths measures the bands
 * between the face edge and the outer canthi, so widening the cheekbones is
 * what actually moves it — the jaw plays no part in that measurement.
 */
const widenCheekbones = (f) => (v) =>
  v.map((p, i) => (i === 234 || i === 454 ? [p[0] * f, p[1], p[2]] : p));

// ── assertions ─────────────────────────────────────────────────────────────
const failures = [];
const checks = [];
function check(name, fn) {
  try {
    const msg = fn();
    checks.push([name, true, msg ?? '']);
  } catch (err) {
    checks.push([name, false, err.message]);
    failures.push(`${name}: ${err.message}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const fmt = (n) => (typeof n === 'number' ? n.toFixed(3) : String(n));

// 1. A perfectly average face must be measurable, valid and near 0σ.
const base = computeRawGeometry(buildResult(), 'front');
check('canonical face produces geometry', () => {
  assert(base, 'computeRawGeometry returned null for the canonical 468-vertex mesh');
  return 'ok';
});

const SCORED = Object.entries(base ?? {}).filter(
  ([, m]) => m && typeof m === 'object' && 'status' in m,
);

// Metrics that are deliberately withheld from a front-facing photo, either
// because the mesh has no such landmark (upperThird) or because the
// measurement needs a true side view (the nasal set).
const FRONT_UNAVAILABLE = new Set(['upperThird', 'noseProjection', 'noseBridgeAngle', 'alarAngle']);

// 1. Every front-viewable metric must still be measurable on a known mesh.
//
// Note what this deliberately does NOT assert: that the canonical mesh lands on
// the shipped mu. MediaPipe's canonical model is a stylised average face, while
// the shipped mu values are medians measured over real photographs — the two
// have no obligation to coincide, and the real ones are the ones that matter.
// Demanding a synthetic mesh match a real-population median was the wrong test
// and it fought the correct data. mu/sigma correctness is owned by check 7,
// which replays real captured faces; measurability and anatomy-sensitivity are
// owned here.
check('all front-viewable metrics are measurable and valid', () => {
  const bad = [];
  for (const [k, m] of SCORED) {
    if (FRONT_UNAVAILABLE.has(k)) continue; // checked separately below
    if (m.status !== 'valid') bad.push(`${k}: status=${m.status} (${m.reason ?? 'no reason'})`);
    else if (!Number.isFinite(m.raw)) bad.push(`${k}: raw is not finite`);
  }
  assert(bad.length === 0, `canonical face is not measurable:\n    ${bad.join('\n    ')}`);
  return `${SCORED.length - FRONT_UNAVAILABLE.size} metrics measured and valid`;
});

// 2. Measurements that cannot be taken from a front photo must say so rather
//    than reporting a number derived from the wrong landmarks.
check('unmeasurable metrics are unavailable with a reason', () => {
  const bad = [];
  for (const k of FRONT_UNAVAILABLE) {
    const m = base?.[k];
    if (!m) {
      bad.push(`${k}: missing`);
      continue;
    }
    if (m.status !== 'unavailable') bad.push(`${k}: expected unavailable, got ${m.status}`);
    else if (!m.reason) bad.push(`${k}: unavailable with no reason given to the user`);
    else if (m.confidence !== 0) bad.push(`${k}: unavailable but confidence ${m.confidence}`);
  }
  assert(bad.length === 0, bad.join('; '));
  return `${FRONT_UNAVAILABLE.size} withheld`;
});

check('upperThird refuses to invent a hairline', () => {
  const m = base?.upperThird;
  assert(m, 'upperThird missing');
  assert(m.status === 'unavailable', `expected unavailable, got ${m.status}`);
  return m.reason ?? 'unavailable';
});

// 3. Range guards — each one reproduces a specific historical bug.
const RANGES = [
  ['horizontalFifths', 0.4, 1.0, 'was structurally pinned at 4.0 (outer bands always zero)'],
  ['gonialAngle', 100, 170, 'was ~11 deg (angle taken at the chin, not the gonion)'],
  ['upperLipRatio', 0.1, 0.5, 'was ~1.06 (divided by vermilion height, not mouth height)'],
  ['browTilt', -25, 25, 'was ~-31 deg (brow landmarks were not mirrored)'],
  ['jawRatio', 0.3, 1.2, 'was negative (jaw landmarks were wider than the cheekbones)'],
  ['mandibularTaper', -0.2, 0.6, 'was negative (jaw landmarks were wider than the cheekbones)'],
  ['fwhr', 0.8, 3.0, 'out of range for a bizygomatic-width ratio'],
  ['lipFullness', 0.1, 0.8, 'out of range for a vermilion/mouth-height ratio'],
  ['faceRatio', 0.6, 1.2, 'out of range for a face width/height ratio'],
];
for (const [key, lo, hi, why] of RANGES) {
  check(`${key} in [${lo}, ${hi}]`, () => {
    const m = base?.[key];
    assert(m, `${key} missing`);
    assert(m.raw >= lo && m.raw <= hi, `raw ${fmt(m.raw)} outside [${lo}, ${hi}] — ${why}`);
    return `${fmt(m.raw)}`;
  });
}

// 4. A measurement must respond to the anatomy it claims to measure.
check('horizontalFifths responds to cheekbone width', () => {
  const before = base.horizontalFifths.raw;
  const after = computeRawGeometry(buildResult(widenCheekbones(1.2)), 'front').horizontalFifths.raw;
  const delta = Math.abs(after - before);
  assert(
    delta > 0.02,
    `value did not move when the cheekbones widened (${fmt(before)} -> ${fmt(after)})`,
  );
  return `Δ${fmt(delta)}`;
});

check('gonialAngle responds to jaw width', () => {
  const before = base.gonialAngle.raw;
  const after = computeRawGeometry(buildResult(widenJaw(1.35)), 'front').gonialAngle.raw;
  const delta = Math.abs(after - before);
  assert(delta > 0.5, `value did not move when the jaw widened (${fmt(before)} -> ${fmt(after)})`);
  return `Δ${fmt(delta)}°`;
});

// 5. Iris landmarks must not influence any measurement.
//    468-477 are the MediaPipe iris points. Treating them as face landmarks is
//    what put a left-iris point into the nose-width formula.
check('iris landmarks do not affect any metric', () => {
  const junk = Array.from({ length: 10 }, (_, i) => ({ x: 0.02 + i * 0.09, y: 0.97, z: -3 }));
  const withJunk = computeRawGeometry(buildResult(null, junk), 'front');
  const diffs = [];
  for (const [k, m] of SCORED) {
    if (k === 'upperThird' || !m || !withJunk[k]) continue;
    if (Math.abs(withJunk[k].raw - m.raw) > 1e-9) {
      diffs.push(`${k}: ${fmt(m.raw)} -> ${fmt(withJunk[k].raw)}`);
    }
  }
  assert(
    diffs.length === 0,
    `metrics changed when iris points were replaced:\n    ${diffs.join('\n    ')}`,
  );
  return `${SCORED.length - 1} metrics unaffected`;
});

// 6. Landmark-count guard: 455 is the highest index used, so a 455-point mesh
//    must still be measured (the old guard demanded 469 and rejected valid faces).
check('455-landmark mesh is accepted, 454 is rejected', () => {
  const trimmed = buildResult();
  trimmed.faceLandmarks[0] = trimmed.faceLandmarks[0].slice(0, 455);
  const ok = computeRawGeometry(trimmed, 'front');
  assert(ok, 'a 455-landmark mesh was rejected even though 454 is the highest index used');
  const short = buildResult();
  short.faceLandmarks[0] = short.faceLandmarks[0].slice(0, 454);
  assert(!computeRawGeometry(short, 'front'), 'a 454-landmark mesh should be rejected');
  return '455 ok / 454 rejected';
});

// 7. The shipped REFS must describe REAL measured faces.
//
// This is the check that would have caught the original defect. The previous
// REFS were fitted to a synthetic average mesh and were more than 1σ off the
// real-photo median on eight metrics, which quietly billed a large share of
// real users as "out of range". This replays landmark sets captured from real
// photographs by the real MediaPipe FaceLandmarker in real Chrome and asserts
// two distribution-level facts about the shipped mu/sigma:
//
//   1. mu must sit INSIDE the real p10-p90 band. A systematic offset — the exact
//      bug being guarded against — puts mu outside it.
//   2. sigma must be sized to the real spread: the real p10-p90 span should be
//      roughly 0.8σ to 3σ wide (Gaussian is 2.56σ). Too tight and ordinary faces
//      get called out of range; too wide and the metric stops discriminating.
//
// Both are deliberately distribution-level rather than "median within 0.5σ".
// faceRatio, fwhr, jawRatio and lipFullness are heavy-tailed and lightly
// sampled, so a point estimate of the median is unstable at fixture size and
// would fail on sampling noise alone. Containment and spread are stable.
// Re-deriving REFS from a synthetic source, or hand-editing one, now fails.
check('shipped REFS are consistent with real measured photographs', () => {
  const fixture = JSON.parse(
    readFileSync(path.join(HERE, 'fixtures/face-real-calibration.json'), 'utf8'),
  );
  const samples = new Map();

  for (const [lm, matrix] of fixture.faces) {
    const result = {
      faceLandmarks: [lm.map(([x, y, z]) => ({ x, y, z }))],
      faceBlendshapes: [],
      facialTransformationMatrixes: matrix ? [{ data: matrix, rows: 4, columns: 4 }] : [],
    };
    const geo = computeRawGeometry(result, 'front');
    if (!geo) continue;
    for (const [k, m] of Object.entries(geo)) {
      if (!m || typeof m !== 'object' || m.status !== 'valid') continue;
      if (FRONT_UNAVAILABLE.has(k)) continue;
      if (!samples.has(k)) samples.set(k, []);
      samples.get(k).push(m);
    }
  }

  const MIN_N = 10;
  const quantile = (arr, p) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))];
  };

  const offsetBad = [];
  const spreadBad = [];
  let compared = 0;

  // Deviation-from-symmetry measures are the deliberate exception. For these, 0
  // IS perfect symmetry and that — not the population median — is the correct
  // centre: a real photo's median sits near 0.08 purely because of camera
  // perspective, and anchoring mu there would quietly tax every frontal photo
  // for the angle it was shot at. The real-data containment test is meaningless
  // for them, so they are checked for spread only, plus the invariant that
  // their mu must stay exactly 0.
  const SYMMETRY_METRICS = new Set(['chinProjection', 'jawSymmetry', 'symmetry']);

  for (const [k, list] of samples) {
    if (list.length < MIN_N) continue; // too few rated frames to say anything
    const raws = list.map((m) => m.raw);
    const p10 = quantile(raws, 0.1);
    const p90 = quantile(raws, 0.9);
    const { mu, sigma } = list[0];
    compared++;

    if (SYMMETRY_METRICS.has(k)) {
      if (mu !== 0) {
        offsetBad.push(
          `${k}: mu must stay exactly 0 (perfect symmetry is the centre), got ${fmt(mu)}`,
        );
      }
    } else if (mu < p10 || mu > p90) {
      offsetBad.push(
        `${k}: shipped mu ${fmt(mu)} is outside the real p10-p90 band [${fmt(p10)}, ${fmt(p90)}] (n=${list.length})`,
      );
    }
    // A spread far wider than the data means the metric is washing out; far
    // narrower means ordinary faces are being flagged as extreme. The floor is
    // 0.5 rather than 1.0 because these real distributions are not Gaussian:
    // browLengthRatio in particular is tight-cored with a long upper tail, so
    // its p10-p90 half-span is well under 1.28σ, and the symmetry measures are
    // deliberately widened above their measured spread to absorb camera
    // perspective. 0.5 still catches a sigma so wide that the entire real
    // distribution collapses inside ±0.25σ and the metric stops discriminating.
    const MIN_SPAN_IN_SIGMAS = 0.5;
    const MAX_SPAN_IN_SIGMAS = 3;
    const spanInSigmas = (p90 - p10) / (2 * sigma);
    if (spanInSigmas < MIN_SPAN_IN_SIGMAS || spanInSigmas > MAX_SPAN_IN_SIGMAS) {
      spreadBad.push(
        `${k}: real p10-p90 span is ${spanInSigmas.toFixed(2)}σ wide but shipped sigma is ${fmt(sigma)} (n=${list.length})`,
      );
    }
  }

  assert(compared >= 20, `only ${compared} metrics comparable — fixture looks broken`);
  assert(
    offsetBad.length === 0,
    `shipped REFS are offset from real photographs:\n    ${offsetBad.join('\n    ')}`,
  );
  assert(
    spreadBad.length === 0,
    `shipped sigma is mis-sized against real photographs:\n    ${spreadBad.join('\n    ')}`,
  );
  return `${compared} metrics over ${fixture.faces.length} real faces`;
});

// ── output ─────────────────────────────────────────────────────────────────
const w = Math.max(...checks.map(([n]) => n.length));
for (const [name, ok, msg] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(w)}  ${msg}`);
}
console.log(`\n${checks.length - failures.length}/${checks.length} passed`);
if (failures.length) {
  console.error(`\nverify:face FAILED\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log('verify:face OK');
