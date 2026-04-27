/**
 * POST /api/coach/save-tip
 *
 * Saves a daily tip to the user's bookmarks (tips_saved table).
 * Body: { userId, childId, content, source, category }
 */

import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, childId, content, source, category } = body;

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { error } = await supabase.from("tips_saved").insert({
      user_id: userId || "demo-user-001",
      child_id: childId || null,
      content,
      source: source || null,
      category: category || null,
    });

    if (error) {
      console.error("[Save Tip] DB error:", error);
      return NextResponse.json({ error: "Failed to save tip" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Save Tip] Error:", error);
    return NextResponse.json({ error: "Failed to save tip" }, { status: 500 });
  }
}
