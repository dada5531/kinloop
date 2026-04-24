import { z } from "zod";

import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
import type { SchedulerExtraction } from "@/types/event";

/**
 * Scheduler Extractor — Claude prompt + Zod schema for extracting events from parent communications.
 *
 * Prompt lives in: /prompts/scheduler-extraction.md
 * Test fixture: /tests/unit/fixtures/school-email.txt
 *
 * TODO: Implement extraction pipeline.
 * See GitHub Issue #5.
 */

export const schedulerExtractionSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      location: z.string().nullable(),
    }),
  ),
  actionItems: z.array(
    z.object({
      task: z.string(),
      dueDate: z.string().nullable(),
      priority: z.enum(["high", "medium", "low"]),
    }),
  ),
  amountsDue: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
      currency: z.string().default("USD"),
      dueDate: z.string().nullable(),
      payableTo: z.string().nullable(),
    }),
  ),
  suggestedReply: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export async function extractFromText(
  content: string,
  childContext: string,
): Promise<SchedulerExtraction> {
  // TODO: Load prompt from /prompts/scheduler-extraction.md
  // TODO: Call Claude with tool_use for structured extraction
  // TODO: Validate with Zod schema
  throw new Error("Not implemented — see GitHub Issue #5");
}
