# Codebase Audit — v1.6.4-crud-and-fixes

## 1. Silent catch{} Blocks

All silent catch blocks found in the codebase, categorized by severity:

### Intentional / Acceptable (no fix needed)
- `src/app/(dashboard)/coach/page.tsx:299` — SSE chunk parsing, intentional skip
- `src/app/(dashboard)/scheduler/page.tsx:607` — Clipboard API fallback, intentional
- `src/lib/integrations/content-fetcher.ts` (10 instances) — Content enrichment fallback chains, each tries an optional source and continues
- `src/lib/supabase/server.ts:31` — Next.js Server Component cookie limitation, documented
- `src/lib/safe-date.ts:78,112,132` — Date parsing fallback, returns safe defaults
- `src/lib/logger.ts:51` — JSON serialization fallback, returns "[unserializable]"

### Already Fixed in This Branch
All catch blocks in dashboard pages now use `logError()` + `showErrorToast()`.

## 2. Unsafe new Date() Calls

### Already Protected (using safeFormatDate/safeToISOString)
- scheduler/page.tsx — All date display and API calls use safe-date helpers
- dashboard/page.tsx — Uses safeFormatDate for display
- play/page.tsx — Uses safeFormatDate for display
- development/page.tsx — Uses safeFormatDate for formatDate helper

### Remaining Unsafe Calls (need review)
- `dashboard/page.tsx:87,91` — Event filtering/sorting with `new Date(e.start_time)`
- `development/page.tsx:118,283,284,323,324,440` — Age calculation with `new Date(dob)` — DOB is always a valid date from DB
- `play/page.tsx:591,592,717,718,720,721,1497,1498` — Schedule date construction and filtering
- `scheduler/page.tsx:941,945,948,949` — Event filtering/sorting
- `components/dashboard/TopBar.tsx:60,63` — Event filtering
- `components/InlineEditForm.tsx:67` — Date validation
- `lib/calendar/ics-generator.ts:22` — ICS date formatting
- `lib/hooks/use-children.ts:55` — Age calculation from DOB
- `lib/prompts.ts:36` — DOB for prompt context

### Assessment
Most unsafe `new Date()` calls are for:
1. **DOB calculations** — DOB comes from the database and is always valid ISO
2. **Event filtering/sorting** — `start_time` comes from the database and is always valid ISO
3. **Schedule construction** — User-selected date+time, always valid format

These are low-risk because the inputs come from controlled sources (database or user form inputs).
The high-risk path (AI-extracted dates) is already protected via `safeToISOString()`.

## 3. Infrastructure Already in Place
- `src/lib/safe-date.ts` — safeISODate(), safeToISOString(), safeFormatDate(), safeFormatTime()
- `src/lib/logger.ts` — logError(), logWarn() with structured JSON payloads
- `src/lib/error-toasts.ts` — showErrorToast() with specific copy per error type
- `src/lib/extraction-schema.ts` — Zod validation + salvage for Claude responses
- `src/lib/extractors/scheduler-extractor.ts` — Zod schema for Claude tool_use output

## 4. Bug Fixed in This Commit
- Development timeline delete was passing prefixed IDs (e.g., `milestone-{uuid}`) instead of raw UUIDs to the DELETE API endpoint.
