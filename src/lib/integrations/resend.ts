/**
 * Resend integration.
 *
 * Purpose: Outbound email with attachment support (calendar invites, reply drafts).
 * Auth: RESEND_API_KEY
 * Rate limits: 100 emails/day (free tier), 50,000/month (pro)
 *
 * V1.5: Send from Resend's onboarding domain (onboarding@resend.dev).
 * V2: Custom domain verification for kinloop.com.
 */

import { Resend } from "resend";

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set. Get one at https://resend.com");
    }
    _client = new Resend(process.env.RESEND_API_KEY);
  }
  return _client;
}

/**
 * Get the configured "from" address.
 * Falls back to Resend's onboarding domain for V1.5.
 */
function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Kinloop <onboarding@resend.dev>";
}

/**
 * Send a basic notification email.
 */
export async function sendNotificationEmail(params: { to: string; subject: string; html: string }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: getFromAddress(),
    ...params,
  });
}

/**
 * Send a calendar invite email with .ics attachment and optional reply draft.
 */
export async function sendCalendarEmail(params: {
  to: string;
  subject: string;
  html: string;
  icsContent: string;
  icsFilename?: string;
}) {
  const resend = getResendClient();

  return resend.emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: [
      {
        filename: params.icsFilename || "event.ics",
        content: Buffer.from(params.icsContent, "utf-8").toString("base64"),
        contentType: "text/calendar",
      },
    ],
  });
}
