import { NextRequest, NextResponse } from "next/server";

import { extractActivity } from "@/lib/extractors/activity-extractor";
import { fetchContentFromUrl, detectPlatform } from "@/lib/integrations/content-fetcher";
import { buildChildContextString } from "@/lib/prompts";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/extract/activity
 *
 * Accepts: { content?: string, url?: string, childId: string }
 * Returns: Structured activity plan + platform metadata.
 *
 * Pipeline:
 *   1. If URL provided → auto-fetch content from platform (YouTube transcript, TikTok caption, etc.)
 *   2. Merge fetched content with any manually pasted text
 *   3. Fetch child context from Supabase
 *   4. Call Claude with activity extraction prompt + Zod schema
 *   5. Return validated structured output + extraction metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, url, childId } = body;

    if (!content && !url) {
      return NextResponse.json({ error: "Either content or url is required" }, { status: 400 });
    }

    let inputText = content || "";
    let platform = "other";
    let fetchedTitle = "";
    let extractionSource: "url" | "manual" | "combined" = content ? "manual" : "url";

    // ── Auto-fetch content from URL ──────────────────────────────
    if (url) {
      platform = detectPlatform(url);

      try {
        const fetched = await fetchContentFromUrl(url);
        fetchedTitle = fetched.title;

        if (content) {
          // User pasted text AND provided URL — combine both
          inputText = `${fetched.fullText}\n\n--- User-provided notes ---\n${content}`;
          extractionSource = "combined";
        } else {
          inputText = fetched.fullText;
          extractionSource = "url";
        }

        // If we got very little content, warn but continue
        if (fetched.fullText.length < 50) {
          console.warn(
            `[Activity Extract] Sparse content from ${platform}: "${fetched.fullText.slice(0, 100)}"`,
          );
        }
      } catch (fetchError) {
        console.warn(`[Activity Extract] URL fetch failed for ${platform}:`, fetchError);

        // If we have manual content, use it as fallback
        if (content) {
          inputText = `Source URL: ${url}\n\n${content}`;
          extractionSource = "manual";
        } else {
          // No content at all — return a helpful error
          return NextResponse.json(
            {
              error: `Could not fetch content from ${platform}. Try pasting the text/transcript manually.`,
              platform,
              canRetryManual: true,
            },
            { status: 422 },
          );
        }
      }
    }

    // ── Build child context ──────────────────────────────────────
    let childContext = "No child context available.";
    if (childId) {
      try {
        const supabase = getAdminClient();
        const { data: child } = await supabase
          .from("children")
          .select("name, dob, allergies, notes")
          .eq("id", childId)
          .single();

        if (child) {
          childContext = buildChildContextString(child);
        }
      } catch {
        // Continue without child context
      }
    }

    // ── Extract with Claude ──────────────────────────────────────
    const result = await extractActivity(inputText, childContext);

    return NextResponse.json({
      ...result,
      _meta: {
        platform,
        extractionSource,
        fetchedTitle,
        sourceUrl: url || null,
        contentLength: inputText.length,
      },
    });
  } catch (error) {
    console.error("[Activity Extract] Error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "Anthropic API key not configured." }, { status: 503 });
    }

    return NextResponse.json({ error: "Extraction failed. Please try again." }, { status: 500 });
  }
}
