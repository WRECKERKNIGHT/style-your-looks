import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, score, comment } = body;

    if (!postId || !score) {
      return NextResponse.json({ error: "Post ID and score are required" }, { status: 400 });
    }

    if (score < 1 || score > 10) {
      return NextResponse.json({ error: "Score must be between 1 and 10" }, { status: 400 });
    }

    // In production, this would save to Supabase
    return NextResponse.json({
      success: true,
      message: "Rating submitted",
      rating: { postId, score, comment },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
