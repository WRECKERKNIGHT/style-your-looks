import { stat } from "node:fs/promises";
import path from "node:path";

const WASM_DIR = path.join("public", "mediapipe", "wasm");
const MODELS_DIR = path.join("public", "models");

const REQUIRED_WASM = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

const REQUIRED_MODELS = [
  { file: "face_landmarker.task", minBytes: 3 * 1024 * 1024 },
  { file: "pose_landmarker_heavy.task", minBytes: 25 * 1024 * 1024 },
  { file: "selfie_multiclass_256x256.tflite", minBytes: 10 * 1024 * 1024 },
];

// The rigged studio mannequin — a truncated GLB fails to parse at runtime,
// so guard it the same way as the ML weights.
const REQUIRED_MANNEQUIN = [
  { file: path.join("mannequin", "cesium-man.glb"), minBytes: 300 * 1024 },
];

let failed = false;

async function check(dir, file, minBytes = 0) {
  const full = path.join(dir, file);
  try {
    const info = await stat(full);
    if (info.size < minBytes) {
      console.error(
        `  x ${full} looks truncated (${info.size} bytes, expected at least ${minBytes})`
      );
      failed = true;
      return;
    }
    console.log(`  . ${full} (${(info.size / 1024 / 1024).toFixed(1)} MB)`);
  } catch {
    console.error(`  x MISSING ${full}`);
    failed = true;
  }
}

console.log("Verifying self-hosted ML engine assets...\n");

for (const file of REQUIRED_WASM) await check(WASM_DIR, file);
for (const { file, minBytes } of REQUIRED_MODELS) await check(MODELS_DIR, file, minBytes);
console.log("");
for (const { file, minBytes } of REQUIRED_MANNEQUIN) await check(MODELS_DIR, file, minBytes);

if (failed) {
  console.error(
    "\nML assets are incomplete — analysis engines would fall back to the CDN or fail offline."
  );
  console.error("Restore public/mediapipe/wasm and public/models before building.\n");
  process.exit(1);
}

console.log("\nAll ML assets present.");
