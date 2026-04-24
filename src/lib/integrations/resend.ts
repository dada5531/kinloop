/**
 * Resend integration.
 *
 * Purpose: Inbound email parsing (parents forward school emails) + outbound notifications.
 * Auth: RESEND_API_KEY
 * Rate limits: 100 emails/day (free tier), 50,000/month (pro)
 * Fallback: Manual paste/upload in Scheduler UI.
 *
 * TODO: Implement inbound webhook handler and outbound notifications.
 * See GitHub Issue #6.
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

export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  return resend.emails.send({
    from: "KINLOOP <notifications@kinloop.com>",
    ...params,
  });
}
