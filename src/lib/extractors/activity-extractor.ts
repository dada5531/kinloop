import { z } from "zod";

import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
import { readPrompt, buildChildContextString } from "@/lib/prompts";
import type { ActivityExtraction } from "@/types/activity";

/**
 * Activity Extractor — Claude tool_use for extracting activity plans
 * from YouTube transcripts, social media posts, blog content, etc.
 *
 * Prompt lives in: /prompts/activity-extraction.md
 */

export const activityExtractionSchema = z.object({
  title: z.string(),
  description: z.string(),
  ageRangeMin: z.number(),
  ageRangeMax: z.number(),
  durationMinutes: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.enum(["sensory", "art", "stem", "outdoor", "cooking", "music", "movement", "other"]),
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

// ─── JSON Schema for Claude tool_use ────────────────────────────
const activityToolSchema = {
  name: "extract_activity_plan",
  description:
    "Extract a structured activity plan from social media content, video transcripts, or blog posts about children's activities.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Clear, descriptive activity name" },
      description: { type: "string", description: "2-3 sentence description of the activity" },
      ageRangeMin: { type: "number", description: "Minimum age in months" },
      ageRangeMax: { type: "number", description: "Maximum age in months" },
      durationMinutes: { type: "number", description: "Estimated duration in minutes" },
      difficulty: {
        type: "string",
        enum: ["easy", "medium", "hard"],
        description: "Difficulty level",
      },
      category: {
        type: "string",
        enum: ["sensory", "art", "stem", "outdoor", "cooking", "music", "movement", "other"],
        description: "Activity category",
      },
      steps: {
        type: "array",
        description: "Step-by-step instructions",
        items: { type: "string" },
      },
      materials: {
        type: "array",
        description: "Materials needed",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: ["string", "null"] },
            required: { type: "boolean" },
          },
          required: ["name", "quantity", "required"],
        },
      },
      skills: {
        type: "array",
        description: "Developmental skills practiced",
        items: { type: "string" },
      },
      safetyNotes: {
        type: "array",
        description: "Safety considerations",
        items: { type: "string" },
      },
    },
    required: [
      "title",
      "description",
      "ageRangeMin",
      "ageRangeMax",
      "durationMinutes",
      "difficulty",
      "category",
      "steps",
      "materials",
      "skills",
      "safetyNotes",
    ],
  },
};

export async function extractActivity(
  transcript: string,
  childContext: string,
): Promise<ActivityExtraction> {
  const systemPrompt = readPrompt("activity-extraction");

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `${systemPrompt}\n\n## Child Context\n${childContext}`,
    messages: [{ role: "user", content: transcript }],
    tools: [activityToolSchema],
    tool_choice: { type: "tool", name: "extract_activity_plan" },
  });

  const toolBlock = response.content.find((b: { type: string }) => b.type === "tool_use");

  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  return activityExtractionSchema.parse(toolBlock.input);
}
