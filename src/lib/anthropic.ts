import Anthropic from "@anthropic-ai/sdk";

/**
 * Singleton Anthropic client.
 * All Claude calls should go through this module.
 *
 * Usage:
 *   import { claude } from "@/lib/anthropic";
 *   const response = await claude.messages.create({ ... });
 *
 * Model: claude-sonnet-4-5 (locked — do not change without team discussion)
 */

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Get one at https://console.anthropic.com",
      );
    }
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _client;
}

export const claude = new Proxy({} as Anthropic, {
  get(_, prop) {
    return Reflect.get(getAnthropicClient(), prop);
  },
});

/**
 * Default model for all KINLOOP Claude calls.
 * Centralized here so we can change it in one place.
 */
export const CLAUDE_MODEL = "claude-sonnet-4-5-20250514" as const;

/**
 * Canonical example of calling Claude with structured extraction.
 *
 * ```ts
 * import { claude, CLAUDE_MODEL } from "@/lib/anthropic";
 * import { readPrompt } from "@/lib/utils";
 *
 * const systemPrompt = readPrompt("scheduler-extraction");
 * const response = await claude.messages.create({
 *   model: CLAUDE_MODEL,
 *   max_tokens: 4096,
 *   system: systemPrompt,
 *   messages: [{ role: "user", content: emailText }],
 *   tools: [{
 *     name: "extract_events",
 *     description: "Extract structured events from parent communication",
 *     input_schema: schedulerExtractionSchema, // Zod → JSON Schema
 *   }],
 *   tool_choice: { type: "tool", name: "extract_events" },
 * });
 * ```
 */
