# Architecture Research

**Domain:** Internal B2B franchise listing marketplace
**Researched:** 2026-03-19
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
├──────────────────┬──────────────────────┬───────────────────────────┤
│  (marketplace)   │      (admin)         │       (auth)              │
│  /browse         │  /admin/listings     │   /login                  │
│  /listings/[id]  │  /admin/users        │   /auth/callback          │
│  /map            │  /admin/dashboard    │                           │
│  /dashboard      │  /admin/alerts       │                           │
│  /my-listings    │                      │                           │
└──────────┬───────┴──────────────────────┴──────────┬────────────────┘
           │                                          │
┌──────────▼──────────────────────────────────────────▼────────────────┐
│                       MIDDLEWARE LAYER                                │
│   Auth check (NextAuth session) → Role gate → Route resolution        │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│                       API / SERVER LAYER                             │
├──────────────┬───────────────┬──────────────┬─────────────────────── │
│  Route       │  Server       │  External    │  Background            │
│  Handlers    │  Actions      │  API Proxy   │  Jobs (cron)           │
│  /api/*      │  (mutations)  │  /api/ops/*  │  alert emails          │
└──────┬───────┴───────┬───────┴──────┬───────┴────────────────────────┘
       │               │              │
┌──────▼───────────────▼──────────────▼─────────────────────────────── ┐
│                       DATA LAYER                                     │
├──────────────────────────────────┬──────────────────────────────────┤
│        Neon Postgres              │     Hello Sugar Internal API     │
│  listings, users, contacts,       │  revenue, bookings, membership  │
│  alerts, audit_log                │  new clients, operational KPIs  │
└──────────────────────────────────┴──────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Middleware (`middleware.ts`) | Validate session on every request; redirect unauthenticated users; enforce role gates before route resolution | NextAuth session, all routes |
| Auth routes (`(auth)/`) | Google OAuth flow via NextAuth; callback handling; session creation with role assignment | NextAuth, Neon (user lookup) |
| Marketplace routes (`(marketplace)/`) | Browse listings, map view, listing detail, buyer contact form, alert preferences | Server Actions, External API Proxy |
| Admin routes (`(admin)/`) | Approve/reject listings, user management, full listing edit, activity log | Server Actions, Neon |
| Seller routes (within `(marketplace)/`) | Create/edit own listings, view contact requests, track listing status | Server Actions, Neon |
| Server Actions | All data mutations (create listing, submit contact, set alert, approve/reject) | Neon Postgres |
| External API Proxy (`/api/ops/`) | Fetch live operational data from Hello Sugar internal API; cache responses; normalize shape | Hello Sugar API, Neon (for caching) |
| Notification Service | Send email alerts (new listing in watched area, buyer contact received) | Resend or Nodemailer, Neon |
| Map component (client) | Render listing pins on Mapbox; popups on click; filter sync | react-map-gl (client-only, `'use client'`) |
| Chart components (client) | 12-month KPI trend charts | Recharts or Chart.js (client-only) |

## Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Google SSO entry point
│   │   └── auth/callback/route.ts   # OAuth callback handler
│   ├── (marketplace)/
│   │   ├── layout.tsx               # Shared nav for buyers/sellers
│   │   ├── browse/page.tsx          # Listing grid + filters
│   │   ├── map/page.tsx             # Map view wrapper (server shell)
│   │   ├── listings/
│   │   │   ├── [id]/page.tsx        # Listing detail + KPI dashboard
│   │   │   └── new/page.tsx         # Create listing form (seller)
│   │   ├── my-listings/page.tsx     # Seller's own listings
│   │   └── alerts/page.tsx          # Buyer area alert preferences
│   ├── (admin)/
│   │   ├── layout.tsx               # Admin nav, admin-only gate
│   │   ├── listings/page.tsx        # Approve/reject queue
│   │   ├── listings/[id]/page.tsx   # Full admin edit view
│   │   ├── users/page.tsx           # User management
│   │   └── activity/page.tsx        # Audit log
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│       └── ops/
│           ├── [locationId]/route.ts    # Live data proxy endpoint
│           └── kpi/[locationId]/route.ts # KPI trend data
├── components/
│   ├── listings/                    # ListingCard, ListingForm, StatusBadge
│   ├── kpi/                         # KpiCard, TrendChart, MetricGrid
│   ├── map/                         # MapView (client), ListingMarker
│   ├── admin/                       # ApprovalQueue, UserTable, AuditLog
│   └── ui/                          # Shared primitives (Button, Modal, etc.)
├── lib/
│   ├── auth.ts                      # NextAuth config, Google provider
│   ├── db/
│   │   ├── schema.ts                # Neon table definitions (Drizzle/raw SQL)
│   │   ├── listings.ts              # Listing queries
│   │   ├── users.ts                 # User queries
│   │   └── alerts.ts                # Alert queries
│   ├── ops-api/
│   │   ├── client.ts                # Hello Sugar API HTTP client
│   │   ├── transforms.ts            # Normalize API response → internal shape
│   │   └── cache.ts                 # Cache strategy (revalidate intervals)
│   ├── email/
│   │   ├── send.ts                  # Email dispatch wrapper
│   │   └── templates/               # Contact notification, new-listing alert
│   └── permissions.ts               # Role constants and check helpers
├── actions/
│   ├── listings.ts                  # createListing, updateListing, submitContact
│   ├── admin.ts                     # approveListing, rejectListing, editAnyListing
│   └── alerts.ts                    # createAlert, deleteAlert
└── middleware.ts                    # Session guard + role routing
```

### Structure Rationale

- **`(auth)/`, `(marketplace)/`, `(admin)/`** Route groups give each persona its own layout without affecting URLs. Admin layout adds role check; marketplace layout adds buyer/seller nav. This is the canonical Next.js RBAC pattern.
- **`api/ops/`** External API calls proxied through Next.js Route Handlers so credentials never reach the client and caching is applied server-side.
- **`actions/`** All mutations are Server Actions, co-located by domain not by page. This avoids scattered form logic and enables direct Postgres access without REST indirection.
- **`lib/db/`** Query functions separated from components — components call query functions, not raw SQL. Enables reuse across pages and Server Actions without duplication.
- **`lib/ops-api/`** Isolated from the rest of the app. If the external API changes shape, only `transforms.ts` needs updating.

## Architectural Patterns

### Pattern 1: Route Group Role Segregation

**What:** Separate route groups `(marketplace)` and `(admin)` each with their own `layout.tsx`. The admin layout checks session role and redirects if not admin. Marketplace layout handles buyer/seller UI differences via conditional rendering.

**When to use:** Any time different user types need different chrome (navigation, permissions) without different URL prefixes.

**Trade-offs:** Clean separation, easy to audit. Slight duplication if shared UI exists — extract those to `components/`.

```typescript
// app/(admin)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/browse')
  return <div className="admin-shell">{children}</div>
}
```

### Pattern 2: External API Proxy with Time-Based Revalidation

**What:** Hello Sugar operational data is never fetched directly from client components. A Next.js Route Handler at `/api/ops/[locationId]` fetches from the internal API, normalizes the shape, and serves it with `next: { revalidate: 300 }` (5-minute cache). Listing detail pages call this proxy, not the external API directly.

**When to use:** Any time an external API credential must be hidden, rate limits need to be respected, or response shape needs normalization before display.

**Trade-offs:** Adds one network hop server-to-server, but eliminates CORS issues, protects credentials, and gives a single point to add error handling and fallbacks.

```typescript
// app/api/ops/[locationId]/route.ts
export async function GET(req, { params }) {
  const data = await fetch(
    `${process.env.HS_API_BASE}/locations/${params.locationId}/kpis`,
    {
      headers: { Authorization: `Bearer ${process.env.HS_API_KEY}` },
      next: { revalidate: 300 },   // 5-min stale-while-revalidate
    }
  )
  const raw = await data.json()
  return Response.json(transformOpsData(raw))
}
```

### Pattern 3: Listing State Machine (Postgres-backed)

**What:** Listings move through explicit states stored in a `status` column: `draft → pending_approval → active | rejected`. Transitions are enforced in Server Actions — a seller cannot set status to `active` directly, only the admin `approveListing` action can. All transitions are written to an `audit_log` table.

**When to use:** Any time a business object has a lifecycle with access-controlled transitions. Avoids ad-hoc boolean flags that drift.

**Trade-offs:** Adds an `audit_log` table and transition-check logic, but makes compliance, debugging, and admin visibility trivial.

```typescript
// Valid transitions enforced in server actions
const VALID_TRANSITIONS = {
  draft: ['pending_approval'],
  pending_approval: ['active', 'rejected'],
  active: ['draft'],        // seller can unpublish
  rejected: ['draft'],      // seller can revise and resubmit
}
```

## Data Flow

### Listing Creation Flow

```
Seller fills form (client)
    ↓
Server Action: createListing()
    ↓
Neon: INSERT listing (status = 'draft')
    ↓
Seller submits for review
    ↓
Server Action: submitForReview()
    ↓
Neon: UPDATE status = 'pending_approval' + INSERT audit_log
    ↓
Email: notify admin of new submission
    ↓
Admin approves in (admin)/listings
    ↓
Server Action: approveListing() [admin role required]
    ↓
Neon: UPDATE status = 'active' + INSERT audit_log
    ↓
Listing visible on /browse and /map
    ↓
Email: trigger area alerts matching listing location
```

### Listing Detail / KPI Data Flow

```
User navigates to /listings/[id]
    ↓
Server Component fetches listing row from Neon (direct DB query)
    ↓
Server Component fetches live KPIs from /api/ops/[locationId]
    (cached 5 min, stale-while-revalidate)
    ↓
Client receives merged payload: listing metadata + live KPI data
    ↓
KpiCard components render summary cards (RSC, no JS)
TrendChart renders 12-month chart (client component, hydrated)
    ↓
Buyer submits contact form
    ↓
Server Action: submitContact() → INSERT contact_request → email seller
```

### Authentication Flow

```
User hits any protected route
    ↓
middleware.ts: check NextAuth session cookie
    ↓
No session → redirect to /login
    ↓
/login → Google OAuth redirect (NextAuth)
    ↓
Google callback → NextAuth jwt callback adds role from DB lookup
    ↓
Session contains: { user: { id, email, role: 'buyer'|'seller'|'admin' } }
    ↓
middleware.ts: route group role gate resolves
```

### Alert Notification Flow

```
Buyer sets area alert (state or city) via /alerts
    ↓
Server Action: createAlert() → INSERT user_alert
    ↓
[Background] Cron job runs on listing activation OR
             revalidatePath triggers after approveListing()
    ↓
Query: alerts matching new listing's state/city
    ↓
Email dispatch: each matched buyer notified
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users (v1) | Single Next.js app on Vercel, direct Neon queries in Server Actions, time-based KPI cache, Resend for email |
| 500-5k users | Add Redis (Upstash) for alert fan-out queuing, move cron jobs to Vercel Cron, add DB connection pooling via PgBouncer (Neon has this built-in) |
| 5k+ users | Separate alert/email worker service, CDN-cache static listing pages with on-demand revalidation via `revalidateTag` |

### Scaling Priorities

1. **First bottleneck:** External API rate limits. The Hello Sugar internal API may throttle concurrent requests from listing detail pages. Fix: aggressive caching at the proxy layer (`revalidate: 300`), optional DB-level KPI snapshot table for burst traffic.
2. **Second bottleneck:** Alert fan-out on popular listing approvals. If many buyers watch the same state, a synchronous email loop blocks the approval action. Fix: queue emails via Resend batch API or a simple Postgres-backed job queue.

## Anti-Patterns

### Anti-Pattern 1: Fetching External API Directly from Client Components

**What people do:** Call the Hello Sugar API from `useEffect` or a client-side fetch, passing the API key via environment variable prefixed `NEXT_PUBLIC_`.

**Why it's wrong:** Exposes the API key in the browser bundle. Also bypasses caching, causing one external API call per user per page load.

**Do this instead:** Always proxy through `/api/ops/[locationId]` Route Handler. The key stays server-side and caching applies.

### Anti-Pattern 2: Role Checks Inside Page Components Only

**What people do:** Check `session.user.role` inside the page JSX and render null if unauthorized.

**Why it's wrong:** The page still renders on the server; data fetches still execute. A crafty user can observe timing or intercept network calls. Also makes admin routes discoverable.

**Do this instead:** Enforce role gates in `middleware.ts` (edge) for route-level blocking, and again in `layout.tsx` for belt-and-suspenders. Page components can then assume the user is authorized.

### Anti-Pattern 3: Mixing Seller and Admin Mutations in the Same Server Action

**What people do:** A single `updateListing` action handles both seller edits and admin edits with an `if (role === 'admin')` branch inside.

**Why it's wrong:** Privilege escalation risk if the role check has a bug. Harder to audit — one function does two conceptually different things.

**Do this instead:** Separate `updateOwnListing` (checks ownership) and `adminUpdateListing` (checks admin role) as distinct actions in `actions/listings.ts` and `actions/admin.ts` respectively.

### Anti-Pattern 4: Using Client Components for Data Fetching

**What people do:** Default to `'use client'` + `useEffect` for all data, because it feels familiar from React SPA patterns.

**Why it's wrong:** Introduces loading spinners, layout shift, and network waterfalls for data that could be server-rendered. Listing browse and detail pages have no interactivity requirements for their initial data.

**Do this instead:** Server Components for all initial data loads (listing grid, KPI cards, user details). Add `'use client'` only for interactive elements: map canvas, trend charts, form state.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Hello Sugar Internal API | Server-side Route Handler proxy with `next: { revalidate: 300 }` | Credentials in env vars; never client-side |
| Google Workspace SSO | NextAuth v5 Google provider with `hd` domain restriction | Lock to `hellosugarsalons.com` domain via `hd` param to prevent outside signups |
| Mapbox | `react-map-gl` as client component with `dynamic(() => import(...), { ssr: false })` | GL JS requires `window`; must be client-only |
| Email (Resend) | Called from Server Actions and alert cron job | Resend is simpler than Nodemailer for Vercel; reliable free tier |
| Neon Postgres | Direct queries from Server Components and Server Actions via `@neondatabase/serverless` | Use connection pooling endpoint for serverless; branch per environment |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component → Neon | Direct query via `lib/db/*.ts` query functions | No REST layer; query functions are the abstraction |
| Server Action → Neon | Same `lib/db/` functions | Actions call queries, not raw SQL inline |
| Server Component → External API | Via `/api/ops/` Route Handler fetch (internal HTTP) | This enables caching and credential isolation |
| Middleware → NextAuth | `auth()` helper from `lib/auth.ts` | Session available at edge without DB round-trip |
| Map component → Listing data | Props passed from parent Server Component | Map receives pre-fetched listing array; no client-side API calls |
| Alert job → Email service | Invoked via Vercel Cron → Route Handler → Resend | Keep cron handler thin; business logic in `lib/email/` |

## Build Order Implications

The component dependencies create a natural build sequence:

1. **Auth + middleware first** — Everything requires authentication. No other feature is testable without it. Google OAuth + role assignment + route protection is the foundation.
2. **Database schema second** — Listings, users, contacts, alerts tables. Schema is the contract all other layers depend on.
3. **Listing CRUD + approval workflow** — The core business object. Seller create/edit, admin approve/reject, state machine transitions.
4. **Browse + filters** — Requires active listings to exist. List view is the primary buyer surface.
5. **External API proxy + KPI dashboard** — Depends on listings existing (need locationIds). The live data layer can be mocked initially and swapped in once the API contract is known.
6. **Map view** — Requires listings with geocoordinates. Mapbox client component can be added once browse is working, since it consumes the same data.
7. **Contact form + email notifications** — Stateless from the listing perspective; can be added after browse/detail are stable.
8. **Area alerts** — Depends on email infrastructure and active listings existing to match against.
9. **Admin dashboard analytics** — Aggregate views over existing data; lowest dependency.

## Sources

- [Next.js App Router Routing Documentation](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Auth.js Role-Based Access Control](https://authjs.dev/guides/role-based-access-control)
- [Next.js Authentication Guide](https://nextjs.org/docs/pages/guides/authentication)
- [Next.js Caching and Revalidation](https://nextjs.org/docs/app/guides/caching)
- [Neon + Next.js Server Actions Guide](https://neon.com/guides/next-server-actions)
- [react-map-gl Mapbox Integration](https://dev.to/niharikak101/integrating-mapbox-with-next-js-the-cheaper-alternative-to-google-maps-g39)
- [Enterprise Patterns with Next.js App Router](https://medium.com/@vasanthancomrads/enterprise-patterns-with-the-next-js-app-router-ff4ca0ef04c4)
- [Marketplace Architecture Trends 2025](https://ulansoftware.com/blog/marketplace-software-architecture-trends-2025)

---
*Architecture research for: Internal franchise listing marketplace (Hello Sugar)*
*Researched: 2026-03-19*
