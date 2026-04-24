import { z } from "zod";

import type { HealthExtraction } from "@/types/health";

/**
 * Health Extractor — Claude prompt + Zod schema for extracting health data from pediatrician notes.
 *
 * Prompt lives in: /prompts/health-extraction.md
 * Test fixture: /tests/unit/fixtures/pediatrician-note.txt
 *
 * TODO: Implement extraction pipeline.
 * See GitHub Issue #12.
 */

export const healthExtractionSchema = z.object({
  recordType: z.enum(["well_child", "sick_visit", "specialist", "dental", "school_report", "other"]),
  recordDate: z.string(),
  provider: z.string().nullable(),
  summary: z.string(),
  growthData: z
    .object({
      weightLbs: z.number().nullable(),
      weightPercentile: z.number().nullable(),
      heightInches: z.number().nullable(),
      heightPercentile: z.number().nullable(),
      headCircumferenceCm: z.number().nullable(),
      bmi: z.number().nullable(),
    })
    .nullable(),
  milestones: z.array(
    z.object({
      name: z.string(),
      category: z.enum(["motor", "language", "social", "cognitive"]),
      status: z.enum(["achieved", "emerging", "not_yet"]),
    }),
  ),
  immunizations: z.array(
    z.object({
      name: z.string(),
      date: z.string().nullable(),
    }),
  ),
  concerns: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export async function extractHealthRecord(
  content: string,
  childContext: string,
): Promise<HealthExtraction> {
  throw new Error("Not implemented — see GitHub Issue #12");
}
