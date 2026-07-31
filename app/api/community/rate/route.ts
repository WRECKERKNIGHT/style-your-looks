import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, isUuid, clampInt } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const limitCheck = rateLimit(request, 20);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Slow down!" },
        { status: 429 }
      );
    }

    let body: { postId?: unknown; score?: unknown; comment?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const postId = body.postId;
    const score = clampInt(body.score, 1, 10, -1);
    const comment = sanitizeText(body.comment, 280);

    if (typeof postId !== "string" || !isUuid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (score < 1 || score > 10) {
      return NextResponse.json(
        { error: "Score must be between 1 and 10" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { error: ratingError } = await supabase.from("community_ratings").upsert(
      {
        post_id: postId,
        user_id: user.id,
        score,
      },
      { onConflict: "post_id,user_id" }
    );

    if (ratingError) {
      return NextResponse.json({ error: ratingError.message }, { status: 500 });
    }

    if (comment) {
      const { error: commentError } = await supabase.from("community_comments").insert({
        post_id: postId,
        user_id: user.id,
        text: comment,
        rating: score,
      });

      if (commentError) {
        return NextResponse.json({ error: commentError.message }, { status: 500 });
      }
    }

    const { data: ratings } = await supabase
      .from("community_ratings")
      .select("score")
      .eq("post_id", postId);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
      await supabase
        .from("community_posts")
        .update({ avg_rating: Math.round(avg * 10) / 10, rating_count: ratings.length })
        .eq("id", postId);
    }

    return NextResponse.json({ success: true, message: "Rating submitted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
