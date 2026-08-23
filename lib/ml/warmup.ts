import { initializeFaceLandmarker } from "./face-analyzer";

let warmed = false;

/**
 * Pre-build the ML engines so the first user scan skips the multi-second
 * WASM/model init on an already nerve-wracking "analysing..." screen.
 * Safe to call repeatedly; failures clear the flag so a later mount retries.
 */
export async function warmupEngines(): Promise<void> {
  if (warmed) return;
  warmed = true;
  try {
    await initializeFaceLandmarker();
  } catch (err) {
    warmed = false;
    console.warn("Engine warm-up skipped — will retry before first scan:", err);
  }
}
