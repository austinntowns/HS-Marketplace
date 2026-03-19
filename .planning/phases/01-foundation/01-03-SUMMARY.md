---
phase: 01-foundation
plan: 03
subsystem: database
tags: [drizzle, postgres, neon, enums, schema]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: users table (auth.ts) that listings/contacts/alerts reference via FK

provides:
  - Postgres enum types: listing_status (6 states), listing_type (4 values)
  - listings table with all v1 fields (financials, location, timestamps, state machine)
  - photos table with listingId FK for Phase 2 photo uploads
  - contacts table with listingId + buyerId FKs for Phase 3 contact forms
  - alerts table with userId FK for Phase 3 buyer area alerts
  - Initial migration SQL (drizzle/0000_cute_fenris.sql) covering all 9 tables
  - migrate.ts script for running migrations against Neon

affects: [02-listings, 03-discovery, 04-integrations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Enums in separate enums.ts file — required for Drizzle FK/migration ordering
    - Financial values stored in integer cents (not decimal) for precision
    - Buyer info snapshot on contacts — preserves data if user profile changes
    - JSON columns ($type<T>()) for flexible arrays (states, listingTypes, bundledListingIds)

key-files:
  created:
    - src/db/schema/enums.ts
    - src/db/schema/listings.ts
    - src/db/schema/photos.ts
    - src/db/schema/contacts.ts
    - src/db/schema/alerts.ts
    - src/db/migrate.ts
    - drizzle/0000_cute_fenris.sql
    - drizzle/meta/_journal.json
    - drizzle/meta/0000_snapshot.json
  modified:
    - src/db/schema.ts

key-decisions:
  - "Enums defined in separate enums.ts to satisfy Drizzle migration ordering requirement"
  - "monthlyExpenses stored as typed JSON rather than separate table — simpler for v1, no separate join needed"
  - "Buyer info snapshot (name, email, phone) on contacts table — preserves data immutability even if user updates profile"
  - "migrate.ts uses DATABASE_URL_DIRECT (non-pooled) for migrations per Neon best practices"

patterns-established:
  - "Pattern 1: Schema files import enums before tables that use them"
  - "Pattern 2: All UUID primary keys use text().primaryKey().$defaultFn(() => crypto.randomUUID())"
  - "Pattern 3: Cascade deletes on all FK relationships"
  - "Pattern 4: Type exports (Listing/NewListing pattern) at bottom of each schema file"

requirements-completed: []

# Metrics
duration: 20min
completed: 2026-03-19
---

# Phase 01 Plan 03: Database Schema and Migration Summary

**Drizzle schema for all v1 entities (listings, photos, contacts, alerts) with Postgres enums and initial migration SQL for Neon**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-19T21:10:00Z
- **Completed:** 2026-03-19T21:30:00Z
- **Tasks:** 4 of 5 complete (Task 5 blocked on real DB credentials — see Auth Gates below)
- **Files modified:** 10

## Accomplishments
- Full Drizzle schema for all 9 database tables across 6 schema files
- Postgres enum types (listing_status with 6 states, listing_type with 4 values) in dedicated enums.ts
- listings table with all Phase 2-4 fields pre-created — no future ALTER TABLE migrations needed
- Initial migration SQL validated and ready to apply once real Neon credentials are set

## Task Commits

Each task was committed atomically:

1. **Task 1: Create enum definitions** - `c5b3b8f` (feat)
2. **Task 2: Create listings table schema** - `ccaaa15` (feat)
3. **Task 3: Create photos, contacts, and alerts tables** - `87b5638` (feat)
4. **Task 4: Update schema index and generate migration** - `7695558` (feat)

_Task 5 (Run migration) blocked — auth gate on DATABASE_URL_DIRECT credentials_

## Files Created/Modified
- `src/db/schema/enums.ts` - Postgres enums for listing_status and listing_type
- `src/db/schema/listings.ts` - Main listings table with 24 columns, FK to users, Listing/NewListing types
- `src/db/schema/photos.ts` - Photos table with listingId FK and Photo/NewPhoto types
- `src/db/schema/contacts.ts` - Contacts table with listingId + buyerId FKs, buyer snapshot, Contact/NewContact types
- `src/db/schema/alerts.ts` - Alerts table with userId FK, JSON arrays, Alert/NewAlert types
- `src/db/schema.ts` - Re-exports all schemas in correct order (enums first)
- `src/db/migrate.ts` - Migration runner using DATABASE_URL_DIRECT for Neon
- `drizzle/0000_cute_fenris.sql` - Initial migration SQL for all 9 tables

## Decisions Made
- Enums in separate `enums.ts` file — Drizzle requires enum types to be defined before tables that reference them in migration output
- `monthlyExpenses` as typed JSON (`{ rent, labor, supplies, utilities, marketing, other }`) — avoids separate expenses table for v1
- Buyer info snapshot (buyerName, buyerEmail, buyerPhone) on contacts — preserves data immutability if user profile changes later
- `migrate.ts` uses `DATABASE_URL_DIRECT` (non-pooled Neon connection) per Neon's migration requirements

## Deviations from Plan

None - plan executed exactly as written.

## Auth Gates

**Task 5: Run migration against Neon**
- **Status:** Blocked
- **Issue:** `.env.local` contains placeholder credentials (`postgresql://user:pass@host/db`) — `fetch failed` error when connecting
- **Resolution needed:** Replace `DATABASE_URL` and `DATABASE_URL_DIRECT` in `.env.local` with real Neon connection strings
- **Command to run after updating credentials:** `npm run db:migrate`
- **Expected output:** `Running migrations... Migrations complete`
- **Verification after migration:** `npx tsx src/db/verify-schema.ts` (see Task 5 in PLAN.md for verify script)

## Issues Encountered
- The `.env.local` has placeholder database credentials. The migration script code is correct, but cannot connect to Neon without real credentials. This is expected for a fresh project setup.

## User Setup Required

To complete Task 5 (migration):
1. Get Neon connection strings from your Neon dashboard (project → Connection Details)
2. Update `.env.local`:
   - `DATABASE_URL` — pooled connection string
   - `DATABASE_URL_DIRECT` — direct (non-pooled) connection string
3. Run: `npm run db:migrate`
4. Verify: `npm run db:studio` (opens Drizzle Studio to inspect tables)

## Next Phase Readiness
- All schema files are complete and type-safe
- Migration SQL is generated and validated (correct FK ordering, all 9 tables)
- Once real Neon credentials are set and `npm run db:migrate` runs, Phase 2 can begin immediately
- No additional schema changes needed for Phase 2-4 (all fields pre-created)

---
*Phase: 01-foundation*
*Completed: 2026-03-19*
