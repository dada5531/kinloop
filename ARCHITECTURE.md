# Architecture

## System Overview

```mermaid
graph TB
    subgraph Client["Browser (Next.js App Router)"]
        LP[Landing Page]
        DA[Dashboard 2x2]
        Q1[Scheduler]
        Q2[Development Hub]
        Q3[Play Lab]
        Q4[Coach]
    end

    subgraph Auth["Authentication"]
        CL[Clerk]
        MW[Middleware]
    end

    subgraph API["API Layer (Next.js Route Handlers)"]
        EX1["/api/extract/scheduler"]
        EX2["/api/extract/health"]
        EX3["/api/extract/activity"]
        CH["/api/coach/chat"]
        CTX["/api/context/[childId]"]
        WH1["/api/webhooks/resend"]
        WH2["/api/webhooks/stripe"]
    end

    subgraph AI["AI Services"]
        CLAUDE["Claude claude-sonnet-4-5<br/>(Anthropic SDK)"]
        VOYAGE["Voyage AI<br/>(voyage-3-lite embeddings)"]
    end

    subgraph DB["Supabase"]
        PG[(Postgres)]
        VEC[(pgvector)]
        STOR[Storage]
        RLS[Row-Level Security]
    end

    subgraph External["External Integrations"]
        GCAL[Google Calendar API]
        GMAIL[Gmail API]
        YT[YouTube Data API v3]
        RS[Resend]
        ST[Stripe]
    end

    Client --> MW --> API
    CL --> MW
    EX1 --> CLAUDE
    EX2 --> CLAUDE
    EX3 --> CLAUDE
    CH --> CLAUDE
    CH --> VOYAGE --> VEC
    API --> PG
    API --> STOR
    CTX --> PG
    EX1 --> GCAL
    Q1 --> GMAIL
    EX3 --> YT
    WH1 --> RS
    WH2 --> ST
```

## Extraction Pipeline

Every quadrant follows the same extraction pattern:

```mermaid
flowchart LR
    A[Input Source] --> B{Content Type}
    B -->|Text| C[Raw Text]
    B -->|PDF| D[pdf-parse] --> C
    B -->|Image| E[Claude Vision] --> C
    B -->|URL| F[Fetch/Scrape] --> C
    C --> G[Load Prompt<br/>/prompts/*.md]
    G --> H[Fetch Child Context<br/>/api/context/childId]
    H --> I[Claude tool_use<br/>+ Zod Schema]
    I --> J[Validate Output]
    J --> K[(Save to Supabase)]
    K --> L[Downstream Integration<br/>Calendar / Shopping / Chart]
```

## Data Model

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ children : has
    users ||--o{ events : creates
    users ||--o{ health_records : creates
    users ||--o{ activities : creates
    users ||--o{ tips_saved : saves
    users ||--o{ coach_conversations : starts

    children ||--o{ events : about
    children ||--o{ health_records : about
    children ||--o{ activities : about
    children ||--o{ coach_conversations : about

    coach_conversations ||--o{ coach_messages : contains

    users {
        uuid id PK
        text clerk_id UK
        text email
        text name
        text avatar_url
        text google_access_token
        text google_refresh_token
        timestamptz created_at
        timestamptz updated_at
    }

    children {
        uuid id PK
        uuid user_id FK
        text name
        date dob
        text photo_url
        text[] allergies
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    events {
        uuid id PK
        uuid user_id FK
        uuid child_id FK
        text title
        timestamptz start_time
        timestamptz end_time
        text location
        text source
        jsonb action_items
        numeric amount_due
        text google_event_id
        text status
        timestamptz created_at
        timestamptz updated_at
    }

    health_records {
        uuid id PK
        uuid user_id FK
        uuid child_id FK
        date visit_date
        text type
        text file_url
        jsonb extracted
        text summary
        timestamptz created_at
        timestamptz updated_at
    }

    activities {
        uuid id PK
        uuid user_id FK
        uuid child_id FK
        text source_url
        text title
        jsonb materials
        int duration_minutes
        int age_min
        int age_max
        jsonb steps
        timestamptz scheduled_for
        timestamptz created_at
        timestamptz updated_at
    }

    tips_saved {
        uuid id PK
        uuid user_id FK
        uuid child_id FK
        text content
        text source
        text category
        timestamptz created_at
    }

    coach_conversations {
        uuid id PK
        uuid user_id FK
        uuid child_id FK
        timestamptz created_at
        timestamptz updated_at
    }

    coach_messages {
        uuid id PK
        uuid conversation_id FK
        text role
        text content
        jsonb sources
        timestamptz created_at
    }

    embeddings {
        uuid id PK
        text content
        text source
        text category
        vector_1024 embedding
        jsonb metadata
        timestamptz created_at
    }
```

### Table Details

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Mirror of Clerk user, stores Google OAuth tokens | `clerk_id`, `google_refresh_token` |
| `children` | Child profiles — the central entity | `name`, `dob`, `allergies[]`, `notes` |
| `events` | Extracted events from Scheduler | `title`, `start_time`, `action_items` (jsonb), `status` |
| `health_records` | Extracted health data from Development Hub | `visit_date`, `type`, `extracted` (jsonb), `file_url` |
| `activities` | Extracted activity plans from Play Lab | `source_url`, `materials` (jsonb), `steps` (jsonb) |
| `tips_saved` | Bookmarked tips from Coach | `content`, `source`, `category` |
| `coach_conversations` | Conversation threads | `child_id` |
| `coach_messages` | Individual messages in conversations | `role`, `content`, `sources` (jsonb) |
| `embeddings` | pgvector embeddings for RAG | `content`, `embedding` (vector 1024), `source` |

## Auth Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant CL as Clerk
    participant MW as Middleware
    participant API as API Route
    participant SB as Supabase

    B->>CL: Sign in (Google OAuth)
    CL->>B: Session cookie + JWT
    B->>MW: Request /dashboard
    MW->>CL: Verify JWT
    CL->>MW: User claims
    MW->>API: Forward (authenticated)
    API->>SB: Query with user_id filter
    SB->>SB: RLS policy check
    SB->>API: Scoped results
    API->>B: Response
```

Clerk handles authentication. The Next.js middleware (`src/middleware.ts`) protects all `(dashboard)` routes. Supabase RLS policies enforce that users can only access their own data — every query must include a `user_id` filter.

## Cross-Quadrant Context Service

The `/api/context/[childId]` endpoint is the intelligence layer that connects all four quadrants. It aggregates:

```
GET /api/context/{childId}
→ {
    child: { name, dob, allergies, notes },
    upcoming_events: [...last 30 days from events table],
    recent_health: [...last 3 from health_records],
    recent_activities: [...last 5 from activities],
    recent_topics: [...last 3 coach conversation topics]
  }
```

This context is injected into every Claude system prompt, enabling personalized responses across all quadrants.

## External API Integrations

| Service | Purpose | Auth Method | Rate Limits | Fallback |
|---|---|---|---|---|
| **Anthropic** (Claude) | All AI extraction and chat | API key (`ANTHROPIC_API_KEY`) | 4,000 RPM (Tier 1) | Queue and retry with exponential backoff |
| **Voyage AI** | Embedding generation for RAG | API key (`VOYAGE_API_KEY`) | 300 RPM (free tier) | Cache embeddings; batch requests |
| **Google Calendar** | Write extracted events | OAuth 2.0 (user consent) | 1,000,000 queries/day | Store events locally; sync on next login |
| **Gmail** | Read school emails (V2) | OAuth 2.0 (user consent) | 250 quota units/user/sec | Email forwarding via Resend (V1) |
| **YouTube Data API** | Video metadata + transcripts | API key (`YOUTUBE_API_KEY`) | 10,000 units/day | Use youtube-transcript npm package for captions |
| **Resend** | Inbound email parsing + notifications | API key (`RESEND_API_KEY`) | 100 emails/day (free) | Manual paste/upload in Scheduler UI |
| **Stripe** | Subscription management | API key (`STRIPE_SECRET_KEY`) | No hard limit | Scaffold only for V1 |
| **Supabase Storage** | File uploads (PDFs, images) | Service role key | 50MB per file | Compress before upload |
