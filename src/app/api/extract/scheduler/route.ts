import { NextRequest, NextResponse } from "next/server";

import { extractFromText, extractFromMultimodal } from "@/lib/extractors/scheduler-extractor";
import { buildChildContextString } from "@/lib/prompts";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/extract/scheduler
 *
 * Accepts: { content: string, contentType: "text" | "pdf" | "image", childId: string, fileUrl?: string, fileMimeType?: string }
 * Returns: Structured extraction with events, action items, amounts, suggested reply.
 *
 * Pipeline:
 *   1. Fetch child context from Supabase
 *   2. If PDF/image, call multimodal extraction; otherwise text extraction
 *   3. Return validated structured output
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contentType, childId, fileUrl, fileMimeType } = body;

    if (!content && !fileUrl) {
      return NextResponse.json({ error: "Either content or fileUrl is required" }, { status: 400 });
    }

    // Fetch child context for personalization
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
        // Continue without child context if fetch fails
      }
    }

    let result;

    if ((contentType === "image" || contentType === "pdf") && fileUrl && fileMimeType) {
      // Multimodal extraction for images and PDFs
      result = await extractFromMultimodal(
        content ||
          "Extract all events, dates, deadlines, payments, and action items from this document.",
        fileUrl,
        fileMimeType,
        childContext,
      );
    } else {
      // Text-only extraction
      result = await extractFromText(content, childContext);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Scheduler Extract] Error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Set ANTHROPIC_API_KEY in your environment." },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "Extraction failed. Please try again." }, { status: 500 });
  }
}
