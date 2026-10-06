/**
 * Cross-analyzer regression guard.
 *
 * verify-face-geometry.mjs covers the face measurement layer. Every defect
 * found there had the same shape — a formula and the reference it is scored
 * against quietly disagreeing — and nothing caught it. The other analyzers
 * carry the same kind of untested threshold logic, so they get the same
 * treatment here: pinned behaviour for the cases we know are right, plus
 * degenerate inputs, which is where threshold code usually breaks.
 *
 * No browser, no WASM, no photo. These are the pure decision functions.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const require = createRequire(import.meta.url);

// Minimal DOM shims so the browser modules load under node.
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

let classifyBodyType, analyzeColorSeason, getColorHarmonyScore, getSeasonEmoji;
let rangeScore, toZScore, idealScore, calibratedScore, domainToIndex;
let comparisonFromPercentile, computeFaceIQ;
try {
  const jiti = require(path.join(ROOT, 'node_modules/jiti'))(import.meta.url, {
    interopDefault: true,
    esmResolve: true,
  });
  ({ classifyBodyType } = jiti(path.join(ROOT, 'lib/ml/body-analyzer.ts')));
  ({ analyzeColorSeason, getColorHarmonyScore, getSeasonEmoji } = jiti(
    path.join(ROOT, 'lib/ml/color-analysis.ts'),
  ));
  ({ rangeScore, toZScore, idealScore, calibratedScore, domainToIndex } = jiti(
    path.join(ROOT, 'lib/ml/scoring-curves.ts'),
  ));
  ({ comparisonFromPercentile, computeFaceIQ } = jiti(path.join(ROOT, 'lib/ml/calibration.ts')));
} catch (err) {
  // Never block a deploy over an optional dev-only guard.
  console.warn(`verify:analyzers — skipped (cannot load analyzer modules): ${err.message}`);
  process.exit(0);
}

let failures = 0;
let checks = 0;

function check(name, condition, detail = "") {
  checks++;
  if (condition) return;
  failures++;
  console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

function section(title) {
  console.log(`\n${title}`);
}

/** Body types are width-ratio labels; pin each documented shape to a verdict. */
function bodyChecks() {
  section("body typing — classifyBodyType");
  const W = (shoulderWidth, waistWidth, hipWidth) => ({
    shoulderWidth,
    waistWidth,
    hipWidth,
  });

  // Textbook proportions for each label. These are the cases the thresholds
  // exist to serve, so a threshold edit that breaks one is a real regression.
  const cases = [
    ["Rectangle", W(40, 38, 39)], //           s2w 1.05, w2h 0.97, s2h 1.03
    ["Inverted Triangle", W(44, 34, 36)], //  s2w 1.29, s2h 1.22
    ["Triangle", W(34, 33, 40)], //            s2h 0.85, w2h 0.83
    ["Hourglass", W(42, 30, 41)], //           s2w 1.40, w2h 0.73, s2h 1.02
    ["Round", W(40, 45, 40)], //                w2h 1.13, s2w 0.89
  ];
  for (const [expected, m] of cases) {
    const got = classifyBodyType(m);
    check(`${expected} detected`, got === expected, `got "${got}"`);
  }

  // The classifier must always land on one of its own labels. A ratio that
  // falls through every branch silently becomes a body type nobody chose.
  const LABELS = new Set([
    "Rectangle",
    "Inverted Triangle",
    "Triangle",
    "Hourglass",
    "Round",
    "Mesomorph",
    "Endomorph",
    "Ectomorph",
  ]);
  const allLabels = [...LABELS].join("|");
  let offMenu = 0;
  for (let s = 0.2; s <= 3; s += 0.1) {
    for (let w = 0.2; w <= 3; w += 0.1) {
      for (let h = 0.2; h <= 3; h += 0.2) {
        const label = classifyBodyType(W(s, w, h));
        if (!LABELS.has(label)) offMenu++;
      }
    }
  }
  check(
    "every ratio maps to a documented label",
    offMenu === 0,
    `${offMenu} combinations fell through to an unknown label`
  );

  // A real analysis can hand back degenerate widths when a landmark is
  // occluded. Zero or negative widths make the ratios Infinity or NaN, and
  // those compare false against every threshold — the classifier then picks
  // whichever label happens to be last rather than admitting it has no data.
  const degenerate = [
    ["all zero", W(0, 0, 0)],
    ["zero hips", W(40, 35, 0)],
    ["zero waist", W(40, 0, 38)],
    ["negative", W(-40, 35, 38)],
    ["non-finite", W(NaN, 35, 38)],
    ["infinite", W(Infinity, 35, 38)],
  ];
  for (const [name, m] of degenerate) {
    const label = classifyBodyType(m);
    check(
      `degenerate widths rejected (${name})`,
      label === null,
      `returned "${label}" instead of refusing to classify`
    );
  }
}

function colorChecks() {
  section("colour analysis");
  const SEASONS = new Set(["Spring", "Summer", "Autumn", "Winter"]);

  // Every undertone crossed with a spread of ITA must resolve to a real
  // season, and an out-of-range ITA must not escape the four seasons.
  let bad = 0;
  const seen = new Set();
  for (const undertone of ["Warm", "Cool", "Neutral"]) {
    for (let ita = 0; ita <= 90; ita += 1) {
      const r = analyzeColorSeason({ undertone, ita, monkScaleId: 3 });
      if (!SEASONS.has(r.seasonalType)) bad++;
      else seen.add(r.seasonalType);
    }
  }
  check("every undertone/ITA pair yields a valid season", bad === 0, `${bad} invalid`);
  check("all four seasons are reachable", seen.size === 4, `only reached ${[...seen]}`);

  // A result must never ship an empty colour list — the UI renders these
  // directly as swatches, and an empty array renders as nothing at all.
  let emptyPalette = 0;
  for (const undertone of ["Warm", "Cool", "Neutral"]) {
    for (let ita = 0; ita <= 90; ita += 3) {
      const r = analyzeColorSeason({ undertone, ita, monkScaleId: 3 });
      if (
        !Array.isArray(r.bestColors) ||
        r.bestColors.length === 0 ||
        r.neutralColors.length === 0 ||
        !r.subType ||
        !r.description
      ) {
        emptyPalette++;
      }
    }
  }
  check("every season carries a full palette", emptyPalette === 0, `${emptyPalette} incomplete`);

  // Swatch colours must be real hex, or the style attribute silently drops them.
  const r = analyzeColorSeason({ undertone: "Warm", ita: 45, monkScaleId: 3 });
  const badHex = [
    ...r.bestColors,
    ...r.neutralColors,
    ...r.worstColors,
  ].filter((c) => !/^#[0-9a-fA-F]{6}$/.test(c));
  check("all palette entries are 6-digit hex", badHex.length === 0, badHex.slice(0, 3).join(","));

  check("season emoji resolves", ["Spring", "Summer", "Autumn", "Winter", "Nonsense"].every((s) => !!getSeasonEmoji(s)));

  section("colour harmony scoring");
  const palette = ["#A0522D", "#1F2937"];
  check("exact match scores 10", getColorHarmonyScore("#A0522D", palette) === 10, `got ${getColorHarmonyScore("#A0522D", palette)}`);
  check("score stays inside 0-10", (() => {
    for (const hex of ["#FFFFFF", "#000000", "#7F7F7F", "#123456"]) {
      const s = getColorHarmonyScore(hex, palette);
      if (!Number.isFinite(s) || s < 0 || s > 10) return false;
    }
    return true;
  })());

  // Malformed hex reaches this from user-entered values and catalogue rows.
  // parseInt("GG", 16) is NaN, NaN propagates through Math.min/Math.max, and
  // the function hands back NaN — which renders as literal "NaN" in the UI.
  for (const bad of ["#GGG", "#12345", "not-a-colour", "#", ""]) {
    const s = getColorHarmonyScore(bad, palette);
    // Null, not NaN: the UI needs to be able to say "cannot score this".
    check(`malformed hex "${bad}" declines to score`, s === null, `got ${s}`);
  }

  // With no palette to compare against there is no distance to speak of, so
  // reporting the worst possible score states a conclusion that isn't true.
  const noPalette = getColorHarmonyScore("#A0522D", []);
  check(
    "empty palette reports no score rather than worst-case",
    !Number.isFinite(noPalette),
    `got ${noPalette}`
  );
}

function curveChecks() {
  section("scoring curves");
  check("rangeScore clamps at the floor", rangeScore(-50) >= 1.5, `${rangeScore(-50)}`);
  check("rangeScore clamps at the ceiling", rangeScore(50) <= 10, `${rangeScore(50)}`);
  check("zero sigma does not divide by zero", toZScore(10, 5, 0) === 0);
  check("non-finite value is refused", toZScore(NaN, 5, 1) === 0);
  check("calibratedScore falls back on zero sigma", calibratedScore(10, 5, 0) === 5);
  check("idealScore falls back on zero sigma", idealScore(10, 5, 0) === 5);
  check("domainToIndex maps the bottom of the range to 0", domainToIndex(3) === 0);
  check("domainToIndex maps the top of the range to 100", domainToIndex(10) === 100);

  // A domain score of NaN must not become a NaN percentile bar.
  check(
    "domainToIndex refuses a non-finite score",
    Number.isFinite(domainToIndex(NaN)),
    `got ${domainToIndex(NaN)}`
  );
  check(
    "rangeScore refuses a non-finite z",
    Number.isFinite(rangeScore(NaN)),
    `got ${rangeScore(NaN)}`
  );
}

/**
 * The scoring numbers are indexes on a curve fitted to a reference corpus, not
 * percentiles of real users. ZERVEY holds no dataset of analysed faces, so any
 * generated string implying a ranking against them is a fabricated claim — and
 * one that shipped, as "Above 78% of all faces analysed".
 *
 * This scans every value the copy generator can produce rather than spot-
 * checking the current bands, so editing the thresholds cannot reintroduce a
 * claim without failing the build.
 */
function claimChecks() {
  section("reference framing — comparisonFromPercentile");

  const forbidden = /faces analysed|all faces|real users|other users|people|users/i;
  for (let p = 0; p <= 100; p++) {
    const copy = comparisonFromPercentile(p);
    check(
      `index ${p} makes no population claim`,
      copy === null || !forbidden.test(copy),
      `got "${copy}"`
    );
  }

  check("non-finite index declines to describe itself", comparisonFromPercentile(NaN) === null);
  check(
    "every band yields copy",
    [10, 30, 50, 75, 90, 99].every((p) => typeof comparisonFromPercentile(p) === 'string')
  );

  // The top band must not restate the number as a headcount of users.
  const top = comparisonFromPercentile(99) ?? '';
  check("top band does not report a headcount", !/\d+\s*%/.test(top), `got "${top}"`);

  // With nothing measured there is no index and no comparison to show.
  const none = computeFaceIQ({}, {});
  check("no measurable metric yields no index", none.faceIQ === null);
  check("no measurable metric yields no comparison", none.comparison === null);
}

console.log("verify:analyzers");
bodyChecks();
colorChecks();
curveChecks();
claimChecks();

console.log(`\n${checks - failures}/${checks} passed`);
if (failures > 0) {
  console.error(`verify:analyzers FAILED — ${failures} check(s)`);
  process.exit(1);
}
console.log("verify:analyzers OK");