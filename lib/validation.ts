export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.slice(0, maxLength).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

export function isUuid(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export function isHttpUrl(value: unknown, allowedHost?: string): boolean {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (allowedHost && !url.hostname.endsWith(allowedHost)) return false;
    return true;
  } catch {
    return false;
  }
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

export function isAllowedCategory(value: string): boolean {
  return ["outfit", "face", "grooming", "body", "color", "tryon"].includes(value);
}

export function isDataUrl(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value)
  );
}

export function dataUrlToBuffer(value: string): {
  buffer: Buffer;
  contentType: string;
} {
  const match = /^data:image\/(\w+);base64,(.+)$/i.exec(value);
  if (!match) throw new Error("Invalid image data URL");
  const mimeByExt: Record<string, string> = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const contentType = mimeByExt[match[1].toLowerCase()] || "image/jpeg";
  return {
    buffer: Buffer.from(match[2], "base64"),
    contentType,
  };
}

export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\") || raw.includes(":")) return fallback;
  return raw;
}
