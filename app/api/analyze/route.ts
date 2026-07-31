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

    const body = await request.json();
    const { imageData, analysisType } = body;

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    if (imageData.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds maximum allowed size" },
        { status: 413 }
      );
    }

    if (analysisType && !["face", "body", "color", "all"].includes(analysisType)) {
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
