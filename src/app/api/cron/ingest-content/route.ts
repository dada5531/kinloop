/**
 * Cron endpoint — daily corpus ingestion.
 *
 * Runs once per day via Vercel Cron. Seeds the tips_corpus and activities_corpus
 * tables with embeddings from the curated seed data, and picks the daily
 * tip and activity recommendations.
 *
 * POST /api/cron/ingest-content
 * Authorization: Bearer CRON_SECRET (or manual trigger without auth for dev)
 */

import { NextRequest, NextResponse } from "next/server";

import { generateEmbeddings } from "@/lib/rag/embed";
import { TIPS_CORPUS, ACTIVITIES_CORPUS } from "@/lib/rag/seed-corpus";
import { getAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60; // Allow up to 60s for embedding generation

/**
 * GET handler — triggered by Vercel Cron or manual curl.
 */
export async function GET(req: NextRequest) {
  // Optional: verify cron secret in production
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();
    const results = {
      tips_seeded: 0,
      activities_seeded: 0,
      daily_tip: false,
      daily_activity: false,
    };

    // --- 1. Seed tips corpus (skip if already seeded) ---
    const { count: tipsCount } = await supabase
      .from("tips_corpus")
      .select("*", { count: "exact", head: true });

    if ((tipsCount ?? 0) < TIPS_CORPUS.length) {
      // Generate embeddings for all tips
      const tipsTexts = TIPS_CORPUS.map((t) => t.content);
      const tipsEmbeddings = await generateEmbeddings(tipsTexts);

      for (let i = 0; i < TIPS_CORPUS.length; i++) {
        const tip = TIPS_CORPUS[i];

        // Check if this tip already exists (by content prefix)
        const { data: existing } = await supabase
          .from("tips_corpus")
          .select("id")
          .ilike("content", `${tip.content.slice(0, 50)}%`)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const { error } = await supabase.from("tips_corpus").insert({
          content: tip.content,
          source: tip.source,
          source_url: tip.source_url,
          category: tip.category,
          age_bucket: tip.age_bucket,
          embedding: JSON.stringify(tipsEmbeddings[i]),
        });

        if (!error) results.tips_seeded++;
      }
    }

    // --- 2. Seed activities corpus (skip if already seeded) ---
    const { count: activitiesCount } = await supabase
      .from("activities_corpus")
      .select("*", { count: "exact", head: true });

    if ((activitiesCount ?? 0) < ACTIVITIES_CORPUS.length) {
      const activitiesTexts = ACTIVITIES_CORPUS.map((a) => `${a.title}: ${a.description}`);
      const activitiesEmbeddings = await generateEmbeddings(activitiesTexts);

      for (let i = 0; i < ACTIVITIES_CORPUS.length; i++) {
        const activity = ACTIVITIES_CORPUS[i];

        // Check if already exists
        const { data: existing } = await supabase
          .from("activities_corpus")
          .select("id")
          .eq("title", activity.title)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const { error } = await supabase.from("activities_corpus").insert({
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
          embedding: JSON.stringify(activitiesEmbeddings[i]),
        });

        if (!error) results.activities_seeded++;
      }
    }

    // --- 3. Pick daily recommendations ---
    const today = new Date().toISOString().split("T")[0];

    // Check if today's recommendations already exist
    const { data: existingRec } = await supabase
      .from("daily_recommendations")
      .select("id")
      .eq("date", today)
      .limit(1);

    if (!existingRec || existingRec.length === 0) {
      // Pick a random tip
      const { data: allTips } = await supabase
        .from("tips_corpus")
        .select("id, content, source, source_url, category");

      if (allTips && allTips.length > 0) {
        const tipIndex = Math.floor(Math.random() * allTips.length);
        const dailyTip = allTips[tipIndex];

        await supabase.from("daily_recommendations").insert({
          date: today,
          type: "tip",
          content_id: dailyTip.id,
          content_snapshot: {
            content: dailyTip.content,
            source: dailyTip.source,
            source_url: dailyTip.source_url,
            category: dailyTip.category,
          },
        });
        results.daily_tip = true;
      }

      // Pick a random activity
      const { data: allActivities } = await supabase
        .from("activities_corpus")
        .select(
          "id, title, description, source, source_url, category, age_min, age_max, duration_minutes, materials, steps",
        );

      if (allActivities && allActivities.length > 0) {
        const actIndex = Math.floor(Math.random() * allActivities.length);
        const dailyActivity = allActivities[actIndex];

        await supabase.from("daily_recommendations").insert({
          date: today,
          type: "activity",
          content_id: dailyActivity.id,
          content_snapshot: {
            title: dailyActivity.title,
            description: dailyActivity.description,
            source: dailyActivity.source,
            source_url: dailyActivity.source_url,
            category: dailyActivity.category,
            age_min: dailyActivity.age_min,
            age_max: dailyActivity.age_max,
            duration_minutes: dailyActivity.duration_minutes,
            materials: dailyActivity.materials,
            steps: dailyActivity.steps,
          },
        });
        results.daily_activity = true;
      }
    }

    return NextResponse.json({
      ok: true,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Ingestion error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
