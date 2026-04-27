import { z } from "zod";

import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
import { readPrompt, buildChildContextString } from "@/lib/prompts";
import type { SchedulerExtraction } from "@/types/event";

/**
 * Scheduler Extractor — Claude tool_use for structured extraction of events
 * from parent communications (emails, PDFs, images).
 *
 * Prompt lives in: /prompts/scheduler-extraction.md
 */

// ─── Zod Schema ─────────────────────────────────────────────────
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

// ─── JSON Schema for Claude tool_use ────────────────────────────
const extractionToolSchema = {
  name: "extract_scheduler_data",
  description:
    "Extract structured events, action items, amounts due, and suggested reply from a parent communication (email, PDF, or image).",
  input_schema: {
    type: "object" as const,
    properties: {
      events: {
        type: "array",
        description: "Calendar events extracted from the communication",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Descriptive event name" },
            description: {
              type: "string",
              description: "Brief event description or context",
            },
            startDate: {
              type: "string",
              description: "ISO 8601 date (YYYY-MM-DD) or datetime",
            },
            endDate: {
              type: ["string", "null"],
              description: "ISO 8601 end date or null",
            },
            location: {
              type: ["string", "null"],
              description: "Event location or null",
            },
          },
          required: ["title", "description", "startDate", "endDate", "location"],
        },
      },
      actionItems: {
        type: "array",
        description: "Action items the parent needs to complete",
        items: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "Clear, actionable task description",
            },
            dueDate: {
              type: ["string", "null"],
              description: "ISO 8601 due date or null",
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Priority level",
            },
          },
          required: ["task", "dueDate", "priority"],
        },
      },
      amountsDue: {
        type: "array",
        description: "Payments or fees mentioned in the communication",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "What the payment is for",
            },
            amount: { type: "number", description: "Dollar amount" },
            currency: { type: "string", description: "Currency code (default USD)" },
            dueDate: {
              type: ["string", "null"],
              description: "ISO 8601 due date or null",
            },
            payableTo: {
              type: ["string", "null"],
              description: "Who to pay or null",
            },
          },
          required: ["description", "amount", "currency", "dueDate", "payableTo"],
        },
      },
      suggestedReply: {
        type: ["string", "null"],
        description: "Suggested reply if the communication expects a response, or null",
      },
      confidence: {
        type: "number",
        description: "Confidence score from 0 to 1",
      },
    },
    required: ["events", "actionItems", "amountsDue", "suggestedReply", "confidence"],
  },
};

// ─── Extraction Function ────────────────────────────────────────

export async function extractFromText(
  content: string,
  childContext: string,
): Promise<SchedulerExtraction> {
  const systemPrompt = readPrompt("scheduler-extraction");

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `${systemPrompt}\n\n## Child Context\n${childContext}`,
    messages: [{ role: "user", content }],
    tools: [extractionToolSchema],
    tool_choice: { type: "tool", name: "extract_scheduler_data" },
  });

  // Extract the tool_use block from the response
  const toolBlock = response.content.find((b: { type: string }) => b.type === "tool_use");

  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  // Validate with Zod
  const parsed = schedulerExtractionSchema.parse(toolBlock.input);
  return parsed;
}

/**
 * Extract from multimodal content (image or PDF).
 * Passes the image/document URL directly to Claude's vision capability.
 */
export async function extractFromMultimodal(
  textContent: string,
  mediaUrl: string,
  mediaType: string,
  childContext: string,
): Promise<SchedulerExtraction> {
  const systemPrompt = readPrompt("scheduler-extraction");

  // Build multimodal message content
  const userContent: Array<
    { type: "text"; text: string } | { type: "image"; source: { type: "url"; url: string } }
  > = [];

  if (textContent) {
    userContent.push({ type: "text", text: textContent });
  }

  if (mediaType.startsWith("image/")) {
    userContent.push({
      type: "image",
      source: { type: "url", url: mediaUrl },
    });
  } else {
    // For PDFs and other documents, include as text instruction
    userContent.push({
      type: "text",
      text: `[Document available at: ${mediaUrl}]\nPlease extract all events, dates, deadlines, payments, and action items.`,
    });
  }

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: `${systemPrompt}\n\n## Child Context\n${childContext}`,
    messages: [{ role: "user", content: userContent }],
    tools: [extractionToolSchema],
    tool_choice: { type: "tool", name: "extract_scheduler_data" },
  });

  const toolBlock = response.content.find((b: { type: string }) => b.type === "tool_use");

  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  return schedulerExtractionSchema.parse(toolBlock.input);
}
