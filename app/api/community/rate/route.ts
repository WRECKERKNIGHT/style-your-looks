import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText, isUuid } from "@/lib/validation";

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
    if (typeof postId !== "string" || !isUuid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Reject out-of-range scores instead of silently clamping them.
    const rawScore = body.score;
    const score = typeof rawScore === "number" ? rawScore : Number(rawScore);
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      return NextResponse.json(
        { error: "Score must be an integer between 1 and 10" },
        { status: 400 }
      );
    }

    const comment = sanitizeText(body.comment, 280);

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

    // Unverified email addresses must not be able to influence community
    // ratings. Prevents account-squatting abuse of the public feed.
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Confirm your email before rating or commenting" },
        { status: 403 }
      );
    }

    // Ensure the target post exists and is visible to the caller (private posts
    // owned by someone else are filtered out by RLS and treated as not found).
    const { data: post, error: postError } = await supabase
      .from("community_posts")
      .select("id, user_id")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // No self-rating: a user cannot rate their own post, so averages can't be
    // inflated by the author.
    if (post.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot rate your own post" },
        { status: 403 }
      );
    }

    const { error: ratingError } = await supabase
      .from("community_ratings")
      .upsert(
        {
          post_id: postId,
          user_id: user.id,
          score,
        },
        { onConflict: "post_id,user_id" }
      );

    if (ratingError) {
      return NextResponse.json(
        { error: "Could not save your rating" },
        { status: 500 }
      );
    }

    if (comment) {
      const { error: commentError } = await supabase
        .from("community_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          text: comment,
          rating: score,
        });

      if (commentError) {
        return NextResponse.json(
          { error: "Could not save your comment" },
          { status: 500 }
        );
      }
    }

    // Refresh the post average via a security-definer helper (the DB trigger
    // also covers this; a failure here is non-fatal).
    await supabase.rpc("recompute_post_rating", {
      target_post_id: postId,
    });

    return NextResponse.json({ success: true, message: "Rating submitted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
