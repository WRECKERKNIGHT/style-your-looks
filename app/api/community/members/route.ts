import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface MemberRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  post_count: number;
  first_post_at: string | null;
}

export async function GET(request: Request) {
  try {
    const limitCheck = rateLimit(request, 20);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
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

    const { data: rows, error } = await supabase.rpc("get_community_members");

    if (error) {
      return NextResponse.json(
        { error: "Could not load the member directory" },
        { status: 500 }
      );
    }

    const members = (rows as MemberRow[] | null)?.map((row) => ({
      id: row.id,
      user: {
        full_name: row.full_name,
        avatar_url: row.avatar_url,
      },
      postCount: Number(row.post_count ?? 0),
      firstPostAt: row.first_post_at,
    })) ?? [];

    return NextResponse.json(
      { success: true, members },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
