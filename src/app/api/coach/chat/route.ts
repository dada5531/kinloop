import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/coach/chat
 *
 * Accepts: { message: string, childId: string, conversationId?: string }
 * Returns: { response: string, sources: Source[], conversationId: string }
 *
 * Pipeline:
 *   1. Embed user message with Voyage AI
 *   2. Search pgvector for relevant parenting knowledge chunks
 *   3. Fetch child context from /api/context/[childId]
 *   4. Call Claude with coach system prompt + retrieved chunks + child context
 *   5. Save message pair to coach_messages table
 *   6. Return response with source citations
 *
 * TODO: Implement with RAG pipeline (see /src/lib/rag/)
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented — see GitHub Issue #11" },
    { status: 501 },
  );
}
