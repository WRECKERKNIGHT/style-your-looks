import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCategory, clampInt, isUuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;

export async function GET(request: Request) {
  try {
    const limitCheck = rateLimit(request, 60);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const id = searchParams.get("id");
    const page = clampInt(searchParams.get("page"), 1, 100000, 1);
    const limit = clampInt(searchParams.get("limit"), 1, MAX_LIMIT, 20);

    if (id && !isUuid(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    if (category && category !== "all" && !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
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

    let query = supabase
      .from("community_posts")
      .select(
        "id, user_id, image_url, category, title, description, face_blurred, is_private, avg_rating, rating_count, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.range((page - 1) * limit, page * limit - 1);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Could not load the community feed" },
        { status: 500 }
      );
    }

    // Resolve display names. profiles are RLS-protected, so names come from a
    // security-definer helper instead of an embedded join.
    const rows = posts || [];
    const userIds = [
      ...new Set(rows.map((p) => p.user_id).filter(Boolean) as string[]),
    ];
    const names: Record<string, { full_name: string | null; avatar_url: string | null }> =
      {};
    if (userIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabase.rpc(
        "get_public_profiles",
        { target_ids: userIds }
      );
      if (!profileError && Array.isArray(profileRows)) {
        for (const profile of profileRows) {
          names[profile.id] = {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          };
        }
      }
    }

    // Strip internal user ids from the public response to prevent account
    // enumeration via the feed.
    const postsWithUser = rows.map(({ user_id, ...post }) => ({
      ...post,
      user: user_id ? names[user_id] || null : null,
    }));

    return NextResponse.json(
      {
        success: true,
        posts: postsWithUser,
        pagination: { page, limit, total: count || 0 },
      },
      {
        headers: {
          // Feed can include the caller's own private posts; never share-cache.
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
