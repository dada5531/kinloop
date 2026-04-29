import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/measurements?childId=xxx&type=height|weight|head_circumference
 * Returns measurements for a child, optionally filtered by type.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const type = searchParams.get("type");

    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    let query = supabase
      .from("measurements")
      .select("*")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("date", { ascending: true });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Measurements GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
  }
}

/**
 * POST /api/measurements
 * Add a new measurement.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.childId || !body.type || body.value === undefined) {
      return NextResponse.json({ error: "childId, type, and value are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const userId = body.userId || "11111111-1111-1111-1111-111111111111";

    const { data, error } = await supabase
      .from("measurements")
      .insert({
        child_id: body.childId,
        user_id: userId,
        date: body.date || new Date().toISOString().split("T")[0],
        type: body.type,
        value: body.value,
        unit: body.unit || (body.type === "weight" ? "kg" : "cm"),
        notes: body.notes || null,
        source: body.source || "manual",
        health_record_id: body.healthRecordId || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Measurements POST] Error:", error);
    return NextResponse.json({ error: "Failed to save measurement" }, { status: 500 });
  }
}


// Soft-delete a measurement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const measurementId = searchParams.get("id");
    if (!measurementId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("measurements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", measurementId);
    if (error) {
      console.error("[Measurements DELETE] Soft-delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Measurements DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
  }
}
