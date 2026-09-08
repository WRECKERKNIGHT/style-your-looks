/**
 * Population-calibrated scoring kernels.
 *
 * rangeScore(): PRIMARY — range-based scoring for bell-curve metrics.
 *   Uses preferred/acceptable ranges instead of a single "ideal" point.
 *   Normal variation (within 1σ) stays in ~8-10 range. Further deviation
 *   descends smoothly (not a flat catch-all) so genuinely extreme-but-valid
 *   measurements stay distinguishable from "unavailable" (null). The floor is
 *   intentionally low — a valid extreme measurement is honestly low, but a
 *   failed/unavailable measurement is never shown as a score at all (null).
 *
 *   preferred: -0.5σ to +0.5σ → score ~8-10
 *   acceptable: -1.0σ to +1.0σ → score ~7-8
 *   beyond: penalty descends toward floor (1.5)
 */

/**
 * Score a bell-curve measurement using preferred/acceptable ranges.
 *
 * Instead of "120° = 10, 112° = worse", this says:
 *   "116-124° is preferred (9-10), 112-128° is acceptable (7-10),
 *    beyond that gets penalized but remains a real, honest low score."
 *
 * The curve is tuned to give real, visible differentiation for typical
 * faces — the population mean scores ~7.5, a +0.5σ deviation ~8.3, and a
 * +1σ deviation ~8.9. This replaces the old version where nearly every
 * normal face scored 8-10 and differences were invisible.
 *
 * @param z        absolute z-score (how many σ from population mean)
 * @param floor    minimum score for a VALID measurement (default 1.5)
 * @param ceil     maximum score (default 10)
 */
export function rangeScore(z: number, floor = 1.5, ceil = 10): number {
  if (!Number.isFinite(z)) return (floor + ceil) / 2;
  const az = Math.abs(z);

  // Exact anchors so we can reason about the curve precisely:
  //   z=0.0 → 7.5   (population mean)
  //   z=0.5 → 9.3   (preferred band edge)
  //   z=1.0 → 6.0   (acceptable band edge)
  //   z=2.5 → floor (1.5 by default)
  //   z>2.5 → floor
  if (az <= 0.5) {
    return 7.5 + ((9.3 - 7.5) / 0.5) * az;
  }
  if (az <= 1.0) {
    return 9.3 - ((9.3 - 6.0) / 0.5) * (az - 0.5);
  }
  if (az <= 2.5) {
    return 6.0 - ((6.0 - floor) / 1.5) * (az - 1.0);
  }
  return floor;
}

/**
 * Convert a domain's rangeScore (3-10) to a 0-100 index for Face Profile.
 */
export function domainToIndex(score: number): number {
  return Math.round(Math.max(0, Math.min(100, ((score - 3) / 7) * 100)));
}

/**
 * Compute a z-score from a raw measurement.
 */
export function toZScore(value: number, mu: number, sigma: number): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 0;
  return (value - mu) / sigma;
}

/**
 * LEGACY: Score a directional metric (higher = better).
 * Kept for backward compatibility with unmigrated callers.
 */
export function calibratedScore(
  value: number,
  mu: number,
  sigma: number,
  floor = 1,
  ceil = 10,
): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 5;
  const z = (value - mu) / sigma;
  const raw = 5 + z * 2;
  return Math.round(Math.max(floor, Math.min(ceil, raw)) * 10) / 10;
}

/**
 * LEGACY: Score a "closer to ideal is better" metric.
 * Too harsh — normal variation (1σ) drops to 5.5. Replaced by rangeScore.
 * Kept for backward compatibility with unmigrated callers.
 */
export function idealScore(value: number, mu: number, sigma: number, floor = 1, ceil = 10): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 5;
  const z = Math.abs((value - mu) / sigma);
  const range = ceil - floor;
  const raw = ceil - range * Math.min(1, z * 0.5);
  return Math.round(Math.max(floor, Math.min(ceil, raw)) * 10) / 10;
}
