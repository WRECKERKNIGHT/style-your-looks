import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  sanitizeText,
  isAllowedCategory,
  isDataUrl,
  dataUrlToBuffer,
} from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const BUCKET = "community-posts";

interface PostBody {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  imageData?: unknown;
  faceBlurred?: unknown;
  isPrivate?: unknown;
}

export async function POST(request: Request) {
  try {
    const limitCheck = rateLimit(request, 5);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Slow down!" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    let body: PostBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = sanitizeText(body.title, 80);
    if (!title) {
      return NextResponse.json(
        { error: "A title is required (max 80 characters)" },
        { status: 400 }
      );
    }

    const description = sanitizeText(body.description, 500);

    const category = body.category;
    if (typeof category !== "string" || !isAllowedCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const faceBlurred = body.faceBlurred === true;
    const isPrivate = body.isPrivate === true;

    const imageData = body.imageData;
    const imageDataStr = typeof imageData === "string" ? imageData : null;
    if (imageData !== undefined && imageData !== null && !isDataUrl(imageData)) {
      return NextResponse.json(
        { error: "imageData must be a PNG/JPEG/WebP data URL" },
        { status: 400 }
      );
    }
    const imageBytes = imageDataStr
      ? Math.ceil((imageDataStr.length * 3) / 4)
      : 0;
    if (imageBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image exceeds the 15 MB limit" },
        { status: 413 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Community is not configured" },
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
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Confirm your email before posting to the community" },
        { status: 403 }
      );
    }

    let imageUrl: string | null = null;
    if (imageDataStr) {
      const { buffer, contentType } = dataUrlToBuffer(imageDataStr);
      const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
      const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, buffer, { contentType, upsert: false });
      if (uploadError) {
        return NextResponse.json(
          { error: "Could not upload your image" },
          { status: 500 }
        );
      }
      imageUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
    }

    const { data: post, error: insertError } = await supabase
      .from("community_posts")
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        image_url: imageUrl,
        face_blurred: faceBlurred,
        is_private: isPrivate,
        avg_rating: 0,
        rating_count: 0,
      })
      .select("id, title, category, created_at")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Could not create your post" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post.id,
          title: post.title,
          category: post.category,
          createdAt: post.created_at,
          isPrivate,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
