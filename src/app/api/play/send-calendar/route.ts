import { NextRequest, NextResponse } from "next/server";

import { sendCalendarInvite } from "@/lib/calendar/send-invite";

/**
 * POST /api/play/send-calendar
 *
 * Sends a calendar invite email for a scheduled Play Lab activity.
 * Uses the shared sendCalendarInvite utility.
 *
 * Body: {
 *   title: string,
 *   description?: string,
 *   startDate: string (ISO 8601),
 *   endDate?: string (ISO 8601),
 *   materials?: Array<{ name: string; quantity: string | null }>,
 *   childId?: string,
 *   eventId?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, materials, childId, eventId } = body;

    if (!title || !startDate) {
      return NextResponse.json(
        { error: "Title and startDate are required" },
        { status: 400 }
      );
    }

    // Build materials HTML for the email body
    let materialsHtml = "";
    if (materials && materials.length > 0) {
      const materialsList = materials
        .map(
          (m: { name: string; quantity: string | null }) =>
            `<li style="font-size: 13px; color: #555; margin-bottom: 4px;">${m.name}${m.quantity ? ` (${m.quantity})` : ""}</li>`
        )
        .join("");
      materialsHtml = `
        <div style="margin-top: 16px; padding: 16px; background: #fef9f0; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #B8860B; font-weight: 600;">Materials needed</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${materialsList}
          </ul>
        </div>
      `;
    }

    const result = await sendCalendarInvite({
      events: [
        {
          title,
          description: description || undefined,
          startDate,
          endDate: endDate || null,
        },
      ],
      source: "play_lab",
      childId,
      eventId,
      extraHtml: materialsHtml,
    });

    if (!result.success) {
      const status = result.code === "no_email" ? 400 : result.code === "no_api_key" ? 503 : 500;
      return NextResponse.json(
        { error: result.message, code: result.code },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      emailId: result.emailId,
    });
  } catch (error) {
    console.error("[Play Lab Calendar] Error:", error);
    return NextResponse.json(
      { error: "Failed to send calendar invite." },
      { status: 500 }
    );
  }
}
