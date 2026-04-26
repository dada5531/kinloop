import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * GET /api/settings
 *
 * Returns all settings for the current user as a key-value map.
 */
export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("user_settings")
      .select("setting_key, setting_value")
      .eq("user_id", DEMO_USER_ID);

    if (error) throw error;

    // Convert to a simple key-value map
    const settings: Record<string, string | null> = {};
    for (const row of data || []) {
      settings[row.setting_key] = row.setting_value;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[Settings GET] Error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

/**
 * POST /api/settings
 *
 * Upserts a single setting.
 * Body: { key: string, value: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Upsert: insert or update on conflict
    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: DEMO_USER_ID,
        setting_key: key,
        setting_value: value || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,setting_key", ignoreDuplicates: false },
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings POST] Error:", error);
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
  }
}
