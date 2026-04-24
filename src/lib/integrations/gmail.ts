/**
 * Gmail integration.
 *
 * Purpose: Read school emails directly from user's Gmail (V2 feature).
 * Auth: OAuth 2.0 with Gmail readonly scope
 * Rate limits: 250 quota units/user/second
 * Fallback: Email forwarding via Resend inbound webhook (V1 approach).
 *
 * TODO: Implement in V2.
 */

export async function fetchRecentSchoolEmails(params: {
  accessToken: string;
  query?: string;
  maxResults?: number;
}) {
  throw new Error("Not implemented — V2 feature");
}
