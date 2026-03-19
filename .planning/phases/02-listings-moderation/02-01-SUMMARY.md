---
phase: 02-listings-moderation
plan: 01
subsystem: database
tags: [drizzle, zod, react-hook-form, vercel-blob, typescript, status-machine, vitest]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: auth schema (users table), env.ts pattern, db/index.ts setup

provides:
  - Drizzle schema for listings, listingLocations, listingPhotos tables
  - TypeScript types for listings domain (ListingStatus, ListingType, ListingFormData, Photo)
  - Zod validation schemas for wizard steps (typeLocation, financials, photosDetails)
  - Status machine with role-based transition enforcement
  - Vercel Blob upload endpoint with seller auth check
  - Client-side image compression utility
affects:
  - 02-02 (listing wizard form uses these schemas)
  - 02-03 (admin moderation queue uses status machine)
  - 02-04 (status transitions use canTransition)

# Tech tracking
tech-stack:
  added:
    - react-hook-form@7.71.2 (form state management)
    - "@hookform/resolvers@5.2.2" (zod integration)
    - "@vercel/blob@2.3.1" (photo storage)
    - "@dnd-kit/core@6.3.1" (drag-drop foundation)
    - "@dnd-kit/sortable@10.0.0" (sortable photo grid)
    - "@dnd-kit/utilities" (CSS transform helpers)
    - browser-image-compression@2.0.2 (client-side compress)
    - jose@6.2.2 (edge-compatible JWT for email action links)
    - nanoid@5.1.5 (photo ID generation)
    - "@types/leaflet" (TypeScript types for map)
  patterns:
    - Per-step Zod schema validation (typeLocationSchema, financialsSchema, photosDetailsSchema)
    - Lightweight status machine (TRANSITIONS array + canTransition + getAvailableActions)
    - Vercel Blob client upload with server-side auth gate

key-files:
  created:
    - src/db/schema/listings.ts
    - src/lib/listings/types.ts
    - src/lib/listings/schemas.ts
    - src/lib/listings/status-machine.ts
    - src/lib/upload/compress.ts
    - src/app/api/upload/route.ts
    - src/__tests__/listings/schemas.test.ts
    - src/__tests__/listings/status-machine.test.ts
  modified:
    - src/lib/env.ts (added BLOB_READ_WRITE_TOKEN)
    - package.json (added 9 new dependencies)

key-decisions:
  - "Phase 1 listings.ts replaced entirely — Phase 1 schema was simplified placeholder; Plan 02-01 requires listingLocations and listingPhotos tables with expanded fields"
  - "listingStatusEnum and listingTypeEnum remain in enums.ts (Phase 1 decision) — listings.ts imports from enums.ts rather than re-exporting"
  - "Territory validation uses superRefine to check lat/lng/radius only on territory-type locations, allowing mixed bundles"
  - "listingSchema uses .and() chaining instead of .merge() — Zod 4 compatible approach for combining schemas with superRefine"
  - "BLOB_READ_WRITE_TOKEN added to env.ts server schema — required for Vercel Blob operations"

patterns-established:
  - "Pattern: Zod per-step schemas — each wizard step has its own schema (typeLocationSchema, financialsSchema, photosDetailsSchema), merged into listingSchema"
  - "Pattern: Status machine as TRANSITIONS array — canTransition(from, to, role) and getAvailableActions(status, role) derived from single source of truth"
  - "Pattern: Vercel Blob client upload — POST /api/upload handles token generation with auth check, client uses @vercel/blob/client upload()"

requirements-completed:
  - LIST-05
  - LIST-06
  - LIST-07
  - LIST-08
  - LIST-10
  - LIST-11
  - LIST-12
  - LIST-13
  - LIST-22
  - LIST-23

# Metrics
duration: 3min
completed: 2026-03-19
---

# Phase 02 Plan 01: Data Foundation Summary

**Drizzle listing schema (listings + listingLocations + listingPhotos), Zod wizard schemas with territory validation, role-based status machine, and Vercel Blob upload endpoint**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T21:23:29Z
- **Completed:** 2026-03-19T21:26:57Z
- **Tasks:** 4
- **Files modified:** 10

## Accomplishments

- Drizzle schema with three tables: `listings` (asking price, assets, analytics), `listingLocations` (salon + territory types with auto-populated fields), `listingPhotos` (url, filename, displayOrder)
- Zod schemas for all three wizard steps with territory field validation via `superRefine`
- Status machine enforcing 7 transitions with role-based permissions (seller vs admin)
- Vercel Blob upload endpoint requiring seller access, accepting jpeg/png/webp up to 10MB
- 34 unit tests passing across schemas and status machine

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create Drizzle listing schema** - `76a3396` (feat)
2. **Task 2: Create TypeScript types, Zod validation schemas, and status machine** - `c066b21` (feat)
3. **Task 3: Create Vercel Blob upload endpoint and image compression utility** - `44c26b2` (feat)
4. **Task 4: Create test files for schemas and status machine** - `23b931b` (test)

## Files Created/Modified

- `src/db/schema/listings.ts` - Listings, listingLocations, listingPhotos Drizzle tables with relations
- `src/lib/listings/types.ts` - ListingStatus, ListingType, LocationType, Photo, LocationSelection, ListingFormData
- `src/lib/listings/schemas.ts` - Per-step Zod schemas + listingSchema + getFieldsForStep helper
- `src/lib/listings/status-machine.ts` - TRANSITIONS, canTransition, getAvailableActions
- `src/lib/upload/compress.ts` - Client-side image compression to webp using browser-image-compression
- `src/app/api/upload/route.ts` - Vercel Blob handleUpload with seller auth check
- `src/lib/env.ts` - Added BLOB_READ_WRITE_TOKEN to server env schema
- `src/__tests__/listings/schemas.test.ts` - 15 tests for Zod schemas
- `src/__tests__/listings/status-machine.test.ts` - 19 tests for status machine

## Decisions Made

- Replaced Phase 1's simplified `listings.ts` with the full Phase 2 schema (adds `listingLocations` and `listingPhotos` tables, restructures `listings` columns)
- Used `superRefine` for territory validation instead of `discriminatedUnion` — allows mixed bundles where only territory-type locations require lat/lng/radius
- Used Zod `.and()` chaining instead of `.merge()` for the combined listingSchema to maintain superRefine validation in Zod 4
- Left enums in `enums.ts` per Phase 1 decision (correct Drizzle migration ordering)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- `db:generate` requires TTY for interactive column conflict resolution (renamed/restructured columns from Phase 1 schema). The schema is valid; migration must be run interactively when connecting to a real database. Not a blocker for this plan.
- Node.js 18 is incompatible with Vitest 4 (`node:util styleText` not available). Tests run correctly under Node 20. No code change needed; environment issue only.

## User Setup Required

Add `BLOB_READ_WRITE_TOKEN` to your `.env.local` file:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Get this token from: Vercel Dashboard > Storage > Blob Store > Settings.

## Next Phase Readiness

- All data contracts are established — wizard form, status transitions, and photo uploads can be built
- `listingSchema` ready for react-hook-form zodResolver integration
- `canTransition` ready for API route status change validation
- Upload endpoint ready for PhotoUploader component integration

---
*Phase: 02-listings-moderation*
*Completed: 2026-03-19*

## Self-Check: PASSED

All 9 files verified present. All 4 task commits verified in git history.
