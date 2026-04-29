import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type HealthRecordInsert = Database["public"]["Tables"]["health_records"]["Insert"];

/**
 * GET /api/health-records?childId=xxx
 * Returns all health records for a child.
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
      .from("health_records")
      .select("*")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("visit_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Health Records GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch health records" }, { status: 500 });
  }
}

/**
 * POST /api/health-records
 * Save an extracted health record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.childId || !body.type) {
      return NextResponse.json({ error: "childId and type are required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const effectiveUserId = body.userId || "11111111-1111-1111-1111-111111111111";

    const row: HealthRecordInsert = {
      user_id: effectiveUserId,
      child_id: body.childId,
      type: body.type,
      visit_date: body.visitDate || new Date().toISOString().split("T")[0],
      provider: body.provider || null,
      summary: body.summary || null,
      extracted: body.extracted || null,
      height_cm: body.heightCm ?? null,
      weight_kg: body.weightKg ?? null,
    };

    const { data, error } = await supabase.from("health_records").insert(row).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Health Records POST] Error:", error);
    return NextResponse.json({ error: "Failed to save health record" }, { status: 500 });
  }
}


// Soft-delete a health record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("id");
    if (!recordId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    // Also soft-delete associated measurements
    const { error: measError } = await supabase
      .from("measurements")
      .update({ deleted_at: new Date().toISOString() })
      .eq("health_record_id", recordId);
    if (measError) {
      console.error("[HealthRecords DELETE] Measurements soft-delete error:", measError);
    }
    const { error } = await supabase
      .from("health_records")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", recordId);
    if (error) {
      console.error("[HealthRecords DELETE] Soft-delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HealthRecords DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete health record" }, { status: 500 });
  }
}
