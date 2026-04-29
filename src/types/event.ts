/**
 * Event — extracted from emails, PDFs, or images by the Scheduler quadrant.
 */
export interface Event {
  id: string;
  userId: string;
  childId: string;
  title: string;
  description: string | null;
  startDate: string; // ISO datetime
  endDate: string | null; // ISO datetime
  location: string | null;
  source: "email" | "pdf" | "image" | "manual";
  sourceContent: string | null; // Original text that was extracted from
  status: "pending" | "approved" | "dismissed";
  calendarSynced: boolean;
  googleCalendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extraction result from Claude for the Scheduler quadrant.
 * This is the Zod-validated output shape.
 */
export interface SchedulerExtraction {
  events: {
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
    date_certainty: "exact" | "approximate" | "unknown";
    original_date_text: string | null;
  }[];
  actionItems: {
    task: string;
    dueDate: string | null;
    priority: "high" | "medium" | "low";
  }[];
  amountsDue: {
    description: string;
    amount: number;
    currency: string;
    dueDate: string | null;
    payableTo: string | null;
  }[];
  suggestedReply: string | null;
  confidence: number; // 0-1
}
