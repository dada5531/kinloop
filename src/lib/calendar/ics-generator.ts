/**
 * ICS calendar file generator.
 *
 * Uses the `ics` npm package to generate .ics files from extracted events.
 * These can be attached to emails or downloaded directly.
 */

import { createEvents, type EventAttributes, type DateArray } from "ics";

interface CalendarEvent {
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate?: string | null; // ISO 8601
  location?: string | null;
}

/**
 * Convert an ISO date string to an ICS DateArray [year, month, day, hour, minute].
 */
function toDateArray(isoDate: string): DateArray {
  const d = new Date(isoDate);
  return [
    d.getFullYear(),
    d.getMonth() + 1, // ICS months are 1-indexed
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  ];
}

/**
 * Generate an .ics file content string from one or more events.
 */
export function generateIcs(events: CalendarEvent[]): string {
  const icsEvents: EventAttributes[] = events.map((evt) => {
    const start = toDateArray(evt.startDate);

    const base = {
      title: evt.title,
      description: evt.description || "",
      start,
      status: "CONFIRMED" as const,
      organizer: { name: "Kinloop", email: "noreply@kinloop.com" },
      productId: "kinloop/ics",
      ...(evt.location ? { location: evt.location } : {}),
    };

    if (evt.endDate) {
      return { ...base, end: toDateArray(evt.endDate) } as EventAttributes;
    }
    return { ...base, duration: { hours: 1 } } as EventAttributes;
  });

  const { error, value } = createEvents(icsEvents);

  if (error) {
    console.error("[ICS Generator] Error:", error);
    throw new Error("Failed to generate calendar file");
  }

  return value || "";
}

/**
 * Generate an .ics file as a Buffer for email attachment.
 */
export function generateIcsBuffer(events: CalendarEvent[]): Buffer {
  const icsContent = generateIcs(events);
  return Buffer.from(icsContent, "utf-8");
}
