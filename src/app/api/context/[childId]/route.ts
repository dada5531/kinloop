import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/context/[childId]
 *
 * Returns: Aggregated child context from all quadrants.
 *
 * This is the CROSS-QUADRANT INTELLIGENCE service — the core moat of KINLOOP.
 * Every Claude call should include this context to provide personalized responses.
 *
 * Response shape:
 * {
 *   child: { name, dob, ageMonths, interests, allergies, notes },
 *   recentEvents: Event[],           // Last 10 from Scheduler
 *   healthSummary: {                  // Latest from Development
 *     weight, height, percentiles,
 *     recentMilestones, immunizations
 *   },
 *   savedActivities: Activity[],     // Last 5 from Play Lab
 *   recentCoachTopics: string[],     // Last 5 conversation topics
 * }
 *
 * TODO: Implement — see GitHub Issue #14
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } },
) {
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #14" },
    { status: 501 },
  );
}
