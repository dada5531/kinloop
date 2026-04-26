import { NextResponse } from "next/server";

/**
 * GET /api/health/email-status?id=<resend_email_id>
 * Checks the delivery status of a sent email via Resend API
 * Temporary diagnostic endpoint — remove after verification
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get("id");

  if (!emailId) {
    return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  try {
    const resp = await fetch(`https://api.resend.com/emails/${emailId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await resp.json();
    return NextResponse.json({
      resend_status: resp.status,
      email_data: data,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to query Resend API",
      detail: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
