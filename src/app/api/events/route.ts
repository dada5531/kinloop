import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

/**
 * GET /api/events?childId=xxx
 * Returns all events for a child, ordered by created_at desc.
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
      .from("events")
      .select("*")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Events GET] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("[Events GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event (approve an extracted event).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const effectiveUserId = body.userId || "11111111-1111-1111-1111-111111111111";

    const row: EventInsert = {
      user_id: effectiveUserId,
      child_id: body.childId || null,
      title: body.title,
      start_time: body.startTime || null,
      end_time: body.endTime || null,
      location: body.location || null,
      source: body.source || "paste",
      source_label: body.sourceLabel || null,
      action_items: body.actionItems || [],
      amount_due: body.amountDue || null,
      confidence: body.confidence ?? null,
      raw_content: body.rawContent || null,
      reply_draft: body.replyDraft || null,
      file_url: body.fileUrl || null,
      status: body.status || "approved",
    };

    const { data, error } = await supabase.from("events").insert(row).select().single();

    if (error) {
      console.error("[Events POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Events POST] Error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

/**
 * PATCH /api/events
 * Update event fields. Supports:
 *   - Status changes: { eventId, status }
 *   - Field edits via query param: ?itemId=xxx + body { title, start_time, end_time, location }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const body = await request.json();

    // Determine the event ID from either query param or body
    const eventId = itemId || body.eventId;
    if (!eventId) {
      return NextResponse.json({ error: "eventId or itemId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const updates: EventUpdate = { updated_at: new Date().toISOString() };

    // Status update (legacy path)
    if (body.status) updates.status = body.status;

    // Field edits
    if (body.title !== undefined) updates.title = body.title;
    if (body.start_time !== undefined) updates.start_time = body.start_time;
    if (body.end_time !== undefined) updates.end_time = body.end_time;
    if (body.location !== undefined) updates.location = body.location;

    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("[Events PATCH] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Events PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}


// Soft-delete an event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("id");
    if (!eventId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getAdminClient();
    const { error } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", eventId);
    if (error) {
      console.error("[Events DELETE] Soft-delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Events DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
