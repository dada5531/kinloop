# Roadmap

## Overview

KINLOOP development is organized into three phases aligned with the HBS MBA capstone timeline.

## Now — V1 (Weeks 1-4)

The goal of V1 is a working demo that can be presented at HBS. Focus on the core extraction loop and the "wow" moment of pasting an email and seeing structured events appear.

| Feature | Quadrant | Status | Issue |
|---|---|---|---|
| Clerk auth + protected routes | Setup | Planned | #2 |
| 2x2 dashboard grid | Dashboard | Planned | #3 |
| Child profile creation + selector | Dashboard | Planned | #4 |
| File upload + Claude extraction for permission slips | Q1 Scheduler | Planned | #5 |
| Email forwarding via Resend inbound webhook | Q1 Scheduler | Planned | #6 |
| YouTube link → activity extraction | Q3 Play Lab | Planned | #8 |
| Seed pgvector with 100 starter parenting tips | Q4 Coach | Planned | #10 |
| Basic Coach chat with RAG retrieval | Q4 Coach | Planned | #11 |
| Supabase project + initial migration | Setup | Planned | #1 |
| Cross-quadrant context service | Context | Planned | #14 |
| Demo seed data (Jenn + Mia) | Demo | Planned | #15 |

## Next — V2 (Weeks 5-8)

V2 completes all four quadrants and adds the integrations that make KINLOOP a daily-use tool.

| Feature | Quadrant | Notes |
|---|---|---|
| Manual upload + extraction for pediatrician summaries | Q2 Development | PDF/image → Claude health extraction |
| Growth chart with WHO percentile data | Q2 Development | Recharts + hardcoded WHO LMS subset |
| Full Coach with conversation history | Q4 Coach | Persistent conversations, topic suggestions |
| Gmail OAuth + email reading | Q1 Scheduler | Read last 20 school-labeled emails |
| Google Calendar write | Q1 Scheduler | Insert events with reminders |
| Amazon PA-API materials lookup | Q3 Play Lab | Affiliate links for activity materials |
| Stripe subscription scaffolding | Payments | Free tier + Pro tier |
| Mobile-responsive polish | All | 2x2 grid stacks vertically on mobile |

## Later — Post-HBS

These features represent the long-term product vision beyond the capstone.

| Feature | Category | Notes |
|---|---|---|
| HealthKit integration (native iOS) | Q2 Development | Real-time health data from Apple Health |
| FHIR via 1up Health | Q2 Development | Direct EHR integration with pediatrician systems |
| Instacart Connect | Q3 Play Lab | One-click ordering of activity materials |
| ElevenLabs TTS | Q4 Coach | Voice responses for hands-free parenting advice |
| WhatsApp ingestion | Q1 Scheduler | Parse school group chats (Asia market) |
| TikTok / Instagram APIs | Q3 Play Lab | Direct content extraction (pending API access) |
| Native mobile app | All | React Native or Swift |
| Multi-language support | All | Spanish, Mandarin, Hindi |
| Family sharing | All | Multiple parents per child profile |
| Pediatrician portal | Q2 Development | Read-only access for healthcare providers |
