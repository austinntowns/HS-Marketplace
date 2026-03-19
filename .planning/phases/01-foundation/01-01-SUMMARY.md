---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, drizzle-orm, neon, vitest, t3-env, tailwind, typescript]

# Dependency graph
requires: []
provides:
  - Next.js 16.2.0 project scaffolded with TypeScript, Tailwind, App Router, src dir
  - Drizzle ORM client singleton connected to Neon Postgres via DATABASE_URL
  - t3-env environment validation schema for all 8 required env vars
  - drizzle.config.ts configured for PostgreSQL migrations via DATABASE_URL_DIRECT
  - Vitest test framework with path aliases and SKIP_ENV_VALIDATION support
  - .env.example with all required variable placeholders
  - package.json DB scripts (db:generate, db:migrate, db:push, db:studio) and test scripts
affects: [02-auth, 03-discovery-and-contact, 04-integrations]

# Tech tracking
tech-stack:
  added:
    - next@16.2.0
    - drizzle-orm@0.45.1
    - drizzle-kit@0.31.10
    - "@neondatabase/serverless@1.0.2"
    - resend@6.9.4
    - "@t3-oss/env-nextjs"
    - zod
    - vitest@4.1.0
    - "@vitejs/plugin-react"
    - tsx
    - dotenv
  patterns:
    - t3-env createEnv for type-safe build-time env validation with skipValidation for tests
    - Drizzle/Neon HTTP client singleton in src/db/index.ts
    - Separate DATABASE_URL (pooled) for runtime vs DATABASE_URL_DIRECT (direct) for migrations

key-files:
  created:
    - package.json
    - src/app/page.tsx
    - src/lib/env.ts
    - src/db/index.ts
    - drizzle.config.ts
    - vitest.config.ts
    - src/__tests__/smoke.test.ts
    - src/__tests__/setup.ts
    - .env.example
    - next.config.ts
  modified: []

key-decisions:
  - "Next.js 16.2.0 installed (not 15 as planned) — create-next-app pulled latest; proxy.ts replaces middleware.ts in Next.js 16"
  - "Added skipValidation support to env.ts using SKIP_ENV_VALIDATION env var — required for Vitest to import env module without real credentials"
  - "vitest.config.ts sets SKIP_ENV_VALIDATION=1 in test.env so npm run test works without real env vars"
  - ".gitignore uses .env* pattern with !.env.example negation — tracks example, ignores secrets"

patterns-established:
  - "Pattern 1: Drizzle client in src/db/index.ts using neon() HTTP driver, exported as db singleton"
  - "Pattern 2: env.ts with createEnv from @t3-oss/env-nextjs, skipValidation flag for CI/test contexts"
  - "Pattern 3: drizzle.config.ts points to DATABASE_URL_DIRECT for migrations (non-pooled)"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 01 Plan 01: Project Scaffold Summary

**Next.js 16 app scaffolded with Drizzle/Neon client, t3-env validation, and Vitest — infrastructure pipeline ready for auth and schema in subsequent plans**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T20:47:25Z
- **Completed:** 2026-03-19T20:53:25Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Next.js 16.2.0 project scaffolded with TypeScript, Tailwind CSS, App Router, and src directory layout
- Drizzle ORM client singleton (`src/db/index.ts`) and migration config (`drizzle.config.ts`) ready for schema in Plan 02/03
- t3-env schema validates all 8 required environment variables at build time, skipping in test context
- Vitest configured with `@vitejs/plugin-react` and `@/` path alias; smoke test confirms 2 passing tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Next.js project and install dependencies** - `a70181a` (feat)
2. **Task 2: Configure environment validation and Drizzle client** - `84f2e1d` (feat)
3. **Task 3: Configure Vitest and create placeholder test** - `0441ad1` (feat)

## Files Created/Modified
- `package.json` - Project manifest with all deps and db:/test: scripts
- `src/app/page.tsx` - Hello Sugar Marketplace placeholder (was default Next.js template)
- `src/app/layout.tsx` - Root layout (scaffolded by create-next-app)
- `src/lib/env.ts` - t3-env schema with 8 required server vars, SKIP_ENV_VALIDATION support
- `src/db/index.ts` - Drizzle + Neon HTTP client singleton
- `drizzle.config.ts` - drizzle-kit config using DATABASE_URL_DIRECT, schema at src/db/schema.ts
- `vitest.config.ts` - Vitest config with react plugin, path alias, SKIP_ENV_VALIDATION env var
- `src/__tests__/setup.ts` - Empty setup file for future test mocks
- `src/__tests__/smoke.test.ts` - 2 smoke tests: basic assertion + @/ alias import
- `.env.example` - All 8 variable placeholders committed to repo
- `next.config.ts` - turbopack.root set to silence workspace root warning

## Decisions Made
- Next.js 16.2.0 was installed instead of 15.2.3 (latest at create time). The research file noted Next.js 16 renames `middleware.ts` to `proxy.ts` — confirmed via docs at `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. Future plans must use `proxy.ts` for route protection.
- Added `SKIP_ENV_VALIDATION` support to `env.ts` rather than providing fake env vars for tests. This is the t3-env recommended approach.
- Used `.env*` + `!.env.example` in `.gitignore` instead of individually listing `.env.local` — more robust for future env files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Next.js 16 installed instead of 15; adjusted for proxy.ts convention**
- **Found during:** Task 1 (scaffold)
- **Issue:** `create-next-app@latest` pulled Next.js 16.2.0, not 15.2.3 as planned. Next.js 16 renames `middleware.ts` to `proxy.ts`.
- **Fix:** Verified via official docs in node_modules. No code change needed for this plan — proxy.ts is only relevant for auth (Plan 02). Documented the difference.
- **Files modified:** None (doc-only awareness)
- **Verification:** Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- **Committed in:** a70181a (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added SKIP_ENV_VALIDATION to vitest config**
- **Found during:** Task 3 (Vitest setup)
- **Issue:** Smoke test imports `@/lib/env` which calls `createEnv` — this throws on missing env vars in test context. Tests would fail without real credentials.
- **Fix:** Added `skipValidation: !!process.env.SKIP_ENV_VALIDATION` to `createEnv` call; set `SKIP_ENV_VALIDATION: "1"` in `vitest.config.ts` test.env. `npm run test` now passes without credentials.
- **Files modified:** src/lib/env.ts, vitest.config.ts
- **Verification:** `npm run test` exits 0 with 2 passed
- **Committed in:** 0441ad1 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both auto-fixes required for correct operation. No scope creep.

## Issues Encountered
- Project directory `HS-Marketplace` has uppercase letters which violates npm package name restrictions. `create-next-app .` fails in this directory. Workaround: scaffolded in temp subdirectory `hs-marketplace-temp`, then moved all files to parent. Directory name was only an issue for the scaffold command.

## User Setup Required
None at this stage. Real environment variables (DATABASE_URL, AUTH credentials, RESEND_API_KEY) will be needed for Plan 02 (auth) and beyond. Fill in `.env.local` from `.env.example` before running Plan 02.

## Next Phase Readiness
- Plan 02 (Auth.js v5 + Google SSO) can begin immediately
- `src/db/index.ts` singleton ready; `drizzle.config.ts` points to `src/db/schema.ts` (to be created in Plan 02/03)
- Note: Next.js 16 uses `proxy.ts` instead of `middleware.ts` for route protection — Plan 02 must use this naming
- Real env vars needed: `DATABASE_URL`, `DATABASE_URL_DIRECT`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

---
*Phase: 01-foundation*
*Completed: 2026-03-19*
