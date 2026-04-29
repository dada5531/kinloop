/**
 * extraction-schema.ts — Zod validation for Claude extraction responses.
 *
 * Validates the shape of AI extraction output before rendering in the UI.
 * If validation fails, provides a structured error and the raw data so
 * the user can still see what was extracted.
 */

import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────

export const ExtractedEventSchema = z.object({
  title: z.string().min(1, "Event must have a title"),
  description: z.string().default(""),
  startDate: z.union([z.string(), z.null()]).default(null),
  endDate: z.union([z.string(), z.null()]).default(null),
  location: z.union([z.string(), z.null()]).default(null),
  date_certainty: z.enum(["exact", "approximate", "unknown"]).default("exact"),
  original_date_text: z.union([z.string(), z.null()]).default(null),
});

export const ExtractedActionItemSchema = z.object({
  task: z.string().min(1, "Action item must have a task description"),
  dueDate: z.union([z.string(), z.null()]).default(null),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export const ExtractedAmountSchema = z.object({
  description: z.string().default(""),
  amount: z.number().default(0),
  currency: z.string().default("USD"),
  dueDate: z.union([z.string(), z.null()]).default(null),
  payableTo: z.union([z.string(), z.null()]).default(null),
});

export const ExtractionResultSchema = z.object({
  events: z.array(ExtractedEventSchema).default([]),
  actionItems: z.array(ExtractedActionItemSchema).default([]),
  amountsDue: z.array(ExtractedAmountSchema).default([]),
  suggestedReply: z.union([z.string(), z.null()]).default(null),
  confidence: z.number().min(0).max(1).default(0.5),
  sourceLabel: z.string().optional(),
});

// ─── Types (inferred from schemas) ──────────────────────────

export type ValidatedExtractionResult = z.infer<typeof ExtractionResultSchema>;

// ─── Validation Helper ──────────────────────────────────────

export interface ValidationResult {
  /** Whether the extraction response is valid */
  valid: boolean;
  /** The validated and normalized data (with defaults applied) */
  data: ValidatedExtractionResult | null;
  /** Human-readable error messages */
  errors: string[];
  /** The raw input for fallback display */
  raw: unknown;
}

/**
 * Validate an extraction response from Claude.
 * Returns normalized data with defaults applied, or structured errors.
 */
export function validateExtractionResult(input: unknown): ValidationResult {
  try {
    const parsed = ExtractionResultSchema.parse(input);
    return {
      valid: true,
      data: parsed,
      errors: [],
      raw: input,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.errors.map((e) => {
        const path = e.path.join(".");
        return `${path}: ${e.message}`;
      });
      return {
        valid: false,
        data: null,
        errors,
        raw: input,
      };
    }
    return {
      valid: false,
      data: null,
      errors: ["Unexpected validation error"],
      raw: input,
    };
  }
}

/**
 * Attempt to salvage a partially valid extraction result.
 * Uses safeParse to extract whatever is valid, filling in defaults for the rest.
 */
export function salvageExtractionResult(input: unknown): ValidatedExtractionResult {
  // Try to parse with defaults
  const result = ExtractionResultSchema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  // If that fails, try to extract events at minimum
  const fallback: ValidatedExtractionResult = {
    events: [],
    actionItems: [],
    amountsDue: [],
    suggestedReply: null,
    confidence: 0,
  };

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;

    // Try to salvage events array
    if (Array.isArray(obj.events)) {
      for (const evt of obj.events) {
        const parsed = ExtractedEventSchema.safeParse(evt);
        if (parsed.success) {
          fallback.events.push(parsed.data);
        }
      }
    }

    // Try to salvage action items
    if (Array.isArray(obj.actionItems)) {
      for (const item of obj.actionItems) {
        const parsed = ExtractedActionItemSchema.safeParse(item);
        if (parsed.success) {
          fallback.actionItems.push(parsed.data);
        }
      }
    }

    // Try to salvage amounts
    if (Array.isArray(obj.amountsDue)) {
      for (const amt of obj.amountsDue) {
        const parsed = ExtractedAmountSchema.safeParse(amt);
        if (parsed.success) {
          fallback.amountsDue.push(parsed.data);
        }
      }
    }

    if (typeof obj.suggestedReply === "string") {
      fallback.suggestedReply = obj.suggestedReply;
    }
    if (typeof obj.confidence === "number") {
      fallback.confidence = obj.confidence;
    }
  }

  return fallback;
}
