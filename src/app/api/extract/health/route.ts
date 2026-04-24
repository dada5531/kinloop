import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/extract/health
 *
 * Accepts: { content: string, contentType: "text" | "pdf" | "image", childId: string }
 * Returns: Structured health record with growth data, milestones, immunizations, notes.
 *
 * TODO: Implement with health-extractor.ts
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #12" },
    { status: 501 },
  );
}
