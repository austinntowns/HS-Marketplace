---
phase: 03-discovery-and-contact
plan: "05"
subsystem: alerts
tags: [server-actions, email, next.js, tdd, buyer-facing]
dependency_graph:
  requires:
    - 03-01 (getListings, ListingFilters, NuqsAdapter)
    - 03-02 (BrowsePage, FilterBar, useListingFilters)
    - 01-foundation (auth, email.ts, sendAlertMatchEmail)
  provides:
    - Alert CRUD Server Actions (createAlert, updateAlert, deleteAlert, getMyAlerts)
    - triggerAlertMatching for Phase 2 listing approval integration
    - /account/alerts management page with AlertsManager
    - SaveSearchButton on browse page (states-only)
  affects:
    - Phase 2 listing approval action (must call triggerAlertMatching when status -> active)
tech_stack:
  added: []
  patterns:
    - "'use server' Server Actions for alert CRUD with ownership verification"
    - "vi.hoisted() mock pattern for vitest (same as listings-query tests)"
    - "AlertsManager client component with optimistic list updates"
    - "Async Server Action props passed from Server Component to Client Component"
key_files:
  created:
    - src/lib/alert-actions.ts
    - src/__tests__/alert-actions.test.ts
    - src/components/alerts/AlertForm.tsx
    - src/components/alerts/AlertList.tsx
    - src/app/account/alerts/page.tsx
    - src/app/account/alerts/AlertsManager.tsx
    - src/components/browse/SaveSearchButton.tsx
  modified:
    - src/components/browse/BrowsePage.tsx
    - src/app/(dashboard)/layout.tsx
decisions:
  - "Alert criteria: State/region only (no listingTypes, minPrice, maxPrice) — locked in CONTEXT.md"
  - "triggerAlertMatching receives listing param object, not full DB row — decoupled from schema for Phase 2 flexibility"
  - "Server Actions passed as props to AlertsManager so Server Component handles data fetching and Client Component handles interactions"
  - "Empty states array on alert = match all states (matches listings in any state)"
metrics:
  duration: "5 min"
  completed_date: "2026-03-19"
  tasks_completed: 3
  files_changed: 9
---

# Phase 03 Plan 05: Alert Management System Summary

**One-liner:** Buyer alert system with states-only criteria: "Save this search" on browse, /account/alerts CRUD management, and triggerAlertMatching email hook for Phase 2 listing approval.

## What Was Built

Alert system allowing buyers to subscribe to new listing notifications filtered by US state(s). Alerts use state/region only per the locked CONTEXT.md decision — no listing type or price range filters.

### Key Components

- **`createAlert` / `updateAlert` / `deleteAlert` / `getMyAlerts`** — Server Actions with auth checks, ownership verification, and `revalidatePath('/account/alerts')` after mutations.
- **`triggerAlertMatching`** — Called when a listing is approved (Phase 2 hook). Queries all alerts joined with user info, filters by state match (empty states = match all states), sends `sendAlertMatchEmail` to each matching buyer.
- **`AlertForm`** — Client component with US state checkbox grid and selection pills. Create and edit modes. States-only form per CONTEXT.md.
- **`AlertList`** — Card list showing alert state selections with Edit/Delete buttons.
- **`AlertsManager`** — Client component managing alerts array state, optimistic updates, create/edit/delete flow with inline form toggle.
- **`/account/alerts/page.tsx`** — Server Component: auth gate, fetches initial alerts via `getMyAlerts`, renders `AlertsManager`.
- **`SaveSearchButton`** — Client component on browse page that calls `createAlert` with the current `states` URL filter. Shows "Saving..." and "Saved!" feedback states.

## Task Commits

1. **Task 1 RED: Failing tests for alert CRUD actions** - `e694fc9`
2. **Task 1 GREEN: Implement alert CRUD Server Actions** - `402398d`
3. **Task 2: Alert management page and components** - `8678a60`
4. **Task 3: Save this search button and nav link** - `4a10218`

## Deviations from Plan

None - plan executed exactly as written.

### Note: BrowsePage.tsx already existed

The plan listed BrowsePage.tsx as a file to modify, but plan 03-02 had already been executed (browse page was built and working) even though no 03-02-SUMMARY.md existed. The SaveSearchButton import and render were added to the existing BrowsePage without issue.

## Phase 2 Integration Checklist

The `triggerAlertMatching` function in `src/lib/alert-actions.ts` must be called from the listing approval Server Action when `listing.status` changes to `'active'`. The JSDoc in the function includes example usage.

```typescript
// In Phase 2 listing approval action:
import { triggerAlertMatching } from '@/lib/alert-actions'

// After setting listing.status = 'active':
await triggerAlertMatching({
  id: listing.id,
  type: listing.type,
  city: listing.primaryLocation?.city ?? null,
  state: listing.primaryLocation?.state ?? null,
  askingPrice: listing.askingPrice,
  locationName: listing.primaryLocation?.name ?? null,
})
```

## Self-Check

```
[ -f src/lib/alert-actions.ts ] -> FOUND
[ -f src/__tests__/alert-actions.test.ts ] -> FOUND
[ -f src/components/alerts/AlertForm.tsx ] -> FOUND
[ -f src/components/alerts/AlertList.tsx ] -> FOUND
[ -f src/app/account/alerts/page.tsx ] -> FOUND
[ -f src/app/account/alerts/AlertsManager.tsx ] -> FOUND
[ -f src/components/browse/SaveSearchButton.tsx ] -> FOUND
npm test -> 88 tests pass (10 files)
npm run build -> All 26 routes compile including /account/alerts
```

## Self-Check: PASSED
