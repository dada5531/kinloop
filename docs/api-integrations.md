# API Integrations

This document describes every external API used by KINLOOP, including purpose, authentication method, rate limits, and fallback strategies.

## Anthropic (Claude)

| Field | Value |
|---|---|
| **Purpose** | All AI extraction (scheduler, health, activity) and coach chat |
| **Model** | claude-sonnet-4-5-20250514 |
| **Auth** | API key (`ANTHROPIC_API_KEY`) |
| **Rate Limits** | Tier 1: 4,000 RPM, 400,000 TPM |
| **Fallback** | Queue requests with exponential backoff; show "processing" state in UI |
| **Docs** | https://docs.anthropic.com |

### Usage Pattern
- Extraction endpoints use `tool_use` with strict JSON schemas for reliable structured output
- Coach chat uses standard message completion with RAG context injection
- All calls include child context from `/api/context/[childId]`

## Voyage AI

| Field | Value |
|---|---|
| **Purpose** | Generate embeddings for RAG (coach knowledge base) |
| **Model** | voyage-3-lite (1024 dimensions) |
| **Auth** | API key (`VOYAGE_API_KEY`) |
| **Rate Limits** | Free tier: 300 RPM, 1M tokens/month |
| **Fallback** | Cache embeddings in pgvector; batch new embeddings |
| **Docs** | https://docs.voyageai.com |

### Usage Pattern
- Seed script embeds all parenting knowledge chunks at setup time
- User questions are embedded at query time for similarity search
- Embeddings are cached — never re-embed the same content

## Google Calendar API

| Field | Value |
|---|---|
| **Purpose** | Write extracted events to user's Google Calendar |
| **Auth** | OAuth 2.0 (user consent via Clerk) |
| **Scopes** | `https://www.googleapis.com/auth/calendar.events` |
| **Rate Limits** | 1,000,000 queries/day |
| **Fallback** | Store events locally; sync on next login |
| **Docs** | https://developers.google.com/calendar/api |

## Gmail API

| Field | Value |
|---|---|
| **Purpose** | Read school emails for Scheduler extraction (V2) |
| **Auth** | OAuth 2.0 (user consent via Clerk) |
| **Scopes** | `https://www.googleapis.com/auth/gmail.readonly` |
| **Rate Limits** | 250 quota units/user/second |
| **Fallback** | Email forwarding via Resend inbound webhook (V1) |
| **Docs** | https://developers.google.com/gmail/api |

## YouTube Data API v3

| Field | Value |
|---|---|
| **Purpose** | Fetch video metadata (title, description, duration) for Play Lab |
| **Auth** | API key (`YOUTUBE_API_KEY`) |
| **Rate Limits** | 10,000 units/day (videos.list = 1 unit) |
| **Fallback** | Use `youtube-transcript` npm package for captions without API key |
| **Docs** | https://developers.google.com/youtube/v3 |

### Usage Pattern
- `videos.list` for metadata (title, description, duration)
- `youtube-transcript` npm package for captions/transcript
- Transcript + metadata sent to Claude for activity extraction

## Resend

| Field | Value |
|---|---|
| **Purpose** | Inbound email parsing (school emails forwarded to KINLOOP) + outbound notifications |
| **Auth** | API key (`RESEND_API_KEY`) |
| **Rate Limits** | Free tier: 100 emails/day, 3,000/month |
| **Fallback** | Manual paste/upload in Scheduler UI |
| **Docs** | https://resend.com/docs |

### Inbound Email Flow
1. User forwards school email to `inbox@kinloop.resend.dev`
2. Resend webhook hits `/api/webhooks/resend`
3. Email body extracted and sent to Scheduler extraction pipeline

## Stripe

| Field | Value |
|---|---|
| **Purpose** | Subscription management (Free + Pro tiers) |
| **Auth** | API key (`STRIPE_SECRET_KEY`) |
| **Rate Limits** | No hard limit |
| **Fallback** | Scaffold only for V1; all features available in free tier |
| **Docs** | https://stripe.com/docs/api |

## Supabase Storage

| Field | Value |
|---|---|
| **Purpose** | File uploads (PDFs, images from Scheduler and Development Hub) |
| **Auth** | Service role key (`SUPABASE_SERVICE_ROLE_KEY`) |
| **Rate Limits** | 50MB per file |
| **Fallback** | Compress images before upload; reject files over limit |
| **Docs** | https://supabase.com/docs/guides/storage |

### Storage Buckets
- `inbox` — Uploaded permission slips, school emails, medical documents
- `photos` — Child profile photos
