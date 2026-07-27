import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { error: ratingError } = await supabase.from("community_ratings").upsert({
      post_id: postId,
      user_id: user.id,
      score,
    }, { onConflict: "post_id,user_id" });

    if (ratingError) {
      return NextResponse.json({ error: ratingError.message }, { status: 500 });
    }

    if (comment?.trim()) {
      const { error: commentError } = await supabase.from("community_comments").insert({
        post_id: postId,
        user_id: user.id,
        text: comment.trim(),
        rating: score,
      });

      if (commentError) {
        return NextResponse.json({ error: commentError.message }, { status: 500 });
      }
    }

    // Recalculate average rating
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
