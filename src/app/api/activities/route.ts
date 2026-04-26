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
    const activityId = searchParams.get("activityId");

    if (!activityId) {
      return NextResponse.json({ error: "activityId is required" }, { status: 400 });
    }

    const body = await request.json();
    const supabase = getAdminClient();

    const updates: ActivityUpdate = {};
    if (body.scheduledFor !== undefined) updates.scheduled_for = body.scheduledFor;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;

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
