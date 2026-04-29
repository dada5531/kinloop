/**
 * Daily recommendations — tip of the day + activity of the day.
 *
 * GET /api/coach/daily?childId=xxx
 * Returns today's curated tip and an age-appropriate activity recommendation.
 *
 * Tips are universal (no age filtering).
 * Activities are filtered by the child's current age in months.
 * Picks are deterministic per day+child — same inputs always return same outputs.
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

/**
 * Deterministic hash for picking an index from a list.
 * Uses a simple string hash of date+childId to produce a stable index.
 */
function deterministicIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % length;
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
        console.log(`[Daily] childId=${childId}, dob=${child.dob}, ageMonths=${ageMonths}`);
      } else {
        console.log(`[Daily] childId=${childId}, no DOB found`);
      }
    }

    // Seed for deterministic picks: date + childId (or just date if no child)
    const pickSeed = childId ? `${today}:${childId}` : today;

    // --- Fetch all tips (universal, no age filtering) ---
    const { data: allTips } = await supabase
      .from("tips_corpus")
      .select("id, content, source, source_url, category, affiliate_url_amazon, affiliate_url_audible")
      .order("id");

    // --- Fetch age-appropriate activities ---
    let eligibleActivities;
    if (ageMonths !== null) {
      const { data } = await supabase
        .from("activities_corpus")
        .select(
          "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
        )
        .lte("age_min", ageMonths)
        .gte("age_max", ageMonths)
        .order("id");

      eligibleActivities = data;
      console.log(
        `[Daily] ageMonths=${ageMonths}, eligible activities: ${data?.length ?? 0}`,
        data?.map((a) => `${a.title} (${a.age_min}-${a.age_max})`),
      );
    } else {
      // No child context — return all activities
      const { data } = await supabase
        .from("activities_corpus")
        .select(
          "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
        )
        .order("id");

      eligibleActivities = data;
    }

    // --- Deterministic picks ---
    let tipData = null;
    let activityData = null;

    // Support previewTipId override for QA/demo
    const previewTipId = request.nextUrl.searchParams.get("previewTipId");

    if (allTips && allTips.length > 0) {
      let tip;
      if (previewTipId) {
        tip = allTips.find((t) => t.id === previewTipId);
        if (!tip) tip = allTips[0]; // fallback if ID not found
        console.log(`[Daily] Preview override: tipId=${previewTipId}`);
      } else {
        const tipIndex = deterministicIndex(`tip:${pickSeed}`, allTips.length);
        tip = allTips[tipIndex];
        console.log(`[Daily] Picked tip index=${tipIndex}: ${tip.category}`);
      }
      tipData = {
        content: tip.content,
        source: tip.source,
        source_url: tip.source_url,
        category: tip.category,
        affiliate_url_amazon: tip.affiliate_url_amazon || null,
        affiliate_url_audible: tip.affiliate_url_audible || null,
      };
    }

    if (eligibleActivities && eligibleActivities.length > 0) {
      const actIndex = deterministicIndex(`activity:${pickSeed}`, eligibleActivities.length);
      const activity = eligibleActivities[actIndex];
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
      console.log(
        `[Daily] Picked activity index=${actIndex}: "${activity.title}" (${activity.age_min}-${activity.age_max}mo)`,
      );
    }

    return NextResponse.json({
      tip: tipData,
      activity: activityData,
      date: today,
      ageMonths,
      eligibleCount: eligibleActivities?.length ?? 0,
    });
  } catch (error) {
    console.error("[Daily] Error:", error);
    return NextResponse.json({ error: "Failed to load daily recommendations" }, { status: 500 });
  }
}
