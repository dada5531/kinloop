import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/extract/activity
 *
 * Accepts: { url: string, childId: string }
 * Returns: Structured activity plan with title, steps, materials, skills, safety notes.
 *
 * Pipeline:
 *   1. Detect platform (YouTube, Instagram, TikTok, generic)
 *   2. Fetch transcript/content
 *   3. Fetch child context from /api/context/[childId]
 *   4. Call Claude with activity extraction prompt + Zod schema
 *   5. Optionally look up materials via Amazon PA-API
 *   6. Return validated structured output
 *
 * TODO: Implement with activity-extractor.ts
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #8" },
    { status: 501 },
  );
}
