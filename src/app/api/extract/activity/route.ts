import { NextRequest, NextResponse } from "next/server";

import { extractActivity } from "@/lib/extractors/activity-extractor";
import { buildChildContextString } from "@/lib/prompts";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/extract/activity
 *
 * Accepts: { content: string, url?: string, childId: string }
 * Returns: Structured activity plan with title, steps, materials, skills, safety notes.
 *
 * Pipeline:
 *   1. Accept pasted content or URL description
 *   2. Fetch child context from Supabase
 *   3. Call Claude with activity extraction prompt + Zod schema
 *   4. Return validated structured output
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, url, childId } = body;

    if (!content && !url) {
      return NextResponse.json({ error: "Either content or url is required" }, { status: 400 });
    }

    // Build the input text
    let inputText = content || "";
    if (url) {
      inputText = `Source URL: ${url}\n\n${inputText}`;
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
      } catch {
        // Continue without child context
      }
    }

    const result = await extractActivity(inputText, childContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Activity Extract] Error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "Anthropic API key not configured." }, { status: 503 });
    }

    return NextResponse.json({ error: "Extraction failed. Please try again." }, { status: 500 });
  }
}
