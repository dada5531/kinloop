import { NextRequest, NextResponse } from "next/server";

import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
import { readPrompt, buildChildContextString } from "@/lib/prompts";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type HealthRecordRow = Database["public"]["Tables"]["health_records"]["Row"];
type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
type ChildRow = Database["public"]["Tables"]["children"]["Row"];

/**
 * POST /api/coach/chat
 *
 * Accepts: { messages: Array<{role, content}>, childId: string }
 * Returns: Streaming text response from Claude with child context.
 *
 * Pipeline:
 *   1. Fetch child context from Supabase
 *   2. Fetch cross-quadrant context (recent events, health records, activities)
 *   3. Build system prompt with context injection
 *   4. Stream Claude response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, childId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Load system prompt
    const coachPrompt = readPrompt("coach-system");

    // Build child context
    let childContextBlock = "No child selected.";
    if (childId) {
      try {
        const supabase = getAdminClient();

        // Fetch child info
        const { data: child } = await supabase
          .from("children")
          .select("name, dob, allergies, notes")
          .eq("id", childId)
          .single();

        if (child) {
          childContextBlock = buildChildContextString(
            child as Pick<ChildRow, "name" | "dob" | "allergies" | "notes">,
          );

          // Fetch recent events (last 30 days)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

          const { data: events } = await supabase
            .from("events")
            .select("title, start_time, location, action_items")
            .eq("child_id", childId)
            .gte("created_at", thirtyDaysAgo)
            .order("start_time", { ascending: false })
            .limit(5);

          if (events && events.length > 0) {
            childContextBlock += "\n\nRecent events:\n";
            (
              events as Pick<EventRow, "title" | "start_time" | "location" | "action_items">[]
            ).forEach((e) => {
              childContextBlock += `- ${e.title}`;
              if (e.start_time)
                childContextBlock += ` (${new Date(e.start_time).toLocaleDateString()})`;
              childContextBlock += "\n";
            });
          }

          // Fetch recent health records
          const { data: healthRecords } = await supabase
            .from("health_records")
            .select("type, visit_date, summary, extracted")
            .eq("child_id", childId)
            .order("visit_date", { ascending: false })
            .limit(3);

          if (healthRecords && healthRecords.length > 0) {
            childContextBlock += "\nRecent health records:\n";
            (
              healthRecords as Pick<
                HealthRecordRow,
                "type" | "visit_date" | "summary" | "extracted"
              >[]
            ).forEach((h) => {
              childContextBlock += `- ${h.type}: ${h.summary || "No summary"}`;
              if (h.visit_date) childContextBlock += ` (${h.visit_date})`;
              childContextBlock += "\n";
            });
          }

          // Fetch recent activities
          const { data: activities } = await supabase
            .from("activities")
            .select("title, category, difficulty")
            .eq("child_id", childId)
            .order("created_at", { ascending: false })
            .limit(5);

          if (activities && activities.length > 0) {
            childContextBlock += "\nRecent activities:\n";
            (activities as Pick<ActivityRow, "title" | "category" | "difficulty">[]).forEach(
              (a) => {
                childContextBlock += `- ${a.title} (${a.category}, ${a.difficulty})\n`;
              },
            );
          }
        }
      } catch {
        // Continue without context
      }
    }

    const systemPrompt = `${coachPrompt}\n\n## Current Child Context\n${childContextBlock}`;

    // Format messages for Claude
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    // Stream response
    const stream = await claude.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: claudeMessages,
    });

    // Create a ReadableStream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              "delta" in event &&
              event.delta.type === "text_delta"
            ) {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Coach Chat] Error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "Anthropic API key not configured." }, { status: 503 });
    }

    return NextResponse.json({ error: "Chat failed. Please try again." }, { status: 500 });
  }
}
