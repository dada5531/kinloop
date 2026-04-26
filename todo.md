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
- [ ] Prominent bulk CTA: dark pill button (#2C2C2A bg, white text, 14px), Amazon icon, estimated cost, affiliate disclosure
- [ ] Per-material links: external-link arrow icon inside each chip, underline-on-hover, tooltip "Find on Amazon"
- [ ] Total price estimate line above bulk CTA: "Estimated total: $XX on Amazon · X items eligible for Prime"
- [ ] Layout order: Description → Steps → Materials header → Material chips (with icons) → Price estimate → Dark bulk CTA → Affiliate disclosure → Skills → Safety
- [ ] Take mobile (375px) and desktop (1440px) screenshots from Vercel preview
