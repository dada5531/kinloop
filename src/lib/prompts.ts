import { readFileSync } from "fs";
import { join } from "path";

/**
 * Load a versioned prompt from the /prompts/ directory.
 * Prompts are markdown files with structured sections.
 *
 * @param name - Prompt file name without extension (e.g., "scheduler-extraction")
 * @returns The full prompt text
 */
export function readPrompt(name: string): string {
  const filePath = join(process.cwd(), "prompts", `${name}.md`);
  return readFileSync(filePath, "utf-8");
}

/**
 * Extract just the system prompt section from a prompt file.
 * Looks for content between "## System Prompt" and the next "##" heading.
 */
export function readSystemPrompt(name: string): string {
  const full = readPrompt(name);
  const match = full.match(/## System Prompt\s*\n([\s\S]*?)(?=\n## |\n$)/);
  return match ? match[1].trim() : full;
}

/**
 * Build a child context string for injection into Claude prompts.
 */
export function buildChildContextString(child: {
  name: string;
  dob: string;
  allergies?: string[];
  notes?: string | null;
}): string {
  const now = new Date();
  const dob = new Date(child.dob);
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const ageDisplay = `${years}y ${months}mo`;

  const parts = [`Child: ${child.name}, age ${ageDisplay}`];

  if (child.allergies && child.allergies.length > 0) {
    parts.push(`Allergies: ${child.allergies.join(", ")}`);
  }

  if (child.notes) {
    parts.push(`Notes: ${child.notes}`);
  }

  return parts.join("\n");
}
