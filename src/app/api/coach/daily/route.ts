/**
 * Daily recommendations — tip of the day + activity of the day.
 *
 * GET /api/coach/daily
 * Returns today's curated tip and activity recommendation.
 */

import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Get today's recommendations
    const { data: recs } = await supabase
      .from("daily_recommendations")
      .select("*")
      .eq("date", today);

    if (!recs || recs.length === 0) {
      // No recommendations for today — fall back to random picks from corpus
      const { data: randomTip } = await supabase
        .from("tips_corpus")
        .select("id, content, source, source_url, category")
        .limit(1)
        .order("id"); // deterministic fallback

      const { data: randomActivity } = await supabase
        .from("activities_corpus")
        .select(
          "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
        )
        .limit(1)
        .order("id");

      return NextResponse.json({
        tip: randomTip?.[0]
          ? {
              content: randomTip[0].content,
              source: randomTip[0].source,
              source_url: randomTip[0].source_url,
              category: randomTip[0].category,
            }
          : null,
        activity: randomActivity?.[0]
          ? {
              title: randomActivity[0].title,
              description: randomActivity[0].description,
              source: randomActivity[0].source,
              source_url: randomActivity[0].source_url,
              category: randomActivity[0].category,
              age_min: randomActivity[0].age_min,
              age_max: randomActivity[0].age_max,
              duration_minutes: randomActivity[0].duration_minutes,
              materials: randomActivity[0].materials,
              steps: randomActivity[0].steps,
            }
          : null,
        date: today,
        fallback: true,
      });
    }

    const tipRec = recs.find((r) => r.type === "tip");
    const activityRec = recs.find((r) => r.type === "activity");

    return NextResponse.json({
      tip: tipRec?.content_snapshot ?? null,
      activity: activityRec?.content_snapshot ?? null,
      date: today,
      fallback: false,
    });
  } catch (error) {
    console.error("[Daily] Error:", error);
    return NextResponse.json({ error: "Failed to load daily recommendations" }, { status: 500 });
  }
}
