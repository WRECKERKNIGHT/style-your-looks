import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, analysisType } = body;

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // Server-side analysis is a fallback — primary analysis runs in browser via MediaPipe
    // This route can be used for heavier processing if needed in the future
    return NextResponse.json({
      success: true,
      message: "Analysis should be performed client-side using MediaPipe",
      redirect: "/dashboard/face-analysis",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
