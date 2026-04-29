import { NextRequest, NextResponse } from "next/server";

import { extractHealthRecord } from "@/lib/extractors/health-extractor";
import { buildChildContextString } from "@/lib/prompts";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/extract/health
 *
 * Accepts: { content: string, contentType: "text" | "pdf" | "image", childId: string }
 * Returns: Structured health record with growth data, milestones, immunizations, notes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, childId } = body;

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // Fetch child context
    let childContext = "No child context available.";
    if (childId) {
      try {
        const supabase = getAdminClient();
        const { data: child } = await supabase
          .from("children")
          .select("name, dob, allergies, notes")
          .eq("id", childId)
          .single();

        if (child) {
          childContext = buildChildContextString(child);
        }
      } catch (err) {
        console.error(`[Kinloop Error] extractHealth.childContext:`, err instanceof Error ? err.message : err);
        // Continue without child context
      }
    }

    const result = await extractHealthRecord(content, childContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Health Extract] Error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "Anthropic API key not configured." }, { status: 503 });
    }

    return NextResponse.json({ error: "Extraction failed. Please try again." }, { status: 500 });
  }
}
