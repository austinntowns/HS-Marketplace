# Pitfalls Research

**Domain:** Internal franchise listing marketplace (Next.js + Neon + Vercel + Google Workspace SSO)
**Researched:** 2026-03-19
**Confidence:** HIGH for Next.js/auth pitfalls (official sources); MEDIUM for marketplace-specific patterns (community + official)

---

## Critical Pitfalls

### Pitfall 1: Authorization at the Wrong Layer — Middleware-Only Auth

**What goes wrong:**
Auth checks live only in Next.js middleware, not in individual data-fetching functions or API routes. A single middleware bypass (or a forgotten route) exposes financial data — TTM profit, asking prices, revenue — to any authenticated user regardless of role, or worse, to unauthenticated requests entirely.

**Why it happens:**
Middleware feels like the right chokepoint. It is fast and centralized. Developers ship it and assume the problem is solved. But middleware runs on the edge and can be bypassed by direct API calls. CVE-2025-29927 (a real 2025 Next.js vulnerability) specifically demonstrated middleware bypass at scale.

**How to avoid:**
Implement auth verification at every data access point — not just in middleware. Server Actions and Route Handlers must independently verify the session. Use `getServerSession()` (or equivalent) inside every handler that touches financial fields. Treat middleware as a UX redirect layer only, not a security gate.

**Warning signs:**
- A Route Handler that calls `db.query(...)` without first calling `getSession()`
- Financial fields returned in the same query as public fields without conditional stripping
- "It's protected by middleware" as the answer to any security review question

**Phase to address:** Auth / Foundation phase (Phase 1) — must be established before any data-fetching code is written

---

### Pitfall 2: Google Workspace SSO Does Not Enforce Domain by Default

**What goes wrong:**
NextAuth with the Google provider allows *any* Google account to authenticate unless you explicitly restrict to the Hello Sugar Workspace domain. A franchisee accidentally shares the URL publicly, or a former employee retains their personal Gmail — either way, outsiders can log in and browse sensitive financial listings.

**Why it happens:**
Google OAuth's default mode is "Public" — it accepts any Google account. The `hd` (hosted domain) parameter exists but is advisory, not enforced by Google itself. Enforcement must happen in the NextAuth `signIn` callback by checking `profile.hd` or `profile.email` domain server-side.

**How to avoid:**
In the NextAuth config, add a `signIn` callback that rejects any session where `profile.hd !== "hellosugarsalons.com"` (or whichever the actual Workspace domain is). Additionally, in the Google Cloud Console OAuth Consent Screen, set the application type to "Internal" so Google limits the OAuth grant to Workspace users only — this is a defense-in-depth second layer.

**Warning signs:**
- Google OAuth consent screen is set to "External"
- No `signIn` callback in NextAuth config
- Login works with a personal `@gmail.com` account during testing

**Phase to address:** Auth / Foundation phase (Phase 1)

---

### Pitfall 3: Financial Data Exposed in API Responses Without Role Filtering

**What goes wrong:**
The listing detail API returns the full listing row — including seller-entered TTM profit, revenue figures, and asking price — to any authenticated session regardless of whether that user is approved as a buyer, is the listing owner, or is an admin. Sensitive numbers leak to users who should not see them at their current state in the funnel (e.g., a buyer who hasn't yet submitted a contact inquiry).

**Why it happens:**
In development, full objects are returned for convenience. Role-based field filtering is deferred as "a later concern." It never gets added. Internal tools get treated as low-risk because "everyone is a franchisee."

**How to avoid:**
Define explicit data shapes per role from day one: `PublicListingView` (map card, name, type, state), `BuyerListingView` (adds financials after auth), `SellerListingView` (adds contact inquiries), `AdminListingView` (full object). Enforce these shapes at the database query level using column selection, not at the serialization layer.

**Warning signs:**
- API returns `SELECT *` from listings table
- Financial columns included in the listing index/search response (not just detail)
- No `role` check before returning financial fields

**Phase to address:** Auth / Foundation phase (Phase 1), verified again in Listings phase

---

### Pitfall 4: Live API Data Cached Stale or Fetched on Every Request

**What goes wrong:**
Two opposite failure modes exist simultaneously. Either the Hello Sugar internal API data (revenue, bookings, membership conversions) is cached indefinitely and shows weeks-old numbers to buyers making purchase decisions — or it is fetched on every page render, hammering the internal API and creating latency or rate limit failures.

**Why it happens:**
Next.js App Router caches `fetch()` calls by default (static route behavior). Developers add `{ cache: 'no-store' }` everywhere in frustration, then the API gets hammered. The correct pattern — time-based revalidation with `{ next: { revalidate: 3600 } }` or tag-based invalidation — requires deliberate design.

**How to avoid:**
Decide on acceptable staleness per data type before writing the API integration. Revenue/KPI data: revalidate every 1-4 hours. Listing status (approved/pending): revalidate on mutation via `revalidateTag()`. Never use `cache: 'no-store'` for live API calls on a public listing page — use background revalidation instead. Build a thin API client wrapper that enforces the revalidation strategy.

**Warning signs:**
- KPI cards showing a "last updated" timestamp from days ago
- Internal API logs showing a request on every page load
- `fetch` calls without explicit `cache` or `next.revalidate` options

**Phase to address:** Live Data Integration phase

---

### Pitfall 5: Admin Moderation Has No State Machine — Listings Get Stuck

**What goes wrong:**
Listings can exist in limbo states: submitted but never reviewed, approved then edited without re-triggering review, rejected without a reason, or re-submitted after rejection but treated as new. Sellers get frustrated waiting for approval. Corporate admins have no queue — they discover pending listings by accident.

**Why it happens:**
Approval workflow is treated as a boolean `is_approved` column rather than a proper state machine. Edge cases (edit after approval, re-submission after rejection) are not considered during initial design.

**How to avoid:**
Model listing status as an explicit enum from the start: `draft`, `pending_review`, `approved`, `rejected`, `delisted`. Define transitions and what triggers them. Add a `review_notes` field for rejection reasons. Build an admin queue that surfaces `pending_review` listings sorted by age. Send seller notifications on every status transition.

**Warning signs:**
- `listings` table has an `is_approved BOOLEAN` column instead of `status VARCHAR/ENUM`
- No `updated_at` timestamp on listings
- Admin workflow described as "just a flag"
- No rejection reason field in the schema

**Phase to address:** Admin / Moderation phase — schema must be correct from Phase 1 migrations

---

### Pitfall 6: Contact Form Notifications Silently Fail

**What goes wrong:**
A buyer submits a contact inquiry. The seller never finds out. The lead evaporates. The marketplace loses its entire value proposition — connecting buyers with sellers — because transactional email was treated as a "we'll add it later" concern.

**Why it happens:**
Email sending is typically added after the contact form works in development (where it either no-ops or logs to console). Transactional email providers require DNS configuration (SPF, DKIM, DMARC) that takes 24-48 hours to propagate. This is discovered late.

**How to avoid:**
Choose and configure the transactional email provider (Resend or Postmark recommended for Next.js/Vercel) during the infrastructure phase, not the features phase. Set up SPF/DKIM records for the Hello Sugar domain before writing any notification code. Add explicit delivery logging and a dead-letter mechanism — if an email send fails, write to a `failed_notifications` table with retry logic.

**Warning signs:**
- Email notifications not in the Phase 1 infrastructure checklist
- "We'll use SendGrid eventually" without a domain configured
- No test of email delivery in staging before launch

**Phase to address:** Infrastructure / Foundation phase — configure provider early; notification logic in Listings phase

---

### Pitfall 7: Map View Performance Degrades With All Listings Loaded Client-Side

**What goes wrong:**
The map view loads all approved listing coordinates and metadata in a single query, serializes them into a large JSON payload, and sends it to the client for Mapbox or Google Maps rendering. At 50+ listings this is fine. As the franchise grows, this approach produces visible load delays and unnecessary data exposure (all financial summaries shipped to the browser even for listings not in view).

**Why it happens:**
Map view is built as a client component that fetches all listings, mirroring how list view works. The distinction — that map view needs coordinate + minimal metadata only, not financials — is not enforced at the API layer.

**How to avoid:**
Create a dedicated `/api/listings/map` endpoint that returns only `id`, `lat`, `lng`, `location_type`, `state`, and `asking_price_range` (not exact). Load listing detail lazily on marker click. Implement viewport-based filtering if the listing count grows significantly.

**Warning signs:**
- Map view uses the same API response shape as list view
- Financial figures (TTM profit, exact asking price) included in the map markers payload
- First paint of map page takes >2 seconds

**Phase to address:** Browse / Discovery phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `SELECT *` from listings table | Faster to write queries | Financial data leaks to wrong endpoints; schema changes break all consumers | Never — always select explicit columns |
| `is_approved BOOLEAN` instead of status enum | Simple to implement | Impossible to represent `rejected`, `pending_re_review`, `delisted` without a rewrite | Never for a moderated marketplace |
| Hardcoding the Hello Sugar internal API base URL | One less env var | Breaks across environments; impossible to mock in tests | Only in the first proof-of-concept, must be extracted before Phase 2 |
| Sending email directly from a Server Action (synchronous) | Simple code path | A slow or failing email send blocks the user's request; no retry | MVP only if combined with a timeout + silent failure fallback |
| No pagination on listing index | One less feature to build | Full table scan on every browse page load | Never — add `LIMIT/OFFSET` from the first query |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Hello Sugar internal API | Assuming the API is always available; no error handling for downtime | Wrap all internal API calls in try/catch; display cached/last-known data with a staleness indicator rather than crashing the listing page |
| Hello Sugar internal API | Fetching data per-listing-render (N+1 at listing index) | Batch-fetch KPI data for all visible listings in one call; cache by location ID with TTL |
| Google OAuth (NextAuth) | OAuth consent screen set to "External" | Set to "Internal" in Google Cloud Console; add `hd` check in `signIn` callback |
| Neon Postgres | Using the pooled connection string for migrations | Use the direct (non-pooled) connection string for schema migrations; pooled connection for runtime queries |
| Neon Postgres | No RLS policies, relying only on application-layer auth | Enable RLS on `listings` and `inquiries` tables; even if not fully enforced in v1, the schema should support it |
| Vercel (deployment) | Env vars not set in Vercel dashboard before first deploy | Internal API keys, database URLs, and NextAuth secret must be configured in Vercel before the first production deploy or the app silently fails |
| Transactional email | Sending from a generic `@gmail.com` or `no-reply@vercel.app` | Configure a subdomain of the Hello Sugar domain (e.g., `noreply@mail.hellosugarsalons.com`) with SPF/DKIM before launch |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching live API data on every listing detail page render | High latency on listing detail; internal API rate limit errors | Time-based revalidation (1-4 hour TTL) + manual invalidation on listing update | From day one if traffic is moderate; definitely at 20+ concurrent users |
| Loading all listing coordinates for map view in one payload | Slow map initial load; large network transfer visible in DevTools | Dedicated lean map endpoint; lazy-load detail on marker click | At ~100+ listings |
| No database indexes on filter columns | Browse page with filters becomes slow | Add indexes on `state`, `location_type`, `asking_price`, `status` at migration time | At ~500+ listings; earlier if queries are unoptimized |
| Rendering financial KPI charts client-side with raw data arrays | Chart component re-fetches on every tab switch | Cache chart data in component state or SWR; pre-compute aggregates server-side | At 12-month trend data per listing with multiple users |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Returning financial fields in listing search/index API | Competitors or unauthorized users harvest all franchise financials in one request | Strip financial fields from index responses; include only on detail endpoint after explicit role check |
| No rate limiting on contact form submission | A single user spams all sellers with fake inquiries, poisoning the lead funnel | Add rate limiting per `user_id` on the inquiry endpoint (e.g., max 10 per hour); log all submissions |
| Storing asking prices and TTM profit as unencrypted text visible in browser network tab | Sensitive negotiation data visible to anyone with DevTools on an approved listing | This is acceptable for authenticated internal users — but ensure the listing detail page is never publicly cacheable (set `Cache-Control: private, no-store` on listing detail responses) |
| Admin actions (approve/reject) not logged | No audit trail if a listing is wrongly approved or suppressed | Write an `audit_log` table entry for every admin action: who, what, when, previous state, new state |
| Session tokens visible in URL params | Token harvesting via referrer headers or browser history | Use httpOnly cookies for session storage (NextAuth default); never pass auth tokens as query params |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Listing submitted with no status feedback | Seller doesn't know if submission worked; submits again creating duplicates | Show explicit confirmation screen: "Your listing is pending corporate review. You'll receive an email when it's approved." |
| Rejection with no reason given | Seller resubmits the same flawed listing repeatedly; admin frustration compounds | Require a `review_notes` field on rejection; surface it prominently in the seller's listing view |
| Buyer submits contact form with no confirmation | Buyer doesn't know if the seller was notified; double-submits | Show confirmation: "Your message was sent to the seller. You'll receive a copy at [email]." |
| Area alerts with no unsubscribe mechanism | Franchisees receive emails for alerts they no longer want; mark as spam | Include a one-click unsubscribe in every alert email; honor it immediately without requiring login |
| Map and list view not synchronized | Buyer clicks a state filter in list view, switches to map, filter is lost | Sync filter state to URL query params so both views read from the same source of truth |
| Listing detail shows "loading..." indefinitely when internal API is down | Buyer sees a broken page for a listing they were interested in | Show last-cached API data with a staleness note; never block listing render on live API availability |

---

## "Looks Done But Isn't" Checklist

- [ ] **Auth:** Login works with Google — but verify that a personal `@gmail.com` account is *rejected*, not just that a Workspace account is accepted
- [ ] **Listings:** Create listing form submits — but verify the listing does NOT appear in browse until admin approves it
- [ ] **Listings:** Admin approves listing — but verify the seller receives an email notification
- [ ] **Contact form:** Inquiry is submitted — but verify the seller receives the email AND the buyer receives a confirmation copy
- [ ] **Live data:** KPI cards render on listing detail — but verify they show an appropriate fallback (not a blank card or error) when the internal API is unavailable
- [ ] **Map view:** Markers appear on the map — but verify clicking a marker does NOT expose financial data before the user has submitted a contact inquiry (if that gate is desired)
- [ ] **Area alerts:** Alert is created — but verify a new matching listing actually triggers an email to the subscriber
- [ ] **Admin dashboard:** Listing can be rejected — but verify the seller sees the rejection reason and can edit + resubmit
- [ ] **Filters:** Filtering by state works — but verify filters persist when switching between list and map views (URL param sync)
- [ ] **Multi-location bundles:** Bundle is created — but verify cumulative KPI view correctly sums metrics across all included locations

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Middleware-only auth discovered after launch | HIGH | Audit every Route Handler and Server Action; add session checks; may require emergency patch deploy |
| Google OAuth domain not restricted, outsiders logged in | MEDIUM | Revoke all non-Workspace sessions; add `hd` check; force re-login; rotate NextAuth secret |
| `is_approved` boolean schema requiring status enum migration | HIGH | Write a careful migration adding `status` column, backfilling from `is_approved`, then dropping old column; test against production data shape |
| No transactional email configured at launch | MEDIUM | Inquiries are lost, not recoverable — add a `notifications_queue` table immediately; configure email provider; replay queued notifications |
| Financial data exposed in index API | HIGH | Identify all consumers, update queries to strip financial fields, check if any data was cached by CDN (purge Vercel cache) |
| Admin queue not built, listings stuck in pending | LOW | Add admin queue view; bulk-approve backlog; low data risk |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Middleware-only auth | Phase 1: Auth & Foundation | Attempt direct API call without session cookie — must return 401 |
| Google domain not restricted | Phase 1: Auth & Foundation | Attempt login with personal Gmail — must be rejected |
| Financial data in wrong API responses | Phase 1: Auth & Foundation + Phase 2: Listings | Check index API response shape — financial fields must be absent |
| Live API caching wrong | Phase 3: Live Data Integration | Force internal API downtime in staging — listing page must still render with cached data |
| Listing status as boolean | Phase 1: Foundation (schema) | Review migration files — `status` must be an enum with at least 5 states |
| Contact notifications silent | Phase 1: Infrastructure | Send test inquiry in staging — verify email delivery before Phase 2 feature work |
| Map view ships all financials | Phase 4: Browse & Discovery | Inspect map API response in DevTools Network tab — must not contain TTM profit or exact asking price |
| Admin has no queue | Phase 2: Admin & Moderation | Admin can see pending listings sorted by age without searching |
| No audit log for admin actions | Phase 2: Admin & Moderation | Approve and reject a test listing — verify audit_log table has entries |
| Inquiry spam | Phase 2: Listings | Submit inquiry 11 times in one hour — must be rate-limited after 10 |

---

## Sources

- [Common mistakes with the Next.js App Router and how to fix them — Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [App Router pitfalls: common Next.js mistakes — imidef, 2026](https://imidef.com/en/2026-02-11-app-router-pitfalls)
- [Next.js Complete Security Guide 2025 — TurboStarter](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices)
- [Row-Level Security with Neon — Neon Docs](https://neon.com/docs/guides/row-level-security)
- [How to limit domain for Google provider — NextAuth.js Discussion #266](https://github.com/nextauthjs/next-auth/discussions/266)
- [How to defend against common marketplace attacks — Sharetribe](https://www.sharetribe.com/academy/most-common-marketplace-attacks/)
- [Transactional email best practices — Postmark 2026](https://postmarkapp.com/guides/transactional-email-best-practices)
- [Caching guide — Next.js official docs](https://nextjs.org/docs/app/guides/caching)
- [Why Your Next.js Cache Isn't Working — DEV Community 2026](https://dev.to/pockit_tools/why-your-nextjs-cache-isnt-working-and-how-to-fix-it-in-2026-10pp)
- [How Data Transparency Resolves Friction Between Franchisors and Owners — Invoca](https://www.invoca.com/blog/how-data-transparency-resolves-friction-between-franchisors-and-owners)

---
*Pitfalls research for: Hello Sugar Franchise Marketplace (internal B2B listing platform)*
*Researched: 2026-03-19*
