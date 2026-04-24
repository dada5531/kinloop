import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/extract/scheduler
 *
 * Accepts: { content: string, contentType: "text" | "pdf" | "image", childId: string }
 * Returns: Structured extraction with events, action items, amounts, suggested reply.
 *
 * Pipeline:
 *   1. If PDF/image, extract text or pass as multimodal content
 *   2. Fetch child context from /api/context/[childId]
 *   3. Call Claude with scheduler extraction prompt + Zod schema
 *   4. Return validated structured output
 *
 * TODO: Implement with scheduler-extractor.ts
 */
export async function POST(request: NextRequest) {
  // TODO: Implement extraction pipeline
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #5" },
    { status: 501 },
  );
}
