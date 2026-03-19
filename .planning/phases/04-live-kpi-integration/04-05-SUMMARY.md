---
phase: 04-live-kpi-integration
plan: 05
subsystem: api
tags: [kpi, server-only, mock-data, documentation, zod]

requires:
  - phase: 04-live-kpi-integration
    provides: schema.ts, fetch.ts, KpiSection components from plans 04-01 through 04-04

provides:
  - schema.ts with server-only guard preventing accidental client-side import
  - mock-data.ts with server-only guard, mockLocationKpi, generateMockBundleKpi exports
  - docs/kpi-api-contract.md documenting assumed API contract

affects: [04-live-kpi-integration]

tech-stack:
  added: []
  patterns:
    - "server-only import as first line of any server-only KPI module"
    - "generateMockBundleKpi function for per-location varied mock data"

key-files:
  created:
    - docs/kpi-api-contract.md
    - src/lib/kpi/mock-data.ts (was missing, now created with full exports)
  modified:
    - src/lib/kpi/schema.ts
    - src/lib/kpi/mock-data.ts

key-decisions:
  - "Existing mock-data.ts preserved (richer than plan spec) — added server-only + generateMockBundleKpi rather than replacing"
  - "mockBundleKpi kept intact — fetch.ts already imported it; replacement would have broken the build"
  - "Pre-existing /account/alerts build failure deferred — not caused by these changes"

patterns-established:
  - "server-only guard: all KPI lib files start with import 'server-only'"

requirements-completed: [LIST-17]

duration: 2min
completed: 2026-03-19
---

# Phase 4 Plan 05: Gap Closure (server-only, mock-data, API contract) Summary

**server-only guard on schema.ts, generateMockBundleKpi export on mock-data.ts, and assumed KPI API contract documented in docs/kpi-api-contract.md**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T23:41:13Z
- **Completed:** 2026-03-19T23:43:34Z
- **Tasks:** 3
- **Files modified:** 3 (schema.ts, mock-data.ts, docs/kpi-api-contract.md)

## Accomplishments

- Added `import 'server-only'` as first line of schema.ts — prevents accidental client bundle inclusion of Zod KPI schema
- Added `import 'server-only'` and `generateMockBundleKpi` export to mock-data.ts without breaking fetch.ts's existing `mockBundleKpi` import
- Created docs/kpi-api-contract.md documenting the assumed API shape, authentication, endpoints, response fields, error handling, and caching — clearly marked as ASSUMED pending live credential verification

## Task Commits

1. **Task 1: Add server-only guard to schema.ts** - `7cf0ec5` (feat)
2. **Task 2: Create mock data fixture** - `ce6690f` (feat)
3. **Task 3: Create API contract documentation** - `d47a9e1` (docs)

**Plan metadata:** (final commit below)

## Files Created/Modified

- `src/lib/kpi/schema.ts` — Added `import 'server-only'` as first line
- `src/lib/kpi/mock-data.ts` — Added `import 'server-only'` + `generateMockBundleKpi` export; preserved existing exports
- `docs/kpi-api-contract.md` — New: assumed KPI API contract with Authentication, Endpoints, Response Fields, Error Handling, Caching, and Development fallback sections

## Decisions Made

- Existing mock-data.ts was richer than the plan's spec — it already had `mockLocationKpi`, `mockBundleKpi`, `mockLocationKpiSmall`, and `mockLocationNames`. Rather than overwrite, added the missing `server-only` guard and `generateMockBundleKpi` export. This preserved `mockBundleKpi` which fetch.ts already imports.
- Pre-existing `/account/alerts` prerender build failure deferred to deferred-items.md — not caused by schema/mock-data/docs changes in this plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Preserved existing mock-data.ts exports to avoid breaking fetch.ts**
- **Found during:** Task 2 (Create mock data fixture)
- **Issue:** Plan's mock-data.ts would have replaced the file, removing `mockBundleKpi` which fetch.ts imports — causing a TypeScript error
- **Fix:** Added `server-only` guard and `generateMockBundleKpi` to existing file instead of replacing it
- **Files modified:** src/lib/kpi/mock-data.ts
- **Verification:** `grep -q "mockBundleKpi" src/lib/kpi/fetch.ts` still resolves; all exports present
- **Committed in:** `ce6690f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — preserve existing import contract)
**Impact on plan:** All plan requirements met. No scope creep. fetch.ts continues to work correctly.

## Issues Encountered

- `npm run build` failed with pre-existing `/account/alerts` prerender error (uncached data outside Suspense). Not caused by this plan's changes. Logged to `.planning/phases/04-live-kpi-integration/deferred-items.md`.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- All 04-05 gap closure deliverables complete
- schema.ts, mock-data.ts, and fetch.ts form a complete server-side KPI data layer with safe import guards
- API contract is documented and ready for verification when HS_INTERNAL_API_URL/HS_INTERNAL_API_TOKEN become available
- Pre-existing /account/alerts build issue should be resolved before next production deployment

---
*Phase: 04-live-kpi-integration*
*Completed: 2026-03-19*
