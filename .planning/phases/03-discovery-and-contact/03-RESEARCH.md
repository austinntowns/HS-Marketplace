# Phase 3: Discovery and Contact - Research

**Researched:** 2026-03-19
**Domain:** Map-based listing discovery, URL-synced filtering, photo galleries, contact forms, email alerts
**Confidence:** HIGH (primary sources: Next.js bundled docs, npm registry, official library docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Browse Experience — List View**
- Card-based grid layout (2-3 cards per row on desktop)
- Each card shows: primary photo, asking price, city/state, type badge
- Type badge (Suite/Flagship/Territory) displayed below photo with price, not overlaid
- Primary photo only on cards — no hover carousel
- Skeleton cards while loading
- Results count header ("X listings") updates with filter changes
- Infinite scroll for pagination
- Sort options: Newest first (default), Price low-to-high, Price high-to-low

**Browse Experience — Map View**
- Split screen layout (Zillow-style): list panel on left, map on right
- MapTiler as map provider
- Bi-directional hover linking: hover card highlights pin, hover pin highlights card
- Clicking a map pin shows popup with card preview (photo, price, type) — click popup to go to detail
- Map auto-zooms to fit all visible listings when filters change
- User can manually zoom/pan after auto-fit

**Browse Experience — Mobile**
- Toggle between list and map views (no split on mobile)
- Filter state preserved when switching views

**Browse Experience — Empty State**
- "No listings match your filters" message with button to clear all filters

**Search and Filters**
- Horizontal filter bar above results (not sidebar)
- Location search (Zillow-style): type city/state/zip to center map — NOT freeform text search
- Location autocomplete with city/state suggestions
- Price range: Min/max dropdowns with preset ranges
- State filter: Multi-select dropdown (can select multiple states)
- Type filter: Checkboxes for Suite, Flagship, Territory — NO Bundle option
- Bundle visibility rule: Bundles appear if ANY of their included locations match selected types

**Listing Detail Page**
- Photo gallery: Airbnb-style grid collage (1 large + 4 smaller), "Show all photos" for full gallery lightbox
- Seller financials: Card grid with key metrics (Asking Price, TTM Profit, Monthly Expenses)
- KPI section: Visible placeholder cards with "Coming Soon" or "Live data pending" label
- Layout: Single column, vertical scroll
- Small embedded map showing listing location
- Contact CTA: Floating button that scrolls to contact form section at bottom

**Contact Form**
- Form section at bottom of detail page
- Buyer info auto-filled from profile
- Free-form message field
- One submission per listing per buyer — after submission, form replaced with "You've already contacted this seller" message
- Seller receives email notification immediately on submission

**Area Alerts**
- Quick create: "Save this search" on browse page creates alert from current state filter
- Full management: Alerts section in account settings (create, edit, delete)
- Alert criteria: State/region only (simple)
- Email frequency: Immediate — one email per new matching listing as soon as it's approved

### Claude's Discretion
- Exact card dimensions and spacing
- Filter dropdown styling
- Map pin design
- Lightbox implementation details
- Form validation UX
- Email template design

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DISC-01 | Buyer can browse listings in list view (default sort: newest first) | Server Action + Drizzle cursor pagination, skeleton loading pattern |
| DISC-02 | Buyer can browse listings in map view | MapTiler SDK `@maptiler/sdk`, useEffect + useRef map init, Marker + Popup API |
| DISC-03 | Buyer can filter by listing type (suite, flagship, territory, bundle) | nuqs `parseAsArrayOf` for multi-value URL state, Drizzle `inArray` filter |
| DISC-04 | Buyer can filter by state/region | nuqs `parseAsArrayOf(parseAsString)` for multi-select states |
| DISC-05 | Buyer can filter by price range | nuqs `parseAsInteger` for min/max params |
| DISC-06 | Buyer can filter by time location has been open | Drizzle date-range query on `openedAt` / listing creation date |
| DISC-07 | Buyer can view listing detail page with all seller data and live KPIs | Next.js dynamic route `[id]`, placeholder KPI section, `next/image` for photos |
| DISC-08 | Buyer can submit contact form (one per listing) | Server Action with `'use server'`, unique constraint on `(listingId, buyerId)` |
| DISC-09 | Contact form auto-fills buyer info from profile | `auth()` from Auth.js in Server Component to pre-populate |
| DISC-10 | Contact form includes free-form message field | Standard textarea in form, Zod validation server-side |
| DISC-11 | Seller receives email notification when buyer expresses interest | `sendContactNotification()` already implemented in `src/lib/email.ts` |
| DISC-12 | Buyer can set area/state alerts for new listings | `alerts` table schema, Server Action create/update/delete |
| DISC-13 | Buyer receives email when new matching listing approved | `sendAlertMatchEmail()` already in `src/lib/email.ts`; trigger in listing approval action |
| DISC-14 | Buyer can search listings by text (location name, city, description) | CONTEXT: location autocomplete via `@maptiler/geocoding-control`, not DB text search |
| DISC-15 | Buyer can edit their alert criteria | Server Action update, re-use alert form component |
| DISC-16 | Buyer can delete their alerts | Server Action delete with ownership check |
</phase_requirements>

---

## Summary

Phase 3 builds the buyer-facing discovery and engagement surface. The dominant technical challenge is the **map + list split-screen** with bi-directional hover state, URL-synced filters, and infinite scroll — all of which must feel seamless on both desktop and mobile. The secondary challenge is **state orchestration**: filter changes must simultaneously update the list, URL, and map bounds without causing expensive full re-renders.

The stack is well-matched: MapTiler SDK (on top of MapLibre GL JS) handles all map rendering; nuqs handles URL-synced filter state with a useState-like API; react-intersection-observer triggers infinite scroll without scroll listeners; yet-another-react-lightbox handles the "Show all photos" full gallery; and the Airbnb-style photo grid collage is a custom CSS Grid layout (no library needed — react-photo-album's preset layouts don't match). Contact form submission and seller notification use existing infrastructure (`sendContactNotification` is already implemented in `src/lib/email.ts`). Alert emails (`sendAlertMatchEmail`) are also already implemented and need to be wired to the listing approval action.

**Primary recommendation:** Keep all filter state in the URL via nuqs. Use a Server Action (not a Route Handler) for listing queries — pass filter params from nuqs into Drizzle queries. MapTiler map initialization lives in a `'use client'` component with `useEffect`/`useRef` to avoid SSR issues.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@maptiler/sdk` | 3.11.1 | Interactive map, markers, popups, geocoding | Official MapTiler SDK; built on MapLibre GL JS; decided in CONTEXT.md |
| `@maptiler/geocoding-control` | 2.1.7 | Location autocomplete search box | MapTiler's official geocoding UI component; handles city/state/zip autocomplete |
| `nuqs` | 2.8.9 | URL-synced filter state | Type-safe `useState` backed by URL query string; native App Router support; prevents filter state loss on navigation |
| `react-intersection-observer` | 10.0.3 | Infinite scroll trigger | Thin wrapper on Intersection Observer API; no scroll listeners; works with Next.js SSR |
| `yet-another-react-lightbox` | 3.29.1 | Full gallery lightbox ("Show all photos") | Actively maintained; React 19 compatible; Next.js Image integration; plugin architecture |
| `react-photo-album` | 3.5.1 | Photo layout utilities (rows layout for full gallery grid) | Used with YARL for responsive grid; has Next.js Image render function |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | (already in use) | Server-side form validation | Contact form, alert create/edit actions |
| `resend` | (already in use) | Transactional email | `sendContactNotification` and `sendAlertMatchEmail` already implemented |
| `drizzle-orm` | (already in use) | Listing queries with filters/pagination | All database operations for this phase |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@maptiler/sdk` | Mapbox GL JS | Mapbox requires paid account; MapTiler decided in CONTEXT.md |
| `nuqs` | Manual `useSearchParams` + `useRouter` | Manual approach requires significant boilerplate; nuqs handles batched updates, type parsing, and shallow routing |
| `yet-another-react-lightbox` | `react-bnb-gallery` | react-bnb-gallery last published 6 years ago; YARL actively maintained and React 19 compatible |
| Custom CSS grid (collage) | `react-photo-album` columns layout | react-photo-album doesn't support "1 large + 4 small" fixed layout; custom CSS Grid is 10 lines and exactly the right tool |

**Installation:**

```bash
npm install @maptiler/sdk @maptiler/geocoding-control nuqs react-intersection-observer yet-another-react-lightbox react-photo-album
```

**Version verification (confirmed 2026-03-19 against npm registry):**
- `@maptiler/sdk`: 3.11.1
- `@maptiler/geocoding-control`: 2.1.7
- `nuqs`: 2.8.9
- `yet-another-react-lightbox`: 3.29.1
- `react-intersection-observer`: 10.0.3
- `react-photo-album`: 3.5.1

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── browse/
│   │   └── page.tsx                  # Browse page (Server Component shell, passes searchParams to client)
│   ├── listings/
│   │   └── [id]/
│   │       └── page.tsx              # Listing detail page
│   └── account/
│       └── alerts/
│           └── page.tsx              # Alert management
├── components/
│   ├── browse/
│   │   ├── BrowsePage.tsx            # 'use client' — owns filter state, view toggle
│   │   ├── FilterBar.tsx             # 'use client' — nuqs hooks for all filter params
│   │   ├── ListingCard.tsx           # Pure display component
│   │   ├── ListingGrid.tsx           # 'use client' — infinite scroll, skeleton states
│   │   ├── MapView.tsx               # 'use client' — MapTiler map, markers, popups
│   │   └── LocationSearch.tsx        # 'use client' — @maptiler/geocoding-control
│   ├── listing-detail/
│   │   ├── PhotoCollage.tsx          # Custom CSS Grid (1 large + 4 small)
│   │   ├── FullGallery.tsx           # yet-another-react-lightbox
│   │   ├── FinancialsGrid.tsx        # KPI cards (seller data + placeholders)
│   │   ├── DetailMap.tsx             # Small embedded MapTiler map
│   │   └── ContactForm.tsx           # 'use client' — useActionState
│   └── alerts/
│       ├── AlertForm.tsx             # Create/edit alert
│       └── AlertList.tsx             # Alert management list
├── lib/
│   ├── email.ts                      # Already exists — sendContactNotification, sendAlertMatchEmail
│   ├── listings-query.ts             # Drizzle query helpers (filters, cursor pagination)
│   └── alerts.ts                     # Alert CRUD Server Actions
└── db/
    └── schema/
        ├── auth.ts                   # Already exists
        ├── listings.ts               # Phase 2 — must exist before this phase
        ├── inquiries.ts              # New: contact submissions table
        └── alerts.ts                 # New: buyer alerts table
```

### Pattern 1: URL-Synced Filter State with nuqs

**What:** All filter values live in URL query params. Components read/write via nuqs hooks. Server receives current params as `searchParams` prop.

**When to use:** Anywhere filter state must survive navigation, be shareable via link, and support browser back/forward.

**Setup — wrap root layout:**

```typescript
// Source: https://nuqs.dev/docs/options
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

**Filter state hook:**

```typescript
// Source: https://nuqs.dev/docs/options
'use client'
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from 'nuqs'

export function useListingFilters() {
  return useQueryStates({
    types:    parseAsArrayOf(parseAsString).withDefault([]),
    states:   parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    sort:     parseAsString.withDefault('newest'),
    // location is map-only (not persisted to URL — just centers map)
  })
}
```

**CRITICAL:** `useSearchParams` in Next.js 16 requires a `<Suspense>` boundary around the component in production builds or the build fails with "Missing Suspense boundary with useSearchParams". nuqs handles this correctly when the NuqsAdapter is present, but custom `useSearchParams` usage must be wrapped.

### Pattern 2: MapTiler Initialization in React

**What:** MapTiler SDK must initialize in a `useEffect` with a `useRef` container. Cannot run server-side.

**When to use:** Any component rendering an interactive map.

```typescript
// Source: https://docs.maptiler.com/react/
'use client'
import { useEffect, useRef } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'

export function MapView({ listings, onHover }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptilersdk.Map | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY!

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [-95, 39], // US center
      zoom: 4,
    })

    // Add markers after map loads
    map.current.on('load', () => {
      listings.forEach(listing => {
        const marker = new maptilersdk.Marker()
          .setLngLat([listing.lng, listing.lat])
          .addTo(map.current!)

        const popup = new maptilersdk.Popup({ offset: 25 })
          .setHTML(`<div>...</div>`)

        marker.setPopup(popup)
        marker.getElement().addEventListener('mouseenter', () => onHover(listing.id))
      })
    })

    return () => map.current?.remove()
  }, []) // listings passed as effect dependency for marker updates

  return <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
}
```

**Key concern:** When `listings` changes (filter applied), markers must be removed and re-added. Use a separate `useEffect` for marker management that depends on `listings`.

### Pattern 3: MapTiler Geocoding Control for Location Search

**What:** Drop-in search box that autocompletes city/state/zip and returns coordinates to center the map.

```typescript
// Source: https://docs.maptiler.com/react/sdk-js/geocoding-control/
'use client'
import { GeocodingControl } from '@maptiler/geocoding-control/react'
import '@maptiler/geocoding-control/style.css'
import type { Feature } from '@maptiler/geocoding-control/types'

export function LocationSearch({ onSelect }) {
  function handlePick(value: Feature | undefined) {
    if (value?.geometry.type === 'Point') {
      const [lng, lat] = value.geometry.coordinates
      onSelect({ lng, lat, name: value.place_name })
    }
  }

  return (
    <GeocodingControl
      apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY!}
      country={['US']}          // restrict to US locations
      types={['place', 'postcode', 'region']}
      onPick={handlePick}
      placeholder="Search by city, state, or zip..."
    />
  )
}
```

**Note:** The location search centers the map only — it does not filter the listing results. The map auto-fits to show all results matching the current filter state. Location search is additive: pan the map to a city, then apply state/type/price filters.

### Pattern 4: Infinite Scroll with react-intersection-observer

**What:** A sentinel div at the bottom of the list triggers loading more items when scrolled into view.

```typescript
// Source: https://www.npmjs.com/package/react-intersection-observer
'use client'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect } from 'react'
import { getListings } from '@/lib/listings-query'

export function ListingGrid({ initialListings, filters }) {
  const [listings, setListings] = useState(initialListings)
  const [cursor, setCursor] = useState(initialListings.at(-1)?.id)
  const [hasMore, setHasMore] = useState(initialListings.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (!inView || !hasMore || loading) return
    setLoading(true)
    getListings({ ...filters, cursor }).then(({ items, nextCursor }) => {
      setListings(prev => [...prev, ...items])
      setCursor(nextCursor)
      setHasMore(!!nextCursor)
      setLoading(false)
    })
  }, [inView])

  return (
    <div>
      {listings.map(l => <ListingCard key={l.id} listing={l} />)}
      {loading && <SkeletonCards count={3} />}
      <div ref={ref} />   {/* sentinel */}
    </div>
  )
}
```

**Cursor vs offset pagination:** Use cursor-based pagination (last item's `id` or `createdAt`) not `OFFSET`. `OFFSET` degrades at scale and causes duplicate items when new listings are added mid-scroll. Drizzle pattern:

```typescript
// Source: verified against Drizzle ORM docs
const PAGE_SIZE = 12
const items = await db
  .select()
  .from(listings)
  .where(and(
    eq(listings.status, 'active'),
    cursor ? lt(listings.createdAt, cursor) : undefined,
    // ... other filters
  ))
  .orderBy(desc(listings.createdAt))
  .limit(PAGE_SIZE + 1) // fetch one extra to know if more exist

const hasMore = items.length > PAGE_SIZE
return { items: items.slice(0, PAGE_SIZE), nextCursor: hasMore ? items[PAGE_SIZE - 1].createdAt : null }
```

**When filters change:** Reset `listings` to empty, `cursor` to null, `hasMore` to true, and re-trigger the first load. Use a `useEffect` that depends on `filters` to detect changes and reset state.

### Pattern 5: Airbnb-Style Photo Collage (Custom CSS Grid)

**What:** A fixed layout — one large photo left, 2x2 grid of smaller photos right. react-photo-album does not support this layout; it must be built with CSS Grid.

```typescript
// Source: custom CSS Grid pattern (Claude's discretion for implementation details)
export function PhotoCollage({ photos, onShowAll }) {
  const primary = photos[0]
  const secondary = photos.slice(1, 5) // up to 4

  return (
    <div className="relative">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[500px]">
        {/* Large left photo spans 2 rows */}
        <div className="row-span-2">
          <img src={primary.url} className="w-full h-full object-cover rounded-l-xl" />
        </div>
        {/* 2x2 right grid */}
        {secondary.map((photo, i) => (
          <img key={i} src={photo.url} className={`w-full h-full object-cover ${i === 1 ? 'rounded-tr-xl' : ''} ${i === 3 ? 'rounded-br-xl' : ''}`} />
        ))}
      </div>
      <button
        onClick={onShowAll}
        className="absolute bottom-4 right-4 bg-white border px-4 py-2 rounded-lg text-sm font-medium"
      >
        Show all photos
      </button>
    </div>
  )
}
```

### Pattern 6: Full Gallery Lightbox with yet-another-react-lightbox

```typescript
// Source: https://yet-another-react-lightbox.com/documentation
'use client'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useState } from 'react'

export function FullGallery({ photos }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = photos.map(p => ({ src: p.url, alt: p.alt }))

  return (
    <>
      <button onClick={() => { setIndex(0); setOpen(true) }}>
        Show all photos
      </button>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </>
  )
}
```

### Pattern 7: Contact Form with Server Action

**What:** Uses React `useActionState` for pending/error states. Server Action validates, writes to DB, then sends email.

```typescript
// Source: Next.js bundled docs — node_modules/next/dist/docs/01-app/02-guides/forms.md
'use client'
import { useActionState } from 'react'
import { submitContactForm } from '@/lib/contact-actions'

export function ContactForm({ listingId, buyerName, buyerEmail, hasContacted }) {
  const [state, formAction, pending] = useActionState(submitContactForm, null)

  if (hasContacted) {
    return <p>You've already contacted this seller.</p>
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input name="name" defaultValue={buyerName} required />
      <input name="email" defaultValue={buyerEmail} required type="email" />
      <textarea name="message" rows={4} />
      {state?.error && <p>{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Sending...' : 'Contact Seller'}
      </button>
    </form>
  )
}
```

**Server Action:**

```typescript
'use server'
import { auth } from '@/auth'
import { db } from '@/db'
import { inquiries } from '@/db/schema/inquiries'
import { sendContactNotification } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  listingId: z.string(),
  message: z.string().optional(),
})

export async function submitContactForm(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: 'Not authenticated' }

  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'Invalid form data' }

  // Check for duplicate — unique constraint on (listingId, buyerId)
  const existing = await db.query.inquiries.findFirst({
    where: and(
      eq(inquiries.listingId, parsed.data.listingId),
      eq(inquiries.buyerId, session.user.id),
    ),
  })
  if (existing) return { error: 'Already contacted' }

  await db.insert(inquiries).values({
    listingId: parsed.data.listingId,
    buyerId: session.user.id,
    message: parsed.data.message,
  })

  // Fetch seller info and send notification
  // sendContactNotification() already exists in src/lib/email.ts
  await sendContactNotification({ ... })

  return { success: true }
}
```

### Anti-Patterns to Avoid

- **Storing filter state in React state only:** Refreshing the page loses all filter context. Always use nuqs for filter state.
- **Initializing MapTiler outside useEffect:** The SDK accesses browser APIs (WebGL, ResizeObserver). Running at module scope or in a Server Component crashes the build.
- **OFFSET-based pagination:** `LIMIT 12 OFFSET 120` requires the DB to scan 132 rows and is slow on large result sets. Use cursor-based pagination.
- **Re-rendering the entire map on each listing update:** Adding new markers must not re-initialize the map. Keep the map instance in a `useRef` and manage markers imperatively.
- **Using `dynamic = 'force-dynamic'`:** Next.js 16 docs deprecate this in favor of `connection()` from `next/server` for forcing dynamic rendering when search params are needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL-synced filter state | Manual `useSearchParams` + `useRouter` boilerplate | `nuqs` | Handles batching, type coercion, shallow routing, and SSR; ~200 lines vs 6KB |
| Location autocomplete | Custom geocoding API integration | `@maptiler/geocoding-control` | Handles debouncing, result ranking, keyboard nav, and accessibility; uses the same MapTiler API key already needed for maps |
| Scroll-triggered data loading | `scroll` event listener | `react-intersection-observer` | Scroll listeners are expensive and jank-prone; Intersection Observer is browser-native and performant |
| Lightbox gallery | Custom modal with keyboard/swipe nav | `yet-another-react-lightbox` | Touch support, keyboard navigation, accessibility, responsive images, and React 19 compatibility are non-trivial |
| Email sending | Custom SMTP client | `resend` (already implemented) | Already live in `src/lib/email.ts`; `sendContactNotification` and `sendAlertMatchEmail` just need to be wired |

**Key insight:** The map, location search, and URL state are the three hardest parts. Each has a purpose-built library. The photo collage is the one area that genuinely needs a custom CSS Grid (no library matches the fixed 1+4 layout).

---

## Common Pitfalls

### Pitfall 1: MapTiler CSS Not Imported

**What goes wrong:** Map container renders but is invisible or missing controls.
**Why it happens:** MapTiler SDK requires its own CSS (`@maptiler/sdk/dist/maptiler-sdk.css`) imported at the component level.
**How to avoid:** Import the stylesheet in the same `'use client'` component that initializes the map.
**Warning signs:** Map div exists in DOM but has zero height, or map renders without zoom controls.

### Pitfall 2: MapTiler API Key in Client Bundle

**What goes wrong:** API key exposed in public JavaScript bundle.
**Why it happens:** `process.env.MAPTILER_KEY` without the `NEXT_PUBLIC_` prefix is undefined on the client; with it, it's visible in source.
**How to avoid:** MapTiler keys can be restricted by domain in MapTiler Cloud dashboard. Use `NEXT_PUBLIC_MAPTILER_API_KEY` and restrict the key to `marketplace.hellosugar.salon` in MapTiler Cloud settings. This is the standard approach for client-side map SDKs.
**Warning signs:** `403 Forbidden` responses from MapTiler tile API.

### Pitfall 3: useSearchParams Without Suspense Boundary in Production

**What goes wrong:** Next.js production build fails with "Missing Suspense boundary with useSearchParams".
**Why it happens:** Any `'use client'` component that calls `useSearchParams` (directly or via nuqs) causes the route to bail out of prerendering, which requires a `<Suspense>` boundary above it.
**How to avoid:** Wrap the `FilterBar` and other nuqs-using components in `<Suspense fallback={<FilterBarSkeleton />}>` in the page component. nuqs's NuqsAdapter handles this when configured correctly.
**Warning signs:** Works in `npm run dev` but `npm run build` fails.

### Pitfall 4: Filter Change Doesn't Reset Infinite Scroll Cursor

**What goes wrong:** Changing a filter appends results to the existing list instead of replacing them, showing a mix of filtered and unfiltered results.
**Why it happens:** The cursor and `listings` state are not reset when filter params change.
**How to avoid:** Add a `useEffect` that watches the filter params and resets `listings = []`, `cursor = null`, `hasMore = true` when they change. The sentinel div being visible after reset will trigger the first load automatically.

### Pitfall 5: Map Markers Not Cleaned Up Between Filter Changes

**What goes wrong:** Old markers from the previous filter remain on the map after filters change.
**Why it happens:** `map.current` is stable across renders but markers are added imperatively; removing them requires explicit `marker.remove()` calls.
**How to avoid:** Store all markers in a `useRef<maptilersdk.Marker[]>`. On each filter change, call `markers.current.forEach(m => m.remove())` before adding new ones.

### Pitfall 6: Contact Form Duplicate Submission Race Condition

**What goes wrong:** User double-clicks submit, sending two contact notifications to the seller.
**Why it happens:** Server Action doesn't prevent concurrent submissions; the duplicate check and insert are not atomic.
**How to avoid:** Add a unique database constraint on `(listing_id, buyer_id)` in the inquiries table schema. The DB constraint is the authoritative guard; the application-level check is a UX optimization only.

### Pitfall 7: Alert Emails Fired for Non-Active Listings

**What goes wrong:** Buyer receives alert email for a listing that was later rejected or delisted.
**Why it happens:** Alert matching logic fires on insert rather than on status change to `active`.
**How to avoid:** Trigger `sendAlertMatchEmail` inside the listing **approval** Server Action (status change to `active`), not on listing creation. Query all matching alerts at approval time.

---

## Code Examples

### Database Schema — New Tables for Phase 3

```typescript
// src/db/schema/inquiries.ts
import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const inquiries = pgTable('inquiries', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  listingId: text('listing_id').notNull(), // FK to listings.id
  buyerId:   text('buyer_id').notNull(),   // FK to users.id
  message:   text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniquePerBuyer: unique().on(t.listingId, t.buyerId), // prevents duplicate contacts
}))

// src/db/schema/alerts.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const alerts = pgTable('alerts', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  buyerId:   text('buyer_id').notNull(), // FK to users.id
  states:    text('states').array().notNull(), // e.g. ['TX', 'GA']
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### Listing Query with Filters (Drizzle)

```typescript
// src/lib/listings-query.ts — Server Action or server utility
import { db } from '@/db'
import { listings } from '@/db/schema/listings'
import { and, desc, lt, inArray, gte, lte, eq } from 'drizzle-orm'

const PAGE_SIZE = 12

export async function getListings({ types, states, minPrice, maxPrice, sort, cursor }) {
  const conditions = [
    eq(listings.status, 'active'),
    types?.length  ? inArray(listings.type, types)   : undefined,
    states?.length ? inArray(listings.state, states) : undefined,
    minPrice       ? gte(listings.askingPrice, minPrice) : undefined,
    maxPrice       ? lte(listings.askingPrice, maxPrice) : undefined,
    cursor         ? lt(listings.createdAt, cursor) : undefined,
  ].filter(Boolean)

  const rows = await db
    .select()
    .from(listings)
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt))
    .limit(PAGE_SIZE + 1)

  const hasMore = rows.length > PAGE_SIZE
  return {
    items: rows.slice(0, PAGE_SIZE),
    nextCursor: hasMore ? rows[PAGE_SIZE - 1].createdAt : null,
  }
}
```

### Alert Matching at Listing Approval

```typescript
// Inside the listing approval Server Action (Phase 2 action, extended in Phase 3)
// After setting listing.status = 'active':
const matchingAlerts = await db
  .select()
  .from(alerts)
  .innerJoin(users, eq(alerts.buyerId, users.id))
  .where(
    // Alert matches if listing.state is in alert.states array
    sql`${listing.state} = ANY(${alerts.states})`
  )

await Promise.all(matchingAlerts.map(({ alerts: alert, users: buyer }) =>
  sendAlertMatchEmail({
    buyerEmail: buyer.email!,
    buyerName: buyer.name!,
    listingTitle: listing.title,
    listingId: listing.id,
    listingType: listing.type,
    city: listing.city,
    state: listing.state,
    askingPrice: listing.askingPrice,
  })
))
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `export const dynamic = 'force-dynamic'` | `await connection()` from `next/server` | Next.js 15+ | Prefer `connection()` to opt into dynamic rendering; `force-dynamic` is deprecated per bundled docs |
| Manual `URLSearchParams` + `useRouter` for filter state | `nuqs` with `useQueryStates` | 2024-2025 | Removes ~200 lines of boilerplate; type-safe; batches URL updates |
| `react-query` `useInfiniteQuery` | `react-intersection-observer` + Server Actions | 2024+ | Server Actions allow server-side execution without Route Handler setup; simpler data flow |
| Page-based pagination (`?page=2`) | Cursor-based pagination | Standard | Cursor avoids duplicate items and degrades better at scale |

**Deprecated/outdated:**
- `react-bnb-gallery`: Last published 6 years ago — do not use; YARL is the modern replacement.
- `react-photo-gallery`: Unmaintained; `react-photo-album` is the maintained fork.
- Direct MapLibre GL JS: Works but misses MapTiler's geocoding, style management, and billing integration; use `@maptiler/sdk` which extends it.

---

## Open Questions

1. **Phase 2 schema — is `listings` table created?**
   - What we know: Phase 2 plans are listed as deleted in git status (`D .planning/phases/01-data-pipeline/01-01-PLAN.md`) — Phase 2 plans may not be written yet
   - What's unclear: Whether the `listings`, `photos`, and `locations` tables exist in the DB schema
   - Recommendation: Phase 3 plans should explicitly depend on the listings schema being finalized in Phase 2. The `getListings` query above assumes columns `status`, `type`, `state`, `askingPrice`, `createdAt`, `lat`, `lng` exist.

2. **MapTiler API key provisioning**
   - What we know: The map requires `NEXT_PUBLIC_MAPTILER_API_KEY` in env
   - What's unclear: Whether a MapTiler account exists and a key has been created
   - Recommendation: Add `NEXT_PUBLIC_MAPTILER_API_KEY` to the env setup task in Phase 3 Wave 0. Key must be domain-restricted to `marketplace.hellosugar.salon` in MapTiler Cloud.

3. **Photo storage URL format (Phase 2 dependency)**
   - What we know: Phase 2 must decide between Vercel Blob and Cloudinary (noted as open blocker in STATE.md)
   - What's unclear: Photo URL shape — signed vs public, with or without CDN transform params
   - Recommendation: Phase 3's photo collage and lightbox can be written against a generic `url: string` field. The format doesn't affect Phase 3 implementation.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |
| Test location | `src/__tests__/**/*.test.ts` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISC-01 | `getListings()` returns active listings sorted newest first | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| DISC-03 | `getListings()` filters by type array | unit | `npm test` | ❌ Wave 0 |
| DISC-04 | `getListings()` filters by state array | unit | `npm test` | ❌ Wave 0 |
| DISC-05 | `getListings()` filters by price range | unit | `npm test` | ❌ Wave 0 |
| DISC-06 | `getListings()` filters by time-open range | unit | `npm test` | ❌ Wave 0 |
| DISC-08 | `submitContactForm` prevents duplicate submissions | unit | `npm test` | ❌ Wave 0 |
| DISC-11 | `sendContactNotification` called on contact submission | unit | `npm test` | ✅ Partially (email.test.ts covers the email function; action test needed) |
| DISC-12/13 | Alert create/delete Server Actions | unit | `npm test` | ❌ Wave 0 |
| DISC-13 | Alert matching fires only on listing approval | unit | `npm test` | ❌ Wave 0 |
| DISC-02 | Map renders, markers visible | manual-only | — | N/A — MapTiler requires browser/WebGL |
| DISC-07 | Detail page displays all seller fields | manual-only | — | N/A — visual verification |
| DISC-14 | Location autocomplete returns results | manual-only | — | N/A — requires MapTiler API |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/listings-query.test.ts` — covers DISC-01, DISC-03, DISC-04, DISC-05, DISC-06 (mock Drizzle db)
- [ ] `src/__tests__/contact-actions.test.ts` — covers DISC-08, DISC-11 (mock db + email)
- [ ] `src/__tests__/alert-actions.test.ts` — covers DISC-12, DISC-13, DISC-15, DISC-16

---

## Sources

### Primary (HIGH confidence)
- Next.js bundled docs — `node_modules/next/dist/docs/` — `useSearchParams`, forms/Server Actions, caching
- npm registry (verified 2026-03-19) — `@maptiler/sdk@3.11.1`, `@maptiler/geocoding-control@2.1.7`, `nuqs@2.8.9`, `yet-another-react-lightbox@3.29.1`, `react-intersection-observer@10.0.3`, `react-photo-album@3.5.1`
- `src/lib/email.ts` — existing project code confirming `sendContactNotification` and `sendAlertMatchEmail` are implemented
- `src/db/schema/auth.ts` — existing project code confirming users table shape

### Secondary (MEDIUM confidence)
- [MapTiler React docs](https://docs.maptiler.com/react/) — React integration approach, useEffect/useRef pattern
- [MapTiler Geocoding Control](https://docs.maptiler.com/react/sdk-js/geocoding-control/) — `GeocodingControl` React component, `onPick` event
- [nuqs documentation](https://nuqs.dev/docs/options) — `NuqsAdapter`, `useQueryStates`, `parseAsArrayOf` — verified with official docs
- [yet-another-react-lightbox documentation](https://yet-another-react-lightbox.com/documentation) — basic usage, plugins, slides prop

### Tertiary (LOW confidence)
- Community articles on infinite scroll patterns with Next.js Server Actions — general direction confirmed but implementation details may vary

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified against npm registry on 2026-03-19
- Architecture: HIGH — pattern from Next.js bundled docs and official library docs
- Pitfalls: MEDIUM — MapTiler-specific pitfalls from official docs; map marker cleanup pattern from general MapLibre GL JS knowledge
- Email integration: HIGH — code already exists in project (`src/lib/email.ts`)

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days — all libraries are stable, no fast-moving APIs)
