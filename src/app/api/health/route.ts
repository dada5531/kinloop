import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Smoke-test endpoint that verifies connectivity to:
 *   1. Supabase (SELECT 1)
 *   2. Anthropic API (models list)
 *
 * Returns: { supabase: "ok"|"fail", anthropic: "ok"|"fail", details: {...} }
 */
export async function GET() {
  const results: Record<string, string> = {};
  const details: Record<string, string> = {};

  // 1. Check Supabase
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      results.supabase = "fail";
      details.supabase = "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY";
    } else {
      const supabase = createClient(url, key);
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (error) {
        results.supabase = "fail";
        details.supabase = error.message;
      } else {
        results.supabase = "ok";
        details.supabase = `Connected. Found ${data?.length ?? 0} user(s).`;
      }
    }
  } catch (e) {
    results.supabase = "fail";
    details.supabase = e instanceof Error ? e.message : "Unknown error";
  }

  // 2. Check Anthropic
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      results.anthropic = "fail";
      details.anthropic = "Missing ANTHROPIC_API_KEY";
    } else {
      // Lightweight check: send a tiny message to verify the key works
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
      });

      if (response.ok) {
        results.anthropic = "ok";
        details.anthropic = "API key valid. Claude reachable.";
      } else {
        const body = await response.text();
        results.anthropic = "fail";
        details.anthropic = `HTTP ${response.status}: ${body.slice(0, 200)}`;
      }
    }
  } catch (e) {
    results.anthropic = "fail";
    details.anthropic = e instanceof Error ? e.message : "Unknown error";
  }

  const allOk = results.supabase === "ok" && results.anthropic === "ok";

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      supabase: results.supabase,
      anthropic: results.anthropic,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}
