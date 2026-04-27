# Roadmap

## Overview

KINLOOP development is organized into versioned milestones aligned with the HBS MBA capstone timeline. The project shipped v1.5 as the demo-ready release, with design polish (v1.6) and production hardening (v1.7–v1.8) planned before the capstone presentation.

## Shipped — v1.0 through v1.5

All four quadrants are functional with real AI processing, cross-quadrant intelligence, and end-to-end email delivery.

| Version | What Shipped | PRs |
|---|---|---|
| v1.0 | 4-quadrant dashboard grid, demo family (Jenn + Mia), Scandinavian design system, landing page, password gate auth | #16 |
| v1.1 | Scheduler: email/PDF extraction, .msg/.eml upload, send-to-calendar, batch ops | #18 |
| v1.2 | Coach: tip/activity of day, RAG search, daily cron, corpus seeding | #19–#21 |
| v1.3 | Welcome photo screen, photo upload in Settings, age-filtered daily picks | #22–#25 |
| v1.4 | Development Hub: growth chart with WHO percentiles, milestone tracker, health timeline, manual entry | #26–#27 |
| v1.5 | **Section 3 — Play Lab**: multi-platform content extraction (YouTube, TikTok, Instagram, Pinterest), Amazon search-link CTAs with affiliate tag, enhanced schedule modal, cross-quadrant events, calendar invite emails via Resend with .ics attachments, email health diagnostics | #28–#30 |

### v1.5 Feature Summary

**Play Lab Content Extraction (PR #28)**
- Multi-platform URL paste: YouTube transcripts, TikTok/Instagram/Pinterest metadata, generic web pages
- Claude-powered activity extraction: title, steps, materials, skills, safety notes, age range
- Manual paste escape hatch for content behind auth walls

**Amazon Integration (PR #29)**
- Per-material "Find on Amazon" links with `kinloop-20` affiliate tag
- Bulk "Shop materials on Amazon" CTA with estimated cost
- PA-API v5 placeholder (activates when `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG` are set)

**Scheduler Integration + Calendar Invites (PR #30)**
- Schedule modal: date/time picker, duration auto-fill, reminder toggle
- Cross-quadrant events: Play Lab activities appear in Scheduler and Dashboard counters
- Calendar invite emails via Resend with .ics attachment (verified delivered to real inbox)
- Shared `sendCalendarInvite()` utility reusable across all quadrants
- Email health endpoint (`/api/health/email`) with domain-verification warning

## Next — v1.6 Design Warmth

Colors and typography refresh to make the dashboard feel warmer and more approachable.

| Stage | Scope | Status |
|---|---|---|
| Stage A | Warm cream backgrounds, soft pastel accents, Fraunces serif for headings | Planned |
| Stage B | Micro-interactions, card shadows, hover states, illustration accents | Blocked on Stage A approval |
| Stage C | Mobile-responsive polish, touch targets, swipe gestures | Planned |

## Next — v1.7 Production Hardening

| Feature | Notes |
|---|---|
| Error boundaries on all quadrants | Graceful fallback UI for extraction failures |
| Rate limiting on extraction endpoints | Prevent abuse of Claude API calls |
| Sentry integration | Error tracking and performance monitoring |
| Loading skeletons for all data-fetching pages | Replace spinners with content-shaped placeholders |
| Accessibility audit (WCAG 2.1 AA) | Focus management, screen reader labels, color contrast |

## Next — v1.8 Custom Resend Domain

Production email delivery requires a verified custom domain. Currently using Resend's `onboarding@resend.dev` sandbox domain, which is rate-limited and shows "via resend.dev" in recipient inboxes.

**Setup Checklist:**

1. Purchase or verify ownership of the sending domain (e.g., `kinloop.com` or `mail.kinloop.com`)
2. In the [Resend Dashboard](https://resend.com/domains), click "Add Domain" and enter the domain
3. Add the DNS records shown in the Resend dashboard at your domain registrar. Resend will provide the exact values for:

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

### Authentication & Multi-Tenancy

| Feature | Category | Notes |
|---|---|---|
| Clerk integration | Auth | Replace shared-password gate with real OAuth (Google, Apple) |
| Multi-user auth | Auth | Multiple parents per child profile, role-based access |
| Family sharing | Auth | Invite partner/grandparent with scoped permissions |
| User-scoped queries | Database | Enforce RLS policies per authenticated user (schema already has `user_id` columns) |

### Health & Medical Integrations

| Feature | Category | Notes |
|---|---|---|
| FHIR via 1up Health | Q2 Development | Direct EHR integration with pediatrician systems |
| HealthKit integration (native iOS) | Q2 Development | Real-time health data from Apple Health |
| Pediatrician portal | Q2 Development | Read-only access for healthcare providers |

### Commerce & Logistics

| Feature | Category | Notes |
|---|---|---|
| Amazon PA-API v5 | Q3 Play Lab | Real product search, pricing, images (placeholder code exists) |
| Instacart Connect | Q3 Play Lab | One-click ordering of activity materials |
| Stripe subscription scaffolding | Payments | Free tier + Pro tier |

### Communication & Content

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
