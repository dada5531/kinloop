/**
 * error-toasts.ts — User-facing error messages with specific copy per error type.
 *
 * Each error type gets descriptive, actionable copy instead of generic
 * "Something went wrong." Import and call from catch blocks.
 */

import { toast } from "sonner";

/** Error categories for specific user-facing messages */
export type ErrorCategory =
  | "date_parse"
  | "network"
  | "validation"
  | "extraction"
  | "save"
  | "delete"
  | "upload"
  | "calendar"
  | "auth"
  | "unknown";

interface ErrorToastOptions {
  /** Which field had the issue (for validation errors) */
  field?: string;
  /** The action that was attempted */
  action?: string;
  /** Duration in ms (default: 5000) */
  duration?: number;
}

const ERROR_MESSAGES: Record<ErrorCategory, (opts?: ErrorToastOptions) => string> = {
  date_parse: () =>
    "Couldn\u2019t read the date in this event. Please add it manually after approving.",
  network: () =>
    "Couldn\u2019t save. Check your connection and try again.",
  validation: (opts) =>
    opts?.field
      ? `This event is missing required info \u2014 please fill in ${opts.field}.`
      : "This event is missing required info. Please check all fields and try again.",
  extraction: () =>
    "We had trouble reading this email. Try pasting it again or schedule the event manually.",
  save: (opts) =>
    opts?.action
      ? `Couldn\u2019t ${opts.action}. Please try again.`
      : "Couldn\u2019t save your changes. Please try again.",
  delete: () =>
    "Couldn\u2019t delete this item. Please try again.",
  upload: () =>
    "File upload failed. Check the file size and format, then try again.",
  calendar: () =>
    "Couldn\u2019t send the calendar invite. Please try again or add the event manually.",
  auth: () =>
    "Your session may have expired. Please sign in again.",
  unknown: () =>
    "Something unexpected happened. Please try again.",
};

/**
 * Show a specific error toast based on error category.
 */
export function showErrorToast(
  category: ErrorCategory,
  opts?: ErrorToastOptions,
): void {
  const message = ERROR_MESSAGES[category](opts);
  toast.error(message, {
    duration: opts?.duration ?? 5000,
  });
}

/**
 * Classify an error into a category based on its type and message.
 */
export function classifyError(error: unknown): ErrorCategory {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "network";
  }
  if (error instanceof TypeError && error.message.includes("NetworkError")) {
    return "network";
  }
  if (error instanceof RangeError) {
    return "date_parse";
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("timeout")) {
      return "network";
    }
    if (msg.includes("date") || msg.includes("invalid time") || msg.includes("rangerror")) {
      return "date_parse";
    }
    if (msg.includes("required") || msg.includes("missing") || msg.includes("validation")) {
      return "validation";
    }
    if (msg.includes("extract") || msg.includes("parse") || msg.includes("claude")) {
      return "extraction";
    }
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("session")) {
      return "auth";
    }
  }
  return "unknown";
}

/**
 * Convenience: classify and show an error toast in one call.
 */
export function handleErrorWithToast(
  error: unknown,
  fallbackCategory?: ErrorCategory,
  opts?: ErrorToastOptions,
): void {
  const category = fallbackCategory ?? classifyError(error);
  showErrorToast(category, opts);
}
