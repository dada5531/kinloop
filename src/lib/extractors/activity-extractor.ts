import { z } from "zod";

import type { ActivityExtraction } from "@/types/activity";

/**
 * Activity Extractor — Claude prompt + Zod schema for extracting activity plans from social content.
 *
 * Prompt lives in: /prompts/activity-extraction.md
 * Test fixture: /tests/unit/fixtures/youtube-transcript.txt
 *
 * TODO: Implement extraction pipeline.
 * See GitHub Issue #8.
 */

export const activityExtractionSchema = z.object({
  title: z.string(),
  description: z.string(),
  ageRangeMin: z.number(),
  ageRangeMax: z.number(),
  durationMinutes: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum([
    "sensory",
    "art",
    "stem",
    "outdoor",
    "cooking",
    "music",
    "movement",
    "other",
  ]),
  steps: z.array(z.string()),
  materials: z.array(
    z.object({
      name: z.string(),
      quantity: z.string().nullable(),
      required: z.boolean(),
    }),
  ),
  skills: z.array(z.string()),
  safetyNotes: z.array(z.string()),
});

export async function extractActivity(
  transcript: string,
  childContext: string,
): Promise<ActivityExtraction> {
  throw new Error("Not implemented — see GitHub Issue #8");
}
