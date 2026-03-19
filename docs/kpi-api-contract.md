# Hello Sugar Internal API — KPI Contract

**Status:** ASSUMED — Not verified against live API. Credentials unavailable during Phase 4 development.
**Verify when:** HS_INTERNAL_API_URL and HS_INTERNAL_API_TOKEN are available.
**Schema source:** src/lib/kpi/schema.ts (Zod validation)
**Fetch implementation:** src/lib/kpi/fetch.ts

---

## Authentication

Bearer token via Authorization header.

```
Authorization: Bearer {HS_INTERNAL_API_TOKEN}
```

Environment variables required:
- `HS_INTERNAL_API_URL` — Base URL (e.g., `https://api.hellosugar.salon/v1`)
- `HS_INTERNAL_API_TOKEN` — Bearer token for API authentication

Both vars must be present in `.env.local` for KPI data to appear. If either is
missing, fetch.ts returns mock data in development and null in production
(graceful degradation — KPI section is hidden, not broken).

---

## Endpoints

### Single Location KPI

```
GET {HS_INTERNAL_API_URL}/locations/{locationId}/kpi
```

Returns KPI metrics for one location. `locationId` is the location's database ID
from the `listingLocations` table.

**Success:** `200 OK` with JSON body (see Response Fields below)
**Not found / unavailable:** Any non-200 status → fetch.ts returns null

### Bundle KPI (internal aggregation)

Bundle KPI data is fetched by calling the single-location endpoint for each
location ID individually (in parallel) via `fetchBundleKpi()`. There is no
dedicated bundle endpoint on the internal API.

---

## Response Fields

All fields are optional. Missing fields are excluded from the response.
The Zod schema (src/lib/kpi/schema.ts) validates this shape.

```json
{
  "revenue": {
    "lastMonth": 45230,
    "momChange": 0.12,
    "trend": [
      { "month": "2025-03", "value": 38400 },
      { "month": "2025-04", "value": 39100 },
      "...12 months total..."
    ],
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  "newClients": {
    "lastMonth": 82,
    "momChange": 0.03,
    "trend": ["..."],
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  "bookings": {
    "lastMonth": 358,
    "momChange": 0.05,
    "trend": ["..."],
    "updatedAt": "2026-03-01T00:00:00Z"
  },
  "membershipConversion": {
    "lastMonth": 0.42,
    "momChange": 0.02,
    "trend": ["..."],
    "updatedAt": "2026-03-01T00:00:00Z"
  }
}
```

**Field notes:**
- `lastMonth` — numeric value for the most recent complete month
- `momChange` — month-over-month change as a decimal ratio (0.12 = +12%)
- `trend` — array of 12 monthly values, oldest first. Month format: "YYYY-MM"
- `updatedAt` — ISO 8601 timestamp of when this metric was last refreshed
- `membershipConversion.lastMonth` — decimal ratio (0.42 = 42%), NOT integer percentage

---

## Error Handling

| Scenario | API Behavior | Our Behavior |
|----------|-------------|--------------|
| API unreachable | Network error (thrown) | Returns null → KPI section hidden |
| Non-200 response | HTTP error status | Returns null → KPI section hidden |
| Invalid response shape | 200 with unexpected JSON | Zod validation fails → returns null |
| Missing KPI metric | Field absent from response | Field is undefined in KpiData → card hidden |
| Stale data | API returns cached value | `updatedAt` timestamp shown on card |
| No credentials (dev) | N/A | Returns mock data from mock-data.ts |

---

## Caching

Implemented in fetch.ts using Next.js `'use cache'` directive:
- Stale: 60 seconds (client-side)
- Revalidate: 300 seconds / 5 minutes (server background refresh)
- Expire: 3600 seconds / 1 hour (hard expiry)

Route Handlers at `/api/kpi/[locationId]` and `/api/kpi/bundle` expose the
cached data to client components if needed (not currently used — KpiSection
fetches directly as a Server Component).

---

## Development Without Credentials

When `HS_INTERNAL_API_URL` or `HS_INTERNAL_API_TOKEN` is absent, fetch.ts
automatically falls back to mock data from src/lib/kpi/mock-data.ts:

```typescript
import { mockLocationKpi, generateMockBundleKpi } from '@/lib/kpi/mock-data'
```

To test KpiSection with mock data locally, simply omit the env vars in `.env.local`.
The `shouldUseMockData()` check in fetch.ts handles the fallback automatically.

---

*Last updated: 2026-03-19*
*Updated by: Phase 4 gap closure (04-05)*
