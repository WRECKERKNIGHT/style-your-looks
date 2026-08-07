import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const limitCheck = rateLimit(request, 10, 60_000);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageData, analysisType } = (body ?? {}) as {
      imageData?: unknown;
      analysisType?: unknown;
    };

    if (typeof imageData !== "string" || !imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: "A valid data-URL image is required" }, { status: 400 });
    }

    const approxBytes = Math.ceil((imageData.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds maximum allowed size" },
        { status: 413 }
      );
    }

    if (
      analysisType !== undefined &&
      (typeof analysisType !== "string" || !["face", "body", "color", "all"].includes(analysisType))
    ) {
      return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Analysis should be performed client-side using MediaPipe",
      redirect: "/dashboard/face-analysis",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
