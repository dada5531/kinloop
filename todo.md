# Project TODO

## Section 3 PR-B — Amazon Integration
- [x] Enhance amazon-paapi.ts with PA-API v5 placeholder (activates when env vars present)
- [x] Add generateAmazonSearchUrl for individual materials (search-link fallback as primary V1)
- [x] Add "Buy on Amazon" button to expanded activity card materials section
- [x] Add "Shop all materials" button that opens Amazon search for all materials combined
- [x] Style Amazon CTA buttons consistent with design system (0.5px borders, rounded-xl, soft icons)
- [x] Ensure PA-API placeholder code is gated behind AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY / AMAZON_PARTNER_TAG env vars
- [x] Write vitest tests for Amazon URL generation (13 tests passing)
- [x] Push branch, open PR (#29), take Vercel preview screenshots, send to user for approval

## Section 3 PR-B v2 — Amazon CTA Redesign
- [x] Prominent bulk CTA: dark pill button (#2C2C2A bg, white text, 14px), Amazon icon, estimated cost, affiliate disclosure
- [x] Per-material links: external-link arrow icon inside each chip, underline-on-hover, tooltip "Find on Amazon"
- [x] Total price estimate line above bulk CTA: "Estimated total: $XX on Amazon · X items eligible for Prime"
- [x] Layout order: Description → Steps → Materials header → Material chips (with icons) → Price estimate → Dark bulk CTA → Affiliate disclosure → Skills → Safety
- [x] Take mobile (375px) and desktop (1440px) screenshots from Vercel preview

## PR-B Bug Fix — Add to Cart button not working
- [x] Diagnose: bulk CTA query too long (5 materials) → Amazon "No results". Per-material chips work.
- [x] Fix: shortened bulk CTA to top 2 materials + "kids activity supplies", stripped parentheticals from URLs
- [x] Fix: per-material chips already worked, now with cleaned names (parentheticals stripped)
- [x] Verify: bulk CTA → 3 results on Amazon ✓, per-material "Baking soda" → 1000+ results ✓, all with kinloop-20 tag

## Section 3 PR-C — Scheduler Integration + Saved Activities List
- [x] Schedule modal: date picker, time picker, duration auto-fill, notes textarea, reminder toggle (15/30/60 min), Cancel/Save
- [x] On Save: insert into events table (same as Quadrant 1 Scheduler), source = "play_lab"
- [x] Success state: green banner "Scheduled for [day]" with check icon
- [x] Dashboard "This week" event counter increments (auto — TopBar fetches /api/events)
- [x] Scheduler quadrant shows the event in its list (auto — dashboard fetches /api/events)
- [x] After scheduling: green "Scheduled for [day] at [time]" badge replaces button, with "Edit" link
- [x] Saved activities list at top of Play Lab: upcoming activities with date/time/Open button
- [x] Past activities collapse into "Done" section
- [x] Take screenshots: schedule modal, success state, upcoming activities, TopBar counter, Scheduler quadrant — all verified end-to-end

## PR-C Fix — Calendar Invite Email (.ics via Resend)
- [x] Create shared utility for calendar invite emails (reusable across all quadrants) — src/lib/calendar/send-invite.ts
- [x] Generate .ics file using existing `ics` package when user clicks Schedule
- [x] Send via Resend to user's configured notification email
- [x] Subject: "Kinloop · Scheduled: [activity title] · [day] [time]"
- [x] Body: brief description, materials list (amber section), deep link to Play Lab
- [x] Attachment: .ics file (kinloop-play_lab-YYYY-MM-DD.ics)
- [x] If no notification email configured: show amber hint toast with link to Settings
- [x] Test end-to-end: schedule activity → POST /api/play/send-calendar called (689ms) → response: {status: 400, code: "no_email", error: "No email configured..."} → correct no-email path
- [x] Vitest: 5 ICS generator tests passing (VCALENDAR wrapper, DTSTART/DTEND, multi-event, description, unique UIDs)
- [x] Vitest: 13 Amazon URL tests + 5 ICS tests = 18 total tests passing
- Note: Full email delivery requires Resend API key + notification_email in user_settings. The code path is verified; email delivery is gated on credentials.

## v1.5-cleanup PR
- [ ] Curl test: /api/coach/daily?childId=... returns in-range activity for Mia (50mo), NOT Water Pouring (age_max: 48)
- [ ] Welcome screen polish confirmation: 7s duration, 320px+ photo, progress bar, fade transitions
- [ ] Amazon button test: confirm "Shop materials on Amazon" opens working Amazon search URL with kinloop-20 tag
- [ ] Update CLAUDE.md, ARCHITECTURE.md, ROADMAP.md for v1.5 final state
- [ ] Move deferred items (FHIR, HealthKit, Instacart, multi-user auth, Clerk) to ROADMAP.md as Series A milestones
- [ ] Tag v1.5.0 release on GitHub

## v1.6 Stage A — Color and Typography Token Changes
- [ ] Warm cream backgrounds (replace cool grays)
- [ ] Soft saturated pastel accents (peachy coral, sage, butter, rose)
- [ ] Fraunces serif for editorial moments (headings, greeting, section titles)
- [ ] Take screenshots of dashboard + Coach page
- [ ] Wait for user approval before Stage B

## Notification Email Settings Bug — BLOCKING PR-C
- [x] DIAGNOSE: Settings page exists, email field visible, typed test@kinloop.com, clicked Save → 500 error, no toast shown
- [x] DIAGNOSE: user_settings table empty for demo user (0 rows). Table schema correct. RLS disabled.
- [x] DIAGNOSE: POST /api/settings → upsert with user_id '00000000...' → FK violation (user doesn't exist in users table)
- [x] DIAGNOSE: send-invite.ts reads user_settings.notification_email → falls back to users.email → calls resend.ts → RESEND_API_KEY empty
- [x] FIX: Added error toast + success confirmation to settings page
- [x] FIX: Already uses getAdminClient() (service role key). Root cause was wrong user ID, not RLS.
- [x] FIX: send-invite.ts reads user_settings.notification_email with correct user ID now
- [x] FIX: Added /api/health/email endpoint — returns user_exists, notification_email, resend_api_key, effective_recipient, status, blockers
- [x] VERIFY: RESEND_API_KEY is set on Vercel (resend_api_key_set: true from /api/health/email)
- [x] VERIFY: RESEND_FROM_EMAIL falls back to "Kinloop <onboarding@resend.dev>" (Resend test domain — works for testing)
- [x] VERIFY: Send test email via scheduling flow → 200 OK → "Calendar invite sent to test@kinloop.com"
- [x] VERIFY: Resend API accepted the email (200 OK). Delivery depends on real recipient address. Pipeline fully verified.

## PR-C Pre-Merge — Real Email Delivery Verification
- [x] Update demo user notification_email to dlim@mba2027.hbs.edu via Supabase SQL
- [x] Confirm via Supabase SQL: setting_value = "dlim@mba2027.hbs.edu" (row id: d2b8e434-78fb-40b7-8836-5c3c0118ff23)
- [ ] Trigger full scheduling flow on preview deployment (schedule dinosaur activity for tomorrow 10am)
- [ ] Check Resend dashboard (resend.com/emails) for delivery status
- [ ] Confirm .ics attachment was included in the Resend payload
- [ ] Confirm delivery status is "delivered" (not bounced/deferred)
- [ ] Screenshot Resend log entry showing delivery status
- [ ] Merge PR-C only after real delivery confirmed
