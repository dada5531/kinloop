/**
 * Development Hub (Quadrant 2) — Track growth, milestones, and health records.
 *
 * Data flow:
 *   Input (pediatrician notes/school reports) → Claude extraction → health records → growth charts
 *
 * TODO: Implement with:
 *   - Document upload (PDF, image, text paste)
 *   - AI extraction of health data (weight, height, percentiles, milestones)
 *   - Growth chart with WHO percentile data (Recharts)
 *   - Health record timeline
 *   - "Ask about your child" Q&A powered by health context
 *
 * See GitHub Issues #12, #13 for requirements.
 */
export default function DevelopmentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-development">Development Hub</h1>
      <p className="mt-2 text-muted-foreground">
        Upload pediatrician notes — growth charts and milestones update instantly.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-development/30 p-12 text-center">
        <p className="text-muted-foreground">
          Growth chart and health record timeline will be implemented here.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          See <code>/src/lib/extractors/health-extractor.ts</code> for the Claude prompt schema.
        </p>
      </div>
    </div>
  );
}
