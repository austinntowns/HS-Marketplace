---
phase: 04-live-kpi-integration
plan: 02
subsystem: api-proxy, components
tags: [kpi, caching, route-handlers, server-components, zod, tdd]

# Dependency graph
requires:
  - phase: 04-live-kpi-integration
    plan: 01
    provides: "KPI schema (created here as Rule 3 auto-fix since 04-01 deferred)"
provides:
  - path: src/lib/kpi/schema.ts
    exports: [kpiResponseSchema, KpiData, KpiMetric, KpiMonth]
  - path: src/lib/kpi/fetch.ts
    exports: [fetchLocationKpi, fetchBundleKpi]
  - path: src/lib/kpi/aggregate.ts
    exports: [aggregateBundleKpi]
  - path: src/app/api/kpi/[locationId]/route.ts
    exports: [GET]
  - path: src/app/api/kpi/bundle/route.ts
    exports: [GET]
  - path: src/components/kpi/KpiSection.tsx
    exports: [KpiSection]
  - path: src/components/kpi/KpiCard.tsx
    exports: [KpiCard]
  - path: src/components/kpi/KpiCardRow.tsx
    exports: [KpiCardRow]
affects: [04-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "'use cache' directive with cacheLife (stale:60, revalidate:300, expire:3600)"
    - "server-only import to prevent client bundle leakage of API credentials"
    - "Suspense fallback=null for graceful KPI section degradation"
    - "Async params pattern in Next.js 16 Route Handlers"

key-files:
  created:
    - src/lib/kpi/schema.ts
    - src/lib/kpi/fetch.ts
    - src/lib/kpi/aggregate.ts
    - src/app/api/kpi/[locationId]/route.ts
    - src/app/api/kpi/bundle/route.ts
    - src/components/kpi/KpiCard.tsx
    - src/components/kpi/KpiSection.tsx
    - src/components/kpi/KpiCardRow.tsx
    - src/__tests__/kpi/fetch.test.ts
    - src/__tests__/kpi/aggregate.test.ts
  modified:
    - next.config.ts
    - .env.example

key-decisions:
  - "schema.ts created from 04-02 PLAN.md interfaces block (04-01 deferred, no credentials available)"
  - "fetch.ts uses 'use cache' with cacheLife not unstable_cache — per RESEARCH.md Next.js 16 guidance"
  - "All fetch errors return null, never throw — per CONTEXT.md locked unavailable state decision"
  - "KpiCardRow extracted as separate client component to avoid mixing server/client boundaries"

patterns-established:
  - "KPI proxy pattern: server-only fetch module -> Route Handler -> Suspense Server Component"

requirements-completed: [LIST-17, LIST-19]

# Metrics
duration: 4min
completed: 2026-03-19
status: complete
---

# Phase 4 Plan 02: KPI Proxy and Components Summary

**Cached fetch layer, Route Handler endpoints, KpiSection with Suspense, KpiCard with Live badge — all wired together with 13 passing unit tests.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-19T23:15:01Z
- **Completed:** 2026-03-19T23:19:00Z
- **Tasks:** 6/6 complete
- **Files created/modified:** 12

## Commits

| Hash | Message |
|------|---------|
| 671f658 | feat(04-02): enable cacheComponents and add KPI env vars |
| 647d802 | feat(04-02): create fetch layer with 5-minute server cache |
| 39b3aab | feat(04-02): create bundle KPI aggregation logic |
| 703814c | feat(04-02): create Route Handler endpoints for KPI data |
| 9479805 | feat(04-02): create KpiCard component with Live badge and MoM change |
| 18fdbad | feat(04-02): create KpiSection and KpiCardRow components |

## Task Outcomes

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Enable cacheComponents and add env vars | Complete | 671f658 |
| 2 | Create fetch layer with caching | Complete | 647d802 |
| 3 | Create bundle aggregation logic | Complete | 39b3aab |
| 4 | Create Route Handler endpoints | Complete | 703814c |
| 5 | Create KpiCard component | Complete | 9479805 |
| 6 | Create KpiSection component | Complete | 18fdbad |

## Architecture

The data pipeline flows:

```
Hello Sugar Internal API
        ↓
fetchLocationKpi / fetchBundleKpi  (src/lib/kpi/fetch.ts)
   - 'use cache' with cacheLife (stale:60, revalidate:300, expire:3600)
   - Zod validation via kpiResponseSchema.safeParse
   - Returns null on any error
        ↓
KpiSection (Server Component)
   - Wrapped in Suspense fallback={null}
   - Calls fetch layer directly (not via Route Handler)
   - Returns null if no data (graceful degradation)
        ↓
KpiCardRow (Client Component)
   - Renders grid of KpiCards
   - Adjusts grid-cols based on available metrics
        ↓
KpiCard (Client Component)
   - Live badge, primary value, MoM arrow, freshness timestamp
```

Route Handlers (`/api/kpi/[locationId]` and `/api/kpi/bundle`) exist for external/client-side access and the discovery spike, but the Server Component path uses the fetch layer directly.

## Test Results

- **fetch.test.ts:** 7/7 passing
- **aggregate.test.ts:** 6/6 passing
- **Total:** 13/13 passing

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing schema.ts prerequisite**
- **Found during:** Pre-task setup
- **Issue:** Plan 04-01 was deferred and never created `src/lib/kpi/schema.ts` or `docs/kpi-api-contract.md`. Plan 04-02 depends on the schema. The PLAN.md `<interfaces>` block contained the exact schema definition, so it could be created without API credentials.
- **Fix:** Created `src/lib/kpi/schema.ts` from the schema defined in the 04-02 PLAN.md interfaces block. Committed alongside Task 1.
- **Files modified:** `src/lib/kpi/schema.ts`
- **Commit:** 671f658

**2. [Rule 2 - Missing functionality] Added missing env var test case**
- **Found during:** Task 2 (fetch layer)
- **Issue:** Plan specified 6 test behaviors but didn't include "returns null when env vars are missing" — a critical guard already present in the implementation.
- **Fix:** Added Test 5 `returns null when env vars are missing` to cover the env var guard.
- **Files modified:** `src/__tests__/kpi/fetch.test.ts`
- **Commit:** 647d802

**3. [Rule 2 - Missing functionality] Added trend aggregation test**
- **Found during:** Task 3 (aggregate)
- **Issue:** Plan specified 5 test behaviors but didn't include trend data aggregation — an important behavior of `aggregateBundleKpi` that needed test coverage.
- **Fix:** Added Test 6 `aggregates trend data by summing values per month`.
- **Files modified:** `src/__tests__/kpi/aggregate.test.ts`
- **Commit:** 39b3aab

## Next Steps (Plan 04-03)

Plan 04-03 will add:
- `KpiTrendModal` — modal/drawer triggered by KpiCard onClick (selectedKpi state already wired)
- `KpiTrendChart` — Recharts LineChart for single-location 12-month trend
- `BundleOverlayChart` — multi-line chart overlaying all bundle locations
- `BundleKpiTable` — sortable per-location breakdown table
- Integration of KpiSection into the listing detail page

---

*Phase: 04-live-kpi-integration*
*Plan: 02*
*Completed: 2026-03-19*

## Self-Check: PASSED

- All 10 implementation files exist on disk
- All 6 task commits verified in git history
- 13/13 unit tests passing
