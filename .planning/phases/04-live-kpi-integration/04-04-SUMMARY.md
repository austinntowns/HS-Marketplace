---
phase: 04-live-kpi-integration
plan: "04"
subsystem: listing-detail
tags: [kpi, listing-detail, gap-closure, wiring]
dependency_graph:
  requires: [04-03]
  provides: [live-kpi-pipeline-end-to-end]
  affects: [src/app/listings/[id]/page.tsx]
tech_stack:
  added: []
  patterns: [Server Component prop derivation, conditional prop mapping]
key_files:
  created: []
  modified:
    - src/app/listings/[id]/page.tsx
    - src/lib/kpi/fetch.ts
decisions:
  - "locationId passed as undefined for territory/bundle types — KpiSection handles null returns internally"
  - "salon locations in bundles map to type='suite' (conservative) — KpiSection only uses type to filter territories"
  - "Zod .errors fixed to .issues — property name from ZodError API"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-19"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 2
requirements: [LIST-17, LIST-18, LIST-19]
---

# Phase 04 Plan 04: KpiSection Wired into Listing Detail Page Summary

**One-liner:** Replaced KpiPlaceholder stub with live KpiSection in listing detail page, correctly mapping all four listing types (suite/flagship/bundle/territory) to KpiSection props.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace KpiPlaceholder with KpiSection | eff57d5 | src/app/listings/[id]/page.tsx, src/lib/kpi/fetch.ts |

## What Was Built

The listing detail page (`src/app/listings/[id]/page.tsx`) previously rendered a `KpiPlaceholder` stub component that displayed a static "Coming Soon" block. This plan replaced that stub with the fully-functional `KpiSection` component built in plans 04-02 and 04-03, completing the end-to-end KPI data pipeline.

**Prop derivation logic wired:**
- Suite/flagship: `locationId` = first salon location's ID (undefined for territory/bundle)
- Bundle: `bundleLocations` = all locations mapped with `salon→suite` and `territory→territory` type coercion
- Territory: only `listingType="territory"` passed; KpiSection returns `null` internally
- The wrapping `<section>` element was removed — KpiSection renders its own `<section className="mt-12">`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod safeParse error property name in fetch.ts**
- **Found during:** Task 1 build verification
- **Issue:** `parsed.error.errors` does not exist on Zod's `ZodError` type — correct property is `.issues`
- **Fix:** Changed `parsed.error.errors` to `parsed.error.issues` in `fetchLocationKpi`
- **Files modified:** `src/lib/kpi/fetch.ts` (line 59)
- **Commit:** eff57d5 (included in task commit)

### Out-of-Scope Issues Deferred

**1. `/account/alerts` prerender error**
- Build fails at static page generation for `/account/alerts` with "Uncached data accessed outside Suspense"
- Pre-existing issue from Phase 03 work — not caused by this plan's changes
- TypeScript compilation passes; this is a runtime prerender issue in an unrelated page
- Deferred to a future fix

## Decisions Made

1. `locationId` is passed as `undefined` for territory and bundle types (not `primaryLocation?.id`) to cleanly signal "no single location" — KpiSection guards internally but explicit undefined is cleaner
2. Salon locations in bundles mapped to `type='suite'` conservatively — KpiSection only uses type to filter out territories, so suite vs flagship distinction doesn't affect KPI display
3. The `<section>` wrapper previously wrapping KpiPlaceholder was removed — KpiSection renders its own section element

## Self-Check: PASSED

- src/app/listings/[id]/page.tsx: FOUND
- src/lib/kpi/fetch.ts: FOUND
- .planning/phases/04-live-kpi-integration/04-04-SUMMARY.md: FOUND
- Commit eff57d5: FOUND
