import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { isAllowedCategory, clampInt } from "@/lib/validation";

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
    const page = clampInt(searchParams.get("page"), 1, 100000, 1);
    const limit = clampInt(searchParams.get("limit"), 1, MAX_LIMIT, 20);

    if (category && category !== "all" && !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
      .from("community_posts")
      .select("*, user:user_id(full_name, avatar_url)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        posts: posts || [],
        pagination: { page, limit, total: count || 0 },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
