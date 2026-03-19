---
phase: 04-live-kpi-integration
plan: 03
subsystem: components, charts
tags: [kpi, recharts, modal, charts, bundle, sortable-table]

# Dependency graph
requires:
  - phase: 04-live-kpi-integration
    plan: 02
    provides: "KpiCard, KpiCardRow, KpiSection, schema, fetch layer"
provides:
  - path: src/components/kpi/KpiTrendChart.tsx
    exports: [KpiTrendChart]
  - path: src/components/kpi/KpiTrendModal.tsx
    exports: [KpiTrendModal]
  - path: src/components/kpi/BundleKpiTable.tsx
    exports: [BundleKpiTable]
  - path: src/components/kpi/BundleOverlayChart.tsx
    exports: [BundleOverlayChart]
  - path: src/components/kpi/BundleKpiSection.tsx
    exports: [BundleKpiSection]
affects: []

# Tech tracking
tech-stack:
  added:
    - recharts@3.8.0 (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend)
  patterns:
    - "ResponsiveContainer wrapping LineChart for fluid width"
    - "Custom Tooltip content render prop for formatted values"
    - "PALETTE array with 8 brand-aligned colors cycling for multi-line overlay"
    - "useMemo for sort to avoid re-sorting on every render"
    - "Fragment rows in table for inline chart expansion"

key-files:
  created:
    - src/components/kpi/KpiTrendChart.tsx
    - src/components/kpi/KpiTrendModal.tsx
    - src/components/kpi/BundleKpiTable.tsx
    - src/components/kpi/BundleOverlayChart.tsx
    - src/components/kpi/BundleKpiSection.tsx
  modified:
    - src/components/kpi/KpiCardRow.tsx
    - src/components/kpi/KpiSection.tsx
    - package.json

key-decisions:
  - "KpiSection interface changed from bundleLocationIds (string[]) to bundleLocations (Location[]) to pass names/types to BundleKpiSection"
  - "BundleKpiSection is a separate Client Component — KpiSection stays as a Server Component (async data fetching)"
  - "Overlay modal lives in BundleKpiSection not as a separate component — avoids prop-threading overhead for a single-use modal"

requirements-completed: [LIST-18, LIST-19]

# Metrics
duration: 3min
completed: 2026-03-19
status: complete
---

# Phase 4 Plan 03: KPI Trend Charts and Bundle Breakdown Summary

**Recharts LineChart for 12-month KPI trends, click-to-open modal on KPI cards, sortable per-location bundle table with inline expansion, and multi-line overlay comparison chart.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-19T23:21:16Z
- **Completed:** 2026-03-19T23:24:35Z
- **Tasks:** 7/7 complete
- **Files created/modified:** 8

## Commits

| Hash | Message |
|------|---------|
| d4d309a | chore(04-03): install recharts@3.8.0 for KPI trend charts |
| ea0e937 | feat(04-03): create KpiTrendChart component with Recharts LineChart |
| 22366ec | feat(04-03): create KpiTrendModal with Escape key and body scroll lock |
| 7fe0a66 | feat(04-03): create BundleKpiTable with sortable columns and inline expansion |
| 41480b7 | feat(04-03): create BundleOverlayChart with multi-line comparison and Legend |
| af23781 | feat(04-03): wire KpiTrendModal into KpiCardRow on card click |
| 8ee1f9e | feat(04-03): update KpiSection with bundle breakdown and create BundleKpiSection |

## Task Outcomes

| Task | Name | Status | Commit |
|------|------|--------|--------|
| 1 | Install Recharts | Complete | d4d309a |
| 2 | Create KpiTrendChart | Complete | ea0e937 |
| 3 | Create KpiTrendModal | Complete | 22366ec |
| 4 | Create BundleKpiTable | Complete | 7fe0a66 |
| 5 | Create BundleOverlayChart | Complete | 41480b7 |
| 6 | Update KpiCardRow with modal integration | Complete | af23781 |
| 7 | Update KpiSection for bundle table and overlay | Complete | 8ee1f9e |

## Architecture

The visualization layer flows:

```
KpiSection (Server Component)
   ├── Single listing: fetchLocationKpi → KpiCardRow → KpiCard (click) → KpiTrendModal → KpiTrendChart
   └── Bundle listing: fetchBundleKpi → aggregateBundleKpi
          ├── KpiCardRow (cumulative cards, click opens KpiTrendModal)
          └── BundleKpiSection (Client Component)
                ├── "View all locations" → overlay modal → metric selector → BundleOverlayChart
                └── BundleKpiTable (sortable columns, row click → inline KpiTrendChart)
```

### KpiTrendChart
- Recharts LineChart inside ResponsiveContainer
- Pink-600 (#db2777) line, strokeWidth=2, no dots
- Gray-200 (#e5e7eb) grid with 3 3 dash
- Custom tooltip: `{formattedValue} • {month}`
- Default height 240px; 200px for inline table expansion

### KpiTrendModal
- Fixed overlay z-50 with bg-black/50 scrim
- max-w-2xl panel, click scrim or X to close
- Escape key closes, body scroll locked while open
- Renders KpiTrendChart for selected metric

### BundleKpiTable
- 5 sortable columns: Location, Revenue, New Clients, Bookings, Membership
- Active column shows up/down arrow in pink-600
- useMemo for sort, default ascending by name
- max-h-[400px] overflow-y-auto for scroll with many rows
- Row click expands inline 200px KpiTrendChart; click again to collapse

### BundleOverlayChart
- 8-color PALETTE cycling (pink, blue, green, amber, purple, cyan, orange, slate at 600 level)
- One Line per open location, each with distinct PALETTE color
- 280px height (taller for legend accommodation)
- Custom tooltip: month header + all location values with their line color

### BundleKpiSection
- "View all locations" button opens overlay modal
- Metric selector pills (Revenue / New Clients / Bookings / Membership) in modal
- "Unopened Territories" list below table if territories present

## Deviations from Plan

### Interface Update

**1. [Rule 1 - Bug] KpiSection interface updated to include Location names**
- **Found during:** Task 7
- **Issue:** Existing `KpiSection` used `bundleLocationIds?: string[]` but BundleKpiSection needs location names for table display. The plan's new interface (`bundleLocations?: Location[]`) provides names and types — this replaces the old prop.
- **Fix:** Updated KpiSection interface from `bundleLocationIds` to `bundleLocations` with `{id, name, type}`. No external callers existed yet so no breakage.
- **Files modified:** `src/components/kpi/KpiSection.tsx`
- **Commit:** 8ee1f9e

### Build Environment Note

`npm run build` fails with Node.js 18.14.0 (Next.js 16 requires >=20.9.0). This is a pre-existing environment constraint present before Plan 04-03. All 7 new/modified files pass `tsc --noEmit` with zero TypeScript errors. The 3 pre-existing TS errors (in admin.test.ts, kpi/fetch.test.ts, lib/kpi/fetch.ts) are from Plan 04-02 and not caused by this plan.

---

*Phase: 04-live-kpi-integration*
*Plan: 03*
*Completed: 2026-03-19*

## Self-Check: PASSED

- All 5 created files exist on disk
- All 2 modified files verified
- All 7 task commits present in git log
- Zero TypeScript errors in 04-03 files (tsc --noEmit confirmed)
