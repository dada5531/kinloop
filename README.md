# KINLOOP

[![CI](https://github.com/dada5531/kinloop/actions/workflows/ci.yml/badge.svg)](https://github.com/dada5531/kinloop/actions/workflows/ci.yml)

KINLOOP is a 4-quadrant AI dashboard that turns the chaos of modern parenting — emails, PDFs, doctor notes, social links — into structured calendars, shopping lists, and personalized guidance.

## The 4 Quadrants

**Scheduler** — Forward a school email or upload a permission slip. Claude extracts every event, action item, and payment due date, then writes them to your Google Calendar.

**Development Hub** — Upload a pediatrician after-visit summary. Claude extracts growth data, milestones, and immunizations. See your child's growth plotted against WHO percentile curves.

**Play Lab** — Paste a YouTube link of a kids' activity. Claude generates a structured plan with step-by-step instructions, a materials shopping list, and age-appropriateness checks.

**Coach** — Ask any parenting question. A RAG pipeline retrieves relevant passages from evidence-based parenting books and returns cited, personalized guidance grounded in your child's context.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (Postgres + Storage + pgvector) |
| Auth | Clerk |
| AI | Anthropic SDK (claude-sonnet-4-5) |
| Embeddings | Voyage AI (voyage-3-lite) |
| Email | Resend (inbound + outbound) |
| Payments | Stripe (scaffold) |
| Deploy | Vercel |
| Package Manager | pnpm |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint + Prettier + Husky |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/dada5531/kinloop.git
cd kinloop

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see .env.example for instructions)

# Start Supabase locally
supabase start
# Run the initial migration
supabase db reset

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
kinloop/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components (ui/, dashboard/, quadrant-specific)
│   ├── lib/              # Shared libraries (anthropic, supabase, extractors, rag)
│   ├── types/            # TypeScript type definitions
│   └── middleware.ts      # Clerk auth middleware
├── supabase/             # Migrations, seed data, config
├── prompts/              # Versioned Claude prompts (markdown)
├── docs/                 # API integration docs, prompt engineering notes, demo script
├── tests/                # Unit and E2E tests
└── .github/              # CI/CD workflows, issue templates, PR template
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Start here if you are an AI coding agent or new contributor. Explains the project architecture, code conventions, and what to build next.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System diagrams, data model, auth flow, extraction pipeline, and external API integrations.
- **[ROADMAP.md](./ROADMAP.md)** — V1 (now), V2 (next), and post-HBS feature roadmap.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Branch strategy, commit conventions, and PR workflow.

## License

MIT
