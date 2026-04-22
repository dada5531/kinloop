import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  children,
  events,
  healthRecords,
  growthData,
  activities,
  coachChunks,
  coachConversations,
  type InsertChild,
  type InsertEvent,
  type InsertHealthRecord,
  type InsertGrowthData,
  type InsertActivity,
  type InsertCoachChunk,
  type InsertCoachConversation,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Children ──────────────────────────────────────────────

export async function getChildrenByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(children).where(eq(children.userId, userId)).orderBy(children.name);
}

export async function getChildById(childId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(children).where(eq(children.id, childId)).limit(1);
  return result[0];
}

export async function createChild(data: InsertChild) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(children).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateChild(childId: number, data: Partial<InsertChild>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(children).set(data).where(eq(children.id, childId));
}

// ─── Events (Scheduler) ───────────────────────────────────

export async function getEventsByChildId(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.childId, childId)).orderBy(desc(events.createdAt));
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateEventStatus(eventId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set({ status }).where(eq(events.id, eventId));
}

// ─── Health Records ────────────────────────────────────────

export async function getHealthRecordsByChildId(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords).where(eq(healthRecords.childId, childId)).orderBy(desc(healthRecords.visitDate));
}

export async function createHealthRecord(data: InsertHealthRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(healthRecords).values(data);
  return { id: Number(result[0].insertId) };
}

// ─── Growth Data ───────────────────────────────────────────

export async function getGrowthDataByChildId(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(growthData).where(eq(growthData.childId, childId)).orderBy(growthData.ageMonths);
}

export async function createGrowthEntry(data: InsertGrowthData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(growthData).values(data);
  return { id: Number(result[0].insertId) };
}

// ─── Activities ────────────────────────────────────────────

export async function getActivitiesByChildId(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.childId, childId)).orderBy(desc(activities.createdAt));
}

export async function createActivity(data: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(data);
  return { id: Number(result[0].insertId) };
}

// ─── Coach Chunks ──────────────────────────────────────────

export async function getAllCoachChunks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachChunks);
}

export async function getCoachChunksByAgeBucket(ageBucket: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachChunks).where(eq(coachChunks.ageBucket, ageBucket));
}

export async function insertCoachChunks(chunks: InsertCoachChunk[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (chunks.length === 0) return;
  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < chunks.length; i += 50) {
    await db.insert(coachChunks).values(chunks.slice(i, i + 50));
  }
}

export async function getCoachChunkCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(coachChunks);
  return Number(result[0]?.count ?? 0);
}

// ─── Coach Conversations ──────────────────────────────────

export async function getConversationsByChildId(childId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coachConversations).where(eq(coachConversations.childId, childId)).orderBy(desc(coachConversations.updatedAt));
}

export async function createConversation(data: InsertCoachConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coachConversations).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateConversationMessages(convId: number, messages: InsertCoachConversation["messages"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(coachConversations).set({ messages }).where(eq(coachConversations.id, convId));
}
