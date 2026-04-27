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
- [x] Curl test: /api/coach/daily?childId=... returns in-range activity for Mia (50mo), NOT Water Pouring (age_max: 48)
- [x] Welcome screen polish confirmation: 7s duration, 320px+ photo, progress bar, fade transitions
- [x] Amazon button test: confirm "Shop materials on Amazon" opens working Amazon search URL with kinloop-20 tag
- [x] Update CLAUDE.md, ARCHITECTURE.md, ROADMAP.md for v1.5 final state
- [x] Move deferred items (FHIR, HealthKit, Instacart, multi-user auth, Clerk) to ROADMAP.md as Series A milestones
- [x] Add domain-verification status check to /api/health/email (warn when RESEND_FROM_EMAIL is onboarding@resend.dev)
- [x] Document custom-domain Resend setup as v1.8 task in CLAUDE.md and ROADMAP.md (DNS records, Resend dashboard config checklist)
- [x] Tag v1.5.0 release on GitHub

## v1.6 Stage A — Color and Typography Token Changes
- [x] Warm cream backgrounds — --background: 38 35% 96% (#f8f5f1), zero cool-gray (bg-gray/slate/zinc/neutral) references remain in src/
- [x] Soft saturated pastel accents — Play #dd845f (peachy coral), Development #4fa58e (sage), Coach #c47793 (rose), Scheduler #896bbc (lavender), warm muted washes
- [x] Fraunces serif for editorial moments — font-serif-display on 11 headings across all 6 dashboard pages + landing + welcome
- [x] Screenshots taken in previous session, user approved and proceeded to Stage B

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
- [x] Trigger full scheduling flow → POST /api/play/send-calendar → 200 OK → sent to dlim@mba2027.hbs.edu
- [x] Resend API confirms: last_event = "delivered" (email ID: dd3245f2-3512-4992-ba61-aeb90b60fbd2)
- [x] .ics attachment included (code-level proof: resend.ts lines 62-68, base64-encoded text/calendar)
- [x] Delivery status: "delivered" — confirmed via Resend GET /emails/{id} API
- [x] Full Resend API response saved to resend-delivery-proof.txt
- [x] User confirmed: email arrived in inbox, .ics opens correctly, adds event at right date/time
- [x] PR-C merged (#30)

## v1.6 Stage B — Design Warmth (illustrations, microinteractions, card warmth)

### Ask 1 — Welcome Screen: Bigger Photo
- [x] Desktop: photo at least 480px tall, occupying upper 50-55% of viewport
- [x] Mobile: photo at least 320px tall, dominating upper 60% of viewport
- [x] Keep rounded corners (16px) and soft shadow
- [x] Increase vertical whitespace between photo and greeting to ~32px

### Ask 2 — Landing Page: Abeto-Inspired Redesign
- [x] Massive Fraunces headline (64-80px desktop, 36-44px mobile): "Less chaos. More childhood."
- [x] Single supporting line in Inter, ~18px, muted, max 80 chars
- [x] Two CTAs: primary "Get started" (dark pill) + secondary "Sign in" (ghost link with arrow)
- [x] Remove 4 quadrant cards from above-fold (or push below fold as secondary section)
- [x] Headline letters fade in with 30ms stagger, total <600ms
- [x] Single small decorative element — BalloonSprig wired in 3c (lower-right corner, 25% opacity)

### Ask 3 — Hand-Drawn Illustrations (user-provided style + extensions)

#### 3a — Empty States (user-provided SVGs)
- [x] Copy 4 user-provided SVGs to /src/components/illustrations/ as React components
- [x] SchedulerEmpty: envelopes/letters scene, ~280px tall
- [x] DevelopmentEmpty: growth chart + potted sprout, ~280px tall
- [x] PlayLabEmpty: paper airplane + blocks + key, ~280px tall
- [x] CoachEmpty: open journal + steaming mug, ~280px tall
- [x] Wire each to respective quadrant empty state (replace current no-data text)
- [x] Empty-state copy appears below illustration

#### 3b — Welcome Screen Motifs
- [x] 2 small decorative elements at 20% opacity in opposite corners of photo frame
- [x] Sprig of leaves (2-3 small leaves) in one corner
- [x] Tiny paper crane drifting in opposite corner

#### 3c — Landing Page Decoration
- [x] One small ~60px detail in lower-right/trailing corner (BalloonSprig)
- [x] Subject: small balloon string with sprig OR crayon sun with squiggle rays

#### 3d — Dashboard Header Time-of-Day Motifs (80px, Framer Motion)
- [x] Morning: steaming mug + small sprig (teacup style from Coach empty state)
- [x] Afternoon: paper sun with 6 rays, butter-yellow fills
- [x] Evening: soft crescent moon with 1-2 small clouds, dusty blue/grey fills
- [x] 4-5 second drift loop animation (steam curls / sun rotates 5deg / moon bobs)
- [x] Respect prefers-reduced-motion (useReducedMotion() → empty animate object)

#### 3e — Achievement Micro-Illos (60px, animate 1.5s then fade)
- [x] Milestone marked done: MilestoneAchieved illustration on Development milestone toggle
- [x] Activity scheduled: ActivityScheduled illustration on Play Lab + Scheduler event approval
- [x] Tip saved: TipSaved illustration on Coach tip save
- [x] Email sent: deferred — no standalone email-send trigger point exists in the current UI; EmailSent component is built and available for future use

#### 3f — Play Lab Activity Card Header Illos (40px, per-category)
- [x] Sensory: SensoryIcon at 24px in 40px card header + 14px in CategoryBadge
- [x] Motor: MotorIcon at 24px in 40px card header + 14px in CategoryBadge
- [x] Cognitive: CognitiveIcon at 24px in 40px card header + 14px in CategoryBadge
- [x] Creative: CreativeIcon at 24px in 40px card header + 14px in CategoryBadge

#### 3g — Coach Tip Card Header Illos (40px, per-topic)
- [x] Sleep tips: SleepIcon in daily tip card header
- [x] Behavior tips: BehaviorIcon in daily tip card header
- [x] Nutrition tips: NutritionIcon in daily tip card header
- [x] Development tips: DevelopmentTipIcon in daily tip card header
- [x] Safety tips: SafetyIcon in daily tip card header

#### 3h — Development Milestone Category Icons (~16px, replace checkmark)
- [x] Cognitive: MilestoneCognitive icon in progress ring + milestone list
- [x] Motor: MilestoneMotor icon in progress ring + milestone list
- [x] Language: MilestoneLanguage icon in progress ring + milestone list
- [x] Social: MilestoneSocial icon in progress ring + milestone listapping circles forming venn

#### 3i — Quadrant Transition Motifs (800ms sequence, Framer Motion)
- [x] Build QuadrantTransition wrapper component with 3-phase animation (fade-in, hold+sub-anim, crossfade to content)
- [x] SchedulerTransition: envelope tilts ±2deg (already wired)
- [x] DevelopmentTransition: sprout sways ±3deg
- [x] PlayLabTransition: crane drifts ±4px
- [x] CoachTransition: book pages flicker
- [x] prefers-reduced-motion: simpler 400ms appear + 200ms fade, no scale/sub-animation

#### 3j — Ambient Corner Accents
- [x] Welcome screen: LeafSprig + DriftingCrane at 20% opacity in opposite corners
- [x] Landing page: BalloonSprig at 25% opacity in lower-right corner

#### Scheduler-Only Demo Checkpoint
- [x] Extract all 26 SVGs into individual React TSX components
- [x] Wire Scheduler transition motif on page mount (plays once per visit)
- [x] Wire Scheduler empty state (already done)
- [x] Wire ActivityScheduled crane achievement micro on event approval success
- [x] Push and send screenshots for approval before full rollout — delivering checkpoint to user

#### Style Guide
- [x] Create /docs/illustrations.md documenting color palette, stroke weights, patterns

### Ask 4 — Card Warmth
- [x] Each quadrant card gets 4% opacity wash of its accent color
- [x] Border color shifts to warm-gray #E8E2D5
- [x] Hover: wash deepens to 8%, card lifts with soft shadow (0 4px 12px rgba(0,0,0,0.04))
- [x] Selected/active states: 2px border in quadrant accent at full opacity

### Ask 5 — Microinteractions
- [x] Card hover: scale 1.005 + warmth wash, 200ms ease-out
- [x] Button press: scale 0.98 + brief color deepening, 100ms (btn-press class on all Button components)
- [x] Save/schedule actions: achievement micro-illustration fires on approve/save success (Scheduler, Play Lab, Development, Coach)
- [x] Save/schedule actions: success icon grow-in (animate-success-icon) + accent flush (animate-accent-flush) on Scheduler + Play Lab
- [x] Tab switches: 250ms ease-out cross-fade on Development page tabs (4 tabs)
- [x] Tab switches: no other tabbed areas found — Development is the only page with tabs
- [x] Timeline entries: fade-in on load with 50ms stagger (animate-stagger-item on Scheduler event list)

## v1.6 Stage B Review — User-Requested Before Publish
- [x] Confirm preview URL (NOT production) and send to user — https://kinloop-bi4rup9jo-dada5531s-projects.vercel.app
- [x] Screen recording — not possible in sandbox (no screen recording tool); user directed to test animations live
- [x] 9 still screenshots delivered (landing, dashboard, scheduler x2, development x2, coach, play lab, welcome mobile 375px)
- [x] 4 explicit questions answered in v16_stage_b_review.md
- [x] User signed off and requested closeout (dropped v1.7, proceeded to closeout tasks)

## v1.6 Closeout Tasks
- [x] Move Weekly Planner (v1.7) from "in progress" to "Series A roadmap — agentic layer" in ROADMAP.md
- [x] Preserve Weekly Planner spec (data sources, action types, guardrails) in ROADMAP.md
- [x] Confirm v1.5 is fully closed (calendar invite, age-filter, welcome screen, 5 cleanup items)
- [x] Confirm v1.6 Stage B is on production (kinloop-weld.vercel.app returns 200, font-serif-display present)
- [x] Run Lighthouse on production URL: Performance 96, Accessibility 93, Best Practices 96, SEO 100
- [x] Update CLAUDE.md to reflect final state (Section 7 rewritten, Lighthouse scores added)
- [x] Update ARCHITECTURE.md to reflect final state (illustrations in file tree, Design System v1.6 section, Deployment updated)
- [x] Update ROADMAP.md to reflect final state (v1.6 shipped, Weekly Planner in Series A, spec preserved)
- [x] Tag v1.6.0 release on GitHub (annotated tag pushed)
- [x] Send final status summary

## v1.6.3 — Landing Motion
- [x] Create 8 marquee SVG illustration React components from reference (paper crane, plant, paper airplane, balloon flower, open book, seedling, envelope, house)
- [x] Create shared MarqueeStrip component: CSS keyframe marquee (36s desktop, 28s mobile), duplicate-set seamless loop, per-item bob/sway/tilt/float motions, horizon line, edge fade gradients
- [x] Rewrite landing page (/): no headline, Fraunces subtitle at clamp(28px,4vw,40px) fade-in 0.4s, CTAs fade-in 1.0s, wordmark breathing animation, footer note fade-in 1.6s, marquee strip
- [x] Rewrite password gate (/enter): no subtitle, password input fade-in 0.4s, enter button fade-in 0.8s, same marquee strip
- [x] CSS keyframes in globals.css: kl-breathe, kl-marquee, kl-item-bob, kl-item-sway, kl-item-tilt, kl-item-float
- [x] prefers-reduced-motion: freeze marquee at -15%, disable all internal motions, content at final state immediately
- [x] Mobile: stack CTAs vertically, shorter loop (28s), smaller illos (52px), gap 56px
- [x] Framer Motion for entrance animations (subtitle/CTAs/footer fade-up)
- [ ] Send preview URL for review before publish
