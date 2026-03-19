---
phase: 02-listings-moderation
plan: 02
subsystem: ui
tags: [react-hook-form, zod, dnd-kit, leaflet, vercel-blob, next-js, drizzle]

# Dependency graph
requires:
  - phase: 02-01-listings-moderation
    provides: "listings/types.ts, listings/schemas.ts, db/schema/listings.ts, /api/upload Vercel Blob endpoint"
provides:
  - "Seller listing creation wizard at /seller/listings/new"
  - "Multi-step form with FormProvider + zodResolver auto-validation"
  - "Draft auto-save via saveDraft server action on each step"
  - "Photo upload with Vercel Blob client upload and progress bars"
  - "Drag-to-reorder photo grid via dnd-kit sortable"
  - "Territory picker with Leaflet map, click-to-set-center, radius slider"
  - "Submission success page at /seller/listings/[id]/submitted"
  - "GET /api/listings and POST /api/listings/draft routes"
  - "Mock seller location data (3 fixtures) simulating internal API"
affects:
  - 02-03-listings-moderation
  - 03-buyer-portal

# Tech tracking
tech-stack:
  added: [react-hook-form, @hookform/resolvers, dnd-kit/core, dnd-kit/sortable, dnd-kit/utilities, react-leaflet, leaflet, nanoid]
  patterns: [multi-step-wizard, FormProvider-context, server-action-auto-save, dynamic-ssr-safe-import, useMapEvents-child-component]

key-files:
  created:
    - src/lib/listings/mock-data.ts
    - src/lib/listings/actions.ts
    - src/app/api/listings/route.ts
    - src/app/api/listings/draft/route.ts
    - src/components/ui/StepIndicator.tsx
    - src/components/listings/LocationSelector.tsx
    - src/components/listings/PhotoUploader.tsx
    - src/components/listings/PhotoGrid.tsx
    - src/components/listings/TerritoryPicker.tsx
    - src/components/listings/MapClickHandler.tsx
    - src/components/listings/ListingWizard.tsx
    - src/components/listings/steps/TypeLocationStep.tsx
    - src/components/listings/steps/FinancialsStep.tsx
    - src/components/listings/steps/PhotosDetailsStep.tsx
    - src/app/seller/layout.tsx
    - src/app/seller/listings/new/page.tsx
    - src/app/seller/listings/[id]/submitted/page.tsx
  modified: []

key-decisions:
  - "MapClickHandler extracted as separate component — react-leaflet useMapEvents hook must run inside MapContainer context; dynamic import prevents SSR errors"
  - "params typed as Promise<{id}> in submitted page — Next.js 15+ async params requirement"
  - "void userId in getSellerLocations — Phase 4 will use real API; suppress unused-param lint warning without removing the arg"

patterns-established:
  - "Pattern 1: Multi-step wizard with FormProvider — all steps share form state via useFormContext, validation via trigger(fieldNames) before advancing"
  - "Pattern 2: Server action auth guard — requireSellerAccess() throws on missing auth or seller role, called at top of every action"
  - "Pattern 3: Draft auto-save on step advance — saveDraft called with current form values before setStep(); returns listingId on first save"
  - "Pattern 4: Dynamic Leaflet imports — all react-leaflet components imported via next/dynamic with ssr:false; MapClickHandler also dynamic to satisfy hook-in-MapContainer rule"
  - "Pattern 5: dnd-kit sortable photo grid — SortableContext with rectSortingStrategy, arrayMove on DragEnd, order field updated by index"

requirements-completed: [LIST-01, LIST-02, LIST-03, LIST-04]

# Metrics
duration: 4min
completed: 2026-03-19
---

# Phase 02 Plan 02: Listing Creation Wizard Summary

**3-step seller wizard with FormProvider, Vercel Blob photo upload + dnd-kit reorder, Leaflet territory picker, and draft auto-save to Postgres on each step**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-19T21:31:00Z
- **Completed:** 2026-03-19T21:35:47Z
- **Tasks:** 5
- **Files modified:** 17

## Accomplishments
- Complete listing creation flow from `/seller/listings/new` to `/seller/listings/[id]/submitted`
- Multi-step form with per-step Zod validation and draft auto-save to DB on each step advance
- Photo upload with Vercel Blob client SDK, progress bars, and dnd-kit drag-to-reorder grid
- Territory picker with Leaflet map (OpenStreetMap tiles), click-to-set-center, 1-50km radius slider
- Mock seller location data (3 Atlanta/Dallas fixtures) simulating Phase 4 internal API

## Task Commits

Each task was committed atomically:

1. **Task 1: Mock location data and listing server actions** - `52236e2` (feat)
2. **Task 2: StepIndicator, LocationSelector, PhotoUploader, PhotoGrid** - `8711c11` (feat)
3. **Task 3: TerritoryPicker with Leaflet map** - `df49f44` (feat)
4. **Task 4: ListingWizard and 3 step components** - `ef8e000` (feat)
5. **Task 5: Seller layout, new listing page, submitted page** - `bf8a982` (feat)

## Files Created/Modified
- `src/lib/listings/mock-data.ts` - 3 mock salon fixtures + EXISTING_HS_LOCATIONS for map context
- `src/lib/listings/actions.ts` - saveDraft (create/update) + submitListing server actions
- `src/app/api/listings/route.ts` - GET seller listings with locations+photos join
- `src/app/api/listings/draft/route.ts` - POST auto-save proxy to saveDraft action
- `src/components/ui/StepIndicator.tsx` - Numbered steps with completion checkmarks and connectors
- `src/components/listings/LocationSelector.tsx` - Multi-select toggle with bundle detection
- `src/components/listings/PhotoUploader.tsx` - Vercel Blob client upload with progress bars
- `src/components/listings/PhotoGrid.tsx` - dnd-kit sortable grid with cover photo badge
- `src/components/listings/TerritoryPicker.tsx` - Leaflet map with circle overlay and radius slider
- `src/components/listings/MapClickHandler.tsx` - useMapEvents child component for click handling
- `src/components/listings/ListingWizard.tsx` - FormProvider container with step state and auto-save
- `src/components/listings/steps/TypeLocationStep.tsx` - Type card picker + LocationSelector/TerritoryPicker
- `src/components/listings/steps/FinancialsStep.tsx` - Auto-populated TTM revenue + asking price inputs
- `src/components/listings/steps/PhotosDetailsStep.tsx` - PhotoUploader + PhotoGrid + assets + notes
- `src/app/seller/layout.tsx` - sellerAccess gate + nav with My Listings/Create Listing
- `src/app/seller/listings/new/page.tsx` - Server page auth check + ListingWizard card
- `src/app/seller/listings/[id]/submitted/page.tsx` - Success state with next-steps checklist

## Decisions Made
- **MapClickHandler as separate dynamic component:** react-leaflet's `useMapEvents` must execute inside MapContainer's React context. The plan's approach of passing `onClick` directly to `MapContainer` doesn't work — click events need a child component using the hook. Created `MapClickHandler.tsx` imported via `next/dynamic` to satisfy both the hook rule and SSR safety.
- **Next.js 15+ async params:** `params` is a `Promise<{id}>` in Next.js 15+; the submitted page uses `await params` instead of the synchronous destructuring shown in the plan.
- **void userId in mock:** TypeScript unused-parameter warning suppressed via `void userId` — argument kept in signature for Phase 4 API integration.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MapClickHandler extracted as separate dynamic component**
- **Found during:** Task 3 (TerritoryPicker implementation)
- **Issue:** The plan used `onClick` prop on `MapContainer` which is not a valid react-leaflet prop. Map click events require `useMapEvents` hook inside a child component that renders inside `MapContainer`.
- **Fix:** Created `src/components/listings/MapClickHandler.tsx` with `useMapEvents` hook; imported it via `next/dynamic` inside `TerritoryPicker.tsx` as a child of `MapContainer`. TerritoryPicker passes `handleMapClick` as a prop.
- **Files modified:** `src/components/listings/TerritoryPicker.tsx`, `src/components/listings/MapClickHandler.tsx` (created)
- **Verification:** MapContainer renders correctly; click handler fires via useMapEvents
- **Committed in:** `df49f44` (Task 3 commit)

**2. [Rule 1 - Bug] Fixed Next.js 15+ async params in submitted page**
- **Found during:** Task 5 (submitted page creation)
- **Issue:** Plan used synchronous `params: { id: string }` destructuring. Next.js 15+ (version 16.2.0 in this project) requires `params: Promise<{ id: string }>` with `await params`.
- **Fix:** Typed params as `Promise<{ id: string }>` and added `const { id } = await params` before use.
- **Files modified:** `src/app/seller/listings/[id]/submitted/page.tsx`
- **Verification:** No TypeScript errors, follows Next.js docs pattern
- **Committed in:** `bf8a982` (Task 5 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - bug)
**Impact on plan:** Both fixes essential for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required for this plan (Vercel Blob was set up in 02-01).

## Next Phase Readiness
- Listing creation wizard is fully functional end-to-end
- Draft auto-save and submission to pending status work
- Ready for Phase 02-03: Admin moderation queue and listing approval/rejection flow
- Seller listings index page (`/seller/listings`) not yet built — needed for "My Listings" nav link to resolve

---
*Phase: 02-listings-moderation*
*Completed: 2026-03-19*

## Self-Check: PASSED

All 17 files confirmed present on disk. All 5 task commits verified in git history.
