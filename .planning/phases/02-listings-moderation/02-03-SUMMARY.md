---
phase: 02-listings-moderation
plan: 03
subsystem: ui
tags: [seller-dashboard, status-badges, listing-management, action-tokens, jose, cron, drizzle, next-js]

# Dependency graph
requires:
  - phase: 02-01-listings-moderation
    provides: "listings/types.ts, db/schema/listings.ts, status-machine.ts, email.ts"
  - phase: 02-02-listings-moderation
    provides: "saveDraft, submitListing, ListingWizard, PhotoUploader, PhotoGrid"
provides:
  - "Seller dashboard at /seller/listings with status-badged card grid"
  - "Single-listing detail view at /seller/listings/[id] with analytics sidebar"
  - "Edit flow at /seller/listings/[id]/edit with auto-resubmit for rejected listings"
  - "POST /api/listings/[id]/status endpoint for client-side status changes"
  - "JWT-signed one-click action tokens via jose for mark-sold/confirm-active"
  - "GET /api/actions/[token] one-click email action handler"
  - "/action-complete confirmation page"
  - "GET /api/cron/reminders: 30-day stale listing reminder with mark-sold link in email"
  - "vercel.json cron schedule (daily at 9am UTC)"
affects:
  - 02-04-listings-moderation
  - 03-buyer-portal

# Tech tracking
tech-stack:
  added: [jose]
  patterns: [action-token-jwt, cron-secret-auth, async-searchParams, auto-resubmit-on-edit]

key-files:
  created:
    - src/components/listings/StatusBadge.tsx
    - src/components/listings/ListingCard.tsx
    - src/components/listings/ListingActions.tsx
    - src/components/listings/ListingEditForm.tsx
    - src/app/seller/listings/page.tsx
    - src/app/seller/listings/[id]/page.tsx
    - src/app/seller/listings/[id]/edit/page.tsx
    - src/app/api/listings/[id]/status/route.ts
    - src/lib/listings/action-tokens.ts
    - src/app/api/actions/[token]/route.ts
    - src/app/action-complete/page.tsx
    - src/app/api/cron/reminders/route.ts
    - vercel.json
  modified:
    - src/lib/listings/actions.ts
    - src/lib/env.ts
    - src/lib/email.ts

key-decisions:
  - "searchParams typed as Promise in action-complete page — Next.js 15+ async searchParams requirement, same pattern as async params"
  - "CRON_SECRET added to env schema alongside ACTION_TOKEN_SECRET — both needed for secure cron invocation and JWT signing"
  - "markSoldUrl passed through to sendReminderEmail — email template updated to include one-click green button; ReminderEmailData interface extended with optional markSoldUrl"
  - "async params (Promise<{id}>) used in all dynamic routes — consistent with Next.js 16.2.0 requirement established in 02-02"

patterns-established:
  - "Pattern 6: JWT action tokens with jose — SignJWT + jwtVerify for no-login email actions; executeAction validates transition via status-machine before DB update"
  - "Pattern 7: Cron route with Bearer secret — CRON_SECRET in Authorization header matches Vercel cron invocation pattern"
  - "Pattern 8: Auto-resubmit on edit — updateListing checks listing.status === 'rejected' after saveDraft and sets status to pending, clears rejectionReason"

requirements-completed: [LIST-14, LIST-15, LIST-16, LIST-20, LIST-21]

# Metrics
duration: 4min
completed: 2026-03-19
---

# Phase 02 Plan 03: Seller Listing Management Summary

**Seller dashboard with status-badged listing cards, edit flow with auto-resubmit for rejected listings, JWT-signed one-click email action tokens, and 30-day reminder cron job**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T21:38:55Z
- **Completed:** 2026-03-19T21:43:00Z
- **Tasks:** 4
- **Files modified:** 16 (13 created, 3 modified)

## Accomplishments

- Complete seller listing management lifecycle: view, edit, mark-sold, delist
- Status badge component with 6 status colors used across card grid and detail view
- ListingCard rejection banner: shows admin reason + "Edit to resubmit" CTA
- Edit form auto-resubmits rejected listings to pending on save
- Client-side action buttons (mark sold, delist, relist) via POST /api/listings/[id]/status
- jose JWT-signed action tokens for no-login email links (7-day expiry)
- 30-day reminder cron sends email with one-click Mark as Sold button embedded
- Cron protected by CRON_SECRET Bearer token; vercel.json configures daily 9am UTC schedule

## Task Commits

Each task was committed atomically:

1. **Task 1: StatusBadge and ListingCard** - `75c0238` (feat)
2. **Task 2: Seller dashboard and detail pages** - `01abe5c` (feat)
3. **Task 3: Edit form, status API, actions.ts update** - `9159cc3` (feat)
4. **Task 4: Action tokens, cron, vercel.json** - `3a60104` (feat)

## Files Created/Modified

- `src/components/listings/StatusBadge.tsx` - 6-color status badge (draft/pending/active/rejected/sold/delisted)
- `src/components/listings/ListingCard.tsx` - Card with photo, status overlay, analytics, rejection banner
- `src/components/listings/ListingActions.tsx` - Client dropdown for mark-sold/delist/relist with confirm dialog
- `src/components/listings/ListingEditForm.tsx` - react-hook-form edit form with resubmit warning banner
- `src/app/seller/listings/page.tsx` - Dashboard: empty state, single-listing redirect, multi-listing grid
- `src/app/seller/listings/[id]/page.tsx` - Detail: photos, locations, analytics sidebar, action buttons
- `src/app/seller/listings/[id]/edit/page.tsx` - Edit page: DB-to-form transform, auth gate
- `src/app/api/listings/[id]/status/route.ts` - POST status change endpoint
- `src/lib/listings/action-tokens.ts` - createActionToken, verifyActionToken, executeAction via jose
- `src/app/api/actions/[token]/route.ts` - One-click email action handler with redirect to /action-complete
- `src/app/action-complete/page.tsx` - Success/failure confirmation page
- `src/app/api/cron/reminders/route.ts` - 30-day stale listing finder + reminder sender
- `vercel.json` - Cron schedule: 0 9 * * * -> /api/cron/reminders
- `src/lib/listings/actions.ts` - Added updateListing (auto-resubmit) + changeListingStatus (transition validation)
- `src/lib/env.ts` - Added ACTION_TOKEN_SECRET and CRON_SECRET to schema
- `src/lib/email.ts` - Extended ReminderEmailData with markSoldUrl; updated template to include one-click sold button

## Decisions Made

- **async searchParams in action-complete:** Next.js 16.2.0 requires `searchParams` as `Promise<{...}>` same as `params`. Applied consistently across all new pages.
- **markSoldUrl threaded into email:** The plan called for one-click mark-sold links but the email template didn't include it. Extended `ReminderEmailData` with optional `markSoldUrl` and updated the template to conditionally render a green "Mark as Sold" button.
- **CRON_SECRET added to env schema:** Added alongside `ACTION_TOKEN_SECRET` — both are secrets needed for secure operation (cron protection + JWT signing).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] One-click mark-sold URL not wired into email template**
- **Found during:** Task 4
- **Issue:** The cron route generated `markSoldToken` and `markSoldUrl` but called `sendReminderEmail` without passing the URL. The existing `ReminderEmailData` interface had no `markSoldUrl` field, and the email template had no mark-sold button — defeating the plan's core requirement of "one-click Mark as Sold link in email."
- **Fix:** Extended `ReminderEmailData` with optional `markSoldUrl` field; updated `sendReminderEmail` template to include a green "Mark as Sold" button when URL is present; passed `markSoldUrl` from cron route to email function.
- **Files modified:** `src/lib/email.ts`, `src/app/api/cron/reminders/route.ts`
- **Commit:** `3a60104` (Task 4 commit)

**2. [Rule 1 - Bug] async searchParams in action-complete page**
- **Found during:** Task 4
- **Issue:** Plan used synchronous `searchParams: { success?: string; message?: string }`. Next.js 15+ requires `searchParams` as a Promise.
- **Fix:** Typed `searchParams` as `Promise<{success?: string; message?: string}>` and added `const resolvedParams = await searchParams`.
- **Files modified:** `src/app/action-complete/page.tsx`
- **Commit:** `3a60104` (Task 4 commit)

---

**Total deviations:** 2 auto-fixed (1 Rule 2 - missing critical functionality, 1 Rule 1 - bug)
**Impact on plan:** Both fixes were essential for correctness. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

Before deploying, add to environment variables:
- `ACTION_TOKEN_SECRET` — minimum 32 characters, used to sign/verify JWT action tokens
- `CRON_SECRET` — minimum 16 characters, used in Vercel cron Authorization header

## Next Phase Readiness

- Seller can fully manage listing lifecycle: view, edit, mark-sold, delist
- Edit flow auto-resubmits rejected listings — admin queue will receive resubmissions
- One-click email tokens ready for integration with 30-day reminder emails
- Ready for Phase 02-04: Admin moderation queue (approve/reject) and admin listing management

---
*Phase: 02-listings-moderation*
*Completed: 2026-03-19*

## Self-Check: PASSED

All 13 created files confirmed present on disk. All 4 task commits verified in git history (75c0238, 01abe5c, 9159cc3, 3a60104).
