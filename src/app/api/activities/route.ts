import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"];
type ActivityUpdate = Database["public"]["Tables"]["activities"]["Update"];

/**
 * GET /api/activities?childId=xxx
 * Returns all activities for a child.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Activities GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

/**
 * POST /api/activities
 * Save an extracted activity.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.childId || !body.title) {
      return NextResponse.json({ error: "childId and title are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const effectiveUserId = body.userId || "11111111-1111-1111-1111-111111111111";

    const row: ActivityInsert = {
      user_id: effectiveUserId,
      child_id: body.childId,
      title: body.title,
      description: body.description || null,
      source_url: body.sourceUrl || null,
      platform: body.sourcePlatform || "other",
      age_min: body.ageRangeMin ?? null,
      age_max: body.ageRangeMax ?? null,
      duration_minutes: body.durationMinutes ?? null,
      difficulty: body.difficulty || "medium",
      category: body.category || "other",
      messiness: body.messiness ?? null,
      indoor_outdoor: body.indoorOutdoor || null,
      steps: body.steps || [],
      materials: body.materials || [],
      skills: body.skills || [],
      safety_notes: body.safetyNotes || [],
    };

    const { data, error } = await supabase.from("activities").insert(row).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Activities POST] Error:", error);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}

/**
 * PATCH /api/activities?activityId=xxx
 * Update an activity (e.g., schedule it).
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId") || searchParams.get("itemId");

    if (!activityId) {
      return NextResponse.json({ error: "activityId or itemId is required" }, { status: 400 });
    }

    const body = await request.json();
    const supabase = getAdminClient();

    const updates: ActivityUpdate = {};
    if (body.scheduledFor !== undefined) updates.scheduled_for = body.scheduledFor;
    if (body.scheduled_for !== undefined) updates.scheduled_for = body.scheduled_for;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    // Activities don't have a status column — mark-done uses scheduled_for = null

    const { data, error } = await supabase
      .from("activities")
      .update(updates)
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Activities PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update activity" }, { status: 500 });
  }
}


// Soft-delete an activity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");
    if (!activityId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("activities")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", activityId);
    if (error) {
      console.error("[Activities DELETE] Soft-delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Activities DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
