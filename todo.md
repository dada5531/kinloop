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
- [ ] Diagnose: test the dark CTA button click on Vercel preview, capture actual URL opened
- [ ] Fix: ensure bulk CTA opens Amazon search URL with all materials + affiliate tag (search-link fallback)
- [ ] Fix: ensure per-material chip clicks open Amazon search for that single item with partner tag
- [ ] Verify both flows work end-to-end on Vercel preview, report exact URLs opened

## Section 3 PR-C — Scheduler Integration + Saved Activities List
- [ ] Schedule modal: date picker, time picker, duration auto-fill, notes textarea, reminder toggle (15/30/60 min), Cancel/Save
- [ ] On Save: insert into events table (same as Quadrant 1 Scheduler), source = "play_lab"
- [ ] Success toast: "Scheduled for [day], [time]"
- [ ] Dashboard "This week" event counter increments
- [ ] Scheduler quadrant shows the event in its list
- [ ] After scheduling: green "Scheduled for [day], [time]" badge replaces button, with "Edit" link
- [ ] Saved activities list at top of Play Lab: upcoming activities with date/time/Open button
- [ ] Past activities collapse into "Done" section
- [ ] Take screenshots: schedule modal, success state, saved activities list
