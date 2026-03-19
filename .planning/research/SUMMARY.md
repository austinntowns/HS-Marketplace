# Project Research Summary

**Project:** Hello Sugar Internal Franchise Resale Marketplace
**Domain:** Internal B2B franchise listing marketplace (authenticated, lead-capture)
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This project is an authenticated, internal-only B2B marketplace for Hello Sugar franchise resales — enabling franchisees to list suites, flagships, territories, and multi-location bundles for sale to other qualified buyers within the network. The platform's core value proposition is not just listing management, but live operational data: KPI metrics pulled from Hello Sugar's internal API are displayed alongside seller-entered financials, creating a trust signal that no public marketplace (BizBuySell, Acquire.com) can replicate. Research confirms the recommended approach is Next.js 16 App Router deployed on Vercel with Neon Postgres, with Auth.js v5 enforcing Google Workspace SSO and Drizzle ORM handling all database access. The architecture relies on Server Actions for mutations, server-side route handler proxying for external API data, and route group role segregation for admin vs. marketplace personas.

The recommended build sequence prioritizes authentication and database schema before any feature work, because auth gates everything and schema mistakes are expensive to migrate. The listing state machine (draft → pending review → active/rejected) must be modeled as an explicit enum from the first migration — not a boolean. Live KPI data from Hello Sugar's internal API should be proxied through a cached Next.js route handler to protect credentials, prevent rate limit hammering, and ensure the listing page degrades gracefully when the internal API is unavailable. The external API integration is the highest-complexity dependency and the single feature that most differentiates this platform.

The primary risks are security-related: middleware-only authentication without per-handler session checks, Google OAuth domain not restricted to the Hello Sugar Workspace, and financial data leaking in index API responses. All three are architectural mistakes made in the first sprint and expensive to fix retroactively. The prevention strategy is to establish role-filtered query functions and session verification patterns in Phase 1, before a single listing endpoint is written.

---

## Key Findings

### Recommended Stack

The stack is well-established and fully compatible. Next.js 16.2.0 with the App Router is the foundation — Turbopack is now the default bundler, React Compiler is stable, and Server Actions handle all mutations without separate API routes. Neon Postgres with the `@neondatabase/serverless` driver is the database layer, chosen for its serverless architecture and first-class Vercel integration. Drizzle ORM 0.45.1 provides type-safe schema-as-code with SQL-like syntax and is the standard pairing with Neon. Auth.js v5 (beta but production-ready) is the only viable path for Google Workspace SSO with App Router compatibility. Tailwind CSS v4 and shadcn/ui cover the entire UI surface without custom component work.

All versions have been verified against the npm registry. The one caveat is that Auth.js v5 remains in beta — the migration to a stable release may introduce breaking changes, but it is the only supported path for Next.js App Router and is widely deployed in production.

**Core technologies:**
- Next.js 16.2.0: Full-stack framework — App Router + Server Actions eliminate the need for a separate API layer
- Neon Postgres + `@neondatabase/serverless` 1.0.2: Serverless database — scales to zero, Vercel-native, built-in PgBouncer pooling
- Drizzle ORM 0.45.1: Type-safe database access — schema-as-code, works natively with Neon's serverless driver
- Auth.js (next-auth) v5.0.0-beta.30: Authentication — universal `auth()` across Server Components + middleware, Google Workspace SSO with `hd` restriction
- Tailwind CSS v4 + shadcn/ui: UI layer — covers DataTable, Cards, Charts, Sidebar, Sheet, Dialog; no custom component work required
- react-hook-form 7.71.2 + Zod 4.3.6: Form validation — uncontrolled inputs with shared schema validation on client and server
- react-map-gl 8.1.0 + Mapbox: Map view — dynamic import required (no SSR), use `react-map-gl/mapbox` export
- Resend 6.9.4 + React Email: Transactional email — contact notifications, listing alerts, approval status emails
- TanStack Query 5.91.2: Client-side polling — use only for live KPI refresh intervals, not general CRUD

### Expected Features

Features research distinguishes clearly between what buyers/sellers assume exists (table stakes) and what makes this platform genuinely differentiated (live operational data). Authentication is the dependency for everything — it must ship first.

**Must have (table stakes — v1 launch):**
- Google SSO authentication with buyer/seller/admin roles — gating requirement for all else
- Listing creation for all 4 types (suite, flagship, territory, bundle) with seller-entered financials
- Live API KPI display from Hello Sugar internal API on listing detail — the primary differentiator; do not launch without it
- Admin approve/reject flow with email notification to seller
- List view with filters (type, state, price range)
- Listing detail page with photos, financials, and KPIs
- Contact form on listing with seller email notification
- Listing status visibility for seller (draft / pending review / active / rejected)
- Photo upload (5-10 image limit)

**Should have (add post-launch validation — v1.x):**
- 12-month KPI trend charts — add when buyers request trajectory visibility
- Map view — add when territory listings are active and geography matters to decisions
- Area/state alerts — add when repeat-visit patterns show buyers need notifications
- Admin activity dashboard — add when approval queue alone is insufficient for visibility
- Bundle cumulative + per-location toggle — add when first bundle listing is submitted

**Defer (v2+):**
- In-app messaging — only if email hand-off is losing deals
- Offer/negotiation workflow — only if corporate decides to manage transactions in-house
- Automated valuation tooling — only if enough historical sale data accumulates for reliable comps

### Architecture Approach

The system uses three distinct layers: client (route groups for marketplace/admin/auth personas), a middleware layer for session validation and role routing, and a server/data layer with Server Actions for mutations and a proxied route handler for the Hello Sugar internal API. The external API is never called directly from client components — credentials are server-side and responses are cached with time-based revalidation. Listing status is a Postgres enum state machine (not a boolean), and every admin action writes to an audit log.

**Major components:**
1. Middleware (`middleware.ts`) — session validation and role-based route blocking at edge; redirect unauthenticated requests to `/login`
2. Route Groups `(marketplace)/` and `(admin)/` — separate layouts per persona; admin layout independently enforces role check
3. External API Proxy (`/api/ops/[locationId]`) — server-side fetch from Hello Sugar internal API with 5-minute cache; normalizes shape; hides credentials
4. Server Actions (`actions/`) — all data mutations (createListing, approveListing, submitContact, createAlert); separated by domain
5. `lib/db/` Query Functions — explicit column-selected queries per role shape; never `SELECT *`; reusable across pages and actions
6. Notification Service — Resend email dispatch for contact notifications, listing status changes, and area alerts

### Critical Pitfalls

1. **Middleware-only auth (CVE-2025-29927 class)** — Every Server Action and Route Handler must independently verify the session. Middleware is a UX redirect layer only, not a security gate. Establish session-check pattern in Phase 1 before writing any data-access code.

2. **Google OAuth domain not restricted** — NextAuth Google provider accepts any Google account by default. Add `signIn` callback rejecting `profile.hd !== "hellosugarsalons.com"` AND set OAuth Consent Screen to "Internal" in Google Cloud Console. Verify by attempting login with a personal `@gmail.com` — it must be rejected.

3. **Financial data in index API responses** — Define role-filtered query shapes from day one: `PublicListingView` (no financials), `BuyerListingView` (financials on detail only), `AdminListingView` (full object). Enforce at the query layer via explicit column selection, not at serialization.

4. **Listing status modeled as a boolean** — `is_approved BOOLEAN` cannot represent draft, pending, rejected, or delisted states. Model as an enum from the first migration. Recovery requires a careful multi-step migration and is expensive to retrofit.

5. **Contact notification email configured late** — DNS propagation (SPF/DKIM) takes 24-48 hours. Configure Resend and the Hello Sugar mail subdomain during infrastructure setup, not during feature development. A marketplace where buyer inquiries silently fail has no value.

---

## Implications for Roadmap

Based on the dependency graph across all four research files, the natural build sequence is clear. Authentication and schema cannot be skipped or deferred. The internal API integration is the highest-complexity work and the platform's differentiator — it should be proven early with a mock, then replaced with the real integration before launch.

### Phase 1: Auth, Schema, and Infrastructure Foundation

**Rationale:** Authentication is required by every feature; nothing is testable without it. Database schema is the contract all other layers depend on — mistakes here are the most expensive to fix. Email infrastructure must be configured before feature work (DNS propagation delay). These three concerns are the foundation that makes every subsequent phase safe to build.

**Delivers:** Working Google Workspace SSO with role assignment, complete Neon database schema with listing state machine, configured transactional email provider, middleware session enforcement, and role-based route protection.

**Addresses:** Auth, roles, listing schema, email infrastructure (from FEATURES.md table stakes)

**Avoids:** Middleware-only auth pitfall, Google domain not restricted pitfall, listing status boolean pitfall, contact notifications configured late pitfall

### Phase 2: Listing CRUD and Admin Moderation Workflow

**Rationale:** Listings are the core business object. The seller create/edit flow and the admin approve/reject queue must exist before any buyer-facing features can be built — there is nothing to browse without approved listings. The state machine (draft → pending review → active/rejected) and audit log are established here.

**Delivers:** Seller listing creation form for all 4 types (suite, flagship, territory, bundle), listing status tracking, admin approval queue with rejection reasons, email notifications on status transitions, and photo upload.

**Uses:** Server Actions, Drizzle ORM, react-hook-form + Zod, shadcn DataTable + Badge (from STACK.md)

**Implements:** Listing state machine, seller/admin route group separation, `actions/listings.ts` and `actions/admin.ts` separation (from ARCHITECTURE.md)

**Avoids:** Admin has no moderation queue pitfall, financial data in wrong API responses pitfall

### Phase 3: Browse and Discovery

**Rationale:** With approved listings existing, buyer-facing browse is buildable. Filters must be implemented before alerts (alerts are saved filters with notification triggers). Map view can follow list view as it consumes the same data with a lean endpoint.

**Delivers:** List view with filters (type, state, price range), listing detail page with seller-entered financials and photos, contact form with seller email notification, URL-synced filter state.

**Uses:** shadcn DataTable, react-map-gl (Mapbox), TanStack Query for filter state (from STACK.md)

**Implements:** Lean map endpoint (only coordinates + minimal metadata, no financials in payload), viewport filtering, URL param filter sync (from ARCHITECTURE.md)

**Avoids:** Map view shipping all financials to client pitfall, filter state lost on view switch UX pitfall

### Phase 4: Live Data Integration (KPI Dashboard)

**Rationale:** The internal API integration is the platform's primary differentiator and the highest technical risk. It should be mocked in Phase 3 (so listing detail renders without it) and fully integrated here. Separating this phase means API delays or contract changes don't block the rest of the platform.

**Delivers:** Live KPI cards on listing detail (revenue, bookings, new clients, membership conversion), 5-minute cached API proxy, graceful fallback when internal API is unavailable, financial data provenance labeling (seller-entered vs API-verified).

**Uses:** `/api/ops/[locationId]` Route Handler with `next: { revalidate: 300 }`, `lib/ops-api/` transforms layer, TanStack Query for client-side refresh (from STACK.md)

**Implements:** External API Proxy pattern, stale-while-revalidate caching strategy (from ARCHITECTURE.md)

**Avoids:** Live API data fetched on every request pitfall, API unavailability crashing listing page pitfall

### Phase 5: Engagement Features (Alerts, Trends, Admin Analytics)

**Rationale:** These features build on top of a working core and add stickiness. Area alerts require both the filter model (Phase 3) and email infrastructure (Phase 1) to exist. Trend charts require historical KPI data from Phase 4. Admin analytics are aggregate views over existing data — the lowest dependency of any feature.

**Delivers:** 12-month KPI trend charts per listing, buyer area/state alert preferences with email notification on matching listing approval, admin activity dashboard with inquiry volume and listing age metrics.

**Uses:** Recharts via shadcn Chart wrapper, Resend batch API for alert fan-out, Vercel Cron for alert jobs (from STACK.md)

**Implements:** Alert notification flow, background alert fan-out (from ARCHITECTURE.md)

**Avoids:** Alert fan-out blocking approval action pitfall, alert emails with no unsubscribe mechanism pitfall

### Phase Ordering Rationale

- Auth before everything because no feature is testable or securable without identity
- Schema before features because the listing state machine enum is schema-level and cannot be retroactively added without a migration
- Email infrastructure in Phase 1 because DNS propagation takes 24-48 hours and cannot be done concurrently with feature work
- Admin moderation before browse because there are no approved listings to browse otherwise
- Internal API integration isolated in its own phase so API delays don't block the core product
- Alerts and analytics last because they have the most upstream dependencies but zero blocking relationships downstream

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 4 (Live Data Integration):** The Hello Sugar internal API contract is unknown — endpoint shape, authentication method, rate limits, and available KPI fields all need validation before implementation. This phase requires a discovery spike or API documentation review before work can be scoped.
- **Phase 5 (Area Alerts):** Vercel Cron behavior for alert fan-out at scale needs validation. If many buyers watch the same state, synchronous email loops may need to be replaced with Resend batch API — scope depends on anticipated subscriber volume.

Phases with standard patterns (research likely unnecessary):

- **Phase 1 (Auth + Schema):** Auth.js v5 + Google Workspace SSO is a well-documented pattern with official guides. Drizzle schema migrations are straightforward. No novel patterns.
- **Phase 2 (Listing CRUD + Admin):** Server Actions + react-hook-form + shadcn DataTable is a standard Next.js pattern with abundant examples.
- **Phase 3 (Browse + Map):** List/filter pattern is well-documented. react-map-gl + Next.js dynamic import is covered in official docs. URL-synced filter state is a standard pattern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions verified against npm registry on 2026-03-19; official docs consulted for compatibility matrix |
| Features | HIGH (table stakes) / MEDIUM (differentiators) | Table stakes are ground truth from PROJECT.md; differentiator value based on analog marketplace analysis |
| Architecture | HIGH | Patterns derived from official Next.js, Auth.js, and Neon documentation; canonical App Router patterns |
| Pitfalls | HIGH (Next.js/auth) / MEDIUM (marketplace-specific) | Security pitfalls reference official Vercel security guide and CVE documentation; marketplace UX pitfalls from community sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Hello Sugar internal API contract:** Endpoint structure, authentication mechanism, available KPI fields, rate limits, and historical data depth are all unknown. Phase 4 planning requires a discovery spike or API documentation review before work can be scoped with confidence. Design the proxy layer to accept a mock during Phases 1-3.
- **Hello Sugar Workspace domain name:** Auth configuration requires the exact Workspace domain for the `hd` parameter. Assumed `hellosugarsalons.com` based on context — confirm before writing auth config.
- **Photo storage provider:** The stack recommends cloud storage for listing photos but does not specify a provider. Vercel Blob and Cloudinary are the two standard choices for Next.js/Vercel deployments. Decision needed before Phase 2 listing form work.
- **Bundle listing geodata requirements:** Territory listings require polygon geodata for map visualization. Source and format of this data is unknown. May need to be deferred or handled manually if geodata is not available.

---

## Sources

### Primary (HIGH confidence)
- npm registry (verified 2026-03-19) — all package versions and compatibility
- [Next.js 16 release announcement](https://nextjs.org/blog/next-16) — Turbopack default, React Compiler stable, LTS
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — App Router support, ENV prefix changes
- [Auth.js Google provider docs](https://authjs.dev/reference/core/providers/google) — `hd` parameter for Workspace restriction
- [Neon serverless driver docs](https://neon.com/docs/serverless/serverless-driver) — HTTP/WebSocket transport
- [Neon + Drizzle guide](https://neon.com/docs/guides/drizzle) — official integration
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — compatibility confirmed
- [Next.js App Router Routing Documentation](https://nextjs.org/docs/app/building-your-application/routing) — route groups, layouts
- [Auth.js Role-Based Access Control](https://authjs.dev/guides/role-based-access-control) — RBAC patterns
- [Neon + Next.js Server Actions Guide](https://neon.com/guides/next-server-actions) — mutation patterns
- [Common mistakes with the Next.js App Router — Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — pitfalls
- [Next.js Complete Security Guide 2025 — TurboStarter](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices) — security pitfalls
- PROJECT.md requirements baseline — ground truth for feature scope

### Secondary (MEDIUM confidence)
- [BizBuySell seller lead tools](https://www.bizbuysell.com/seller-leads-broker-faq/) — analog marketplace feature patterns
- [Franchise resale process patterns](https://kmfbusinessadvisors.com/selling-and-buying-existing-franchises/) — approval workflow norms
- [Rise of franchise resale programs 2025](https://blog.wesellrestaurants.com/franchise-resales-are-redefining-growth-insights-from-fldc-2025-and-the-rise-of-resale-programs) — industry context
- [Marketplace UX patterns](https://www.rigbyjs.com/blog/marketplace-ux) — filter and alert patterns
- [B2B marketplace essential features](https://www.journeyh.io/blog/b2b-marketplace-models-features) — feature baseline
- [NextAuth Google domain restriction discussion](https://github.com/nextauthjs/next-auth/discussions/266) — `hd` enforcement pattern
- [Row-Level Security with Neon](https://neon.com/docs/guides/row-level-security) — RLS patterns
- [Transactional email best practices — Postmark 2026](https://postmarkapp.com/guides/transactional-email-best-practices) — email setup timing

### Tertiary (LOW confidence)
- [Internal franchise portal features — Claromentis](https://www.claromentis.com/blog/must-have-franchise-software-features) — franchise intranet context, not resale marketplace; used for RBAC feature patterns only

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
