import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/children/:id/photo — Upload a welcome photo for a child.
 * Accepts multipart/form-data with a single "file" field.
 * Stores the image in Supabase Storage (welcome-photos bucket),
 * then updates the child's photo_url in the database.
 *
 * DELETE /api/children/:id/photo — Remove the welcome photo.
 */

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: childId } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File must be JPEG, PNG, or WebP" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Generate a unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${childId}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("welcome-photos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Photo Upload] Storage error:", uploadError.message);
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("welcome-photos").getPublicUrl(filename);

    const photoUrl = urlData.publicUrl;

    // Update the child record
    const { error: dbError } = await supabase
      .from("children")
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq("id", childId);

    if (dbError) {
      console.error("[Photo Upload] DB error:", dbError.message);
      return NextResponse.json({ error: "Failed to update child record" }, { status: 500 });
    }

    return NextResponse.json({ photo_url: photoUrl });
  } catch (err) {
    console.error("[Photo Upload] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: childId } = await params;

  try {
    const supabase = getSupabase();

    // Get current photo_url to find the storage path
    const { data: child } = await supabase
      .from("children")
      .select("photo_url")
      .eq("id", childId)
      .single();

    if (child?.photo_url) {
      // Extract the path from the full URL
      const url = new URL(child.photo_url);
      const pathParts = url.pathname.split("/welcome-photos/");
      if (pathParts.length > 1) {
        await supabase.storage.from("welcome-photos").remove([pathParts[1]]);
      }
    }

    // Clear the photo_url in the database
    const { error: dbError } = await supabase
      .from("children")
      .update({ photo_url: null, updated_at: new Date().toISOString() })
      .eq("id", childId);

    if (dbError) {
      console.error("[Photo Delete] DB error:", dbError.message);
      return NextResponse.json({ error: "Failed to update child record" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Photo Delete] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
