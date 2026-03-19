# Phase 4: Live KPI Integration - Research

**Researched:** 2026-03-19
**Domain:** Next.js 16 server-side API proxy, data caching, React charting
**Confidence:** HIGH (stack verified against installed node_modules/next/dist/docs)

## Summary

Phase 4 adds live operational KPI data from Hello Sugar's internal API to listing detail pages. The architecture is a server-side proxy layer in Next.js 16 Route Handlers that fetches from the internal API, caches results for 5 minutes, and transforms data into a shape the UI components consume. KPI cards (revenue, new clients, bookings, membership conversion) display on listing detail pages with a 12-month line chart accessible via modal. Bundle listings overlay all location trend lines on a single chart with a per-location data table.

The most critical unknown remains the internal API contract — endpoint URLs, authentication method, available fields, and rate limits. Plan 04-01 is a mandatory discovery spike before implementation can be scoped. All implementation plans (04-02, 04-03) must treat the internal API as a black box until the spike completes and document the results.

Next.js 16 ships with a new `'use cache'` directive (replacing `unstable_cache`) paired with `cacheLife()` for per-function cache lifetimes. The project already runs Next.js 16.2.0, so this is the correct caching API to target. Recharts 3.8.0 supports React 19 via peer dep declaration and is the chart library to use.

**Primary recommendation:** Route Handler proxy at `app/api/kpi/[locationId]/route.ts` with `'use cache'` + `cacheLife({ stale: 60, revalidate: 300, expire: 3600 })`, Recharts LineChart for trend visualization, and silent fallback returning `null` from the proxy function when the internal API is unavailable.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**KPI Card Layout**
- 4-column horizontal row (dashboard-style) — all 4 KPIs visible without scrolling
- KPI section appears BELOW seller-entered financials
- Section header: "Live Performance Data" (or "Live Performance Data (4 locations)" for bundles)
- Unopened territories: hide KPI section entirely (no operational data exists)

**KPI Card Content**
- Primary number: last month's value (not TTM or average)
- Month-over-month change: arrow + percentage (e.g., +12% ↑)
- Change indicator colors: neutral (same color), arrow direction conveys meaning
- Membership conversion: percentage only (45%), not ratio
- Per-card freshness timestamp (e.g., "Updated 2 hours ago")
- Badge with verified checkmark and "Live" label on each card

**KPI Card Interaction**
- Click card to expand — opens modal/drawer with full trend chart
- Cards are compact by default, modal provides detail

**Trend Chart**
- Line chart (not area or bar)
- 12-month fixed period (no 3mo/6mo toggle)
- Hover tooltip shows exact value + date (e.g., "$45,230 • Oct 2025")
- No benchmark or comparison line — just the trend

**Bundle Breakdown**
- Default view: both cumulative KPIs AND per-location table visible
- Per-location display: data table (rows = locations, columns = KPIs)
- Table is sortable by all columns (click header to sort)
- 5+ locations: vertical scroll (no pagination)
- Row click: inline expand to show that location's trend chart
- Bundle trend chart modal: all locations overlaid on same chart, color-coded
- Unopened territories in bundle: separate section below KPI table, not in table itself
- Location count shown in section header

**Unavailable State**
- API completely down: hide KPI section entirely (only seller financials shown)
- Partial data (some KPIs missing): show available cards, hide missing (layout adjusts)
- No failure indication: silent — user sees what's available
- Stale data: show cached data silently, freshness timestamp handles transparency

### Claude's Discretion
- Exact card dimensions and spacing
- Modal animation and styling
- Chart library choice (Recharts, Chart.js, etc.)
- Color palette for overlaid location lines in bundle charts
- Cache duration for stale data (suggested: 5-minute server cache per ROADMAP plans)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIST-17 | Listing displays live KPI data from internal API (revenue, new clients, bookings, membership conversion) | Route Handler proxy with `'use cache'` provides server-side fetching; silent null return handles unavailability |
| LIST-18 | Listing displays 12-month trend charts for KPIs | Recharts `LineChart` + `Line` + `XAxis` + `YAxis` + `Tooltip` renders historical data; modal pattern keeps cards compact |
| LIST-19 | Bundle listings show cumulative KPIs and per-location breakdown | Proxy accepts array of locationIds; aggregation layer sums across locations; per-location table with sortable columns |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next (built-in Route Handlers) | 16.2.0 (installed) | Server-side API proxy endpoint | Already in project; Route Handlers are the correct BFF pattern in Next.js 16 App Router |
| `'use cache'` directive + `cacheLife` | Next.js 16 built-in | Per-function cache lifetime on the proxy | Replaces `unstable_cache`; native to Next.js 16; no extra deps |
| recharts | 3.8.0 | Line chart rendering | Supports React 19 (peer dep verified); composable; declarative; most-used React chart library |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod (already installed) | ^4.3.6 | Validate and parse internal API response shape | Wrap internal API response in a Zod schema during discovery spike to enforce contract |
| React Suspense (built-in) | React 19 | Streaming fallback while KPI section fetches | Wrap KPI section so listing page shell renders immediately |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | Chart.js / react-chartjs-2 | Chart.js requires canvas; Recharts is React-native, easier to style with Tailwind CSS props |
| recharts | Victory | Victory is heavier; recharts is lighter and better maintained in 2025-2026 |
| Route Handler proxy | Server Component direct fetch | Server Component can't be cached independently per-location with `'use cache'`; Route Handler gives a stable URL the discovery spike can hit manually |

**Installation (recharts only — everything else already installed):**
```bash
npm install recharts
```

**Version verification:**
```bash
npm view recharts version   # 3.8.0 (verified 2026-03-19)
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── kpi/
│   │       ├── [locationId]/
│   │       │   └── route.ts          # Single location KPI proxy
│   │       └── bundle/
│   │           └── route.ts          # Bundle (multi-location) KPI proxy
│   └── listings/
│       └── [id]/
│           └── page.tsx              # Listing detail — imports KPI section
├── components/
│   └── kpi/
│       ├── KpiSection.tsx            # Outer section (conditionally rendered)
│       ├── KpiCard.tsx               # Individual card with badge + MoM change
│       ├── KpiTrendModal.tsx         # Modal wrapping trend chart
│       ├── KpiTrendChart.tsx         # Recharts LineChart (single location)
│       ├── BundleKpiTable.tsx        # Sortable per-location table
│       └── BundleOverlayChart.tsx    # Multi-line overlay (bundle modal)
└── lib/
    └── kpi/
        ├── fetch.ts                  # Internal API fetch + transform layer
        ├── schema.ts                 # Zod schemas for API response
        └── aggregate.ts              # Cumulative bundle aggregation logic
```

### Pattern 1: Route Handler as API Proxy with `'use cache'`
**What:** A Next.js Route Handler at `/api/kpi/[locationId]` fetches from the Hello Sugar internal API, validates the response with Zod, transforms it, and returns structured JSON. The fetch function is wrapped in `'use cache'` with a custom profile.

**When to use:** Any time the Next.js app needs to forward requests to an upstream service and cache the results independently of the page render.

**Example:**
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md
// src/lib/kpi/fetch.ts

import { cacheLife } from 'next/cache'
import { kpiResponseSchema } from './schema'

export async function fetchLocationKpi(locationId: string) {
  'use cache'
  cacheLife({
    stale: 60,        // 1 min client-side
    revalidate: 300,  // 5 min server-side background refresh (per ROADMAP)
    expire: 3600,     // 1 hr hard expiry
  })

  try {
    const res = await fetch(
      `${process.env.HS_INTERNAL_API_URL}/locations/${locationId}/kpi`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HS_INTERNAL_API_TOKEN}`,
        },
        cache: 'no-store', // bypass Next.js fetch cache; use cache is the cache layer
      }
    )
    if (!res.ok) return null
    const raw = await res.json()
    return kpiResponseSchema.parse(raw)
  } catch {
    return null  // silent fallback per locked decision
  }
}
```

```typescript
// src/app/api/kpi/[locationId]/route.ts
import { fetchLocationKpi } from '@/lib/kpi/fetch'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params
  const data = await fetchLocationKpi(locationId)
  if (!data) return new Response(null, { status: 204 })
  return Response.json(data)
}
```

### Pattern 2: Server Component KPI Section with Suspense
**What:** The listing detail page renders KPI data directly from the server using the fetch layer (not via client-side fetch to the Route Handler). The Route Handler exists for the discovery spike and potential client-side refresh. The KPI section is wrapped in `<Suspense>` so the listing shell renders immediately.

**When to use:** Server Components that need progressive streaming — listing info renders instantly, KPI section streams in after the internal API responds.

**Example:**
```typescript
// Source: node_modules/next/dist/docs/01-app/02-guides/streaming.md
// src/components/kpi/KpiSection.tsx (Server Component)

import { Suspense } from 'react'
import { fetchLocationKpi } from '@/lib/kpi/fetch'
import { KpiCard } from './KpiCard'

async function KpiContent({ locationId }: { locationId: string }) {
  const data = await fetchLocationKpi(locationId)
  if (!data) return null  // hide section entirely per locked decision

  return (
    <section>
      <h2>Live Performance Data</h2>
      <div className="grid grid-cols-4 gap-4">
        {/* render KpiCard for each available metric */}
      </div>
    </section>
  )
}

export function KpiSection({ locationId }: { locationId: string }) {
  return (
    <Suspense fallback={null}>
      <KpiContent locationId={locationId} />
    </Suspense>
  )
}
```

### Pattern 3: Recharts LineChart with Tooltip
**What:** A 12-month line chart using Recharts `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, and `Tooltip`. Must be a Client Component (`'use client'`) because Recharts uses browser APIs.

**When to use:** Trend chart inside KpiTrendModal and BundleOverlayChart.

**Example:**
```typescript
// Source: recharts 3.8.0 (verified via npm view)
// src/components/kpi/KpiTrendChart.tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface TrendPoint { month: string; value: number }

export function KpiTrendChart({ data, label }: { data: TrendPoint[]; label: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number, _name: string) => [
            `${label}: ${value.toLocaleString()}`,
          ]}
          labelFormatter={(label) => label}  // month string becomes tooltip date
        />
        <Line type="monotone" dataKey="value" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 4: Bundle Overlay Chart (multi-line)
**What:** One `LineChart` with one `<Line>` per location, each assigned a distinct color. Data shape: array of months with one key per locationId.

**Example:**
```typescript
// Multiple Line components, one per location
{locations.map((loc, i) => (
  <Line
    key={loc.id}
    type="monotone"
    dataKey={loc.id}
    stroke={PALETTE[i % PALETTE.length]}
    dot={false}
    strokeWidth={2}
    name={loc.name}
  />
))}
```

### Anti-Patterns to Avoid
- **Fetching KPI data client-side from the browser**: Exposes the internal API token. Always proxy server-side.
- **Using `unstable_cache` instead of `'use cache'`**: Docs explicitly state `unstable_cache` is replaced by `use cache` in Next.js 16. The project is on 16.2.0.
- **Importing Recharts in a Server Component without `'use client'`**: Recharts uses `window`/DOM APIs and will throw at build time.
- **Throwing errors in the KPI fetch layer**: All fetch failures must return `null`; the component layer hides the section on null — per locked decisions no error state is shown.
- **Nesting short-lived `'use cache'` in another `'use cache'` without explicit `cacheLife`**: Next.js 16 throws an error during prerendering for this pattern. Always set explicit `cacheLife` on both outer and inner cached functions when nesting.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data caching with per-key TTL | Custom in-memory Map with setTimeout | `'use cache'` + `cacheLife()` | Next.js cache survives hot reload, integrates with `revalidateTag`, and works across serverless function instances via Vercel's cache layer |
| Line chart rendering | Canvas/SVG path math | Recharts `LineChart` | Recharts handles axis scaling, tick formatting, responsive container, and tooltip positioning |
| Response shape validation from unknown API | Manual `if` guards | Zod schema on internal API response | Zod `safeParse` returns typed result and isolates schema change detection to one file |
| Sorting in the per-location table | DOM manipulation or custom sort | React state + `.sort()` on array | Array sort in state is sufficient; no library needed (table is not paginated) |

**Key insight:** The caching and proxy concerns are fully handled by Next.js 16 built-ins. Do not introduce Redis, edge KV, or external caching libraries for this phase.

---

## Common Pitfalls

### Pitfall 1: `'use cache'` requires `cacheComponents: true` in next.config
**What goes wrong:** Adding `'use cache'` directives works in development but fails at build with a cryptic error about unknown directives.
**Why it happens:** `'use cache'` is gated behind a feature flag in next.config.ts.
**How to avoid:** Enable `cacheComponents: true` in next.config.ts before writing any `'use cache'` code.
**Warning signs:** Build error mentioning "unknown directive" or "cacheComponents".

### Pitfall 2: `cacheLife` inside nested `'use cache'` scopes with no explicit outer lifetime
**What goes wrong:** A `fetchLocationKpi` function uses `cacheLife({ revalidate: 300 })` and is called from a `'use cache'` Server Component that has no explicit `cacheLife`. Next.js throws a prerender error.
**Why it happens:** Without explicit outer `cacheLife`, the inner short-lived cache propagates inward and Next.js flags the ambiguity.
**How to avoid:** Every function or component marked `'use cache'` must call `cacheLife(...)` explicitly.
**Warning signs:** "Prerendering error: nested cache without explicit cacheLife" during `next build`.

### Pitfall 3: Internal API token leaking to the client bundle
**What goes wrong:** `process.env.HS_INTERNAL_API_TOKEN` is referenced in a Client Component or a file that is imported by one, causing Next.js to include it in the browser bundle.
**Why it happens:** Next.js only strips server-only env vars from client bundles when they're accessed in Server Components or Route Handlers.
**How to avoid:** All internal API calls must live in `src/lib/kpi/fetch.ts` (a server-only module). Never import this file from a `'use client'` component. Use `import 'server-only'` in fetch.ts to get a build-time error if the file is accidentally imported client-side.
**Warning signs:** Network tab shows HS_INTERNAL_API_TOKEN in JS bundle; or `next/dist/build/webpack` tree-shaking warning.

### Pitfall 4: Recharts SSR/hydration mismatch
**What goes wrong:** Recharts renders dimensions using `window.innerWidth` on the client which differs from the server-rendered 0-width, causing a React hydration warning.
**Why it happens:** Recharts uses `ResizeObserver` and DOM measurement.
**How to avoid:** Always use `ResponsiveContainer` from recharts and wrap the chart component in `'use client'`. Do not attempt to render Recharts in a Server Component.
**Warning signs:** React console warning "Hydration failed because the initial UI does not match what was rendered on the server."

### Pitfall 5: Discovery spike not completed before 04-02/04-03 planning
**What goes wrong:** Plans 04-02 and 04-03 are written with assumed field names (`revenue`, `new_clients`, etc.) that differ from the actual API response — causing rework.
**Why it happens:** The internal API contract is fully unknown at research time (noted in STATE.md blockers).
**How to avoid:** Plan 04-01 (discovery spike) must be COMPLETED and its findings documented before 04-02 and 04-03 plans are written. The schema file (`src/lib/kpi/schema.ts`) should be the direct output of 04-01.
**Warning signs:** Any implementation in 04-02/04-03 that hard-codes API field names without a 04-01 summary file to reference.

---

## Code Examples

### `'use cache'` with custom 5-minute profile
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md
import { cacheLife } from 'next/cache'

export async function fetchLocationKpi(locationId: string) {
  'use cache'
  cacheLife({
    stale: 60,       // 1 min client router cache
    revalidate: 300, // 5 min server background refresh
    expire: 3600,    // 1 hr hard expiry
  })
  // ... fetch logic
}
```

### Zod schema for unknown API response
```typescript
// src/lib/kpi/schema.ts
import { z } from 'zod'

export const kpiMonthSchema = z.object({
  month: z.string(), // "2025-10" or "Oct 2025" — discover format in spike
  value: z.number(),
})

export const kpiDataSchema = z.object({
  revenue: z.object({
    lastMonth: z.number(),
    momChange: z.number(),   // decimal: 0.12 = +12%
    trend: z.array(kpiMonthSchema),
    updatedAt: z.string(),   // ISO datetime
  }).optional(),
  newClients: z.object({ /* same shape */ }).optional(),
  bookings: z.object({ /* same shape */ }).optional(),
  membershipConversion: z.object({
    lastMonth: z.number(),   // already a decimal: 0.45 = 45%
    momChange: z.number(),
    trend: z.array(kpiMonthSchema),
    updatedAt: z.string(),
  }).optional(),
})

export type KpiData = z.infer<typeof kpiDataSchema>
```

Note: field names here are illustrative. Plan 04-01 (discovery spike) will produce the authoritative schema.

### Next.js 16 Route Handler (dynamic route params)
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
// src/app/api/kpi/[locationId]/route.ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params  // params is a Promise in Next.js 16
  // ...
}
```

### Enabling cacheComponents in next.config
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

### Freshness timestamp display
```typescript
// Format "Updated 2 hours ago" from ISO datetime string
function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `Updated ${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  return `Updated ${hrs} hour${hrs !== 1 ? 's' : ''} ago`
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `unstable_cache` for server caching | `'use cache'` directive + `cacheLife()` | Next.js 16 | `unstable_cache` still works but docs say it is replaced; use the new API for new code |
| `middleware.ts` (file convention) | `proxy.ts` (file convention) | Next.js 16 | Route protection file renamed; project already has a `proxy.ts` (not `middleware.ts`) |
| `params` as plain object in Route Handlers | `params` as `Promise<{...}>` | Next.js 15+ | Must `await params` before destructuring — training-data code that skips this will fail |

**Deprecated/outdated:**
- `unstable_cache`: Docs say "replaced by `use cache` in Next.js 16" — do not use for new code in this project.
- `middleware.ts` file convention: Renamed to `proxy.ts` in Next.js 16 — already migrated in Phase 1.
- `import { unstable_noStore } from 'next/cache'`: Superseded by `cache: 'no-store'` on fetch or simply not wrapping with `'use cache'`.

---

## Open Questions

1. **Internal API contract (the critical unknown)**
   - What we know: The API exists and covers revenue, new clients, bookings, membership conversion. Auth mechanism and field shape unknown.
   - What's unclear: Endpoint URL structure, authentication (Bearer token? API key? mTLS?), rate limits, response field names, date format in trend data, whether trend is pre-computed or raw transactions.
   - Recommendation: Plan 04-01 must be a hands-on spike — make real requests to the API and document the response. Output: `src/lib/kpi/schema.ts` and `docs/kpi-api-contract.md`. Plans 04-02 and 04-03 block on this.

2. **`cacheComponents: true` flag — is it already set?**
   - What we know: The project does not yet have a `next.config.ts` with `cacheComponents` (only a basic config exists from Phase 1 setup).
   - What's unclear: Whether enabling `cacheComponents` affects any existing Phase 1-3 code.
   - Recommendation: Enable it in Plan 04-02 Wave 0 as a first step; check for any `unstable_cache` usage in earlier phases that may need migration.

3. **Internal API availability during development**
   - What we know: The API is Hello Sugar's internal system — likely not accessible from localhost.
   - What's unclear: Whether there's a sandbox/staging endpoint, mock data fixture, or VPN requirement for development.
   - Recommendation: Plan 04-01 spike should clarify this. Plan 04-02 should build a mock fixture that replicates the API response so development can proceed without live API access.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists from Phase 1) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIST-17 | `fetchLocationKpi` returns null when API is down | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ Wave 0 |
| LIST-17 | `fetchLocationKpi` returns null when API returns non-200 | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ Wave 0 |
| LIST-17 | `fetchLocationKpi` returns parsed KpiData when API responds successfully | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ Wave 0 |
| LIST-17 | Zod schema rejects response missing required fields | unit | `npm run test -- src/__tests__/kpi/schema.test.ts` | ❌ Wave 0 |
| LIST-18 | Trend data array has 12 entries (one per month) | unit | `npm run test -- src/__tests__/kpi/fetch.test.ts` | ❌ Wave 0 |
| LIST-19 | `aggregateBundleKpi` sums revenue across locations | unit | `npm run test -- src/__tests__/kpi/aggregate.test.ts` | ❌ Wave 0 |
| LIST-19 | `aggregateBundleKpi` excludes null (unavailable) locations gracefully | unit | `npm run test -- src/__tests__/kpi/aggregate.test.ts` | ❌ Wave 0 |

Note: KPI card rendering and chart rendering are visual/interactive and best verified manually. The unit tests above cover the data layer (fetch, schema, aggregation) which is automatable.

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/kpi/fetch.test.ts` — covers LIST-17, LIST-18 data layer
- [ ] `src/__tests__/kpi/schema.test.ts` — covers LIST-17 Zod validation
- [ ] `src/__tests__/kpi/aggregate.test.ts` — covers LIST-19 cumulative logic
- [ ] `src/lib/kpi/fetch.ts` — the module under test (created in 04-02)
- [ ] `src/lib/kpi/schema.ts` — output of 04-01 discovery spike
- [ ] `src/lib/kpi/aggregate.ts` — created in 04-02

---

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` — `'use cache'` directive, `cacheComponents` flag, Next.js 16 cache model
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cacheLife.md` — `cacheLife()` API, preset profiles, custom profiles
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Route Handler API, params as Promise
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — `unstable_cache` (legacy), fetch cache options
- `node_modules/next/dist/docs/01-app/02-guides/streaming.md` — Suspense + loading patterns
- `npm view recharts version` — confirmed 3.8.0 with React 19 peer dep support

### Secondary (MEDIUM confidence)
- `node_modules/next/dist/docs/01-app/02-guides/backend-for-frontend.md` — Route Handler as BFF/proxy pattern

### Tertiary (LOW confidence)
- None — all critical claims verified against installed Next.js 16 documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed against installed package.json and npm registry
- Architecture: HIGH — patterns derived from Next.js 16 official docs in node_modules
- Pitfalls: HIGH — `'use cache'` nesting error and `cacheComponents` flag requirement verified from docs; API token leak is a general server/client boundary rule confirmed by docs
- Chart library: HIGH — recharts peer deps verified via npm view, React 19 explicitly supported

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (Next.js 16 is stable; recharts 3.x is stable)
