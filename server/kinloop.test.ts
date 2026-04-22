import { describe, expect, it, vi, beforeEach } from "vitest";

// Hoisted mock stores — must be declared before vi.mock calls
const mockChildren: any[] = [];
const mockEvents: any[] = [];
const mockRecords: any[] = [];
const mockGrowth: any[] = [];
const mockActivities: any[] = [];
const mockChunks: any[] = [];
const mockConversations: any[] = [];
let nextId = 1;

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            events: [
              {
                title: "Field Trip to Zoo",
                date: "2026-05-15",
                time: "09:00",
                endTime: "14:00",
                location: "City Zoo",
                notes: "Bring lunch and sunscreen",
              },
            ],
            actionItems: ["Sign permission slip", "Pack lunch"],
            amountDue: { what: "Field trip fee", amount: 15, dueDate: "2026-05-10", payee: "School" },
            replyDraft: null,
            confidence: 0.95,
          }),
        },
      },
    ],
  }),
}));

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

// Mock the db module with in-memory stores
vi.mock("./db", () => ({
  getChildrenByUserId: vi.fn((userId: number) =>
    mockChildren.filter((c) => c.userId === userId)
  ),
  getChildById: vi.fn((id: number) =>
    mockChildren.find((c) => c.id === id)
  ),
  createChild: vi.fn((data: any) => {
    const child = { id: nextId++, ...data, createdAt: new Date(), updatedAt: new Date() };
    mockChildren.push(child);
    return child;
  }),
  updateChild: vi.fn().mockResolvedValue(undefined),
  getEventsByChildId: vi.fn((childId: number) =>
    mockEvents.filter((e) => e.childId === childId)
  ),
  createEvent: vi.fn((data: any) => {
    const event = { id: nextId++, ...data, createdAt: new Date(), updatedAt: new Date() };
    mockEvents.push(event);
    return event;
  }),
  updateEventStatus: vi.fn().mockResolvedValue(undefined),
  getHealthRecordsByChildId: vi.fn((childId: number) =>
    mockRecords.filter((r) => r.childId === childId)
  ),
  createHealthRecord: vi.fn((data: any) => {
    const record = { id: nextId++, ...data, createdAt: new Date() };
    mockRecords.push(record);
    return record;
  }),
  getGrowthDataByChildId: vi.fn((childId: number) =>
    mockGrowth.filter((g) => g.childId === childId)
  ),
  createGrowthEntry: vi.fn((data: any) => {
    const entry = { id: nextId++, ...data };
    mockGrowth.push(entry);
    return entry;
  }),
  getActivitiesByChildId: vi.fn((childId: number) =>
    mockActivities.filter((a) => a.childId === childId)
  ),
  createActivity: vi.fn((data: any) => {
    const activity = { id: nextId++, ...data, createdAt: new Date() };
    mockActivities.push(activity);
    return activity;
  }),
  getAllCoachChunks: vi.fn(() => mockChunks),
  getCoachChunksByAgeBucket: vi.fn(() => []),
  insertCoachChunks: vi.fn((chunks: any[]) => {
    mockChunks.push(...chunks.map((c) => ({ id: nextId++, ...c })));
  }),
  getCoachChunkCount: vi.fn(() => mockChunks.length),
  getConversationsByChildId: vi.fn((childId: number) =>
    mockConversations.filter((c) => c.childId === childId)
  ),
  createConversation: vi.fn((data: any) => {
    const conv = { id: nextId++, ...data, createdAt: new Date(), updatedAt: new Date() };
    mockConversations.push(conv);
    return conv;
  }),
  updateConversationMessages: vi.fn().mockResolvedValue(undefined),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-123",
      email: "jenn@example.com",
      name: "Jenn",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("KINLOOP Backend", () => {
  beforeEach(() => {
    mockChildren.length = 0;
    mockEvents.length = 0;
    mockRecords.length = 0;
    mockGrowth.length = 0;
    mockActivities.length = 0;
    mockChunks.length = 0;
    mockConversations.length = 0;
    nextId = 1;
  });

  describe("children router", () => {
    it("creates a child and lists them", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const child = await caller.children.create({
        name: "Mia",
        dob: "2022-02-15",
        gender: "female",
        schoolName: "Bright Horizons",
      });

      expect(child).toBeDefined();
      expect(child.id).toBe(1);
      expect(child.name).toBe("Mia");

      const list = await caller.children.list();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("Mia");
    });

    it("gets a child by id", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      await caller.children.create({ name: "Mia", dob: "2022-02-15" });

      const child = await caller.children.get({ id: 1 });
      expect(child).toBeDefined();
      expect(child?.name).toBe("Mia");
    });

    it("updates a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      await caller.children.create({ name: "Mia", dob: "2022-02-15" });

      const result = await caller.children.update({ id: 1, schoolName: "New School" });
      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated access", async () => {
      const caller = appRouter.createCaller(createUnauthContext());
      await expect(caller.children.list()).rejects.toThrow();
    });
  });

  describe("scheduler router", () => {
    it("returns events for a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const events = await caller.scheduler.events({ childId: 1 });
      expect(Array.isArray(events)).toBe(true);
    });

    it("extracts events from text using LLM", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const result = await caller.scheduler.extract({
        childId: 1,
        content: "Dear parents, the field trip to the zoo is on May 15th from 9am to 2pm. Fee is $15.",
        sourceType: "email",
        sourceLabel: "School email",
      });

      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe("Field Trip to Zoo");
      expect(result.actionItems).toContain("Sign permission slip");
      expect(result.amountDue).toBeDefined();
      expect(result.amountDue.amount).toBe(15);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it("approves and saves an event", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const event = await caller.scheduler.approve({
        childId: 1,
        title: "Field Trip to Zoo",
        startTime: "2026-05-15T09:00:00Z",
        endTime: "2026-05-15T14:00:00Z",
        location: "City Zoo",
        sourceType: "email",
        sourceLabel: "School email",
        actionItems: ["Sign permission slip"],
        amountDue: { what: "Fee", amount: 15, dueDate: "2026-05-10", payee: "School" },
        confidence: 0.95,
      });

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.title).toBe("Field Trip to Zoo");
      expect(event.status).toBe("approved");
    });

    it("updates event status", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      await caller.scheduler.approve({
        childId: 1,
        title: "Test Event",
        sourceType: "manual",
        sourceLabel: "Manual",
        actionItems: [],
      });

      const result = await caller.scheduler.updateStatus({
        eventId: 1,
        status: "completed",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("development router", () => {
    it("returns health records for a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const records = await caller.development.records({ childId: 1 });
      expect(Array.isArray(records)).toBe(true);
    });

    it("returns growth data for a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const growth = await caller.development.growthData({ childId: 1 });
      expect(Array.isArray(growth)).toBe(true);
    });

    it("adds a manual growth entry", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const entry = await caller.development.addGrowthEntry({
        childId: 1,
        recordDate: "2026-04-01",
        ageMonths: 50,
        weightLbs: 38.5,
        heightIn: 41.2,
        weightPercentile: 55,
        heightPercentile: 60,
      });

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
    });
  });

  describe("playLab router", () => {
    it("returns activities for a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const activities = await caller.playLab.activities({ childId: 1 });
      expect(Array.isArray(activities)).toBe(true);
    });

    it("saves an activity", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const activity = await caller.playLab.save({
        childId: 1,
        title: "Bubble Painting",
        sourceUrl: "https://youtube.com/watch?v=abc",
        sourcePlatform: "youtube",
        materials: [{ name: "Paint", qty: "1 set", whereToBuy: "https://amazon.com/s?k=paint" }],
        durationMinutes: 30,
        ageMin: 3,
        ageMax: 8,
        skills: ["Creativity", "Fine motor"],
        steps: ["Mix paint", "Blow bubbles", "Press paper"],
        safetyNotes: ["Use washable paint"],
        messiness: 3,
        indoorOutdoor: "indoor",
      });

      expect(activity).toBeDefined();
      expect(activity.id).toBeDefined();
      expect(activity.title).toBe("Bubble Painting");

      const list = await caller.playLab.activities({ childId: 1 });
      expect(list).toHaveLength(1);
    });
  });

  describe("coach router", () => {
    it("seeds the parenting corpus", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const result = await caller.coach.seedCorpus();
      expect(result.seeded).toBe(true);
      expect(result.count).toBeGreaterThan(0);

      // Second call should not re-seed
      const result2 = await caller.coach.seedCorpus();
      expect(result2.seeded).toBe(false);
    });

    it("reports corpus status", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const status1 = await caller.coach.corpusStatus();
      expect(status1.seeded).toBe(false);

      await caller.coach.seedCorpus();
      const status2 = await caller.coach.corpusStatus();
      expect(status2.seeded).toBe(true);
    });

    it("returns conversations for a child", async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const convs = await caller.coach.conversations({ childId: 1 });
      expect(Array.isArray(convs)).toBe(true);
    });
  });

  describe("context router", () => {
    it("returns a cross-quadrant summary", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      // Create a child first
      mockChildren.push({
        id: 1,
        userId: 1,
        name: "Mia",
        dob: "2022-02-15",
        gender: "female",
        allergies: [],
        medications: [],
        schoolName: "Bright Horizons",
        teacherName: null,
        pediatricianName: null,
        pediatricianPhone: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const summary = await caller.context.summary({ childId: 1 });
      expect(summary.child).toBeDefined();
      expect(summary.child?.name).toBe("Mia");
      expect(summary.stats).toBeDefined();
      expect(summary.stats.totalEvents).toBe(0);
      expect(summary.stats.totalRecords).toBe(0);
    });
  });

  describe("upload router", () => {
    it("uploads a file and returns URL", async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const result = await caller.upload.file({
        fileName: "test.pdf",
        fileData: Buffer.from("test content").toString("base64"),
        contentType: "application/pdf",
      });

      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
    });
  });
});
