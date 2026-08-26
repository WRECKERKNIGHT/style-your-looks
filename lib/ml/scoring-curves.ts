/**
 * Population-calibrated scoring kernels.
 *
 * The calibratedScore() function maps a raw measurement to a 1-10 score
 * using z-scores against published population statistics. Unlike the old
 * idealScore() Gaussian kernel which compressed everyone to 5-6, this
 * produces true population-relative scores where:
 *   - 5 = exactly average
 *   - 7 = ~84th percentile (1 SD above)
 *   - 9 = ~98th percentile (2 SD above)
 *   - 3 = ~16th percentile (1 SD below)
 *
 * For metrics where HIGHER is better (symmetry, jawline sharpness):
 *   mu is the population mean, positive z = above average = higher score.
 *
 * For metrics where CLOSER TO IDEAL is better (ratios, proportions):
 *   mu is the aesthetic ideal, and deviation in either direction penalizes.
 */

/**
 * Score a measurement where HIGHER values are better (e.g., symmetry, jawline).
 * Uses z-score against population mean, mapped to 1-10 scale.
 *
 * @param value   measured value
 * @param mu      population mean
 * @param sigma   population standard deviation
 * @param floor   minimum score (default 1)
 * @param ceil    maximum score (default 10)
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
  // Map z-score to 1-10: z=0 → 5, z=1 → ~7, z=2 → ~9, z=-1 → ~3
  const raw = 5 + z * 2;
  return Math.round(Math.max(floor, Math.min(ceil, raw)) * 10) / 10;
}

/**
 * Score a measurement where CLOSER TO IDEAL is better (e.g., ratios, angles).
 * Uses Gaussian decay from the ideal value, but with tighter spread than
 * the old idealScore() to produce better discrimination.
 *
 * @param value   measured ratio / angle / deviation
 * @param mu      aesthetic ideal from anthropometric literature
 * @param sigma   population spread — controls discrimination width
 * @param floor   minimum score (default 1)
 * @param ceil    maximum score (default 10)
 */
export function idealScore(
  value: number,
  mu: number,
  sigma: number,
  floor = 1,
  ceil = 10
): number {
  if (sigma <= 0 || !Number.isFinite(value)) return 5;
  const z = (value - mu) / sigma;
  const raw = ceil - (ceil - 5) * (1 - Math.exp(-0.5 * z * z));
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
