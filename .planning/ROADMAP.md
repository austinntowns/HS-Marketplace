# Roadmap: Hello Sugar Franchise Marketplace

## Overview

Four phases that take the platform from zero to a fully operational franchise resale marketplace. Authentication and schema ship first because everything else depends on identity. Listing creation and admin moderation ship second because there is nothing to browse without approved listings. Buyer discovery and contact ship third to complete the core value loop. Live KPI integration from the internal API ships last — it is the platform's primary differentiator and highest technical risk, isolated so API delays cannot block the rest of the product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Google Workspace SSO, role system, database schema, and email infrastructure (completed 2026-03-19)
- [x] **Phase 2: Listings and Moderation** - Seller listing creation for all types, admin approval queue, and status notifications (completed 2026-03-19)
- [ ] **Phase 3: Discovery and Contact** - Buyer browse, filters, listing detail, contact form, and area alerts
- [ ] **Phase 4: Live KPI Integration** - Internal API proxy, live KPI cards on listing detail, trend charts, and bundle rollups

## Phase Details

### Phase 1: Foundation
**Goal**: The platform accepts authenticated Hello Sugar users and the database is ready to hold every object the product needs
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Plans:** 4/4 plans complete
**Success Criteria** (what must be TRUE):
  1. A franchisee with a hellosugar.salon Google account can log in and land on the marketplace — no manual setup required
  2. A personal Gmail account is rejected at the login screen and cannot access any page
  3. Admin can assign or revoke the admin role for any user from the user management screen
  4. A non-franchisee added by admin can log in; a non-franchisee not added by admin is denied
  5. The listing state machine (draft, pending, active, rejected, sold, delisted) is represented as a Postgres enum and all tables exist in the schema

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js project with Neon/Drizzle/Vitest (Wave 1)
- [x] 01-02-PLAN.md — Auth.js v5 Google Workspace SSO with role system (Wave 2, AUTH-01 through AUTH-05)
- [x] 01-03-PLAN.md — Complete Drizzle schema and initial migration (Wave 3, depends on 01-02)
- [x] 01-04-PLAN.md — Resend transactional email configuration (Wave 2, parallel to 01-02)

### Phase 2: Listings and Moderation
**Goal**: Sellers can create and manage listings for all location types, and admins can approve or reject them before they go live
**Depends on**: Phase 1
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, LIST-10, LIST-11, LIST-12, LIST-13, LIST-14, LIST-15, LIST-16, LIST-20, LIST-21, LIST-22, LIST-23, ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09
**Plans:** 4/4 plans complete
**Success Criteria** (what must be TRUE):
  1. Seller can create a listing for a suite, flagship, territory, or bundle — open salons pre-populate from system data; territories use manual entry
  2. Seller can enter asking price, TTM profit, reason for selling, included assets, notes, and upload 1-10 photos
  3. Seller sees their listing move through draft -> pending -> active or rejected, with an email arriving on each status change
  4. Admin sees all pending listings in an approval queue, can approve or reject with a reason, and can edit or mark any listing as sold
  5. Seller receives a reminder email when their listing has been active 30+ days without an update

Plans:
- [x] 02-01-PLAN.md — Drizzle schema, Zod validation, status machine, upload endpoint (Wave 1, LIST-05/06/07/08/10/11/12/13/22/23)
- [ ] 02-02-PLAN.md — Seller listing creation wizard with multi-step form, photo upload, territory map (Wave 2, LIST-01/02/03/04, depends on 02-01)
- [ ] 02-03-PLAN.md — Seller listing management: dashboard, edit, status actions, 30-day reminder (Wave 3, LIST-14/15/16/20/21, depends on 02-02)
- [ ] 02-04-PLAN.md — Admin moderation: queue, approve/reject, all listings view, admin overrides (Wave 3, ADMN-01-09, depends on 02-02)

### Phase 3: Discovery and Contact
**Goal**: Buyers can find listings that match their criteria and submit contact requests to sellers
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, DISC-07, DISC-08, DISC-09, DISC-10, DISC-11, DISC-12, DISC-13, DISC-14, DISC-15, DISC-16
**Plans:** 3/5 plans executed
**Success Criteria** (what must be TRUE):
  1. Buyer can browse active listings in list view (default: newest first) and map view, and switch between them without losing filter state
  2. Buyer can filter by listing type, state, price range, and time open — and search by text — with all filters reflected in the URL
  3. Buyer can view a listing detail page showing all seller-entered financials, photos, and location info (KPI cards show a placeholder pending Phase 4)
  4. Buyer can submit one contact form per listing with their info auto-filled; seller receives an email notification immediately
  5. Buyer can create, edit, and delete area/state alerts — and receives an email when a new matching listing goes live

Plans:
- [ ] 03-01-PLAN.md — Install browse dependencies, create listings query with filters and cursor pagination (Wave 1, DISC-01/14)
- [ ] 03-02-PLAN.md — Browse page UI: FilterBar, ListingCard, ListingGrid, MapView, LocationSearch (Wave 2, DISC-02/03/04/05/06, depends on 03-01)
- [ ] 03-03-PLAN.md — Listing detail page with photos, financials, floating contact CTA, KPI placeholder (Wave 1, DISC-07)
- [ ] 03-04-PLAN.md — Contact form, seller notification, admin inquiry log (Wave 2, DISC-08/09/10/11, depends on 03-03)
- [ ] 03-05-PLAN.md — Alert management with states-only criteria, email notification on listing match (Wave 2, DISC-12/13/15/16, depends on 03-02)

### Phase 4: Live KPI Integration
**Goal**: Listing detail pages display live operational data from Hello Sugar's internal API, making the financial picture complete and verified
**Depends on**: Phase 3
**Requirements**: LIST-17, LIST-18, LIST-19
**Plans:** 3 plans
**Success Criteria** (what must be TRUE):
  1. Listing detail for an open salon shows live KPI cards (revenue, new clients, bookings, membership conversion) sourced from the internal API — labeled as API-verified, not seller-entered
  2. Each KPI card has a 12-month trend chart showing historical trajectory
  3. A bundle listing shows cumulative KPIs across all included locations plus a per-location breakdown toggle
  4. When the internal API is unavailable, the listing detail page still loads and KPI cards display a clear "data temporarily unavailable" state rather than an error

Plans:
- [ ] 04-01-PLAN.md — Internal API discovery spike: obtain credentials, explore endpoints, document contract, create Zod schema and mock fixture (Wave 1, LIST-17)
- [ ] 04-02-PLAN.md — Server-side API proxy with 5-minute cache, Route Handlers, fetch layer, aggregation logic, KPI cards on listing detail (Wave 2, LIST-17/LIST-19, depends on 04-01)
- [ ] 04-03-PLAN.md — 12-month trend charts with Recharts, KPI modal, bundle per-location table, overlay chart (Wave 3, LIST-18/LIST-19, depends on 04-02)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-19 |
| 2. Listings and Moderation | 4/4 | Complete   | 2026-03-19 |
| 3. Discovery and Contact | 3/5 | In Progress|  |
| 4. Live KPI Integration | 0/3 | Planning complete | - |
