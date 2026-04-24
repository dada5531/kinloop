/**
 * Coach (Quadrant 4) — Personalized parenting guidance with RAG.
 *
 * Data flow:
 *   User question → RAG retrieval (pgvector) → Claude chat with child context → cited response
 *
 * TODO: Implement with:
 *   - Chat interface with message history
 *   - Topic suggestion cards (tantrums, sleep, nutrition, etc.)
 *   - RAG-powered responses with source citations
 *   - Cross-quadrant context injection (child age, recent events, health data)
 *   - Conversation persistence
 *
 * See GitHub Issues #10, #11 for requirements.
 */
export default function CoachPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-coach">Coach</h1>
      <p className="mt-2 text-muted-foreground">
        Ask anything — get evidence-based answers grounded in your child&apos;s context.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-coach/30 p-12 text-center">
        <p className="text-muted-foreground">
          Chat interface and topic cards will be implemented here.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          See <code>/prompts/coach-system.md</code> for the system prompt.
        </p>
      </div>
    </div>
  );
}
