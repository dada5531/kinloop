import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { z } from "zod";
import {
  getChildrenByUserId,
  getChildById,
  createChild,
  updateChild,
  getEventsByChildId,
  createEvent,
  updateEventStatus,
  getHealthRecordsByChildId,
  createHealthRecord,
  getGrowthDataByChildId,
  createGrowthEntry,
  getActivitiesByChildId,
  createActivity,
  getAllCoachChunks,
  getCoachChunksByAgeBucket,
  insertCoachChunks,
  getCoachChunkCount,
  getConversationsByChildId,
  createConversation,
  updateConversationMessages,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Children ──────────────────────────────────────────────

  children: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getChildrenByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getChildById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          dob: z.string(),
          gender: z.string().optional(),
          allergies: z.array(z.string()).optional(),
          medications: z.array(z.string()).optional(),
          schoolName: z.string().optional(),
          teacherName: z.string().optional(),
          pediatricianName: z.string().optional(),
          pediatricianPhone: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createChild({
          userId: ctx.user.id,
          name: input.name,
          dob: input.dob,
          gender: input.gender ?? null,
          allergies: input.allergies ?? [],
          medications: input.medications ?? [],
          schoolName: input.schoolName ?? null,
          teacherName: input.teacherName ?? null,
          pediatricianName: input.pediatricianName ?? null,
          pediatricianPhone: input.pediatricianPhone ?? null,
          notes: input.notes ?? null,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          dob: z.string().optional(),
          gender: z.string().optional(),
          allergies: z.array(z.string()).optional(),
          medications: z.array(z.string()).optional(),
          schoolName: z.string().optional(),
          teacherName: z.string().optional(),
          pediatricianName: z.string().optional(),
          pediatricianPhone: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateChild(id, data as any);
        return { success: true };
      }),
  }),

  // ─── Scheduler (Quadrant 1) ────────────────────────────────

  scheduler: router({
    events: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        return getEventsByChildId(input.childId);
      }),

    extract: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          content: z.string(),
          sourceType: z.string(),
          sourceLabel: z.string(),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a parenting assistant that extracts structured information from school emails, permission slips, medical notices, and other parenting-related documents.

Extract all actionable information and return valid JSON with this exact structure:
{
  "events": [{"title": string, "date": string (YYYY-MM-DD), "time": string (HH:MM) or null, "endTime": string (HH:MM) or null, "location": string or null, "notes": string or null}],
  "actionItems": [string],
  "amountDue": {"what": string, "amount": number, "dueDate": string (YYYY-MM-DD), "payee": string} or null,
  "replyDraft": string or null,
  "confidence": number (0-1)
}

Be thorough — extract every date, deadline, payment, and action item. If there's a natural reply the parent should send, draft it.`,
            },
            {
              role: "user",
              content: input.content,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "extraction_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        date: { type: "string" },
                        time: { type: ["string", "null"] },
                        endTime: { type: ["string", "null"] },
                        location: { type: ["string", "null"] },
                        notes: { type: ["string", "null"] },
                      },
                      required: ["title", "date", "time", "endTime", "location", "notes"],
                      additionalProperties: false,
                    },
                  },
                  actionItems: { type: "array", items: { type: "string" } },
                  amountDue: {
                    type: ["object", "null"],
                    properties: {
                      what: { type: "string" },
                      amount: { type: "number" },
                      dueDate: { type: "string" },
                      payee: { type: "string" },
                    },
                    required: ["what", "amount", "dueDate", "payee"],
                    additionalProperties: false,
                  },
                  replyDraft: { type: ["string", "null"] },
                  confidence: { type: "number" },
                },
                required: ["events", "actionItems", "amountDue", "replyDraft", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");
        return parsed;
      }),

    approve: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          title: z.string(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          location: z.string().optional(),
          sourceType: z.string(),
          sourceLabel: z.string(),
          actionItems: z.array(z.string()),
          amountDue: z
            .object({
              what: z.string(),
              amount: z.number(),
              dueDate: z.string(),
              payee: z.string(),
            })
            .nullable()
            .optional(),
          confidence: z.number().optional(),
          rawContent: z.string().optional(),
          replyDraft: z.string().optional(),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createEvent({
          childId: input.childId,
          title: input.title,
          startTime: input.startTime ? new Date(input.startTime) : null,
          endTime: input.endTime ? new Date(input.endTime) : null,
          location: input.location ?? null,
          sourceType: input.sourceType,
          sourceLabel: input.sourceLabel,
          actionItems: input.actionItems,
          amountDue: input.amountDue ?? null,
          confidence: input.confidence?.toString() ?? null,
          rawContent: input.rawContent ?? null,
          replyDraft: input.replyDraft ?? null,
          fileUrl: input.fileUrl ?? null,
          status: "approved",
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({ eventId: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        await updateEventStatus(input.eventId, input.status);
        return { success: true };
      }),
  }),

  // ─── Development Hub (Quadrant 2) ──────────────────────────

  development: router({
    records: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        return getHealthRecordsByChildId(input.childId);
      }),

    growthData: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        return getGrowthDataByChildId(input.childId);
      }),

    extractHealth: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          content: z.string(),
          documentType: z.string(),
          fileUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a pediatric health data extraction assistant. Extract structured health information from medical documents, school reports, and developmental assessments.

Return valid JSON with this structure:
{
  "visitDate": string (YYYY-MM-DD),
  "type": "well-visit" | "sick" | "school_report" | "dental",
  "summary": string (2-3 sentence summary),
  "extracted": {object with relevant key-value pairs like height, weight, percentiles, vaccinations, teacher notes, etc.},
  "nextAction": string or null,
  "growthData": {"weightLbs": number or null, "heightIn": number or null, "weightPercentile": number or null, "heightPercentile": number or null, "ageMonths": number or null} or null
}`,
            },
            {
              role: "user",
              content: `Document type: ${input.documentType}\n\n${input.content}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "health_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  visitDate: { type: "string" },
                  type: { type: "string" },
                  summary: { type: "string" },
                  extracted: { type: "object", additionalProperties: true },
                  nextAction: { type: ["string", "null"] },
                  growthData: {
                    type: ["object", "null"],
                    properties: {
                      weightLbs: { type: ["number", "null"] },
                      heightIn: { type: ["number", "null"] },
                      weightPercentile: { type: ["number", "null"] },
                      heightPercentile: { type: ["number", "null"] },
                      ageMonths: { type: ["number", "null"] },
                    },
                    required: ["weightLbs", "heightIn", "weightPercentile", "heightPercentile", "ageMonths"],
                    additionalProperties: false,
                  },
                },
                required: ["visitDate", "type", "summary", "extracted", "nextAction", "growthData"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");

        // Save the health record
        const record = await createHealthRecord({
          childId: input.childId,
          visitDate: parsed.visitDate,
          type: parsed.type,
          fileUrl: input.fileUrl ?? null,
          extracted: parsed.extracted,
          summary: parsed.summary,
          nextAction: parsed.nextAction,
        });

        // If growth data was extracted, save it too
        if (parsed.growthData && (parsed.growthData.weightLbs || parsed.growthData.heightIn)) {
          // Calculate ageMonths from child DOB if not provided by LLM
          let ageMonths = parsed.growthData.ageMonths;
          if (!ageMonths) {
            const child = await getChildById(input.childId);
            if (child?.dob) {
              const dob = new Date(child.dob);
              const visitDate = new Date(parsed.visitDate);
              ageMonths = Math.round(
                (visitDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
              );
            } else {
              ageMonths = 0;
            }
          }
          try {
            await createGrowthEntry({
              childId: input.childId,
              recordDate: parsed.visitDate,
              ageMonths,
              weightLbs: parsed.growthData.weightLbs?.toString() ?? null,
              heightIn: parsed.growthData.heightIn?.toString() ?? null,
              weightPercentile: parsed.growthData.weightPercentile ?? null,
              heightPercentile: parsed.growthData.heightPercentile ?? null,
            });
            console.log("[Development] Growth data saved:", { ageMonths, weight: parsed.growthData.weightLbs, height: parsed.growthData.heightIn });
          } catch (err) {
            console.error("[Development] Failed to save growth data:", err);
          }
        }

        return { record, parsed };
      }),

    askAboutChild: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          question: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Get all health records for context
        const records = await getHealthRecordsByChildId(input.childId);
        const child = await getChildById(input.childId);
        const growth = await getGrowthDataByChildId(input.childId);

        const contextStr = records
          .map(
            (r) =>
              `[${r.visitDate} - ${r.type}] ${r.summary}\nDetails: ${JSON.stringify(r.extracted)}`
          )
          .join("\n\n");

        const growthStr = growth
          .map(
            (g) =>
              `Age ${g.ageMonths}mo: ${g.weightLbs}lbs, ${g.heightIn}in (W:${g.weightPercentile}%, H:${g.heightPercentile}%)`
          )
          .join("\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a helpful pediatric health assistant. Answer questions about a child's health records accurately and concisely. Always cite which record or visit your answer comes from.

Child: ${child?.name ?? "Unknown"}, DOB: ${child?.dob ?? "Unknown"}
Allergies: ${JSON.stringify(child?.allergies ?? [])}

Health Records:
${contextStr}

Growth Data:
${growthStr}`,
            },
            { role: "user", content: input.question },
          ],
        });

        return {
          answer:
            typeof response.choices[0]?.message?.content === "string"
              ? response.choices[0].message.content
              : "",
        };
      }),

    addGrowthEntry: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          recordDate: z.string(),
          ageMonths: z.number(),
          weightLbs: z.number().optional(),
          heightIn: z.number().optional(),
          weightPercentile: z.number().optional(),
          heightPercentile: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createGrowthEntry({
          childId: input.childId,
          recordDate: input.recordDate,
          ageMonths: input.ageMonths,
          weightLbs: input.weightLbs?.toString() ?? null,
          heightIn: input.heightIn?.toString() ?? null,
          weightPercentile: input.weightPercentile ?? null,
          heightPercentile: input.heightPercentile ?? null,
        });
      }),
  }),

  // ─── Play Lab (Quadrant 3) ─────────────────────────────────

  playLab: router({
    activities: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        return getActivitiesByChildId(input.childId);
      }),

    extractFromUrl: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          url: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Detect platform
        const url = input.url.toLowerCase();
        let platform = "other";
        if (url.includes("youtube.com") || url.includes("youtu.be"))
          platform = "youtube";
        else if (url.includes("tiktok.com")) platform = "tiktok";
        else if (url.includes("instagram.com")) platform = "instagram";
        else if (url.includes("pinterest.com")) platform = "pinterest";

        // Try to get YouTube transcript
        let transcript = "";
        if (platform === "youtube") {
          try {
            // youtube-transcript has broken CJS/ESM interop, import ESM directly
            const ytModule = await import("youtube-transcript/dist/youtube-transcript.esm.js");
            const YoutubeTranscript = ytModule.YoutubeTranscript;
            const segments = await YoutubeTranscript.fetchTranscript(input.url);
            transcript = segments.map((s: any) => s.text).join(" ");
          } catch (e) {
            console.warn("Could not fetch YouTube transcript:", e);
          }
        }

        // Get child info for age check
        const child = await getChildById(input.childId);

        const contentToAnalyze = transcript
          ? `URL: ${input.url}\nPlatform: ${platform}\nTranscript: ${transcript}`
          : `URL: ${input.url}\nPlatform: ${platform}\nPlease analyze this URL and extract an activity plan based on the URL and platform context.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a kids' activity planner. Given a social media URL (and transcript if available), extract a structured activity plan.

Return valid JSON:
{
  "title": string,
  "ageMin": number (years),
  "ageMax": number (years),
  "durationMinutes": number,
  "skills": [string],
  "materials": [{"name": string, "qty": string, "whereToBuy": string (Amazon/Target search URL)}],
  "steps": [string],
  "safetyNotes": [string],
  "messiness": number (1-5),
  "indoorOutdoor": "indoor" | "outdoor" | "both"
}

For materials, generate Amazon search URLs like: https://www.amazon.com/s?k=food+coloring+set
Be specific about quantities and include estimated prices in the name if possible.`,
            },
            { role: "user", content: contentToAnalyze },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "activity_plan",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  ageMin: { type: "number" },
                  ageMax: { type: "number" },
                  durationMinutes: { type: "number" },
                  skills: { type: "array", items: { type: "string" } },
                  materials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        qty: { type: "string" },
                        whereToBuy: { type: "string" },
                      },
                      required: ["name", "qty", "whereToBuy"],
                      additionalProperties: false,
                    },
                  },
                  steps: { type: "array", items: { type: "string" } },
                  safetyNotes: { type: "array", items: { type: "string" } },
                  messiness: { type: "number" },
                  indoorOutdoor: { type: "string" },
                },
                required: [
                  "title",
                  "ageMin",
                  "ageMax",
                  "durationMinutes",
                  "skills",
                  "materials",
                  "steps",
                  "safetyNotes",
                  "messiness",
                  "indoorOutdoor",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");

        // Age appropriateness check
        let ageWarning: string | null = null;
        if (child?.dob) {
          const childAgeYears =
            (Date.now() - new Date(child.dob).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000);
          if (childAgeYears < parsed.ageMin || childAgeYears > parsed.ageMax) {
            ageWarning = `This activity is designed for ages ${parsed.ageMin}-${parsed.ageMax}, but ${child.name} is ${Math.floor(childAgeYears)} years old. Please review for age-appropriateness.`;
          }
        }

        return { ...parsed, platform, ageWarning, sourceUrl: input.url };
      }),

    save: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          sourceUrl: z.string().optional(),
          sourcePlatform: z.string().optional(),
          title: z.string(),
          materials: z
            .array(
              z.object({
                name: z.string(),
                qty: z.string(),
                whereToBuy: z.string(),
              })
            )
            .optional(),
          durationMinutes: z.number().optional(),
          ageMin: z.number().optional(),
          ageMax: z.number().optional(),
          skills: z.array(z.string()).optional(),
          steps: z.array(z.string()).optional(),
          safetyNotes: z.array(z.string()).optional(),
          messiness: z.number().optional(),
          indoorOutdoor: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createActivity({
          childId: input.childId,
          sourceUrl: input.sourceUrl ?? null,
          sourcePlatform: input.sourcePlatform ?? null,
          title: input.title,
          materials: input.materials ?? [],
          durationMinutes: input.durationMinutes ?? null,
          ageMin: input.ageMin ?? null,
          ageMax: input.ageMax ?? null,
          skills: input.skills ?? [],
          steps: input.steps ?? [],
          safetyNotes: input.safetyNotes ?? [],
          messiness: input.messiness ?? null,
          indoorOutdoor: input.indoorOutdoor ?? null,
        });
      }),
  }),

  // ─── Coach (Quadrant 4) ────────────────────────────────────

  coach: router({
    conversations: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        return getConversationsByChildId(input.childId);
      }),

    chat: protectedProcedure
      .input(
        z.object({
          childId: z.number(),
          conversationId: z.number().optional(),
          message: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const child = await getChildById(input.childId);

        // Get relevant coach chunks for context (simple keyword matching for now)
        const allChunks = await getAllCoachChunks();
        const words = input.message.toLowerCase().split(/\s+/);
        const relevantChunks = allChunks
          .filter((chunk) => {
            const chunkText = (chunk.content + " " + chunk.topic).toLowerCase();
            return words.some(
              (w) => w.length > 3 && chunkText.includes(w)
            );
          })
          .slice(0, 8);

        // Get cross-quadrant context
        const recentEvents = await getEventsByChildId(input.childId);
        const recentRecords = await getHealthRecordsByChildId(input.childId);

        const contextSummary = [
          recentEvents.slice(0, 3).map((e) => `Upcoming: ${e.title}`).join(", "),
          recentRecords.slice(0, 2).map((r) => r.summary).join(". "),
        ]
          .filter(Boolean)
          .join("\n");

        const corpusContext = relevantChunks
          .map(
            (c) =>
              `[${c.bookTitle} by ${c.bookAuthor} — ${c.topic}]\n${c.content}`
          )
          .join("\n\n");

        const childAge = child?.dob
          ? `${Math.floor((Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old`
          : "unknown age";

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a warm, evidence-based parenting coach. You give practical, age-appropriate advice grounded in established parenting research. Always cite your sources when referencing specific books or research.

Child: ${child?.name ?? "Unknown"}, ${childAge}
${child?.notes ? `Notes: ${child.notes}` : ""}

Recent family context:
${contextSummary || "No recent context available."}

Reference corpus (cite these when relevant):
${corpusContext || "No specific references available for this topic."}

Guidelines:
- Be warm, supportive, and non-judgmental
- Give specific, actionable advice
- Cite book/author when referencing research
- Acknowledge that every child is different
- If unsure, say so and suggest consulting their pediatrician`,
            },
            { role: "user", content: input.message },
          ],
        });

        const assistantContent =
          typeof response.choices[0]?.message?.content === "string"
            ? response.choices[0].message.content
            : "";

        // Extract source citations from the response
        const sources = relevantChunks.map((c) => ({
          book: c.bookTitle,
          chapter: c.topic,
        }));

        const now = new Date().toISOString();
        const userMsg = {
          role: "user" as const,
          content: input.message,
          timestamp: now,
        };
        const assistantMsg = {
          role: "assistant" as const,
          content: assistantContent,
          sources: sources.length > 0 ? sources : undefined,
          timestamp: now,
        };

        // Save to conversation
        let conversationId = input.conversationId;
        if (conversationId) {
          const convs = await getConversationsByChildId(input.childId);
          const conv = convs.find((c) => c.id === conversationId);
          if (conv) {
            const existingMessages = conv.messages ?? [];
            await updateConversationMessages(conversationId, [
              ...existingMessages,
              userMsg,
              assistantMsg,
            ]);
          }
        } else {
          const result = await createConversation({
            childId: input.childId,
            messages: [userMsg, assistantMsg],
          });
          conversationId = result.id;
        }

        return {
          conversationId,
          message: assistantMsg,
        };
      }),

    seedCorpus: protectedProcedure.mutation(async () => {
      const count = await getCoachChunkCount();
      if (count > 0) {
        return { seeded: false, count, message: "Corpus already seeded" };
      }

      // Seed with curated parenting knowledge chunks
      const chunks = getParentingCorpusChunks();
      await insertCoachChunks(chunks);
      return { seeded: true, count: chunks.length, message: "Corpus seeded successfully" };
    }),

    corpusStatus: protectedProcedure.query(async () => {
      const count = await getCoachChunkCount();
      return { count, seeded: count > 0 };
    }),
  }),

  // ─── File Upload ───────────────────────────────────────────

  upload: router({
    file: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(), // base64
          contentType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const key = `${ctx.user.id}/uploads/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url, key };
      }),
  }),

  // ─── Cross-Quadrant Context ────────────────────────────────

  context: router({
    summary: protectedProcedure
      .input(z.object({ childId: z.number() }))
      .query(async ({ input }) => {
        const [child, eventsList, records, growth, activityList] =
          await Promise.all([
            getChildById(input.childId),
            getEventsByChildId(input.childId),
            getHealthRecordsByChildId(input.childId),
            getGrowthDataByChildId(input.childId),
            getActivitiesByChildId(input.childId),
          ]);

        return {
          child,
          recentEvents: eventsList.slice(0, 5),
          recentRecords: records.slice(0, 3),
          latestGrowth: growth[growth.length - 1] ?? null,
          recentActivities: activityList.slice(0, 3),
          stats: {
            totalEvents: eventsList.length,
            pendingEvents: eventsList.filter((e) => e.status === "pending")
              .length,
            totalRecords: records.length,
            totalActivities: activityList.length,
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ─── Parenting Corpus Seed Data ──────────────────────────────

function getParentingCorpusChunks() {
  return [
    // Siegel & Bryson — The Whole-Brain Child
    {
      content:
        "Connect and redirect: When a child is upset, first connect emotionally (right brain to right brain) before trying to redirect with logic (left brain). Say 'I can see you're really upset' before 'Let's figure out what happened.' This builds neural integration between emotional and logical brain regions.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "emotional-regulation",
      ageBucket: "3-5",
    },
    {
      content:
        "Name it to tame it: Help children tell the story of what upset them. When children narrate their experiences, they engage their left brain to make sense of right-brain emotional experiences. This storytelling process literally helps integrate the brain and calm big emotions.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "emotional-regulation",
      ageBucket: "3-5",
    },
    {
      content:
        "The upstairs and downstairs brain: The 'downstairs brain' (brainstem and limbic region) handles basic functions and big emotions. The 'upstairs brain' (prefrontal cortex) handles thinking, planning, and empathy — but it's not fully developed until the mid-20s. When a child flips their lid, the upstairs brain has disconnected. Don't try to reason — help them calm down first.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "tantrums",
      ageBucket: "1-3",
    },
    {
      content:
        "Engage, don't enrage: When your child is in a full tantrum, engaging the upstairs brain (logic, reasoning) won't work because the downstairs brain has taken over. Instead, nurture the downstairs brain first with comfort, then engage the upstairs brain once the child is calm.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "tantrums",
      ageBucket: "1-3",
    },
    {
      content:
        "Move it or lose it: Physical activity can shift a child's emotional state. When a child is stuck in a negative emotional loop, getting them to move their body — running, jumping, dancing — can help shift their brain state and regulate emotions.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "emotional-regulation",
      ageBucket: "3-5",
    },

    // Siegel & Bryson — No-Drama Discipline
    {
      content:
        "Discipline means to teach, not to punish. The goal of discipline should be to build your child's brain, helping them develop self-control, empathy, and problem-solving skills. Ask yourself: 'What do I want to teach in this moment?' rather than 'How do I punish this behavior?'",
      bookTitle: "No-Drama Discipline",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "discipline",
      ageBucket: "3-5",
    },
    {
      content:
        "Chase the why: Before responding to misbehavior, consider why your child is acting this way. Are they hungry, tired, overwhelmed, or seeking connection? The behavior is often a symptom of an unmet need, not defiance.",
      bookTitle: "No-Drama Discipline",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "discipline",
      ageBucket: "1-3",
    },
    {
      content:
        "Connection is the key to cooperation. Children are more likely to cooperate when they feel connected to their parents. Before correcting behavior, make sure your child feels seen and understood. A quick hug or acknowledging their feelings can make discipline much more effective.",
      bookTitle: "No-Drama Discipline",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "discipline",
      ageBucket: "3-5",
    },

    // Faber & Mazlish — How to Talk So Kids Will Listen
    {
      content:
        "Acknowledge feelings with a word: Instead of dismissing feelings ('You're fine!'), acknowledge them. 'Oh.' 'Mmm.' 'I see.' These simple responses show you're listening and help the child feel heard. Sometimes that's all they need to move through the emotion.",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "communication",
      ageBucket: "3-5",
    },
    {
      content:
        "Give in fantasy what you can't give in reality: When a child wants something they can't have, instead of logical explanations, try fantasy. 'I wish I could make it summer right now so you could go swimming!' This validates their desire while maintaining the boundary.",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "communication",
      ageBucket: "3-5",
    },
    {
      content:
        "Describe what you see instead of criticizing: Instead of 'You're so messy!', try 'I see a wet towel on the bed.' Instead of 'You never listen!', try 'I notice the toys are still on the floor.' Describing without judgment invites cooperation without damaging self-esteem.",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "communication",
      ageBucket: "3-5",
    },
    {
      content:
        "Offer choices instead of commands: Instead of 'Put on your coat!', try 'Would you like to wear the red coat or the blue one?' Choices give children a sense of autonomy and reduce power struggles. Keep choices limited to 2-3 options.",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "cooperation",
      ageBucket: "3-5",
    },
    {
      content:
        "Use one-word reminders: Instead of long lectures, use a single word. 'Teeth.' 'Backpack.' 'Shoes.' Children tune out lectures but respond to brief, respectful reminders. The shorter the reminder, the more effective.",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "cooperation",
      ageBucket: "5-8",
    },

    // Ross Greene — The Explosive Child
    {
      content:
        "Kids do well if they can. If a child isn't meeting expectations, it's because they lack the skills to do so — not because they lack the will. Challenging behavior is the result of lagging skills (flexibility, frustration tolerance, problem-solving) meeting unsolved problems.",
      bookTitle: "The Explosive Child",
      bookAuthor: "Ross Greene",
      topic: "challenging-behavior",
      ageBucket: "5-8",
    },
    {
      content:
        "Plan B: Collaborative Problem Solving. Step 1: Empathy — 'I've noticed that [problem]. What's up?' Step 2: Define the concern — 'The thing is...' Step 3: Invitation — 'I wonder if there's a way we can...' This approach treats the child as a partner in solving problems rather than someone to be controlled.",
      bookTitle: "The Explosive Child",
      bookAuthor: "Ross Greene",
      topic: "challenging-behavior",
      ageBucket: "5-8",
    },
    {
      content:
        "Identify lagging skills and unsolved problems. Make a list of situations that regularly lead to challenging behavior. These are 'unsolved problems.' Then identify which skills the child is lacking (flexibility, frustration tolerance, problem-solving). Address the unsolved problems proactively, not in the heat of the moment.",
      bookTitle: "The Explosive Child",
      bookAuthor: "Ross Greene",
      topic: "challenging-behavior",
      ageBucket: "3-5",
    },

    // Emily Oster — Cribsheet
    {
      content:
        "Sleep training works and is safe. Multiple randomized controlled trials show that graduated extinction ('Ferber method') and bedtime fading are effective and do not cause long-term harm. Cortisol levels normalize quickly. The key is consistency — pick a method and stick with it for at least a week.",
      bookTitle: "Cribsheet",
      bookAuthor: "Emily Oster",
      topic: "sleep",
      ageBucket: "0-1",
    },
    {
      content:
        "Breastfeeding benefits are real but more modest than often claimed. In developed countries with clean water, the strongest evidence supports benefits for gastrointestinal infections and possibly eczema in the first year. Long-term IQ and obesity effects are much less clear when you control for socioeconomic factors.",
      bookTitle: "Cribsheet",
      bookAuthor: "Emily Oster",
      topic: "feeding",
      ageBucket: "0-1",
    },
    {
      content:
        "Screen time research is weaker than headlines suggest. The AAP recommends no screens before 18 months (except video chat) and limited, high-quality content for 2-5 year olds. The evidence for harm from moderate, supervised screen time is limited. Co-viewing and discussing content matters more than total minutes.",
      bookTitle: "Cribsheet",
      bookAuthor: "Emily Oster",
      topic: "screen-time",
      ageBucket: "1-3",
    },

    // Emily Oster — The Family Firm
    {
      content:
        "Use a business framework for family decisions. Gather data, make a decision framework, and then commit. For big decisions (school choice, activities, schedules), write down your values, research options, make a choice, and then stop second-guessing. Decision fatigue is real — systematize routine choices.",
      bookTitle: "The Family Firm",
      bookAuthor: "Emily Oster",
      topic: "decision-making",
      ageBucket: "3-5",
    },
    {
      content:
        "The evidence on extracurricular activities: Research suggests that one or two structured activities are beneficial for children's development, but over-scheduling can increase stress. Quality matters more than quantity. Let children have unstructured play time — it's essential for creativity and self-regulation.",
      bookTitle: "The Family Firm",
      bookAuthor: "Emily Oster",
      topic: "activities",
      ageBucket: "5-8",
    },
    {
      content:
        "School readiness is about more than academics. Social-emotional skills (following directions, taking turns, managing frustration) are stronger predictors of kindergarten success than knowing letters or numbers. Focus on play-based learning, social interaction, and self-regulation skills.",
      bookTitle: "The Family Firm",
      bookAuthor: "Emily Oster",
      topic: "school-readiness",
      ageBucket: "3-5",
    },

    // Janet Lansbury — RIE Approach
    {
      content:
        "Observe before intervening. RIE philosophy encourages parents to pause and observe before jumping in. When a child is struggling (with a toy, a physical challenge, a social situation), give them space to problem-solve. Your confidence in their capability builds their confidence.",
      bookTitle: "No Bad Kids",
      bookAuthor: "Janet Lansbury",
      topic: "independence",
      ageBucket: "1-3",
    },
    {
      content:
        "Sportscasting: Narrate what you see without judgment. 'You're trying to stack the blocks. That one fell down. You're trying again.' This validates the child's experience without directing or praising. It builds body awareness and emotional vocabulary.",
      bookTitle: "No Bad Kids",
      bookAuthor: "Janet Lansbury",
      topic: "communication",
      ageBucket: "0-1",
    },
    {
      content:
        "Set limits with confidence and empathy. 'I won't let you hit. You're upset and I understand, but hitting isn't safe.' The formula: acknowledge the feeling + set the limit + offer an alternative. Children feel safer when boundaries are clear and consistently held.",
      bookTitle: "No Bad Kids",
      bookAuthor: "Janet Lansbury",
      topic: "boundaries",
      ageBucket: "1-3",
    },
    {
      content:
        "Allow all feelings, limit actions. Every feeling is acceptable — anger, frustration, sadness, jealousy. But not every action is acceptable. 'You can be angry, but I won't let you throw toys.' This teaches emotional literacy while maintaining safety.",
      bookTitle: "No Bad Kids",
      bookAuthor: "Janet Lansbury",
      topic: "emotional-regulation",
      ageBucket: "1-3",
    },

    // AAP Clinical Reports
    {
      content:
        "The AAP recommends well-child visits at 1, 2, 4, 6, 9, 12, 15, 18, 24, and 30 months, then annually from 3 years. These visits include developmental screening, growth monitoring, immunizations, and anticipatory guidance. The 4-year visit typically includes vision and hearing screening.",
      bookTitle: "AAP Bright Futures Guidelines",
      bookAuthor: "American Academy of Pediatrics",
      topic: "well-visits",
      ageBucket: "0-1",
    },
    {
      content:
        "Developmental milestones at 4 years: Most children can hop on one foot, catch a bounced ball, use scissors, draw a person with 2-4 body parts, tell stories, follow 3-step instructions, and understand 'same' and 'different.' Significant variation is normal. Consult your pediatrician if you have concerns.",
      bookTitle: "AAP Developmental Milestones",
      bookAuthor: "American Academy of Pediatrics",
      topic: "milestones",
      ageBucket: "3-5",
    },
    {
      content:
        "Picky eating is developmentally normal in toddlers and preschoolers. The AAP recommends: offer a variety of foods without pressure, let children decide how much to eat, avoid using food as reward or punishment, model healthy eating, and continue offering rejected foods — it can take 10-15 exposures before a child accepts a new food.",
      bookTitle: "AAP Nutrition Guidelines",
      bookAuthor: "American Academy of Pediatrics",
      topic: "picky-eating",
      ageBucket: "1-3",
    },
    {
      content:
        "Sleep recommendations by age: Infants (4-12 months) need 12-16 hours including naps. Toddlers (1-2 years) need 11-14 hours. Preschoolers (3-5 years) need 10-13 hours. School-age (6-12 years) need 9-12 hours. Consistent bedtime routines are the single most effective sleep intervention.",
      bookTitle: "AAP Sleep Guidelines",
      bookAuthor: "American Academy of Pediatrics",
      topic: "sleep",
      ageBucket: "3-5",
    },
    {
      content:
        "Physical activity guidelines: Preschoolers (3-5) should be physically active throughout the day, with a goal of at least 3 hours of activity. School-age children (6+) need at least 60 minutes of moderate-to-vigorous activity daily. Limit sedentary screen time. Active play supports motor development, healthy weight, and emotional regulation.",
      bookTitle: "AAP Physical Activity Guidelines",
      bookAuthor: "American Academy of Pediatrics",
      topic: "physical-activity",
      ageBucket: "3-5",
    },

    // Additional topics
    {
      content:
        "Preparing for a new sibling: Start talking about the baby early but not too early (a few months before is enough for preschoolers). Read books about new babies together. Involve the older child in preparations. After birth, protect special one-on-one time with the older child. Regression (in sleep, toileting, behavior) is normal and temporary.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "sibling-transition",
      ageBucket: "3-5",
    },
    {
      content:
        "Potty training readiness signs: Shows interest in the toilet, stays dry for 2+ hours, can follow simple instructions, can pull pants up and down, shows discomfort with dirty diapers, and can communicate the need to go. Most children are ready between 18-36 months. Avoid starting during major transitions (new baby, moving, starting school).",
      bookTitle: "AAP Toilet Training Guidelines",
      bookAuthor: "American Academy of Pediatrics",
      topic: "potty-training",
      ageBucket: "1-3",
    },
    {
      content:
        "Separation anxiety peaks around 8-10 months and again at 18 months, but can resurface at preschool age. Keep goodbyes short and confident. Create a goodbye ritual. Never sneak away — it erodes trust. Reassure them you'll return and be specific ('I'll pick you up after snack time').",
      bookTitle: "No Bad Kids",
      bookAuthor: "Janet Lansbury",
      topic: "separation-anxiety",
      ageBucket: "1-3",
    },
    {
      content:
        "Building resilience: Allow children to experience manageable frustration and failure. Resist the urge to fix everything. Use 'scaffolding' — provide just enough support for them to succeed on their own. Praise effort and strategy, not innate ability ('You worked really hard on that' vs. 'You're so smart').",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "resilience",
      ageBucket: "3-5",
    },
    {
      content:
        "Handling lying in young children: Before age 4-5, children often blur fantasy and reality — this isn't 'lying' in the adult sense. For older children, focus on why they felt the need to lie rather than punishing the lie itself. Create safety for truth-telling: 'I won't be angry if you tell me what really happened.'",
      bookTitle: "How to Talk So Kids Will Listen",
      bookAuthor: "Adele Faber & Elaine Mazlish",
      topic: "honesty",
      ageBucket: "3-5",
    },
    {
      content:
        "Managing screen time transitions: Give advance warnings ('5 more minutes, then screens off'). Use visual timers. Have a consistent routine for what happens after screens (snack, outdoor play, reading). Avoid screens before bed — the blue light disrupts melatonin production. Choose interactive over passive content.",
      bookTitle: "The Family Firm",
      bookAuthor: "Emily Oster",
      topic: "screen-time",
      ageBucket: "3-5",
    },
    {
      content:
        "Encouraging reading: Read aloud daily — it's the single most important thing you can do for literacy. Let children choose books. Re-reading favorites is beneficial, not boring. Point to words as you read. Ask open-ended questions about the story. Visit the library regularly. For reluctant readers, try graphic novels, audiobooks, or reading about their interests.",
      bookTitle: "The Family Firm",
      bookAuthor: "Emily Oster",
      topic: "literacy",
      ageBucket: "3-5",
    },
    {
      content:
        "Helping children with anxiety: Validate the feeling ('It makes sense you feel worried'). Don't accommodate avoidance — gently encourage facing fears with support. Teach simple coping strategies: deep breathing, counting to 10, 'brave talk' ('I can do hard things'). If anxiety significantly impacts daily life, consult a professional.",
      bookTitle: "The Whole-Brain Child",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "anxiety",
      ageBucket: "5-8",
    },
    {
      content:
        "Fine motor development activities for 3-5 year olds: playdough and clay work, bead stringing, cutting with safety scissors, drawing and coloring, building with small blocks, buttoning and zipping, pouring water between containers, using tweezers to pick up small objects. These activities strengthen the small muscles needed for writing.",
      bookTitle: "AAP Developmental Milestones",
      bookAuthor: "American Academy of Pediatrics",
      topic: "fine-motor",
      ageBucket: "3-5",
    },
    {
      content:
        "Positive discipline alternatives to time-out: Time-in (sit with the child and help them regulate), natural consequences (forgot lunch → feel hungry), logical consequences (threw toy → toy goes away for the day), problem-solving together, repair and make amends. The goal is teaching, not suffering.",
      bookTitle: "No-Drama Discipline",
      bookAuthor: "Daniel Siegel & Tina Payne Bryson",
      topic: "discipline",
      ageBucket: "3-5",
    },
  ];
}
