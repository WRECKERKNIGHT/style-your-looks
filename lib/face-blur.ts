function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/**
 * Blurs the face region of an image using the MediaPipe landmark mesh, so the
 * "blur my face" option on community posts is a real, on-device edit rather
 * than a flag we cannot verify. Returns a JPEG data URL.
 */
export async function blurFaceRegion(
  imageData: string,
  landmarks: number[][]
): Promise<string> {
  if (!imageData || landmarks.length < 5) return imageData;

  const img = await loadImage(imageData);
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) return imageData;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return imageData;

  ctx.drawImage(img, 0, 0);

  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of landmarks) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (maxX <= minX || maxY <= minY) return imageData;

  const padX = (maxX - minX) * 0.35;
  const padY = (maxY - minY) * 0.5;
  const bx = Math.max(0, (minX - padX) * width);
  const by = Math.max(0, (minY - padY) * height);
  const bw = Math.min(width - bx, (maxX - minX + padX * 2) * width);
  const bh = Math.min(height - by, (maxY - minY + padY * 2) * height);
  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(bw / 2, 10), Math.max(bh / 2, 10), 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.filter = "blur(42px) saturate(1.1)";
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";
  ctx.fillStyle = "rgba(20,12,8,0.35)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}
