# Claude Prompt Engineering Notes

## Overview

All Claude prompts are versioned markdown files stored in `/prompts/`. This document tracks the rationale behind prompt design decisions and records changes over time.

## Design Principles

1. **Structured output via tool_use.** Every extraction prompt uses Anthropic's `tool_use` feature with a strict JSON schema. This is more reliable than asking Claude to return JSON in a message — tool_use guarantees schema compliance.

2. **Separation of concerns.** System prompts handle persona and constraints. User messages contain the raw content. Child context is injected between them. Never mix instructions with content.

3. **Confidence scoring.** Every extraction returns a `confidence` field (0-1). The UI uses this to flag low-confidence extractions for manual review. Threshold: below 0.5 triggers a review banner.

4. **Cross-quadrant context injection.** Every Claude call includes the child's full context from `/api/context/[childId]`. This is the platform thesis — the AI knows the whole child, not just the current document.

## Prompt Files

| File | Quadrant | Purpose | Version |
|---|---|---|---|
| `scheduler-extraction.md` | Q1 Scheduler | Extract events, action items, payments from school communications | 1.0.0 |
| `health-extraction.md` | Q2 Development | Extract health data from pediatrician summaries | 1.0.0 |
| `activity-extraction.md` | Q3 Play Lab | Extract activity plans from video/social content | 1.0.0 |
| `coach-system.md` | Q4 Coach | RAG-powered parenting advice with source citations | 1.0.0 |

## Change Log

| Date | Prompt | Change | Rationale |
|---|---|---|---|
| 2026-04-24 | All | Initial versions | Baseline prompts for V1 scaffold |

## How to Update Prompts

1. Edit the markdown file in `/prompts/`
2. Bump the version number in the file header
3. Add an entry to the Change Log table above
4. Update the corresponding Zod schema in `/src/lib/extractors/` if the output schema changed
5. Add or update the unit test fixture in `/tests/unit/fixtures/`
6. Note the change in your PR description
