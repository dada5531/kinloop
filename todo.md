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
- [ ] Create shared utility for calendar invite emails (reusable across all quadrants)
- [ ] Generate .ics file using existing `ics` package when user clicks Schedule
- [ ] Send via Resend to user's configured notification email
- [ ] Subject: "Kinloop · Scheduled: [activity title] · [day] [time]"
- [ ] Body: brief description, materials list, link back to activity in Play Lab
- [ ] Attachment: .ics file
- [ ] If no notification email configured: show toast "Tip: configure your email in Settings to get calendar invites"
- [ ] Test end-to-end: schedule activity → email arrives with .ics → clicking .ics adds event to calendar

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
