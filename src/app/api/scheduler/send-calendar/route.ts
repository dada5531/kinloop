import { safeFormatDate } from "@/lib/safe-date";
import { NextRequest, NextResponse } from "next/server";

import { generateIcs } from "@/lib/calendar/ics-generator";
import { sendCalendarEmail } from "@/lib/integrations/resend";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/scheduler/send-calendar
 *
 * Sends a calendar invite email with .ics attachment to the user's configured email.
 * Looks up the event by ID from the database — no need for the client to pass an events array.
 *
 * Body: {
 *   eventId: string,        // required — the event to send
 *   replyDraft?: string,
 *   originalSender?: string,
 * }
 *
 * Handles date_certainty:
 *   - "unknown"     → 422: "This event needs a confirmed date before sending to your calendar."
 *   - "approximate" → sends with note in .ics description
 *   - "exact"       → sends normally
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, replyDraft, originalSender } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // ── Look up the event from the database ──────────────────
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .is("deleted_at", null)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ── Handle date_certainty ────────────────────────────────
    const dateCertainty = event.date_certainty || "exact";

    if (dateCertainty === "unknown" || !event.start_time) {
      return NextResponse.json(
        {
          error: "This event needs a confirmed date before sending to your calendar.",
          code: "DATE_UNKNOWN",
        },
        { status: 422 },
      );
    }

    // Build the event object for ICS generation
    let description = event.raw_content
      ? `Extracted from: ${event.source_label || "email"}`
      : "";

    if (dateCertainty === "approximate" && event.original_date_text) {
      description = `Date approximate — confirmed from: '${event.original_date_text}'${description ? `\n\n${description}` : ""}`;
    }

    const icsEvent = {
      title: event.title,
      startDate: event.start_time,
      endDate: event.end_time || undefined,
      location: event.location || undefined,
      description: description || undefined,
    };

    const events = [icsEvent];

    // ── Get recipient email ──────────────────────────────────
    const userId = event.user_id;

    // Try user_settings first
    const { data: emailSetting } = await supabase
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", userId)
      .eq("setting_key", "notification_email")
      .single();

    let recipientEmail = emailSetting?.setting_value;

    // Fall back to user profile email
    if (!recipientEmail) {
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      recipientEmail = user?.email;
    }

    if (!recipientEmail) {
      return NextResponse.json(
        {
          error: "No email configured. Please set your email in Settings.",
          code: "NO_EMAIL",
        },
        { status: 400 },
      );
    }

    // ── Generate .ics content ────────────────────────────────
    const icsContent = generateIcs(events);

    // ── Build email HTML ─────────────────────────────────────
    const dateDisplay = safeFormatDate(event.start_time, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const approximateNote =
      dateCertainty === "approximate" && event.original_date_text
        ? `<p style="font-size: 12px; color: #b08d00; margin: 4px 0 0 0; font-style: italic;">⚠ Date approximate — from: "${event.original_date_text}"</p>`
        : "";

    const eventHtml = `
      <div style="margin-bottom: 16px; padding: 16px; background: #f9f8f6; border-radius: 8px; border-left: 4px solid #7C6EAF;">
        <strong style="font-size: 15px; color: #1a1a1a;">${event.title}</strong><br/>
        <span style="color: #666; font-size: 13px;">
          ${dateDisplay}
          ${event.location ? ` · ${event.location}` : ""}
        </span>
        ${approximateNote}
      </div>
    `;

    // Build reply section if available
    let replyHtml = "";
    const draft = replyDraft || event.reply_draft;
    if (draft && originalSender) {
      const mailtoBody = encodeURIComponent(draft);
      const mailtoSubject = encodeURIComponent(`Re: ${event.title || "School event"}`);
      const mailtoLink = `mailto:${originalSender}?subject=${mailtoSubject}&body=${mailtoBody}`;

      replyHtml = `
        <div style="margin-top: 24px; padding: 20px; background: #f0f0ea; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888;">Drafted reply</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-line;">${draft}</p>
          <a href="${mailtoLink}" style="display: inline-block; padding: 10px 24px; background: #2C2C2A; color: white; text-decoration: none; border-radius: 999px; font-size: 13px; font-weight: 500;">
            Send this reply →
          </a>
        </div>
      `;
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: #1a1a1a;">kinloop</span>
        </div>

        <p style="font-size: 15px; color: #333; margin-bottom: 8px;">
          A new event has been added to your calendar.
        </p>
        <p style="font-size: 13px; color: #888; margin-bottom: 24px;">
          Open the attached .ics file to add it to your calendar app.
        </p>

        ${eventHtml}

        ${replyHtml}

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e0;">
          <p style="font-size: 11px; color: #aaa; margin: 0;">
            Sent by Kinloop · <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://kinloop-weld.vercel.app"}/settings" style="color: #aaa;">Disable these emails in Settings</a>
          </p>
        </div>
      </div>
    `;

    // ── Send the email ───────────────────────────────────────
    const emailResult = await sendCalendarEmail({
      to: recipientEmail,
      subject: `📅 ${event.title} — Kinloop`,
      html,
      icsContent,
      icsFilename: `kinloop-events-${new Date().toISOString().split("T")[0]}.ics`,
    });

    // Log to sent_emails table
    await supabase.from("sent_emails").insert({
      user_id: userId,
      child_id: event.child_id || null,
      event_id: eventId,
      recipient_email: recipientEmail,
      subject: `Calendar invite: ${event.title}`,
      email_type: "calendar_invite",
      ics_content: icsContent,
      resend_message_id: (emailResult as { data?: { id?: string } }).data?.id || null,
      status: "sent",
    });

    return NextResponse.json({
      success: true,
      message: `Calendar invite sent to ${recipientEmail}`,
      emailId: (emailResult as { data?: { id?: string } }).data?.id,
    });
  } catch (error) {
    console.error("[Send Calendar] Error:", error);

    // Log failed attempt
    try {
      const supabase = getAdminClient();
      const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";
      await supabase.from("sent_emails").insert({
        user_id: DEMO_USER_ID,
        recipient_email: "unknown",
        subject: "Failed calendar invite",
        email_type: "calendar_invite",
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (err) {
      console.error(`[Kinloop Error] sendCalendar:`, err instanceof Error ? err.message : err);
      // Don't fail on audit log failure
    }

    if (error instanceof Error && error.message.includes("RESEND_API_KEY")) {
      return NextResponse.json(
        { error: "Resend API key not configured. Set RESEND_API_KEY in your environment." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to send calendar invite. Please try again." },
      { status: 500 },
    );
  }
}
