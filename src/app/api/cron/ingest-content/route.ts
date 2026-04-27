/**
 * Cron endpoint — daily corpus ingestion + daily recommendation picker.
 *
 * Runs once per day via Vercel Cron. Seeds the tips_corpus and activities_corpus
 * tables from the curated seed data, then picks today's daily tip and activity.
 *
 * GET /api/cron/ingest-content
 * Authorization: Bearer CRON_SECRET (or manual trigger without auth for dev)
 *
 * DB schema (daily_recommendations):
 *   id, child_id, recommendation_date (date), tip_id (uuid FK), activity_id (uuid FK), created_at
 *
 * Note: Embedding generation requires VOYAGE_API_KEY. If not set, corpus is
 * seeded without embeddings (RAG search won't work, but daily cards will).
 */

import { NextRequest, NextResponse } from "next/server";

import { TIPS_CORPUS, ACTIVITIES_CORPUS } from "@/lib/rag/seed-corpus";
import { getAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

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
      tips_errors: [] as string[],
      activities_errors: [] as string[],
      daily_tip: false,
      daily_activity: false,
    };

    // --- 1. Seed tips corpus (skip if already seeded) ---
    const { count: tipsCount } = await supabase
      .from("tips_corpus")
      .select("*", { count: "exact", head: true });

    if ((tipsCount ?? 0) < TIPS_CORPUS.length) {
      // Try to generate embeddings, but fall back to null if VOYAGE_API_KEY is missing
      let tipsEmbeddings: (number[] | null)[] = TIPS_CORPUS.map(() => null);

      if (process.env.VOYAGE_API_KEY) {
        try {
          const { generateEmbeddings } = await import("@/lib/rag/embed");
          const tipsTexts = TIPS_CORPUS.map((t) => t.content);
          tipsEmbeddings = await generateEmbeddings(tipsTexts);
        } catch (embErr) {
          console.error("[Cron] Embedding generation failed, seeding without embeddings:", embErr);
        }
      } else {
        console.log("[Cron] VOYAGE_API_KEY not set, seeding corpus without embeddings");
      }

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
          ...(tipsEmbeddings[i] ? { embedding: JSON.stringify(tipsEmbeddings[i]) } : {}),
        });

        if (error) {
          results.tips_errors.push(`Tip ${i}: ${error.message}`);
          console.error(`[Cron] Tip insert error (${i}):`, error.message);
        } else {
          results.tips_seeded++;
        }
      }
    }

    // --- 2. Seed activities corpus (skip if already seeded) ---
    const { count: activitiesCount } = await supabase
      .from("activities_corpus")
      .select("*", { count: "exact", head: true });

    if ((activitiesCount ?? 0) < ACTIVITIES_CORPUS.length) {
      let activitiesEmbeddings: (number[] | null)[] = ACTIVITIES_CORPUS.map(() => null);

      if (process.env.VOYAGE_API_KEY) {
        try {
          const { generateEmbeddings } = await import("@/lib/rag/embed");
          const activitiesTexts = ACTIVITIES_CORPUS.map((a) => `${a.title}: ${a.description}`);
          activitiesEmbeddings = await generateEmbeddings(activitiesTexts);
        } catch (embErr) {
          console.error("[Cron] Activity embedding generation failed:", embErr);
        }
      }

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
          ...(activitiesEmbeddings[i]
            ? { embedding: JSON.stringify(activitiesEmbeddings[i]) }
            : {}),
        });

        if (error) {
          results.activities_errors.push(`Activity ${i}: ${error.message}`);
          console.error(`[Cron] Activity insert error (${i}):`, error.message);
        } else {
          results.activities_seeded++;
        }
      }
    }

    // --- 3. Pick daily recommendations ---
    // Uses the actual DB schema: recommendation_date, tip_id, activity_id
    const today = new Date().toISOString().split("T")[0];

    const { data: existingRec } = await supabase
      .from("daily_recommendations")
      .select("id")
      .eq("recommendation_date", today)
      .limit(1);

    if (!existingRec || existingRec.length === 0) {
      // Pick a random tip
      const { data: allTips } = await supabase.from("tips_corpus").select("id");

      // Pick a random activity
      const { data: allActivities } = await supabase.from("activities_corpus").select("id");

      const tipId =
        allTips && allTips.length > 0
          ? allTips[Math.floor(Math.random() * allTips.length)].id
          : null;

      const activityId =
        allActivities && allActivities.length > 0
          ? allActivities[Math.floor(Math.random() * allActivities.length)].id
          : null;

      if (tipId || activityId) {
        const { error: recError } = await supabase.from("daily_recommendations").insert({
          recommendation_date: today,
          tip_id: tipId,
          activity_id: activityId,
        });

        if (recError) {
          console.error("[Cron] Daily recommendation insert error:", recError.message);
        } else {
          results.daily_tip = !!tipId;
          results.daily_activity = !!activityId;
        }
      }
    } else {
      results.daily_tip = true;
      results.daily_activity = true;
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
