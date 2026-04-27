import { z } from "zod";

import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
import { readPrompt, buildChildContextString } from "@/lib/prompts";
import type { HealthExtraction } from "@/types/health";

/**
 * Health Extractor — Claude tool_use for extracting health data from
 * pediatrician notes, immunization records, school health reports, etc.
 *
 * Prompt lives in: /prompts/health-extraction.md
 */

export const healthExtractionSchema = z.object({
  recordType: z.enum([
    "well_child",
    "sick_visit",
    "specialist",
    "dental",
    "school_report",
    "other",
  ]),
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

// ─── JSON Schema for Claude tool_use ────────────────────────────
const healthToolSchema = {
  name: "extract_health_data",
  description:
    "Extract structured health data from pediatrician notes, immunization records, or school health reports.",
  input_schema: {
    type: "object" as const,
    properties: {
      recordType: {
        type: "string",
        enum: ["well_child", "sick_visit", "specialist", "dental", "school_report", "other"],
        description: "Type of health record",
      },
      recordDate: {
        type: "string",
        description: "ISO date of the visit/record (YYYY-MM-DD)",
      },
      provider: {
        type: ["string", "null"],
        description: "Name of the healthcare provider or null",
      },
      summary: {
        type: "string",
        description: "2-3 sentence summary of the visit/record",
      },
      growthData: {
        type: ["object", "null"],
        description: "Growth measurements if present, or null",
        properties: {
          weightLbs: { type: ["number", "null"] },
          weightPercentile: { type: ["number", "null"] },
          heightInches: { type: ["number", "null"] },
          heightPercentile: { type: ["number", "null"] },
          headCircumferenceCm: { type: ["number", "null"] },
          bmi: { type: ["number", "null"] },
        },
        required: [
          "weightLbs",
          "weightPercentile",
          "heightInches",
          "heightPercentile",
          "headCircumferenceCm",
          "bmi",
        ],
      },
      milestones: {
        type: "array",
        description: "Developmental milestones mentioned",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Milestone description" },
            category: {
              type: "string",
              enum: ["motor", "language", "social", "cognitive"],
            },
            status: {
              type: "string",
              enum: ["achieved", "emerging", "not_yet"],
            },
          },
          required: ["name", "category", "status"],
        },
      },
      immunizations: {
        type: "array",
        description: "Immunizations given or discussed",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            date: { type: ["string", "null"] },
          },
          required: ["name", "date"],
        },
      },
      concerns: {
        type: "array",
        description: "Health concerns flagged by the provider",
        items: { type: "string" },
      },
      nextSteps: {
        type: "array",
        description: "Follow-up actions or next steps",
        items: { type: "string" },
      },
    },
    required: [
      "recordType",
      "recordDate",
      "provider",
      "summary",
      "growthData",
      "milestones",
      "immunizations",
      "concerns",
      "nextSteps",
    ],
  },
};

export async function extractHealthRecord(
  content: string,
  childContext: string,
): Promise<HealthExtraction> {
  const systemPrompt = readPrompt("health-extraction");

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `${systemPrompt}\n\n## Child Context\n${childContext}`,
    messages: [{ role: "user", content }],
    tools: [healthToolSchema],
    tool_choice: { type: "tool", name: "extract_health_data" },
  });

  const toolBlock = response.content.find((b: { type: string }) => b.type === "tool_use");

  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  return healthExtractionSchema.parse(toolBlock.input);
}
