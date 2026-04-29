import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

/**
 * GET /api/milestones?childId=xxx&category=cognitive|motor|language|social&status=hit|upcoming|missed
 * Returns milestones for a child, optionally filtered.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    let query = supabase
      .from("milestones")
      .select("*")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("age_months_expected", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Milestones GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

/**
 * POST /api/milestones
 * Add a new milestone.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.childId || !body.category || !body.title) {
      return NextResponse.json(
        { error: "childId, category, and title are required" },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const userId = body.userId || "11111111-1111-1111-1111-111111111111";

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        child_id: body.childId,
        user_id: userId,
        category: body.category,
        title: body.title,
        description: body.description || null,
        age_months_expected: body.ageMonthsExpected || 0,
        status: body.status || "upcoming",
        achieved_date: body.achievedDate || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Milestones POST] Error:", error);
    return NextResponse.json({ error: "Failed to save milestone" }, { status: 500 });
  }
}

/**
 * PATCH /api/milestones
 * Update a milestone (e.g., mark as hit).
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const body = await request.json();
    const milestoneId = itemId || body.id;

    if (!milestoneId) {
      return NextResponse.json({ error: "itemId or id is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const updates: Database["public"]["Tables"]["milestones"]["Update"] = {};

    if (body.status !== undefined) updates.status = body.status;
    if (body.achievedDate !== undefined) updates.achieved_date = body.achievedDate;
    if (body.achieved_date !== undefined) updates.achieved_date = body.achieved_date;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.title !== undefined) updates.title = body.title;

    const { data, error } = await supabase
      .from("milestones")
      .update(updates)
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Milestones PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}


// Soft-delete a milestone
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("id");
    if (!milestoneId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("milestones")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", milestoneId);
    if (error) {
      console.error("[Milestones DELETE] Soft-delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Milestones DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
