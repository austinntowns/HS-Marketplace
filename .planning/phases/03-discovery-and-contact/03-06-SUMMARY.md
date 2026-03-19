---
phase: 03-discovery-and-contact
plan: "06"
subsystem: browse/search
tags: [text-search, ilike, nuqs, filter-bar, gap-closure]
dependency_graph:
  requires: []
  provides: [text-search-filter]
  affects: [listings-query, FilterBar, BrowsePage]
tech_stack:
  added: []
  patterns: [drizzle-ilike, nuqs-parseAsString, URL-synced-filters]
key_files:
  created: []
  modified:
    - src/lib/listings-query.ts
    - src/components/browse/FilterBar.tsx
    - src/components/browse/BrowsePage.tsx
    - src/__tests__/listings-query.test.ts
decisions:
  - "query field coerced with || undefined in BrowsePage (empty string from nuqs default becomes undefined for getListings)"
  - "ilike applied to listingLocations.name, listingLocations.city, and listings.notes — covers all buyer-visible text fields"
  - "minYearsOpen also implemented (pre-existing test suite required it) as part of same conditions array"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-19"
  tasks_completed: 3
  files_modified: 4
requirements_closed: [DISC-14]
---

# Phase 03 Plan 06: Text Search Filter Summary

**One-liner:** Text search via ilike on location name, city, and notes with URL persistence via nuqs parseAsString.

## What Was Built

Closed the DISC-14 verification gap by adding full text search capability to the browse page:

1. **`getListings` query filter** — Added `query?: string` to `ListingFilters`; when non-empty, applies `or(ilike(name), ilike(city), ilike(notes))` so buyers can search across all relevant text fields case-insensitively. Also added `minYearsOpen?: number` which was required by pre-existing tests from a prior session.

2. **FilterBar search input** — Added `query: parseAsString.withDefault("")` to `useListingFilters()`. Added a text `<input>` with placeholder "Location, city..." before the Type filter. `hasActiveFilters` and `clearAll` both updated to include query.

3. **BrowsePage wiring** — Added `query: rawFilters.query || undefined` to the filters object so the URL param flows through to `getListings`.

## Deviations from Plan

### Auto-handled (pre-existing state from prior sessions)

**1. [Rule 2 - Missing functionality] minYearsOpen already tested, not implemented**
- **Found during:** Task 1 — linter-written tests from session 03-07 already existed in test file
- **Issue:** `minYearsOpen` tests were committed in `b2423fa` but the interface field wasn't in `ListingFilters` yet
- **Fix:** Added `minYearsOpen?: number` to `ListingFilters` and corresponding `lte(listingLocations.openingDate, ...)` condition
- **Files modified:** `src/lib/listings-query.ts`
- **Commit:** adb65b2

**2. [Pre-existing] FilterBar already had minYearsOpen UI**
- Prior session had already added `TIME_OPEN_OPTIONS`, `minYearsOpen` to `useListingFilters`, and the "Open:" select to FilterBar
- No conflict — query field was added cleanly alongside existing minYearsOpen

## Verification

- `npm test` — 94 tests pass (10 test files)
- `npm run build` — succeeds, all routes compile
- `grep -n "ilike" src/lib/listings-query.ts` — confirms import and usage
- `grep -n "query" src/components/browse/FilterBar.tsx` — confirms query in useQueryStates, input, hasActiveFilters, clearAll

## Self-Check: PASSED

Files exist:
- [x] src/lib/listings-query.ts — contains `query?: string` and `ilike`
- [x] src/components/browse/FilterBar.tsx — contains `parseAsString` and `placeholder="Location, city..."`
- [x] src/components/browse/BrowsePage.tsx — contains `query: rawFilters.query || undefined`

Commits exist:
- [x] adb65b2 — feat(03-06): add query field to ListingFilters and getListings
- [x] 5604f3e — feat(03-06): add text search input to FilterBar with URL sync
- [x] 5f20418 — feat(03-06): wire query filter through BrowsePage to getListings
