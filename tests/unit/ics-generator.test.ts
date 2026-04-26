import { describe, it, expect } from "vitest";
import { generateIcs } from "../../src/lib/calendar/ics-generator";

describe("ICS Generator", () => {
  it("generates valid .ics content with VCALENDAR wrapper", () => {
    const events = [
      {
        title: "Dinosaur Egg Excavation Sensory Dig",
        description: "Kids dig through a frozen dinosaur egg",
        startDate: "2026-04-28T10:00:00",
        endDate: "2026-04-28T10:30:00",
      },
    ];

    const ics = generateIcs(events);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("Dinosaur Egg Excavation Sensory Dig");
    expect(ics).toContain("PRODID");
  });

  it("includes DTSTART and DTEND for timed events", () => {
    const events = [
      {
        title: "Test Activity",
        startDate: "2026-04-28T10:00:00",
        endDate: "2026-04-28T10:30:00",
      },
    ];

    const ics = generateIcs(events);

    expect(ics).toContain("DTSTART");
    expect(ics).toContain("DTEND");
  });

  it("handles multiple events in a single .ics file", () => {
    const events = [
      {
        title: "Activity 1",
        startDate: "2026-04-28T10:00:00",
        endDate: "2026-04-28T10:30:00",
      },
      {
        title: "Activity 2",
        startDate: "2026-04-29T14:00:00",
        endDate: "2026-04-29T15:00:00",
      },
    ];

    const ics = generateIcs(events);

    // Should have exactly 2 VEVENT blocks
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(veventCount).toBe(2);
    expect(ics).toContain("Activity 1");
    expect(ics).toContain("Activity 2");
  });

  it("includes description when provided", () => {
    const events = [
      {
        title: "Test",
        description: "A fun sensory activity for toddlers",
        startDate: "2026-04-28T10:00:00",
      },
    ];

    const ics = generateIcs(events);

    expect(ics).toContain("DESCRIPTION");
    expect(ics).toContain("sensory activity");
  });

  it("generates unique UIDs for each event", () => {
    const events = [
      { title: "Event A", startDate: "2026-04-28T10:00:00" },
      { title: "Event B", startDate: "2026-04-29T10:00:00" },
    ];

    const ics = generateIcs(events);

    const uids = ics.match(/UID:(.+)/g) || [];
    expect(uids.length).toBe(2);
    expect(uids[0]).not.toBe(uids[1]);
  });
});
