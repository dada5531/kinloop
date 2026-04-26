# CLAUDE.md — KINLOOP Project Guide

> Read this file first. It tells you everything you need to know to contribute to KINLOOP.

## 1. Project Context

KINLOOP is an AI-native parenting dashboard built as an HBS MBA capstone project. The thesis: parents are drowning in unstructured information — school emails, pediatrician notes, social media activity ideas — and AI can transform that chaos into structured, actionable data.

The target user is a busy parent (think: working mom with a 4-year-old) who receives 10+ school communications per week, tracks pediatrician visits on paper, and saves activity ideas to a bookmark folder she never revisits.

KINLOOP solves this with four specialized AI quadrants, all sharing a single child profile for cross-quadrant intelligence.

## 2. The 4-Quadrant Model

Each quadrant follows the same pattern: **unstructured input → Claude extraction → structured output → downstream integration**.

### Quadrant 1: Scheduler (`/scheduler`)

- **Input**: School emails (pasted text, .msg/.eml file upload), permission slip PDFs, photos of flyers
- **Claude extraction**: Events, action items, amounts due, suggested reply
- **Output**: Structured events in the `events` table
- **Integration**: Calendar invite emails via Resend with .ics attachment; Google Calendar write planned for Series A
- **Key files**: `src/app/(dashboard)/scheduler/page.tsx`, `src/lib/extractors/scheduler-extractor.ts`, `src/app/api/extract/scheduler/route.ts`, `src/app/api/scheduler/send-calendar/route.ts`

### Quadrant 2: Development Hub (`/development`)

- **Input**: Pediatrician after-visit summaries, school developmental reports (PDF/photo upload)
- **Claude extraction**: Visit type, growth data, milestones, immunizations, concerns
- **Output**: Structured records in `health_records` table, growth data points in `measurements`
- **Integration**: Growth chart with WHO percentile overlay (Recharts), milestone tracker, health timeline
- **Key files**: `src/app/(dashboard)/development/page.tsx`, `src/lib/extractors/health-extractor.ts`, `src/lib/who-growth-data.ts`

### Quadrant 3: Play Lab (`/play`)

- **Input**: YouTube URLs, TikTok/Instagram/Pinterest links, pasted activity descriptions, generic web pages
- **Claude extraction**: Activity plan with title, steps, materials (with quantities), skills, safety notes, age range
- **Output**: Structured activities in `activities` table
- **Integration**: Amazon search links for materials (affiliate tag `kinloop-20`), cross-quadrant scheduling to `events` table, calendar invite emails with .ics attachment
- **Key files**: `src/app/(dashboard)/play/page.tsx`, `src/lib/extractors/activity-extractor.ts`, `src/lib/integrations/content-fetcher.ts`, `src/lib/integrations/amazon-paapi.ts`, `src/lib/calendar/send-invite.ts`

### Quadrant 4: Coach (`/coach`)

- **Input**: Free-text parenting questions
- **RAG pipeline**: Embed question → pgvector similarity search → retrieve relevant parenting knowledge chunks
- **Claude response**: Evidence-based answer with source citations, personalized to child's age and context
- **Output**: Conversation history in `coach_conversations` / `coach_messages`
- **Daily features**: Tip of the day, activity of the day (age-filtered), daily cron for content refresh
- **Key files**: `src/app/(dashboard)/coach/page.tsx`, `src/lib/rag/search.ts`, `src/lib/rag/embed.ts`, `src/app/api/coach/daily/route.ts`

## 3. Cross-Quadrant Intelligence

This is the moat. Every Claude call in every quadrant includes the child's full context from `/api/context/[childId]`. This means:

- The Scheduler knows the child's allergies when extracting a field trip permission slip
- The Coach knows the child's recent health records when answering a developmental question
- The Play Lab knows the child's age to the month when checking activity appropriateness
- The Development Hub knows upcoming events when summarizing health context

The context service aggregates:

```json
{
  "child": { "name": "Mia", "dob": "2022-02-15", "allergies": ["peanuts"], "notes": "..." },
  "upcoming_events": ["...last 30 days of events"],
  "recent_health": ["...last 3 health records"],
  "recent_activities": ["...last 5 saved activities"],
  "recent_topics": ["...last 3 coach conversation topics"]
}
```

**Rule: Never make a Claude call without including child context.** If you are adding a new extraction or chat feature, fetch context from `/api/context/[childId]` and include it in the system prompt.

## 4. Code Conventions

### Server actions over API routes

Prefer Next.js Server Actions for mutations. Use API routes (`/api/*`) only for:

- Webhook endpoints (Resend, Stripe)
- Long-running extractions that need streaming
- Endpoints called by external services
- Health/diagnostic endpoints

### Zod schemas for every Claude output

Every Claude extraction must have a corresponding Zod schema in `/src/lib/extractors/`. The schema validates the structured output before it touches the database. See `scheduler-extractor.ts` for the pattern.

### Prompts live in `/prompts/` as markdown

Never inline Claude prompts in TypeScript files. Every prompt is a versioned markdown file in `/prompts/`. Import it in your extractor:

```ts
import { readFileSync } from "fs";
import { join } from "path";

const PROMPT = readFileSync(join(process.cwd(), "prompts", "scheduler-extraction.md"), "utf-8");
```

Current prompts: `scheduler-extraction.md`, `health-extraction.md`, `activity-extraction.md`, `coach-system.md`.

### Type-first development

Define types in `/src/types/` before writing implementation. The type definitions serve as the contract between the extraction layer, the database layer, and the UI layer.

### Server components by default

Components are React Server Components unless they need interactivity. Add `"use client"` only when the component uses hooks, event handlers, or browser APIs.

## 5. Anthropic SDK Usage Pattern

Here is the canonical example for calling Claude with structured extraction using tool_use:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic();

// 1. Define the Zod schema
const extractionSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      location: z.string().nullable(),
    }),
  ),
  confidence: z.number().min(0).max(1),
});

// 2. Convert to JSON Schema for Claude's tool_use
const tool = {
  name: "extract_events",
  description: "Extract structured events from parent communication",
  input_schema: {
    type: "object" as const,
    properties: {
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            date: { type: "string", description: "ISO 8601 date" },
            location: { type: ["string", "null"] },
          },
          required: ["title", "date", "location"],
        },
      },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["events", "confidence"],
  },
};

// 3. Call Claude with tool_use for reliable structured output
const response = await client.messages.create({
  model: CLAUDE_MODEL, // imported from @/lib/anthropic
  max_tokens: 4096,
  system: systemPrompt, // Loaded from /prompts/
  messages: [{ role: "user", content: emailText }],
  tools: [tool],
  tool_choice: { type: "tool", name: "extract_events" },
});

// 4. Extract and validate
const toolBlock = response.content.find((b) => b.type === "tool_use");
const parsed = extractionSchema.parse(toolBlock?.input);
```

**Model**: Always import `CLAUDE_MODEL` from `@/lib/anthropic`. Never hardcode a model string. See Section 5a below for the upgrade procedure.

## 5a. Model Upgrade Procedure

The Claude model identifier is defined in **one place**: `src/lib/anthropic.ts` as the `CLAUDE_MODEL` constant. Every extractor, the coach chat route, and the health endpoint import this constant. To upgrade the model:

1. Open `src/lib/anthropic.ts`
2. Change the `CLAUDE_MODEL` value (e.g., from `"claude-sonnet-4-6"` to `"claude-sonnet-4-7"`)
3. Run `pnpm typecheck` to confirm no hardcoded model strings remain
4. Run `pnpm test` to verify extractors still pass
5. Push to a feature branch, verify on Vercel preview deployment, then merge to `main`

To audit for any hardcoded model strings that bypass the constant:

```bash
grep -r "claude-" src/ --include="*.ts" --include="*.tsx" | grep -v CLAUDE_MODEL | grep -v node_modules
```

Current model: `claude-sonnet-4-6` (as of April 2026)

## 5b. Authentication (Demo Mode)

Demo uses a **single shared password gate** via the `KINLOOP_ACCESS_PASSWORD` env var. This is intentional for the HBS demo — no accounts, no signup, no OAuth.

**How it works:**

- `src/middleware.ts` checks for a `kinloop_access` cookie on every request to protected routes
- If missing, redirects to `/enter` (branded password input page)
- `POST /api/auth/verify` validates the password using `crypto.timingSafeEqual`, sets a 30-day httpOnly cookie
- Public routes (no password needed): `/`, `/enter`, `/api/health`, `/api/auth/verify`
- Rate limiting: 5 attempts per minute per IP (in-memory)

**To change the password:** Update the `KINLOOP_ACCESS_PASSWORD` env var in Vercel and redeploy. No code change needed.

**To upgrade to real auth:** Replace the middleware with Clerk (or similar), restore `AuthProvider` to use `ClerkProvider`, and add user-scoped queries. The database schema already has `user_id` columns on every table. Clerk is installed as a dependency but not active — this is a Series A milestone.

## 5c. Email Integration (Resend)

KINLOOP uses [Resend](https://resend.com) for outbound email with .ics calendar attachment support.

**Current state (v1.5):** Sending from Resend's sandbox domain (`onboarding@resend.dev`). This works for testing but is rate-limited (100 emails/day) and shows "via resend.dev" in recipient inboxes.

**Key files:**

- `src/lib/integrations/resend.ts` — Resend client, `sendCalendarEmail()`, `sendNotificationEmail()`
- `src/lib/calendar/send-invite.ts` — Shared calendar invite utility (reusable across all quadrants)
- `src/lib/calendar/ics-generator.ts` — ICS file generation using the `ics` npm package
- `src/app/api/play/send-calendar/route.ts` — Play Lab calendar invite endpoint
- `src/app/api/scheduler/send-calendar/route.ts` — Scheduler calendar invite endpoint
- `src/app/api/health/email/route.ts` — Email pipeline health check (includes domain-verification warning)

**How calendar invites work:**

1. User clicks "Schedule" on an activity → schedule modal opens
2. On save: event inserted into `events` table (source: `play_lab` or `scheduler`)
3. `sendCalendarInvite()` reads `notification_email` from `user_settings`, generates .ics, sends via Resend
4. Audit log written to `sent_emails` table with `resend_message_id`
5. User receives email with .ics attachment → opens in any calendar app

**Production email setup (v1.8):** See [ROADMAP.md](./ROADMAP.md) for the custom domain setup checklist. The `/api/health/email` endpoint will report `from_domain_verified: false` and include a warning until a custom domain is configured.

## 5d. Amazon Integration

Play Lab materials include "Find on Amazon" links with the `kinloop-20` affiliate tag.

**V1 (current):** Search-link fallback — generates `amazon.com/s?k={query}&tag=kinloop-20` URLs. No API key needed. Works for all materials.

**V2 (future):** PA-API v5 — real product search with pricing, images, and ASIN lookup. Activates when `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, and `AMAZON_PARTNER_TAG` env vars are all set. Placeholder code exists in `src/lib/integrations/amazon-paapi.ts`.

## 6. Database Conventions

- Every table has `user_id` (and `child_id` where applicable) for multi-tenancy
- RLS policies exist in Supabase but are currently bypassed by the admin client (`getAdminClient()` with service role key) in demo mode. When Clerk is integrated (Series A), switch to `createServerSupabaseClient()` which respects RLS.
- Always filter queries by `user_id` (currently hardcoded to demo user `11111111-...`; will be dynamic with real auth)
- Use `gen_random_uuid()` for all primary keys
- Timestamps are `timestamptz` (UTC)
- The `embeddings` table uses pgvector's `vector(1024)` type for Voyage AI embeddings
- JSON columns (`jsonb`) are used for flexible structured data (action_items, materials, messages)
- Demo user ID: `11111111-1111-1111-1111-111111111111` (NOT `00000000-...`)
- Demo child ID: `22222222-2222-2222-2222-222222222222` (Mia, DOB 2022-02-15)

### Tables (4 migrations)

| Table | Added In | Purpose |
|---|---|---|
| `users` | 0001 | User profiles (Clerk ID placeholder, email, name) |
| `children` | 0001 | Child profiles (name, DOB, allergies, notes) |
| `events` | 0001 | Extracted events from Scheduler + cross-quadrant scheduling |
| `health_records` | 0001 | Extracted health data from Development Hub |
| `activities` | 0001 | Extracted activity plans from Play Lab |
| `tips_saved` | 0001 | Bookmarked tips from Coach |
| `coach_conversations` | 0001 | Conversation threads |
| `coach_messages` | 0001 | Individual messages in conversations |
| `embeddings` | 0001 | pgvector embeddings for RAG |
| `user_settings` | 0003 | Notification email, calendar invite toggle |
| `sent_emails` | 0003 | Audit log for outbound emails (resend_message_id, status) |
| `tips_corpus` | 0004 | Parenting tips corpus for Coach RAG |
| `activities_corpus` | 0004 | Activities corpus for Coach daily picks |
| `daily_recommendations` | 0004 | Cached daily tip/activity of the day |

## 7. What to Build Next

See [ROADMAP.md](./ROADMAP.md) for the full timeline. The immediate next milestone is **v1.6 Design Warmth** (colors and typography refresh).

Suggested build order for remaining v1.x work:

1. v1.6 Stage A: Warm cream backgrounds, pastel accents, Fraunces serif for headings
2. v1.6 Stage B: Micro-interactions, card shadows, hover states
3. v1.7: Error boundaries, rate limiting, Sentry, loading skeletons
4. v1.8: Custom Resend domain setup

## 8. What NOT to Do

- **Do not add new dependencies** without justification in the PR description. The stack is locked.
- **Do not inline secrets.** All API keys go through environment variables. Never commit `.env.local`.
- **Do not bypass the cross-quadrant context service.** Every Claude call must include child context from `/api/context/[childId]`.
- **Do not commit prompt changes** without updating `/docs/claude-prompts.md` with the rationale.
- **Do not use `any` type.** TypeScript strict mode is enforced. Define proper types in `/src/types/`.
- **Do not write client components unnecessarily.** Default to Server Components; add `"use client"` only when required.
- **Do not use demo user ID `00000000-...`** — always use `11111111-1111-1111-1111-111111111111`.

## 9. Testing Expectations

- Every Claude extractor needs a unit test with a fixture input file in `/tests/unit/fixtures/`
- Test the Zod schema validation, not the Claude API call (mock the API response)
- E2E tests cover the critical user flows: onboarding, extraction, coach chat
- Run tests with `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright)
- CI runs lint + typecheck + unit tests on every PR
- Current test suite: 18 tests (13 Amazon URL + 5 ICS generation)

## 10. How to Run Locally

```bash
# Prerequisites
node --version  # Must be 20.x (see .nvmrc)
pnpm --version  # Must be 8.x+

# 1. Clone and install
git clone https://github.com/dada5531/kinloop.git
cd kinloop
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Required: KINLOOP_ACCESS_PASSWORD, ANTHROPIC_API_KEY, SUPABASE keys
# Optional for v1.5: RESEND_API_KEY, VOYAGE_API_KEY
# Future (Series A): GOOGLE_CLIENT_ID/SECRET, YOUTUBE_API_KEY, AMAZON_ACCESS_KEY/SECRET_KEY/PARTNER_TAG

# 3. Start Supabase locally
supabase start
supabase db reset  # Runs migrations + seed data

# 4. Start the dev server
pnpm dev
# Open http://localhost:3000

# 5. Run tests
pnpm test          # Unit tests (Vitest) — 18 tests
pnpm lint          # ESLint
pnpm typecheck     # TypeScript strict check
```

## 11. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `KINLOOP_ACCESS_PASSWORD` | Yes | Shared password for demo access gate |
| `ANTHROPIC_API_KEY` | Yes | Claude API for all AI extraction and chat |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side admin) |
| `RESEND_API_KEY` | For email | Resend API key for calendar invite emails |
| `RESEND_FROM_EMAIL` | For email | Custom sender address (defaults to `onboarding@resend.dev`) |
| `VOYAGE_API_KEY` | For RAG | Voyage AI embeddings for Coach RAG pipeline |
| `CRON_SECRET` | For cron | Secret token for Vercel cron job authentication |
| `AMAZON_ACCESS_KEY` | Future | Amazon PA-API v5 access key |
| `AMAZON_SECRET_KEY` | Future | Amazon PA-API v5 secret key |
| `AMAZON_PARTNER_TAG` | Future | Amazon affiliate tag (defaults to `kinloop-20`) |
