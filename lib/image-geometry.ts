export interface CoverBox {
  boxW: number;
  boxH: number;
  imageAspect: number;
}

/**
 * Maps a normalized point (0..1) from the full source image into pixel
 * coordinates of a box that displays the image with `object-fit: cover`.
 *
 * `imageAspect` is naturalWidth / naturalHeight of the source. When no
 * cropping applies (aspect matches or value unknown), falls back to a plain
 * box-relative mapping.
 */
export function mapCoverPoint(
  u: number,
  v: number,
  { boxW, boxH, imageAspect }: CoverBox
): { x: number; y: number } {
  if (
    !isFinite(imageAspect) ||
    imageAspect <= 0 ||
    boxW <= 0 ||
    boxH <= 0
  ) {
    return { x: u * boxW, y: v * boxH };
  }

  const scale = Math.max(boxW / imageAspect, boxH);
  const displayedW = imageAspect * scale;
  const displayedH = scale;
  const offsetX = (displayedW - boxW) / 2;
  const offsetY = (displayedH - boxH) / 2;

  return {
    x: u * displayedW - offsetX,
    y: v * displayedH - offsetY,
  };
}
