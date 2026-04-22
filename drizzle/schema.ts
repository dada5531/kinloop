import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  date,
} from "drizzle-orm/mysql-core";

// ─── Users (from template) ─────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Children ──────────────────────────────────────────────

export const children = mysqlTable("children", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  dob: date("dob", { mode: "string" }).notNull(),
  gender: varchar("gender", { length: 32 }),
  photoUrl: text("photoUrl"),
  allergies: json("allergies").$type<string[]>(),
  medications: json("medications").$type<string[]>(),
  schoolName: varchar("schoolName", { length: 255 }),
  teacherName: varchar("teacherName", { length: 255 }),
  pediatricianName: varchar("pediatricianName", { length: 255 }),
  pediatricianPhone: varchar("pediatricianPhone", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

// ─── Events (Quadrant 1: Scheduler) ────────────────────────

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  location: text("location"),
  sourceType: varchar("sourceType", { length: 32 }),
  sourceLabel: varchar("sourceLabel", { length: 255 }),
  actionItems: json("actionItems").$type<string[]>(),
  amountDue: json("amountDue").$type<{
    what: string;
    amount: number;
    dueDate: string;
    payee: string;
  } | null>(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  rawContent: text("rawContent"),
  replyDraft: text("replyDraft"),
  fileUrl: text("fileUrl"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// ─── Health Records (Quadrant 2: Development Hub) ──────────

export const healthRecords = mysqlTable("health_records", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  visitDate: date("visitDate", { mode: "string" }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  fileUrl: text("fileUrl"),
  extracted: json("extracted").$type<Record<string, unknown>>(),
  summary: text("summary"),
  nextAction: text("nextAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;

// ─── Growth Data (Quadrant 2: Development Hub) ─────────────

export const growthData = mysqlTable("growth_data", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  recordDate: date("recordDate", { mode: "string" }).notNull(),
  ageMonths: int("ageMonths").notNull(),
  weightLbs: decimal("weightLbs", { precision: 5, scale: 1 }),
  heightIn: decimal("heightIn", { precision: 5, scale: 1 }),
  weightPercentile: int("weightPercentile"),
  heightPercentile: int("heightPercentile"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrowthData = typeof growthData.$inferSelect;
export type InsertGrowthData = typeof growthData.$inferInsert;

// ─── Activities (Quadrant 3: Play Lab) ─────────────────────

export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  sourceUrl: text("sourceUrl"),
  sourcePlatform: varchar("sourcePlatform", { length: 64 }),
  title: varchar("title", { length: 500 }).notNull(),
  materials: json("materials").$type<
    { name: string; qty: string; whereToBuy: string }[]
  >(),
  durationMinutes: int("durationMinutes"),
  ageMin: int("ageMin"),
  ageMax: int("ageMax"),
  skills: json("skills").$type<string[]>(),
  steps: json("steps").$type<string[]>(),
  safetyNotes: json("safetyNotes").$type<string[]>(),
  messiness: int("messiness"),
  indoorOutdoor: varchar("indoorOutdoor", { length: 16 }),
  scheduledFor: timestamp("scheduledFor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ─── Coach Chunks (Quadrant 4: Parenting Coach) ────────────

export const coachChunks = mysqlTable("coach_chunks", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  bookTitle: varchar("bookTitle", { length: 255 }).notNull(),
  bookAuthor: varchar("bookAuthor", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 128 }).notNull(),
  ageBucket: varchar("ageBucket", { length: 16 }).notNull(),
  embedding: json("embedding").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachChunk = typeof coachChunks.$inferSelect;
export type InsertCoachChunk = typeof coachChunks.$inferInsert;

// ─── Coach Conversations (Quadrant 4: Parenting Coach) ─────

export const coachConversations = mysqlTable("coach_conversations", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  messages: json("messages").$type<
    { role: "user" | "assistant"; content: string; sources?: { book: string; chapter: string }[]; timestamp: string }[]
  >(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachConversation = typeof coachConversations.$inferSelect;
export type InsertCoachConversation = typeof coachConversations.$inferInsert;
