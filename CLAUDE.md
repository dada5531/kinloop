# CLAUDE.md — KINLOOP Project Guide

> Read this file first. It tells you everything you need to know to contribute to KINLOOP.

## 1. Project Context

KINLOOP is an AI-native parenting dashboard built as an HBS MBA capstone project. The thesis: parents are drowning in unstructured information — school emails, pediatrician notes, social media activity ideas — and AI can transform that chaos into structured, actionable data.

The target user is a busy parent (think: working mom with a 4-year-old) who receives 10+ school communications per week, tracks pediatrician visits on paper, and saves activity ideas to a bookmark folder she never revisits.

KINLOOP solves this with four specialized AI quadrants, all sharing a single child profile for cross-quadrant intelligence.

## 2. The 4-Quadrant Model

Each quadrant follows the same pattern: **unstructured input → Claude extraction → structured output → downstream integration**.

### Quadrant 1: Scheduler (`/scheduler`)

- **Input**: School emails (forwarded via Resend or pasted), permission slip PDFs, photos of flyers
- **Claude extraction**: Events, action items, amounts due, suggested reply
- **Output**: Structured events in the `events` table
- **Integration**: Google Calendar write with reminders

### Quadrant 2: Development Hub (`/development`)

- **Input**: Pediatrician after-visit summaries, school developmental reports (PDF/photo upload)
- **Claude extraction**: Visit type, growth data, milestones, immunizations, concerns
- **Output**: Structured records in `health_records` table, growth data points
- **Integration**: Growth chart with WHO percentile overlay (Recharts)

### Quadrant 3: Play Lab (`/play`)

- **Input**: YouTube URLs, social media links, pasted activity descriptions
- **Claude extraction**: Activity plan with title, steps, materials, skills, safety notes
- **Output**: Structured activities in `activities` table
- **Integration**: Amazon search links for materials, Google Calendar scheduling

### Quadrant 4: Coach (`/coach`)

- **Input**: Free-text parenting questions
- **RAG pipeline**: Embed question → pgvector similarity search → retrieve relevant parenting knowledge chunks
- **Claude response**: Evidence-based answer with source citations, personalized to child's age and context
- **Output**: Conversation history in `coach_conversations` / `coach_messages`

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

### Zod schemas for every Claude output

Every Claude extraction must have a corresponding Zod schema in `/src/lib/extractors/`. The schema validates the structured output before it touches the database. See `scheduler-extractor.ts` for the pattern.

### Prompts live in `/prompts/` as markdown

Never inline Claude prompts in TypeScript files. Every prompt is a versioned markdown file in `/prompts/`. Import it in your extractor:

```ts
import { readFileSync } from "fs";
import { join } from "path";

const PROMPT = readFileSync(join(process.cwd(), "prompts", "scheduler-extraction.md"), "utf-8");
```

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
5. Push to `develop`, verify on preview deployment, then merge to `main`

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

**To upgrade to real auth:** Replace the middleware with Clerk (or similar), restore `AuthProvider` to use `ClerkProvider`, and add user-scoped queries. The database schema already has `user_id` columns on every table.

## 6. Database Conventions

- Every table has `user_id` (and `child_id` where applicable) for multi-tenancy
- Row-Level Security (RLS) is enforced in Supabase — every query is scoped to the authenticated user
- Never query a table without filtering by `user_id`
- Use `gen_random_uuid()` for all primary keys
- Timestamps are `timestamptz` (UTC)
- The `embeddings` table uses pgvector's `vector(1024)` type for Voyage AI embeddings
- JSON columns (`jsonb`) are used for flexible structured data (action_items, materials, messages)

## 7. What to Build Next

See [ROADMAP.md](./ROADMAP.md) for the full timeline. Check the [GitHub Issues](https://github.com/dada5531/kinloop/issues) for the v1 milestone backlog.

Suggested build order:

1. Issue #1: Connect Supabase and run migration
2. Issue #2: Configure Clerk auth
3. Issue #3: Build dashboard grid
4. Issue #5: Scheduler extraction (the core demo)
5. Issue #8: Play Lab YouTube extraction
6. Issue #10 + #11: Coach RAG pipeline

## 8. What NOT to Do

- **Do not add new dependencies** without justification in the PR description. The stack is locked.
- **Do not inline secrets.** All API keys go through environment variables. Never commit `.env.local`.
- **Do not bypass the cross-quadrant context service.** Every Claude call must include child context from `/api/context/[childId]`.
- **Do not commit prompt changes** without updating `/docs/claude-prompts.md` with the rationale.
- **Do not use `any` type.** TypeScript strict mode is enforced. Define proper types in `/src/types/`.
- **Do not write client components unnecessarily.** Default to Server Components; add `"use client"` only when required.

## 9. Testing Expectations

- Every Claude extractor needs a unit test with a fixture input file in `/tests/unit/fixtures/`
- Test the Zod schema validation, not the Claude API call (mock the API response)
- E2E tests cover the critical user flows: onboarding, extraction, coach chat
- Run tests with `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright)
- CI runs lint + typecheck + unit tests on every PR

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
# Fill in: KINLOOP_ACCESS_PASSWORD, ANTHROPIC_API_KEY, SUPABASE keys
# Optional for V1: GOOGLE_CLIENT_ID/SECRET, YOUTUBE_API_KEY, VOYAGE_API_KEY

# 3. Start Supabase locally
supabase start
supabase db reset  # Runs migrations + seed data

# 4. Start the dev server
pnpm dev
# Open http://localhost:3000

# 5. (Optional) For webhook testing
# Install ngrok: https://ngrok.com
ngrok http 3000
# Set the ngrok URL as RESEND_INBOUND_DOMAIN in .env.local

# 6. Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
pnpm lint          # ESLint
pnpm typecheck     # TypeScript strict check
```
