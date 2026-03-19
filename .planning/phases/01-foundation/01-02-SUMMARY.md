---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [next-auth, auth-js-v5, drizzle, google-oauth, google-workspace, postgresql, neon]

requires:
  - phase: 01-foundation/01-01
    provides: Next.js 16 project scaffold, Drizzle client, t3-env config, vitest setup

provides:
  - Auth.js v5 Google Workspace SSO restricted to hellosugar.salon domain
  - Drizzle schema for Auth.js tables (users, accounts, sessions, verificationTokens, allowlist)
  - Two-tier role model (User/Admin) with sellerAccess flag on users table
  - First-admin bootstrap via INITIAL_ADMIN_EMAIL env var
  - Non-franchisee allowlist enforced in signIn callback
  - Login, access-denied, and dashboard pages
  - Admin user management UI with role toggle, seller access toggle, allowlist management
  - Last-admin demotion guard
  - 26 passing unit tests covering AUTH-01 through AUTH-05

affects: [02-listings, 03-notifications, 04-integrations]

tech-stack:
  added:
    - next-auth@beta (Auth.js v5)
    - "@auth/drizzle-adapter"
  patterns:
    - Edge-split auth config (auth.config.ts for proxy.ts, auth.ts with DrizzleAdapter for server)
    - proxy.ts for Next.js 16 route protection (replaces middleware.ts)
    - Server actions with requireAdmin() guard pattern
    - createUser event for first-login bootstrap logic

key-files:
  created:
    - src/db/schema/auth.ts
    - src/db/schema.ts
    - src/types/next-auth.d.ts
    - src/auth.config.ts
    - src/auth.ts
    - src/proxy.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/access-denied/page.tsx
    - src/app/(dashboard)/layout.tsx
    - src/app/(dashboard)/page.tsx
    - src/app/admin/users/actions.ts
    - src/app/admin/users/page.tsx
    - src/__tests__/auth.test.ts
    - src/__tests__/session.test.ts
    - src/__tests__/admin.test.ts
  modified:
    - src/db/index.ts

key-decisions:
  - "proxy.ts used instead of middleware.ts — Next.js 16 renamed middleware to proxy; same functionality, different file name"
  - "Edge-split auth config pattern: auth.config.ts (edge-compatible, no adapter) imported by proxy.ts; auth.ts (Node.js) adds DrizzleAdapter and full callbacks — prevents edge runtime Node.js module errors"
  - "First-admin bootstrap in createUser event (not signIn callback) — user row must exist before role can be set; createUser fires after adapter creates the row"
  - "Franchisees get sellerAccess=true automatically on first login via createUser event — no admin action required for hellosugar.salon domain users"
  - "signIn callback returns '/access-denied' string (not false) for non-allowlisted users — provides better UX with specific redirect rather than generic error page"

patterns-established:
  - "Pattern: Edge-split auth — auth.config.ts (edge-safe) + auth.ts (Node.js with adapter) + proxy.ts (imports config only)"
  - "Pattern: Server actions start with requireAdmin() — throws if not authenticated as admin"
  - "Pattern: revalidatePath('/admin/users') called after every mutation in admin actions"
  - "Pattern: db.query.allowlist.findFirst({ where: eq(...) }) for type-safe query builder"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05]

duration: 5min
completed: 2026-03-19
---

# Phase 01 Plan 02: Auth.js Google Workspace SSO Summary

**Auth.js v5 with Google Workspace domain restriction, two-tier role model, non-franchisee allowlist, and admin user management — 26 tests passing**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-19T20:56:45Z
- **Completed:** 2026-03-19T21:01:39Z
- **Tasks:** 5
- **Files modified:** 17

## Accomplishments

- Drizzle schema for all Auth.js required tables plus custom `role` and `sellerAccess` columns and `allowlist` table for non-franchisee pre-approval
- Auth.js v5 configured with edge-split pattern: domain enforcement in signIn callback (hd param is only a UI hint), first-admin bootstrap in createUser event, session augmented with role and sellerAccess
- Login page (Google OAuth button), access-denied page (franchise CTA, mailto link), dashboard layout (admin badge, nav, sign-out), admin user management page (role toggle, seller toggle, allowlist management) — all wired as Next.js 16 App Router server components
- All 26 unit tests pass across auth.test.ts, session.test.ts, admin.test.ts covering every AUTH requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth schema and TypeScript augmentation** - `2b2109c` (feat)
2. **Task 2: Configure Auth.js with edge-split pattern** - `2b80bc0` (feat)
3. **Task 3: Create auth pages (login, access-denied, dashboard)** - `b628a3d` (feat)
4. **Task 4: Create admin user management page and actions** - `f1c595f` (feat)
5. **Task 5: Create auth test files** - `fd451f8` (test)

## Files Created/Modified

- `src/db/schema/auth.ts` - Auth.js Drizzle tables: users (with role, sellerAccess), accounts, sessions, verificationTokens, allowlist
- `src/db/schema.ts` - Re-exports all schemas for drizzle-kit
- `src/db/index.ts` - Updated to import schema for query builder support
- `src/types/next-auth.d.ts` - TypeScript augmentation for role and sellerAccess on User, Session, AdapterUser
- `src/auth.config.ts` - Edge-compatible config: Google provider with hd param, pages config, authorized callback
- `src/auth.ts` - Node.js config: DrizzleAdapter, signIn callback (domain check + allowlist), session callback (role/sellerAccess), createUser event (first-admin bootstrap, franchisee sellerAccess)
- `src/proxy.ts` - Next.js 16 route protection importing edge-compatible auth config
- `src/app/api/auth/[...nextauth]/route.ts` - Auth.js GET/POST handlers
- `src/app/(auth)/login/page.tsx` - Google sign-in button with franchise messaging
- `src/app/(auth)/access-denied/page.tsx` - Access denied with mailto and franchise CTA link
- `src/app/(dashboard)/layout.tsx` - Protected layout with admin badge, nav, sign-out
- `src/app/(dashboard)/page.tsx` - Dashboard home showing session role and sellerAccess
- `src/app/admin/users/actions.ts` - Server actions: getUsers, getAllowlist, setUserRole (last-admin guard), setSellerAccess, addToAllowlist, removeFromAllowlist, removeUser
- `src/app/admin/users/page.tsx` - Admin UI with users table and allowlist management
- `src/__tests__/auth.test.ts` - Domain restriction, franchisee auth, allowlist redirect (AUTH-01/02/03)
- `src/__tests__/session.test.ts` - Role and sellerAccess in session (AUTH-04)
- `src/__tests__/admin.test.ts` - Last-admin guard, promotion, cross-user demotion (AUTH-05)

## Decisions Made

- **proxy.ts instead of middleware.ts** — Next.js 16 renamed middleware to proxy. The important context specified this explicitly; functionality is identical.
- **First-admin bootstrap in createUser event** — the signIn callback fires before the user row exists in the database; the DrizzleAdapter creates the row, then createUser fires. Role assignment must happen in createUser.
- **signIn callback returns '/access-denied' string** — returning a path string causes Auth.js to redirect to that path rather than the generic error page, giving users a more informative experience with the franchise CTA.
- **Franchisees get sellerAccess=true automatically** — hellosugar.salon users need no admin action to list; this is set in the createUser event alongside role bootstrap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used proxy.ts instead of middleware.ts**
- **Found during:** Task 2 (Auth.js edge-split configuration)
- **Issue:** Plan specified `src/middleware.ts` but important_context note and research both confirm Next.js 16 uses `proxy.ts`
- **Fix:** Created `src/proxy.ts` with the same content the plan specified for `middleware.ts`; exports `proxy` instead of `middleware`
- **Files modified:** src/proxy.ts (created instead of src/middleware.ts)
- **Verification:** Consistent with Next.js 16 docs in node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
- **Committed in:** 2b80bc0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking issue, file naming convention for Next.js 16)
**Impact on plan:** Required for route protection to function in Next.js 16. No scope creep.

## Issues Encountered

- Node.js v18.14.0 in default shell cannot run vitest@4 (requires Node 20+). Switched to `nvm use 20` to run tests. This is a pre-existing environment issue, not caused by this plan's changes.

## User Setup Required

This plan requires external service configuration before the auth flow will work:

**Google OAuth credentials:**
- Create OAuth 2.0 Web Application credentials at Google Cloud Console > APIs & Services > Credentials
- Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google` (also add `http://localhost:3000/api/auth/callback/google` for local dev)
- Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local` and Vercel environment variables

**Neon database:**
- Set `DATABASE_URL` (pooled) and `DATABASE_URL_DIRECT` (non-pooled) from Neon Console > Connection Details
- Run `npm run db:push` or `npm run db:migrate` to create auth tables in the database

**Optional env vars:**
- `INITIAL_ADMIN_EMAIL` — first user with this email gets admin role on login
- `GOOGLE_WORKSPACE_DOMAIN` — defaults to `hellosugar.salon`, change if domain differs

## Next Phase Readiness

- Auth foundation complete with domain restriction, allowlist, and role management
- Admin must be bootstrapped (via INITIAL_ADMIN_EMAIL) before allowlist can be managed
- DB migration required before any login attempt
- Phase 02 (listings) can build on `session.user.role` and `session.user.sellerAccess` from session

---
*Phase: 01-foundation*
*Completed: 2026-03-19*
