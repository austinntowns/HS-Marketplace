---
phase: 03-discovery-and-contact
plan: 01
subsystem: database
tags: [maptiler, nuqs, drizzle, infinite-scroll, server-actions, react-intersection-observer]

requires:
  - phase: 02-listings-moderation
    provides: "listings/listingLocations/listingPhotos Drizzle schema"

provides:
  - "getListings() Server Action with type/state/price/cursor filters"
  - "@maptiler/sdk, @maptiler/geocoding-control, nuqs, react-intersection-observer installed"
  - "NuqsAdapter wrapping root layout for URL-synced filter state"
  - "NEXT_PUBLIC_MAPTILER_API_KEY in env config"

affects:
  - "03-02 and later — browse page UI and map view components use getListings and NuqsAdapter"

tech-stack:
  added:
    - "@maptiler/sdk@3.11.1 — interactive map with markers/popups"
    - "@maptiler/geocoding-control@2.1.7 — location autocomplete search box"
    - "nuqs@2.8.9 — URL-synced filter state with useState-like API"
    - "react-intersection-observer@10.0.3 — sentinel-based infinite scroll trigger"
  patterns:
    - "NuqsAdapter in root layout — required for all nuqs hooks to work in App Router"
    - "PAGE_SIZE+1 query trick — fetch one extra row to detect hasMore for cursor pagination"
    - "vi.hoisted() for mock variables — required when vi.mock factory references outer vars"

key-files:
  created:
    - "src/lib/listings-query.ts — getListings() Server Action"
    - "src/__tests__/listings-query.test.ts — 9 unit tests for getListings"
  modified:
    - "src/app/layout.tsx — NuqsAdapter wrapping, updated metadata"
    - "src/lib/env.ts — NEXT_PUBLIC_MAPTILER_API_KEY client env var"
    - ".env.example — MapTiler key with setup instructions"
    - "package.json — 4 new dependencies"

key-decisions:
  - "getListings joins listingLocations (displayOrder=0) for city/state — actual schema has no state column on listings table"
  - "getListings joins listingPhotos (displayOrder=0) for primaryPhotoUrl — photo table is listingPhotos not photos"
  - "state filter uses inArray on listingLocations.state via join (not listings.state — that column doesn't exist)"
  - "vi.hoisted() pattern required for vitest mock factories that reference outer variables"

patterns-established:
  - "Cursor pagination: store nextCursor as createdAt ISO string; consumer passes it back as cursor param"
  - "Server Action filter building: conditions array + .filter(Boolean) + and(...conditions) pattern"

requirements-completed: [DISC-01, DISC-14]

duration: 3min
completed: 2026-03-19
---

# Phase 3 Plan 01: Discovery Dependencies and Listings Query Summary

**MapTiler/nuqs/react-intersection-observer installed with NuqsAdapter in root layout; getListings() Server Action queries active listings with type/state/price/cursor filters joining listingLocations and listingPhotos**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T22:19:20Z
- **Completed:** 2026-03-19T22:22:25Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Installed all 4 browse page dependencies (@maptiler/sdk, @maptiler/geocoding-control, nuqs, react-intersection-observer)
- NuqsAdapter configured in root layout; NEXT_PUBLIC_MAPTILER_API_KEY added to t3-env client config
- getListings() Server Action with active-status, type, state, price-range, and cursor filters; joins primary location and primary photo; 9 tests pass

## Task Commits

1. **Task 1: Install dependencies and configure NuqsAdapter** - `bebdae0` (chore)
2. **Task 2 RED: Failing tests for listings query** - `e3a0b2c` (test)
3. **Task 2 GREEN: Implement getListings** - `b2b1bbc` (feat)

## Files Created/Modified

- `src/lib/listings-query.ts` — getListings() Server Action with ListingFilters/ListingCard types
- `src/__tests__/listings-query.test.ts` — 9 unit tests using vi.hoisted mock pattern
- `src/app/layout.tsx` — NuqsAdapter wrapper, updated metadata title/description
- `src/lib/env.ts` — NEXT_PUBLIC_MAPTILER_API_KEY added to client config section
- `.env.example` — MapTiler API key with setup instructions
- `package.json` — 4 new dependencies added

## Decisions Made

- `getListings` joins `listingLocations` (displayOrder=0) for city/state/locationName — the plan's interface showed these on `listings` directly but the actual Phase 2 schema put location data in a separate table
- State filter uses `inArray(listingLocations.state, states)` via the join rather than a listings column
- Photo join targets `listingPhotos.displayOrder = 0` for cover photo (field is `displayOrder` not `order`)
- `vi.hoisted()` pattern adopted for vitest mocks — required when factory function references variables declared outside the factory

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adapted schema references to match actual Phase 2 schema**
- **Found during:** Task 2 (create listings query)
- **Issue:** Plan interface showed `state`, `city`, `locationName`, `latitude`, `longitude` on `listings` table, but actual Phase 2 schema stores this data in `listingLocations` table; plan also showed `photos` table with `order` field, but actual table is `listingPhotos` with `displayOrder`
- **Fix:** Added LEFT JOINs to both `listingLocations` (displayOrder=0) and `listingPhotos` (displayOrder=0); adjusted filter for state to use `listingLocations.state`; updated select columns to match actual field names
- **Files modified:** `src/lib/listings-query.ts`
- **Verification:** 9 tests pass including leftJoin call count assertion
- **Committed in:** b2b1bbc (Task 2 feat commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - schema reference bug)
**Impact on plan:** Fix was necessary — plan was written against a simplified schema diagram, not the actual implemented schema. No scope creep.

## Issues Encountered

- vitest 4.1.0 requires Node 20+; shell PATH pointed to Node 18 — used `PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"` prefix for all test runs. This is a pre-existing environment configuration issue, not introduced by this plan.

## User Setup Required

**MapTiler requires manual API key provisioning:**

1. Create account at https://cloud.maptiler.com
2. Go to Account → API Keys → Create new key
3. Add `NEXT_PUBLIC_MAPTILER_API_KEY=<your_key>` to `.env.local`
4. After deploying: restrict key to production domain in MapTiler Cloud → API Keys → Edit → Allowed URLs → add `marketplace.hellosugar.salon`

## Next Phase Readiness

- All browse page dependencies installed and configured
- `getListings()` ready for consumption by browse page list and map view components
- NuqsAdapter in root layout — `useQueryStates` and all nuqs hooks will work immediately in any client component
- Next: 03-02 browse page UI (ListingCard, ListingGrid with infinite scroll, FilterBar with nuqs)

## Self-Check: PASSED

All created files exist on disk. All 3 task commits verified in git log.

---
*Phase: 03-discovery-and-contact*
*Completed: 2026-03-19*
