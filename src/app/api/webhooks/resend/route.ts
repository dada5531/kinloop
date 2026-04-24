import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/resend
 *
 * Inbound email webhook from Resend.
 * Parents forward school emails to their KINLOOP address (e.g., jenn@inbox.kinloop.com).
 * This endpoint receives the parsed email and triggers the scheduler extraction pipeline.
 *
 * TODO: Implement — see GitHub Issue #6
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #6" },
    { status: 501 },
  );
}
