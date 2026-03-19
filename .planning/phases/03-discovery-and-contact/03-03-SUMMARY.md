---
phase: 03-discovery-and-contact
plan: "03"
subsystem: listing-detail
tags: [next.js, lightbox, maptiler, react, buyer-facing]
dependency_graph:
  requires:
    - 02-listings-moderation (listings, listingLocations, listingPhotos schema)
    - 03-01 (browse page, getListings)
    - 03-02 (browse map/filters)
  provides:
    - /listings/[id] buyer detail page
    - getListingById Server Action
    - PhotoCollage + FullGallery components
    - FinancialsGrid component
    - DetailMap component (MapTiler)
    - KpiPlaceholder for Phase 4
    - FloatingContactCta component
  affects:
    - 03-04 (contact form will land at #contact section on this page)
tech_stack:
  added:
    - yet-another-react-lightbox@3.29.1
    - react-photo-album@3.5.1
    - "@maptiler/sdk (for DetailMap)"
    - react-leaflet + leaflet (fix pre-existing TerritoryPicker build error)
  patterns:
    - "'use server' Server Action for data fetching (getListingById)"
    - "'use client' wrapper component (ListingPhotos) to hold gallery state"
    - "Dynamic import for MapTiler SDK to avoid SSR issues"
    - "async params pattern (Promise<{id}>) per Next.js 16 requirement"
key_files:
  created:
    - src/lib/listing-detail.ts
    - src/components/listing-detail/PhotoCollage.tsx
    - src/components/listing-detail/FullGallery.tsx
    - src/components/listing-detail/FinancialsGrid.tsx
    - src/components/listing-detail/DetailMap.tsx
    - src/components/listing-detail/KpiPlaceholder.tsx
    - src/components/listing-detail/FloatingContactCta.tsx
    - src/app/listings/[id]/page.tsx
    - src/app/listings/[id]/ListingPhotos.tsx
  modified:
    - package.json (new deps)
    - src/proxy.ts (fix Next.js 16 proxy export)
decisions:
  - "ListingDetail interface adapts to actual schema: locations in listingLocations table, not on listings directly"
  - "FinancialsGrid shows askingPrice, ttmProfit, TTM revenue aggregated from listingLocations"
  - "DetailMap uses dynamic import for MapTiler to avoid SSR (same pattern as TerritoryPicker uses with Leaflet)"
  - "DetailMap shows coordinates only for territory listings (salon locations lack lat/lng in current schema)"
  - "proxy.ts refactored to wrap NextAuth auth as a named function — required by Next.js 16 proxy detection"
metrics:
  duration: "5 min"
  completed_date: "2026-03-19"
  tasks_completed: 4
  files_changed: 11
---

# Phase 03 Plan 03: Listing Detail Page Summary

**One-liner:** Airbnb-style listing detail page at `/listings/[id]` with photo collage, lightbox, financials grid, MapTiler map, KPI placeholder, and floating contact CTA.

## What Was Built

The buyer-facing listing detail page at `/listings/[id]`. Buyers who are authenticated can view full listing information including photos, financial metrics, location details, and a placeholder KPI section (Phase 4 will populate it with live data).

### Key Components

- **`getListingById`** — Server Action that queries listings with joined locations, photos, and seller. Only returns `status === 'active'` listings (buyers can't see drafts/pending/rejected).
- **`PhotoCollage`** — Airbnb-style CSS Grid: 1 large photo spanning left 2 columns/2 rows + up to 4 smaller photos in a 2x2 right grid. Handles graceful degradation for 0-5 photos. Shows "Show all photos" button.
- **`FullGallery`** — `yet-another-react-lightbox` wrapper with controlled open/close/index state.
- **`ListingPhotos`** — Client component wrapper that owns lightbox open state, connecting PhotoCollage and FullGallery.
- **`FinancialsGrid`** — Shows asking price, TTM profit, aggregated TTM revenue from all salon locations, and included assets.
- **`DetailMap`** — MapTiler SDK map (200px, non-interactive, zoom 12) using dynamic import to avoid SSR. Shows only for territory listings since salon locations lack lat/lng in current schema.
- **`KpiPlaceholder`** — 4 greyed-out metric cards (Revenue, New Clients, Bookings, Membership) with "Live KPI data coming soon" copy.
- **`FloatingContactCta`** — Fixed bottom-right pink button that smooth-scrolls to `#contact` section.
- **`/listings/[id]/page.tsx`** — Auth-gated async Server Component. Uses `Promise<{id}>` params (Next.js 16 requirement). Returns 404 for non-existent or non-active listings. Generates SEO metadata.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing build failure: react-leaflet not installed**
- **Found during:** Task 4 (build verification)
- **Issue:** `TerritoryPicker.tsx` imports `react-leaflet` dynamically but the package wasn't in `package.json`. Build was already failing before this plan.
- **Fix:** `npm install react-leaflet leaflet`
- **Files modified:** package.json, package-lock.json
- **Commit:** e244206

**2. [Rule 3 - Blocking] proxy.ts export not recognized by Next.js 16 build**
- **Found during:** Task 4 (build verification)
- **Issue:** `export const { auth: proxy } = NextAuth(authConfig)` uses destructuring rename which the Next.js 16 build system couldn't recognize as a function export. Build failed with "must export a function".
- **Fix:** Wrapped auth in an explicit named function: `export function proxy(request: NextRequest): any { return (auth as any)(request) }`
- **Files modified:** src/proxy.ts
- **Commit:** e244206

### Schema Adaptation (Expected Deviation)

The plan's `ListingDetail` interface assumed fields like `latitude`, `longitude`, `monthlyExpenses`, `squareFootage` etc. on the listings table. The actual schema stores location data in `listingLocations` (separate table). The implementation was adapted:
- `ListingDetailLocation` interface added to represent joined location data
- `FinancialsGrid` aggregates `ttmRevenue` across `listing.locations`
- `DetailMap` only shows for territory listings (which store `territoryLat`/`territoryLng`)
- Page displays location details from `listing.locations` array

## Self-Check

```
[ -f src/lib/listing-detail.ts ] → FOUND
[ -f src/components/listing-detail/PhotoCollage.tsx ] → FOUND
[ -f src/components/listing-detail/FullGallery.tsx ] → FOUND
[ -f src/components/listing-detail/FinancialsGrid.tsx ] → FOUND
[ -f src/components/listing-detail/DetailMap.tsx ] → FOUND
[ -f src/components/listing-detail/KpiPlaceholder.tsx ] → FOUND
[ -f src/components/listing-detail/FloatingContactCta.tsx ] → FOUND
[ -f src/app/listings/[id]/page.tsx ] → FOUND
[ -f src/app/listings/[id]/ListingPhotos.tsx ] → FOUND
npm run build → PASSED (all routes including /listings/[id] compiled)
```

## Self-Check: PASSED
