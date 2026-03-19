---
phase: 03-discovery-and-contact
plan: "07"
subsystem: ui
tags: [nuqs, drizzle-orm, filtering, browse, react]

# Dependency graph
requires:
  - phase: 03-discovery-and-contact
    provides: ListingFilters interface in listings-query.ts; FilterBar with useListingFilters; BrowsePage wiring pattern
provides:
  - minYearsOpen field in ListingFilters interface with openingDate lte filter in getListings
  - TIME_OPEN_OPTIONS dropdown in FilterBar synced to URL via nuqs minYearsOpen param
  - BrowsePage passes minYearsOpen from URL to getListings
affects: [browse, listings-query, filter-state]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "parseAsInteger in useListingFilters for numeric URL params with null-to-undefined coercion in BrowsePage"
    - "lte(openingDate, cutoffDate) using Date.now() - N*365.25*24*60*60*1000 for years-open calculation"

key-files:
  created: []
  modified:
    - src/lib/listings-query.ts
    - src/components/browse/FilterBar.tsx
    - src/components/browse/BrowsePage.tsx
    - src/__tests__/listings-query.test.ts

key-decisions:
  - "minYearsOpen uses 365.25-day year approximation for cutoff date calculation (handles leap years reasonably)"

patterns-established:
  - "Time-open filter: value=0 means Any (no filter); values 1/2/3/5 mean at least N years"

requirements-completed: [DISC-06]

# Metrics
duration: 3min
completed: "2026-03-19"
---

# Phase 03 Plan 07: Time-Open Filter (Gap Closure) Summary

**Time-open filter added to browse page — buyers can filter listings by how long a location has been open (1+, 2+, 3+, 5+ years) with URL persistence via nuqs and openingDate lte comparison in Drizzle**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T23:50:42Z
- **Completed:** 2026-03-19T23:53:15Z
- **Tasks:** 3 (plus TDD RED commit)
- **Files modified:** 4

## Accomplishments
- Added `minYearsOpen?: number` to ListingFilters with openingDate lte filter (already partially in place from prior session)
- Added TIME_OPEN_OPTIONS dropdown to FilterBar with "Any / 1+ / 2+ / 3+ / 5+ years" options
- URL param `minYearsOpen` synced via nuqs `parseAsInteger` and wired through BrowsePage
- 3 new tests for minYearsOpen behavior; all 94 tests pass; build clean

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Add failing tests for minYearsOpen** - `b2423fa` (test)
2. **Task 2: Add time-open filter dropdown to FilterBar** - `f4f8e44` (feat)
3. **Task 3: Wire minYearsOpen through BrowsePage** - `1d85439` (feat)

_Note: Task 1 GREEN phase found listings-query.ts already had the minYearsOpen implementation from a prior session. Tests passed on first run._

## Files Created/Modified
- `src/lib/listings-query.ts` - minYearsOpen in ListingFilters; openingDate lte filter in getListings (was already implemented)
- `src/components/browse/FilterBar.tsx` - TIME_OPEN_OPTIONS constant; minYearsOpen in useListingFilters; Open: dropdown; hasActiveFilters and clearAll updated
- `src/components/browse/BrowsePage.tsx` - minYearsOpen: rawFilters.minYearsOpen ?? undefined in filters object
- `src/__tests__/listings-query.test.ts` - 3 new tests for minYearsOpen filter behavior

## Decisions Made
- minYearsOpen = 0 treated as "Any" (no filter) — consistent with the TIME_OPEN_OPTIONS design where value: 0 maps to "Any"
- Uses 365.25 * 24 * 60 * 60 * 1000 ms per year to handle leap years reasonably

## Deviations from Plan

None - plan executed exactly as written. The implementation in listings-query.ts was already in place from a prior session; tests validated it correctly.

## Issues Encountered
- Node.js v18 (system default) incompatible with vitest v4.1.0 (`styleText` export missing from `node:util`). Resolved by activating Node 20 via nvm — consistent with how prior plans ran tests.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- DISC-06 gap closure complete — time-open filter fully implemented end-to-end
- Browse page now has: type, state, price range, time-open, sort, and text search filters
- All filters URL-persisted via nuqs

---
*Phase: 03-discovery-and-contact*
*Completed: 2026-03-19*
