# v1.6.4 Error Handling Audit

## Silent `catch {}` Blocks (39 instances across 16 files)

### Dashboard Pages (user-facing — HIGH priority)
| File | Line | Context |
|------|------|---------|
| scheduler/page.tsx | 208 | File upload parsing |
| scheduler/page.tsx | 464 | handleApproveExtracted — single event |
| scheduler/page.tsx | 515 | handleBatchApproveAll |
| scheduler/page.tsx | 531 | handleUpdateStatus |
| scheduler/page.tsx | 567 | handleSendToCalendar (has separate calendarError state) |
| coach/page.tsx | 202 | Fetch daily tip |
| coach/page.tsx | 236 | Fetch chat history |
| coach/page.tsx | 296 | Send chat message |
| development/page.tsx | 552 | Log measurement |
| development/page.tsx | 758 | Toggle milestone |
| development/page.tsx | 812 | Delete measurement |
| development/page.tsx | 834 | Delete milestone |
| play/page.tsx | 451 | Generate activity |
| play/page.tsx | 553 | Save activity |
| play/page.tsx | 636 | Schedule activity (inner) |
| play/page.tsx | 650 | Schedule activity (outer) |
| dashboard/page.tsx | 89 | Fetch dashboard data |
| settings/page.tsx | 45 | Update child profile |
| settings/page.tsx | 75 | Upload photo |

### API Routes (server-side — MEDIUM priority)
| File | Line | Context |
|------|------|---------|
| api/coach/chat/route.ts | 118 | Parse events context |
| api/extract/activity/route.ts | 93 | Child context fetch |
| api/extract/health/route.ts | 36 | Child context fetch |
| api/extract/scheduler/route.ts | 41 | Child context fetch |
| api/scheduler/send-calendar/route.ts | 170 | Calendar invite |

### Components (UI — MEDIUM priority)
| File | Line | Context |
|------|------|---------|
| WelcomePhotoUploader.tsx | 95 | Photo upload |
| dashboard/TopBar.tsx | 70 | Fetch events for badge |

### Library Code (LOW priority — intentional fallbacks)
| File | Lines | Context |
|------|-------|---------|
| content-fetcher.ts | 40,52,71,104,133,162,190,238,242,285 | URL content fetching — fallback chain |
| supabase/server.ts | 31 | Cookie parsing |
| enter/page.tsx | 51 | Password verification |

## Unsafe `new Date(variable)` Calls (44 instances across 13 files)

### Critical — used with .toISOString() (can throw RangeError)
| File | Line | Expression |
|------|------|------------|
| scheduler/page.tsx | 424 | `new Date(evt.startDate).toISOString()` |
| scheduler/page.tsx | 425 | `new Date(evt.endDate).toISOString()` |
| scheduler/page.tsx | 486 | `new Date(evt.startDate).toISOString()` (batch) |
| scheduler/page.tsx | 487 | `new Date(evt.endDate).toISOString()` (batch) |
| calendar/send-invite.ts | 120,125,139,140 | `new Date(evt.startDate).toLocaleDateString()` |
| calendar/ics-generator.ts | 22 | `new Date(isoDate)` |
| api/scheduler/send-calendar/route.ts | 77 | `new Date(evt.startDate).toLocaleDateString()` |

### Medium — display only (shows "Invalid Date" but doesn't crash)
| File | Lines | Expression |
|------|-------|------------|
| scheduler/page.tsx | 913,982,989 | `new Date(evt.start_time).toLocaleDateString()` |
| play/page.tsx | 582,706,707,709,710,734,740,784,1241,1261,1267,1481,1482 | Various scheduled_for dates |
| development/page.tsx | 112,117,277,278,317,318,434 | DOB and measurement dates |
| dashboard/page.tsx | 172,205 | Event and health record dates |
| coach/chat/route.ts | 74 | Event date in context |
| TopBar.tsx | 58,61 | Event dates for badge |
| ChildProvider.tsx | 63 | DOB |
| use-children.ts | 55 | DOB |
| prompts.ts | 36 | DOB |
| api/coach/daily/route.ts | 24 | DOB |
| api/context/[childId]/route.ts | 44 | DOB |

## Fix Strategy

### content-fetcher.ts — SKIP
These are intentional fallback chains for URL content fetching. The catch blocks try progressively simpler fetch strategies. Adding error toasts here would spam the user. Leave as-is but add console.warn for debugging.

### supabase/server.ts — SKIP
Cookie parsing fallback. Intentional.

### enter/page.tsx — LIGHT FIX
Password verification. Add a toast for network errors only.

### All dashboard pages — FULL FIX
Replace every silent catch with:
1. Structured console.error
2. Specific error toast
3. State reset where needed

### All unsafe new Date() — FULL FIX
Replace with safeISODate() for .toISOString() calls.
For display-only calls, wrap in a safeFormatDate() helper that returns "Date pending" instead of "Invalid Date".
