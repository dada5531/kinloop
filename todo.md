# KINLOOP Full-Stack Upgrade

## Phase 1: Infrastructure
- [x] Upgrade to web-db-user (backend + database)
- [x] Set up database schema (children, events, health_records, activities, coach_chunks, coach_conversations)
- [x] Add Anthropic SDK dependency (using built-in Forge LLM)
- [x] Configure environment secrets (using built-in Forge API keys)

## Phase 2: Backend API Routes
- [x] tRPC scheduler.extract — Claude extraction for emails/PDFs/images
- [x] tRPC playLab.extractFromUrl — Extract activity from URL/text
- [x] tRPC context.summary — Cross-quadrant context
- [x] tRPC coach.chat — RAG-powered coach chat
- [x] tRPC upload.file — File upload to S3 storage
- [x] tRPC children.list / children.create — Child management
- [x] tRPC development.extractHealth — Health record extraction
- [x] tRPC development.askAboutChild — Health Q&A

## Phase 3: Scheduler (real AI)
- [x] Paste text → Claude extraction
- [x] Review UI with extracted events, action items, amounts, reply
- [x] Approve → save to events table
- [x] File upload (PDF/image) → S3 → Claude extraction (multimodal: images via image_url, PDFs via file_url)

## Phase 4: Development Hub (real AI)
- [x] Upload pediatrician summary / school report (paste text)
- [x] Claude extraction of health data
- [x] Growth chart from real data
- [x] Growth data stats (weight, height, percentiles)
- [x] "Ask about child" chat with health records context

## Phase 5: Play Lab (real AI)
- [x] URL paste → detect platform
- [x] YouTube transcript extraction (fixed ESM import)
- [x] Claude extraction of activity plan
- [x] Materials with Amazon search links
- [x] Save to activities table
- [x] Age-appropriateness warning

## Phase 6: Coach (RAG)
- [x] Seed parenting corpus (41 chunks from books/AAP — sufficient for demo, expandable)
- [x] RAG retrieval + Claude chat
- [x] Source citations in responses
- [x] Conversation history persistence

## Phase 7: Cross-quadrant + Polish
- [x] Context endpoint aggregating all tables
- [x] Dashboard 2x2 grid with real data
- [x] Onboarding flow for new users
- [x] Fix growth data extraction (ageMonths fallback)

## Phase 8: Deliver
- [x] Final end-to-end regression of all quadrants after fixes
- [x] 19 vitest tests passing
- [x] Final checkpoint
- [x] Guide user to export to GitHub

## Phase 9: File Upload E2E Verification
- [x] Upload dialog UI (drag-and-drop, click-to-upload)
- [x] Image upload → S3 → multimodal AI extraction (tested with permission slip image)
- [x] Extracted event, action items, payment, suggested reply from image
