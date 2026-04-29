/**
 * logger.ts — Structured logging for Kinloop.
 *
 * Outputs JSON-structured console.error payloads that are searchable
 * in Vercel runtime logs. Sanitizes sensitive input before logging.
 */

interface LogContext {
  /** Route or function name, e.g. "scheduler.handleApproveExtracted" */
  route: string;
  /** User ID (demo or real) */
  userId?: string;
  /** Child ID */
  childId?: string;
  /** Item ID (event, activity, etc.) */
  itemId?: string;
  /** The input that triggered the error (will be truncated/sanitized) */
  input?: unknown;
  /** Any additional metadata */
  meta?: Record<string, unknown>;
  /** Allow extra context keys */
  [key: string]: unknown;
}

/**
 * Truncate a string to maxLen characters for log safety.
 */
function truncate(str: string, maxLen = 500): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + `... [truncated, ${str.length} chars total]`;
}

/**
 * Sanitize input for logging — remove potential PII patterns,
 * truncate long strings, and handle circular references.
 */
function sanitizeInput(input: unknown): unknown {
  if (input == null) return null;
  if (typeof input === "string") {
    // Redact email addresses
    const redacted = input.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL_REDACTED]",
    );
    return truncate(redacted);
  }
  if (typeof input === "number" || typeof input === "boolean") return input;
  try {
    const str = JSON.stringify(input);
    return truncate(str, 1000);
  } catch {
    return "[unserializable]";
  }
}

/**
 * Log a structured error. Shows in Vercel runtime logs as searchable JSON.
 */
export function logError(error: unknown, context: LogContext): void {
  const errorClass = error instanceof Error ? error.constructor.name : typeof error;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : undefined;

  const payload = {
    level: "error" as const,
    timestamp: new Date().toISOString(),
    route: context.route,
    userId: context.userId || "unknown",
    childId: context.childId || "unknown",
    errorClass,
    errorMessage,
    input: context.input ? sanitizeInput(context.input) : undefined,
    meta: context.meta,
    stack,
  };

  console.error(`[Kinloop Error] ${context.route}:`, JSON.stringify(payload));
}

/**
 * Log a structured warning (non-fatal issues like unparseable dates).
 */
export function logWarn(message: string, context: LogContext): void {
  const payload = {
    level: "warn" as const,
    timestamp: new Date().toISOString(),
    route: context.route,
    userId: context.userId || "unknown",
    childId: context.childId || "unknown",
    message,
    input: context.input ? sanitizeInput(context.input) : undefined,
    meta: context.meta,
  };

  console.warn(`[Kinloop Warn] ${context.route}:`, JSON.stringify(payload));
}
