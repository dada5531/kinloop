import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

/**
 * GET /api/health/email
 *
 * Returns diagnostic info for the notification email pipeline.
 * Checks: user exists, notification_email saved, Resend API key configured.
 */
export async function GET() {
  const checks: Record<string, unknown> = {};

  try {
    const supabase = getAdminClient();

    // Check 1: Demo user exists in users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("id", DEMO_USER_ID)
      .single();

    checks.user_exists = !userError && !!user;
    checks.user_email = user?.email || null;

    // Check 2: notification_email in user_settings
    const { data: emailSetting, error: emailError } = await supabase
      .from("user_settings")
      .select("setting_value, updated_at")
      .eq("user_id", DEMO_USER_ID)
      .eq("setting_key", "notification_email")
      .maybeSingle();

    if (emailError) {
      checks.notification_email_query_error = emailError.message;
    }

    checks.notification_email_saved = !!emailSetting?.setting_value;
    checks.notification_email_value = emailSetting?.setting_value || null;
    checks.notification_email_updated_at = emailSetting?.updated_at || null;

    // Check 3: calendar invites enabled
    const { data: inviteSetting } = await supabase
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", DEMO_USER_ID)
      .eq("setting_key", "email_calendar_invites")
      .single();

    checks.calendar_invites_enabled = inviteSetting?.setting_value !== "false";

    // Check 4: Resend API key configured
    checks.resend_api_key_set = !!process.env.RESEND_API_KEY;
    checks.resend_from_email =
      process.env.RESEND_FROM_EMAIL || "Kinloop <onboarding@resend.dev> (default)";

    // Check 5: Effective recipient
    checks.effective_recipient =
      emailSetting?.setting_value || user?.email || "NONE — emails will fail";

    // Overall status
    const allGood =
      checks.user_exists &&
      checks.resend_api_key_set &&
      (checks.notification_email_saved || checks.user_email);

    checks.status = allGood ? "ready" : "not_ready";
    const blockers: string[] = [];
    if (!checks.user_exists) blockers.push("Demo user not found in users table");
    if (!checks.resend_api_key_set) blockers.push("RESEND_API_KEY not set");
    if (!checks.notification_email_saved && !checks.user_email)
      blockers.push("No notification email and no fallback user email");
    checks.blockers = blockers;

    return NextResponse.json(checks);
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
