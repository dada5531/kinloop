import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ChildInsert = Database["public"]["Tables"]["children"]["Insert"];

/**
 * GET /api/children?userId=xxx
 * Returns all children for a user.
 * In development mode (no Clerk), returns demo user's children.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const supabase = getAdminClient();

    // In development mode, use demo user
    const effectiveUserId = userId || "11111111-1111-1111-1111-111111111111";

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Children GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Children GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch children" }, { status: 500 });
  }
}

/**
 * POST /api/children
 * Create a new child profile.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.dob) {
      return NextResponse.json({ error: "name and dob are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const effectiveUserId = body.userId || "11111111-1111-1111-1111-111111111111";

    const row: ChildInsert = {
      user_id: effectiveUserId,
      name: body.name,
      dob: body.dob,
      allergies: body.allergies || [],
      notes: body.notes || null,
      photo_url: body.photoUrl || null,
    };

    const { data, error } = await supabase.from("children").insert(row).select().single();

    if (error) {
      console.error("[Children POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Children POST] Error:", error);
    return NextResponse.json({ error: "Failed to create child" }, { status: 500 });
  }
}
