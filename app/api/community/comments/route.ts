import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isUuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface CommentRow {
  id: string;
  text: string;
  rating: number | null;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

export async function GET(request: Request) {
  try {
    const limitCheck = rateLimit(request, 30);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId") ?? searchParams.get("post_id");
    if (!postId || !isUuid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Community is not configured", demo: true },
        { status: 503 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: rows, error } = await supabase.rpc("get_post_comments", {
      target_post_id: postId,
    });

    if (error) {
      return NextResponse.json(
        { error: "Could not load comments" },
        { status: 500 }
      );
    }

    const comments = (rows as CommentRow[] | null)?.map((row) => ({
      id: row.id,
      text: row.text,
      rating: row.rating,
      createdAt: row.created_at,
      user: {
        full_name: row.full_name,
        avatar_url: row.avatar_url,
      },
    })) ?? [];

    return NextResponse.json(
      { success: true, comments },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
