import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ChildRow = Database["public"]["Tables"]["children"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type HealthRecordRow = Database["public"]["Tables"]["health_records"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
type ConversationRow = Database["public"]["Tables"]["coach_conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["coach_messages"]["Row"];

/**
 * GET /api/context/[childId]
 *
 * Cross-quadrant context aggregation — the core moat of KINLOOP.
 * Every Claude call should include this context to provide personalized responses.
 */
export async function GET(request: NextRequest, { params }: { params: { childId: string } }) {
  try {
    const { childId } = params;

    if (!childId) {
      return NextResponse.json({ error: "childId is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Fetch child profile
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .single();

    if (childError || !child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const typedChild = child as ChildRow;

    // Calculate age
    const now = new Date();
    const dob = new Date(typedChild.dob);
    const ageMonths =
      (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    const ageDisplay = `${years}y ${months}mo`;

    // 2. Fetch recent events (last 10)
    const { data: recentEventsRaw } = await supabase
      .from("events")
      .select(
        "id, title, start_time, end_time, location, status, source, action_items, amount_due, created_at",
      )
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(10);

    const recentEvents = (recentEventsRaw || []) as Pick<
      EventRow,
      | "id"
      | "title"
      | "start_time"
      | "end_time"
      | "location"
      | "status"
      | "source"
      | "action_items"
      | "amount_due"
      | "created_at"
    >[];

    // 3. Fetch health summary (last 3 records)
    const { data: healthRecordsRaw } = await supabase
      .from("health_records")
      .select("id, visit_date, type, extracted, summary, height_cm, weight_kg, created_at")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("visit_date", { ascending: false })
      .limit(3);

    const healthRecords = (healthRecordsRaw || []) as Pick<
      HealthRecordRow,
      | "id"
      | "visit_date"
      | "type"
      | "extracted"
      | "summary"
      | "height_cm"
      | "weight_kg"
      | "created_at"
    >[];

    const lastRecord = healthRecords[0];
    const healthSummary = lastRecord
      ? {
          lastVisitDate: lastRecord.visit_date,
          lastVisitType: lastRecord.type,
          heightCm:
            lastRecord.height_cm ||
            (lastRecord.extracted as Record<string, unknown> | null)?.height_cm ||
            null,
          weightKg:
            lastRecord.weight_kg ||
            (lastRecord.extracted as Record<string, unknown> | null)?.weight_kg ||
            null,
          summary: lastRecord.summary,
          recentConcerns: healthRecords
            .flatMap((r) => {
              const extracted = r.extracted as Record<string, unknown> | null;
              return (extracted?.concerns_flagged as string[]) || [];
            })
            .filter(Boolean),
        }
      : null;

    // 4. Fetch saved activities (last 5)
    const { data: savedActivitiesRaw } = await supabase
      .from("activities")
      .select("id, title, duration_minutes, age_min, age_max, source_url, created_at")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(5);

    const savedActivities = (savedActivitiesRaw || []) as Pick<
      ActivityRow,
      "id" | "title" | "duration_minutes" | "age_min" | "age_max" | "source_url" | "created_at"
    >[];

    // 5. Fetch recent coach topics (last 3 conversations)
    const { data: conversationsRaw } = await supabase
      .from("coach_conversations")
      .select("id, created_at")
      .is('deleted_at', null)
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(3);

    const conversations = (conversationsRaw || []) as Pick<ConversationRow, "id" | "created_at">[];

    let recentCoachTopics: string[] = [];
    if (conversations.length > 0) {
      const convIds = conversations.map((c) => c.id);
      const { data: messagesRaw } = await supabase
        .from("coach_messages")
        .select("content, conversation_id")
        .in("conversation_id", convIds)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(3);

      const msgs = (messagesRaw || []) as Pick<MessageRow, "content" | "conversation_id">[];
      recentCoachTopics = msgs.map((m) => m.content.slice(0, 100));
    }

    return NextResponse.json({
      child: {
        id: typedChild.id,
        name: typedChild.name,
        dob: typedChild.dob,
        ageMonths,
        ageDisplay,
        allergies: typedChild.allergies || [],
        notes: typedChild.notes,
        photoUrl: typedChild.photo_url,
      },
      recentEvents,
      healthSummary,
      savedActivities,
      recentCoachTopics,
    });
  } catch (error) {
    console.error("[Context] Error:", error);
    return NextResponse.json({ error: "Failed to fetch context" }, { status: 500 });
  }
}
