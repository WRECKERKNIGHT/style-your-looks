/**
 * Population-calibrated scoring kernels.
 *
 * Linear penalty maps ("10 − deviation × k") slam common anatomical variation
 * to the floor and hand out 10s like candy inside a razor-thin band — the
 * score distribution ends up nothing like how trained assessors actually
 * rate faces. A Gaussian kernel centred on the researched aesthetic ideal,
 * with σ set to roughly half the real population spread for that measurement,
 * behaves like a clinical rating scale: most faces land mid-band, ideals are
 * rare but reachable, and outliers decay smoothly instead of cliff-dropping.
 */

/**
 * Score a raw measurement against an ideal using a Gaussian kernel.
 * @param value   measured ratio / angle / deviation
 * @param mu      aesthetic ideal from anthropometric literature
 * @param sigma   population spread constant — controls discrimination
 * @param floor   minimum returned score
 * @param ceil    maximum returned score
 */
export function idealScore(
  value: number,
  mu: number,
  sigma: number,
  floor = 2,
  ceil = 10
): number {
  const z = (value - mu) / sigma;
  const raw = floor + (ceil - floor) * Math.exp(-0.5 * z * z);
  return Math.max(floor, Math.min(ceil, Math.round(raw * 100) / 100));
}
