/**
 * Scheduler (Quadrant 1) — Extract events from emails, PDFs, and images.
 *
 * Data flow:
 *   Input (email/PDF/image) → Claude extraction → structured events → Google Calendar
 *
 * TODO: Implement inbox-style layout with:
 *   - File upload zone (PDF, image, text paste)
 *   - Email forwarding integration (Resend inbound webhook)
 *   - AI extraction results with approve/edit/dismiss
 *   - Calendar view of approved events
 *   - Google Calendar sync
 *
 * See GitHub Issues #5, #6, #7 for requirements.
 */
export default function SchedulerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-scheduler">Scheduler</h1>
      <p className="mt-2 text-muted-foreground">
        Forward an email or upload a document — events land on your calendar automatically.
      </p>

      <div className="mt-8 rounded-xl border-2 border-dashed border-scheduler/30 p-12 text-center">
        <p className="text-muted-foreground">
          Upload zone and extraction UI will be implemented here.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          See <code>/src/lib/extractors/scheduler-extractor.ts</code> for the Claude prompt schema.
        </p>
      </div>
    </div>
  );
}
