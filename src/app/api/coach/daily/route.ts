/**
 * Daily recommendations — tip of the day + activity of the day.
 *
 * GET /api/coach/daily
 * Returns today's curated tip and activity recommendation.
 *
 * DB schema (daily_recommendations):
 *   id, child_id, recommendation_date (date), tip_id (uuid FK), activity_id (uuid FK), created_at
 */

import { NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Get today's recommendation row (joined with tip and activity)
    const { data: recs } = await supabase
      .from("daily_recommendations")
      .select("id, recommendation_date, tip_id, activity_id")
      .eq("recommendation_date", today)
      .limit(1);

    let tipData = null;
    let activityData = null;
    let isFallback = false;

    if (recs && recs.length > 0) {
      const rec = recs[0];

      // Fetch the tip by ID
      if (rec.tip_id) {
        const { data: tip } = await supabase
          .from("tips_corpus")
          .select("id, content, source, source_url, category")
          .eq("id", rec.tip_id)
          .single();

        if (tip) {
          tipData = {
            content: tip.content,
            source: tip.source,
            source_url: tip.source_url,
            category: tip.category,
          };
        }
      }

      // Fetch the activity by ID
      if (rec.activity_id) {
        const { data: activity } = await supabase
          .from("activities_corpus")
          .select(
            "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
          )
          .eq("id", rec.activity_id)
          .single();

        if (activity) {
          activityData = {
            title: activity.title,
            description: activity.description,
            source: activity.source,
            source_url: activity.source_url,
            category: activity.category,
            age_min: activity.age_min,
            age_max: activity.age_max,
            duration_minutes: activity.duration_minutes,
            materials: activity.materials,
            steps: activity.steps,
          };
        }
      }
    } else {
      // No recommendations for today — fall back to random picks from corpus
      isFallback = true;

      const { data: randomTip } = await supabase
        .from("tips_corpus")
        .select("id, content, source, source_url, category")
        .limit(1)
        .order("id");

      if (randomTip?.[0]) {
        tipData = {
          content: randomTip[0].content,
          source: randomTip[0].source,
          source_url: randomTip[0].source_url,
          category: randomTip[0].category,
        };
      }

      const { data: randomActivity } = await supabase
        .from("activities_corpus")
        .select(
          "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
        )
        .limit(1)
        .order("id");

      if (randomActivity?.[0]) {
        activityData = {
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
        };
      }
    }

    return NextResponse.json({
      tip: tipData,
      activity: activityData,
      date: today,
      fallback: isFallback,
    });
  } catch (error) {
    console.error("[Daily] Error:", error);
    return NextResponse.json({ error: "Failed to load daily recommendations" }, { status: 500 });
  }
}
