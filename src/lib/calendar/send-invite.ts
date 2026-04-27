/**
 * Shared calendar invite utility.
 *
 * Any quadrant (Scheduler, Play Lab, etc.) can call sendCalendarInvite()
 * to generate an .ics file and email it to the user's configured notification email.
 *
 * Returns { success, message, emailId? } — caller decides how to surface the result.
 */

import { generateIcs } from "./ics-generator";
import { sendCalendarEmail } from "@/lib/integrations/resend";
import { getAdminClient } from "@/lib/supabase/admin";

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

export interface CalendarInviteEvent {
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate?: string | null;
  location?: string | null;
}

export interface CalendarInviteOptions {
  /** The events to include in the .ics file */
  events: CalendarInviteEvent[];
  /** Source quadrant for audit logging */
  source: "scheduler" | "play_lab" | "coach" | "development";
  /** Optional child ID for audit logging */
  childId?: string;
  /** Optional event ID for audit logging */
  eventId?: string;
  /** Optional custom subject line. Defaults to "Kinloop · Scheduled: {title} · {date}" */
  subject?: string;
  /** Optional extra HTML to include in the email body (e.g., materials list) */
  extraHtml?: string;
  /** App base URL for deep links */
  appUrl?: string;
}

export interface CalendarInviteResult {
  success: boolean;
  message: string;
  emailId?: string;
  /** "no_email" if user hasn't configured notification email */
  code?: "no_email" | "no_api_key" | "send_failed" | "invites_disabled";
}

/**
 * Send a calendar invite email with .ics attachment.
 *
 * Checks user settings for:
 * 1. notification_email — required
 * 2. email_calendar_invites — must be "true" (default)
 *
 * Returns a result object — never throws.
 */
export async function sendCalendarInvite(
  options: CalendarInviteOptions
): Promise<CalendarInviteResult> {
  const { events, source, childId, eventId, subject, extraHtml, appUrl } = options;

  if (!events || events.length === 0) {
    return { success: false, message: "No events provided", code: "send_failed" };
  }

  const supabase = getAdminClient();

  try {
    // Check if calendar invites are enabled
    const { data: inviteSetting } = await supabase
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", DEMO_USER_ID)
      .eq("setting_key", "email_calendar_invites")
      .single();

    // Default is enabled — only skip if explicitly set to "false"
    if (inviteSetting?.setting_value === "false") {
      return {
        success: false,
        message: "Calendar invites are disabled in Settings.",
        code: "invites_disabled",
      };
    }

    // Get notification email
    const { data: emailSetting } = await supabase
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", DEMO_USER_ID)
      .eq("setting_key", "notification_email")
      .single();

    let recipientEmail = emailSetting?.setting_value;

    // Fall back to user profile email
    if (!recipientEmail) {
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", DEMO_USER_ID)
        .single();
      recipientEmail = user?.email;
    }

    if (!recipientEmail) {
      return {
        success: false,
        message: "No email configured. Set your email in Settings to get calendar invites.",
        code: "no_email",
      };
    }

    // Generate .ics content
    const icsContent = generateIcs(events);

    // Build subject line
    const firstEvent = events[0];
    const eventDate = new Date(firstEvent.startDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const eventTime = new Date(firstEvent.startDate).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const emailSubject =
      subject || `Kinloop · Scheduled: ${firstEvent.title} · ${eventDate} ${eventTime}`;

    // Build email HTML
    const eventListHtml = events
      .map(
        (evt) => `
        <div style="margin-bottom: 16px; padding: 16px; background: #f9f8f6; border-radius: 8px; border-left: 4px solid ${source === "play_lab" ? "#E8A87C" : "#7C6EAF"};">
          <strong style="font-size: 15px; color: #1a1a1a;">${evt.title}</strong><br/>
          <span style="color: #666; font-size: 13px;">
            ${new Date(evt.startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            at ${new Date(evt.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            ${evt.location ? ` · ${evt.location}` : ""}
          </span>
          ${evt.description ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #555; line-height: 1.5;">${evt.description.slice(0, 200)}${evt.description.length > 200 ? "..." : ""}</p>` : ""}
        </div>
      `
      )
      .join("");

    const sourceLabel =
      source === "play_lab"
        ? "Play Lab"
        : source === "scheduler"
          ? "Scheduler"
          : source === "coach"
            ? "Coach"
            : "Development";

    const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://kinloop-weld.vercel.app";
    const deepLink =
      source === "play_lab" ? `${baseUrl}/play` : `${baseUrl}/scheduler`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: #1a1a1a;">kinloop</span>
          <span style="font-size: 12px; color: #aaa; margin-left: 8px;">${sourceLabel}</span>
        </div>

        <p style="font-size: 15px; color: #333; margin-bottom: 8px;">
          ${events.length === 1 ? "An activity has been" : `${events.length} activities have been`} scheduled.
        </p>
        <p style="font-size: 13px; color: #888; margin-bottom: 24px;">
          Open the attached .ics file to add ${events.length === 1 ? "it" : "them"} to your calendar app.
        </p>

        ${eventListHtml}

        ${extraHtml || ""}

        <div style="margin-top: 24px;">
          <a href="${deepLink}" style="display: inline-block; padding: 10px 24px; background: #2C2C2A; color: white; text-decoration: none; border-radius: 999px; font-size: 13px; font-weight: 500;">
            Open in Kinloop →
          </a>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e0;">
          <p style="font-size: 11px; color: #aaa; margin: 0;">
            Sent by Kinloop · <a href="${baseUrl}/settings" style="color: #aaa;">Manage email preferences</a>
          </p>
        </div>
      </div>
    `;

    // Send the email
    const emailResult = await sendCalendarEmail({
      to: recipientEmail,
      subject: emailSubject,
      html,
      icsContent,
      icsFilename: `kinloop-${source}-${new Date().toISOString().split("T")[0]}.ics`,
    });

    // Audit log
    await supabase.from("sent_emails").insert({
      user_id: DEMO_USER_ID,
      child_id: childId || null,
      event_id: eventId || null,
      recipient_email: recipientEmail,
      subject: emailSubject,
      email_type: "calendar_invite",
      ics_content: icsContent,
      resend_message_id: (emailResult as { data?: { id?: string } }).data?.id || null,
      status: "sent",
    });

    return {
      success: true,
      message: `Calendar invite sent to ${recipientEmail}`,
      emailId: (emailResult as { data?: { id?: string } }).data?.id,
    };
  } catch (error) {
    console.error(`[Calendar Invite][${source}] Error:`, error);

    // Audit log failure
    try {
      await supabase.from("sent_emails").insert({
        user_id: DEMO_USER_ID,
        recipient_email: "unknown",
        subject: `Failed calendar invite (${source})`,
        email_type: "calendar_invite",
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    } catch {
      // Don't fail on audit log failure
    }

    if (error instanceof Error && error.message.includes("RESEND_API_KEY")) {
      return {
        success: false,
        message: "Resend API key not configured.",
        code: "no_api_key",
      };
    }

    return {
      success: false,
      message: "Failed to send calendar invite.",
      code: "send_failed",
    };
  }
}
