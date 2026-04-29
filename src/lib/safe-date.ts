/**
 * safe-date.ts — Bulletproof date parsing for AI-extracted content.
 *
 * Handles: null, undefined, empty string, "TBD", "tbd", relative phrases
 * like "next week", ISO strings with placeholder X chars, and any other
 * unparseable input. Never throws.
 */

export interface SafeDateResult {
  /** Parsed Date object, or null if unparseable */
  date: Date | null;
  /** Whether the input was successfully parsed into a valid date */
  parseable: boolean;
  /** The original input string (for debugging / UI display) */
  original: string;
}

/** Patterns that indicate a date is intentionally vague or unknown */
const UNPARSEABLE_PATTERNS = [
  /^tbd$/i,
  /^t\.b\.d\.?$/i,
  /^to\s*be\s*(determined|decided|announced|confirmed)/i,
  /^n\/?a$/i,
  /^none$/i,
  /^unknown$/i,
  /^pending$/i,
  /^not\s*(set|available|decided|determined)/i,
  /\bsometime\b/i,
  /\bnext\s+(week|month|year|semester|quarter)\b/i,
  /\blast\s+(week|month|year)\b/i,
  /\b(early|mid|late)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i,
  /\b(early|mid|late)\s+\d{4}\b/i,
  /\bprobably\b/i,
  /\blikely\b/i,
  /\baround\b/i,
  /\bapprox/i,
  /X{1,4}/,           // ISO with placeholder X chars: 2025-05-XX
  /\?\?/,             // 2025-??-15
];

/**
 * Safely parse a date string. Returns a structured result instead of throwing.
 *
 * @param input - Any value that might be a date string
 * @returns SafeDateResult with parsed date or null
 */
export function safeISODate(input: unknown): SafeDateResult {
  // Handle null, undefined, empty
  if (input == null || input === "") {
    return { date: null, parseable: false, original: String(input ?? "") };
  }

  const raw = String(input).trim();

  if (raw === "") {
    return { date: null, parseable: false, original: raw };
  }

  // Check against unparseable patterns
  for (const pattern of UNPARSEABLE_PATTERNS) {
    if (pattern.test(raw)) {
      return { date: null, parseable: false, original: raw };
    }
  }

  // Attempt to parse
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      return { date: null, parseable: false, original: raw };
    }
    // Sanity check: reject dates before 1900 or after 2100
    const year = d.getFullYear();
    if (year < 1900 || year > 2100) {
      return { date: null, parseable: false, original: raw };
    }
    return { date: d, parseable: true, original: raw };
  } catch {
    return { date: null, parseable: false, original: raw };
  }
}

/**
 * Safely convert a date input to an ISO string, or return null.
 * Drop-in replacement for `new Date(x).toISOString()` that never throws.
 */
export function safeToISOString(input: unknown): string | null {
  const result = safeISODate(input);
  return result.date ? result.date.toISOString() : null;
}

/**
 * Safely format a date for display. Returns a human-readable string
 * or a fallback message instead of "Invalid Date".
 *
 * @param input - Any value that might be a date
 * @param options - Intl.DateTimeFormat options
 * @param fallback - What to show if the date can't be parsed (default: "Date pending")
 */
export function safeFormatDate(
  input: unknown,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  },
  fallback = "Date pending",
): string {
  const result = safeISODate(input);
  if (!result.date) return fallback;
  try {
    return result.date.toLocaleDateString("en-US", options);
  } catch {
    return fallback;
  }
}

/**
 * Safely format a time for display.
 */
export function safeFormatTime(
  input: unknown,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  },
  fallback = "",
): string {
  const result = safeISODate(input);
  if (!result.date) return fallback;
  try {
    return result.date.toLocaleTimeString("en-US", options);
  } catch {
    return fallback;
  }
}
