/**
 * Population-calibrated scoring kernels.
 *
 * rangeScore(): PRIMARY — range-based scoring for bell-curve metrics.
 *   Uses preferred/acceptable ranges instead of a single "ideal" point.
 *   Normal variation (within 1σ) stays in 8-10 range. Only extreme
 *   deviation (beyond 2σ) drops below 5. Floor is 3 — a valid
 *   measurement never scores 0.
 *
 *   preferred: -0.5σ to +0.5σ → score 8.5-10
 *   acceptable: -1.0σ to +1.0σ → score 7-9
 *   beyond: penalty drops toward floor (3)
 */

/**
 * Score a bell-curve measurement using preferred/acceptable ranges.
 *
 * Instead of "120° = 10, 112° = worse", this says:
 *   "116-124° is preferred (9-10), 112-128° is acceptable (7-10),
 *    beyond that gets penalized but never to 0."
 *
 * @param z        absolute z-score (how many σ from population mean)
 * @param floor    minimum score (default 3 — valid measurements never hit 0)
 * @param ceil     maximum score (default 10)
 */
export function rangeScore(
  z: number,
  floor = 3,
  ceil = 10
): number {
  if (!Number.isFinite(z)) return (floor + ceil) / 2;
  const az = Math.abs(z);
  const range = ceil - floor;

  // Within preferred range (0-0.5σ): score 9-10
  if (az <= 0.5) {
    return ceil - range * 0.10 * (az / 0.5);
  }
  // Within acceptable range (0.5-1.0σ): score 7-9
  if (az <= 1.0) {
    return (ceil - range * 0.10) - range * 0.20 * ((az - 0.5) / 0.5);
  }
  // Beyond acceptable (1.0-2.5σ): score 3-7
  if (az <= 2.5) {
    return (ceil - range * 0.30) - range * 0.70 * ((az - 1.0) / 1.5);
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
  ceil = 10
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
export function idealScore(
  value: number,
  mu: number,
  sigma: number,
  floor = 1,
  ceil = 10
): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 5;
  const z = Math.abs((value - mu) / sigma);
  const range = ceil - floor;
  const raw = ceil - range * Math.min(1, z * 0.5);
  return Math.round(Math.max(floor, Math.min(ceil, raw)) * 10) / 10;
}
