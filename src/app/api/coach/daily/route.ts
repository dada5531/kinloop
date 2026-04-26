/**
 * Daily recommendations — tip of the day + activity of the day.
 *
 * GET /api/coach/daily?childId=xxx
 * Returns today's curated tip and an age-appropriate activity recommendation.
 *
 * Tips are universal (no age filtering).
 * Activities are filtered by the child's current age in months.
 * If the pre-picked daily activity is out of range, a random age-appropriate one is substituted.
 *
 * DB schema (daily_recommendations):
 *   id, child_id, recommendation_date (date), tip_id (uuid FK), activity_id (uuid FK), created_at
 */

import { NextRequest, NextResponse } from "next/server";

import { getAdminClient } from "@/lib/supabase/admin";

/**
 * Compute a child's age in months from their DOB.
 */
function getAgeMonths(dob: string): number {
  const now = new Date();
  const dobDate = new Date(dob);
  return (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Get child's age if childId is provided
    const childId = request.nextUrl.searchParams.get("childId");
    let ageMonths: number | null = null;

    if (childId) {
      const { data: child } = await supabase
        .from("children")
        .select("dob")
        .eq("id", childId)
        .single();

      if (child?.dob) {
        ageMonths = getAgeMonths(child.dob);
      }
    }

    // Get today's recommendation row
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

      // Fetch the tip by ID (tips are universal, no age filtering)
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

      // Fetch the activity by ID, then check age appropriateness
      if (rec.activity_id) {
        const { data: activity } = await supabase
          .from("activities_corpus")
          .select(
            "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
          )
          .eq("id", rec.activity_id)
          .single();

        if (activity) {
          // Check if the activity is age-appropriate for this child
          const isAgeAppropriate =
            ageMonths === null ||
            (activity.age_min !== null &&
              activity.age_max !== null &&
              ageMonths >= activity.age_min &&
              ageMonths <= activity.age_max);

          if (isAgeAppropriate) {
            activityData = formatActivity(activity);
          }
        }
      }

      // If no age-appropriate activity was found, pick a random one that fits
      if (!activityData && ageMonths !== null) {
        activityData = await pickAgeAppropriateActivity(supabase, ageMonths);
      } else if (!activityData) {
        // No childId provided and no activity from daily rec — just pick any
        activityData = await pickRandomActivity(supabase);
      }
    } else {
      // No recommendations for today — fall back to random picks
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

      // Pick an age-appropriate activity if we know the child's age
      if (ageMonths !== null) {
        activityData = await pickAgeAppropriateActivity(supabase, ageMonths);
      } else {
        activityData = await pickRandomActivity(supabase);
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

function formatActivity(activity: Record<string, unknown>) {
  return {
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

async function pickAgeAppropriateActivity(
  supabase: ReturnType<typeof getAdminClient>,
  ageMonths: number,
) {
  const { data: activities } = await supabase
    .from("activities_corpus")
    .select(
      "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
    )
    .lte("age_min", ageMonths)
    .gte("age_max", ageMonths);

  if (activities && activities.length > 0) {
    const pick = activities[Math.floor(Math.random() * activities.length)];
    return formatActivity(pick);
  }

  // If no age-appropriate activities exist, fall back to any activity
  return pickRandomActivity(supabase);
}

async function pickRandomActivity(supabase: ReturnType<typeof getAdminClient>) {
  const { data: activities } = await supabase
    .from("activities_corpus")
    .select(
      "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
    );

  if (activities && activities.length > 0) {
    const pick = activities[Math.floor(Math.random() * activities.length)];
    return formatActivity(pick);
  }

  return null;
}
