# Roadmap

## Overview

KINLOOP development is organized into versioned milestones aligned with the HBS MBA capstone timeline. The project shipped v1.6 as the demo-ready release, with production hardening (v1.7–v1.8) available as post-demo improvements.

## Shipped — v1.0 through v1.6

All four quadrants are functional with real AI processing, cross-quadrant intelligence, end-to-end email delivery, and a warm illustration-driven design system.

| Version | What Shipped | PRs |
|---|---|---|
| v1.0 | 4-quadrant dashboard grid, demo family (Jenn + Mia), Scandinavian design system, landing page, password gate auth | #16 |
| v1.1 | Scheduler: email/PDF extraction, .msg/.eml upload, send-to-calendar, batch ops | #18 |
| v1.2 | Coach: tip/activity of day, RAG search, daily cron, corpus seeding | #19–#21 |
| v1.3 | Welcome photo screen, photo upload in Settings, age-filtered daily picks | #22–#25 |
| v1.4 | Development Hub: growth chart with WHO percentiles, milestone tracker, health timeline, manual entry | #26–#27 |
| v1.5 | **Section 3 — Play Lab**: multi-platform content extraction, Amazon affiliate CTAs, cross-quadrant scheduling, calendar invite emails via Resend with .ics attachments, email health diagnostics | #28–#30 |
| v1.6 | **Design Warmth**: warm cream palette, Fraunces serif, 32 hand-drawn SVG illustrations, Framer Motion page transitions, achievement micro-animations, time-of-day motifs, card warmth, microinteractions | — |

### v1.5 Feature Summary

**Play Lab Content Extraction (PR #28)** enables multi-platform URL paste for YouTube transcripts, TikTok/Instagram/Pinterest metadata, and generic web pages. Claude extracts structured activity plans with title, steps, materials, skills, safety notes, and age range. A manual paste escape hatch handles content behind auth walls.

**Amazon Integration (PR #29)** adds per-material "Find on Amazon" links with the `kinloop-20` affiliate tag, a bulk "Shop materials on Amazon" CTA with estimated cost, and a PA-API v5 placeholder that activates when `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, and `AMAZON_PARTNER_TAG` are set.

**Scheduler Integration + Calendar Invites (PR #30)** delivers a schedule modal with date/time picker, duration auto-fill, and reminder toggle. Cross-quadrant events flow from Play Lab into the Scheduler and Dashboard counters. Calendar invite emails are sent via Resend with .ics attachments (verified delivered to a real inbox). The shared `sendCalendarInvite()` utility is reusable across all quadrants, and the `/api/health/email` endpoint provides domain-verification diagnostics.

### v1.6 Feature Summary

**Stage A — Color and Typography** replaced cool-gray backgrounds with warm cream (#f8f5f1), introduced soft saturated pastel accents per quadrant (lavender, sage, coral, rose), and added Fraunces serif for editorial headings across all pages.

**Stage B — Illustrations and Motion** added 32 original SVG-as-React-component illustrations covering empty states, page entrance transitions, achievement micro-animations, time-of-day motifs, activity category icons, coach tip theme icons, milestone category icons, and ambient corner accents. All Framer Motion animations respect `prefers-reduced-motion` via the `useReducedMotion()` hook. CSS microinteractions include button press (scale 0.98), tab crossfade (250ms), timeline stagger (50ms), and success icon grow-in with accent flush.

## Deferred — v1.7 Production Hardening

These items improve reliability and accessibility but are not required for the capstone demo.

| Feature | Notes |
|---|---|
| Error boundaries on all quadrants | Graceful fallback UI for extraction failures |
| Rate limiting on extraction endpoints | Prevent abuse of Claude API calls |
| Sentry integration | Error tracking and performance monitoring |
| Loading skeletons for all data-fetching pages | Replace spinners with content-shaped placeholders |
| Accessibility audit (WCAG 2.1 AA) | Focus management, screen reader labels, color contrast |
| CSS `prefers-reduced-motion` overrides | Add `@media` rules for `.btn-press`, `.animate-tab-crossfade`, `.animate-stagger-item` |

## Deferred — v1.8 Custom Resend Domain

Production email delivery requires a verified custom domain. Currently using Resend's `onboarding@resend.dev` sandbox domain, which is rate-limited and shows "via resend.dev" in recipient inboxes.

**Setup Checklist:**

1. Purchase or verify ownership of the sending domain (e.g., `kinloop.com` or `mail.kinloop.com`)
2. In the [Resend Dashboard](https://resend.com/domains), click "Add Domain" and enter the domain
3. Add the DNS records shown in the Resend dashboard at your domain registrar:

| Record Type | Purpose | Notes |
|---|---|---|
| MX | Bounce handling | Resend provides the exact hostname |
| TXT | SPF authentication | Resend provides the SPF include value |
| CNAME | DKIM signing | Resend provides the DKIM key value |

4. Wait for DNS propagation (usually 5–30 minutes, up to 48 hours)
5. Click "Verify" in Resend dashboard — status should change to "Verified"
6. Update `RESEND_FROM_EMAIL` env var on Vercel: `Kinloop <noreply@mail.kinloop.com>`
7. Redeploy and verify via `/api/health/email` — `from_domain_verified` should be `true`

## Later — Series A Milestones

These features represent the long-term product vision beyond the HBS capstone. They require significant infrastructure investment and are scoped for post-funding development.

### Agentic Layer — Weekly Planner

The Weekly Planner was designed as v1.7 during the capstone build but deferred to the Series A roadmap. It represents the first "agentic" feature — an AI agent that proactively synthesizes information across all four quadrants and produces a weekly action plan without user prompting. The full spec is preserved below for future implementation.

**Concept.** Every Sunday evening (or on-demand), the Weekly Planner agent reads the upcoming week's events from the Scheduler, checks the child's developmental milestones from the Development Hub, pulls age-appropriate activities from the Play Lab library, and retrieves relevant coaching tips. It produces a single, prioritized weekly brief: "Here's what's coming up, here's what to focus on, here's one activity to try."

**Data Sources.** The agent reads from all four quadrants via the existing cross-quadrant context service (`/api/context/[childId]`), plus the `events` table (next 7 days), `daily_recommendations` (tip and activity of the day), and `activities` (saved but unscheduled activities).

| Source | What the Agent Reads | Purpose |
|---|---|---|
| Scheduler `events` | Next 7 days of events | "What's coming up" section |
| Development `health_records` + `milestones` | Recent records, upcoming milestones | "Focus areas" section |
| Play Lab `activities` | Saved but unscheduled activities | "Try this week" recommendation |
| Coach `tips_corpus` + `daily_recommendations` | Age-filtered tips | "Parenting tip of the week" |
| Cross-quadrant context | Full child profile | Personalization layer |

**Action Types.** The agent produces a structured JSON output (validated by Zod schema) containing the following action types:

| Action Type | Description | Example |
|---|---|---|
| `reminder` | Surface an upcoming event with prep notes | "Field trip Thursday — pack sunscreen and signed form" |
| `milestone_focus` | Highlight a developmental milestone to work on | "Mia is close to 'counts to 20' — try counting games this week" |
| `activity_suggestion` | Recommend a saved or new activity | "You saved 'Dinosaur Egg Dig' — schedule it for Saturday?" |
| `tip` | Deliver a contextual parenting tip | "Screen time tip: try the 20-20-20 rule during tablet time" |
| `health_nudge` | Remind about upcoming or overdue health events | "4-year checkup is due next month — schedule with Dr. Chen?" |

**Guardrails.** The agent operates within strict boundaries to prevent overreach:

- **Read-only by default.** The agent reads from all quadrants but never writes to the database without explicit user confirmation. The weekly brief is a suggestion, not an action.
- **No external API calls.** The agent does not send emails, create calendar events, or make purchases. It only produces a structured brief that the user can act on.
- **Confidence thresholds.** Each action includes a confidence score (0–1). Actions below 0.6 are marked as "tentative" and presented differently in the UI.
- **User override.** Every suggestion includes a dismiss button. Dismissed suggestions are logged and used to improve future recommendations (negative signal).
- **Rate limiting.** The agent runs at most once per day per child profile. Manual triggers are rate-limited to 3 per hour.
- **Transparency.** Each action cites its data source ("Based on your Scheduler events" / "Based on Mia's milestone tracker") so the user understands why the suggestion was made.

**Implementation Notes.** The Weekly Planner would be implemented as a Vercel cron job (`/api/cron/weekly-planner`) that runs Sunday at 6 PM in the user's timezone. It calls Claude with the aggregated context and a structured output schema, stores the result in a new `weekly_plans` table, and surfaces it as a dismissible card on the Dashboard. The UI would be a new section at the top of the Dashboard, above the 4-quadrant grid, showing the weekly brief with expandable action cards.

### Authentication and Multi-Tenancy

| Feature | Category | Notes |
|---|---|---|
| Clerk integration | Auth | Replace shared-password gate with real OAuth (Google, Apple) |
| Multi-user auth | Auth | Multiple parents per child profile, role-based access |
| Family sharing | Auth | Invite partner/grandparent with scoped permissions |
| User-scoped queries | Database | Enforce RLS policies per authenticated user (schema already has `user_id` columns) |

### Health and Medical Integrations

| Feature | Category | Notes |
|---|---|---|
| FHIR via 1up Health | Q2 Development | Direct EHR integration with pediatrician systems |
| HealthKit integration (native iOS) | Q2 Development | Real-time health data from Apple Health |
| Pediatrician portal | Q2 Development | Read-only access for healthcare providers |

### Commerce and Logistics

| Feature | Category | Notes |
|---|---|---|
| Amazon PA-API v5 | Q3 Play Lab | Real product search, pricing, images (placeholder code exists) |
| Instacart Connect | Q3 Play Lab | One-click ordering of activity materials |
| Stripe subscription scaffolding | Payments | Free tier + Pro tier |

### Communication and Content

| Feature | Category | Notes |
|---|---|---|
| Gmail OAuth + email reading | Q1 Scheduler | Read last 20 school-labeled emails |
| Google Calendar write | Q1 Scheduler | Insert events with reminders |
| WhatsApp ingestion | Q1 Scheduler | Parse school group chats (Asia market) |
| TikTok / Instagram APIs | Q3 Play Lab | Direct content extraction (pending API access) |
| ElevenLabs TTS | Q4 Coach | Voice responses for hands-free parenting advice |

### Platform Expansion

| Feature | Category | Notes |
|---|---|---|
| Native mobile app | All | React Native or Swift |
| Multi-language support | All | Spanish, Mandarin, Hindi |
