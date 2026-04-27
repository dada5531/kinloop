/**
 * Google Calendar integration.
 *
 * Purpose: Write extracted events from Scheduler to user's Google Calendar.
 * Auth: OAuth 2.0 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
 * Rate limits: 1,000,000 queries/day (Calendar API)
 * Fallback: Events stored in Supabase; calendar sync retried on next login.
 *
 * TODO: Implement OAuth flow and event creation.
 * See GitHub Issue #7 and docs/api-integrations.md.
 */

export async function createCalendarEvent(params: {
  accessToken: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}) {
  // TODO: Implement with Google Calendar API v3
  throw new Error("Not implemented — see GitHub Issue #7");
}
