/**
 * Play Lab (Quadrant 3) — Extract activity plans from social links.
 *
 * Data flow:
 *   Input (YouTube URL/social link) → transcript fetch → Claude extraction → activity plan + materials
 *
 * TODO: Implement with:
 *   - URL paste input with platform detection
 *   - YouTube transcript extraction
 *   - AI-generated activity plan (title, steps, materials, skills, safety)
 *   - Materials shopping list with Amazon affiliate links (PA-API)
 *   - Save to activity library
 *   - Age-appropriateness filtering based on child profile
 *
 * See GitHub Issues #8, #9 for requirements.
 */
export default function PlayLabPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-play">Play Lab</h1>
      <p className="mt-2 text-muted-foreground">
        Paste a YouTube link — get a structured activity plan with a materials shopping list.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-play/30 p-12 text-center">
        <p className="text-muted-foreground">
          URL input and activity card UI will be implemented here.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          See <code>/src/lib/extractors/activity-extractor.ts</code> for the Claude prompt schema.
        </p>
      </div>
    </div>
  );
}
