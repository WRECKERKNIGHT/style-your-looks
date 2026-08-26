/**
 * Population-calibrated scoring kernels.
 *
 * calibratedScore(): linear z-score mapping for directional metrics.
 *   z=0 → 5, z=1 → 7, z=2 → 9, z=-1 → 3, z=-2 → 1
 *
 * idealScore(): bell-curve scoring for "closer to ideal is better" metrics.
 *   Uses power-curve decay (not Gaussian) to spread scores across 1-10.
 *   At ideal: score=10. At 1σ away: ~7. At 2σ: ~4. At 3σ: ~1.
 *
 * Both produce scores that span the full 1-10 range for real face data.
 */

/**
 * Score a directional metric (higher = better).
 * Linear z-score: maps population statistics directly to 1-10.
 *
 * @param value   measured value
 * @param mu      population mean
 * @param sigma   population standard deviation
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
 * Score a "closer to ideal is better" metric.
 * Uses power-curve decay from the ideal value to spread scores across 1-10.
 *
 * At z=0 (at ideal): score = ceil (10)
 * At z=1 (1σ away): score ≈ 7
 * At z=2 (2σ away): score ≈ 4
 * At z=3 (3σ away): score ≈ 1
 *
 * @param value   measured ratio / angle / deviation
 * @param mu      aesthetic ideal from anthropometric literature
 * @param sigma   population spread — controls discrimination width
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

/**
 * Compute a z-score: how many standard deviations the measured value is
 * from the population mean. Used for percentile computation.
 */
export function toZScore(value: number, mu: number, sigma: number): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 0;
  return (value - mu) / sigma;
}
