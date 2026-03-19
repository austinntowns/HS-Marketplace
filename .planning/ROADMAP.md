# Roadmap: Hello Sugar Franchise Marketplace

## Overview

Four phases that take the platform from zero to a fully operational franchise resale marketplace. Authentication and schema ship first because everything else depends on identity. Listing creation and admin moderation ship second because there is nothing to browse without approved listings. Buyer discovery and contact ship third to complete the core value loop. Live KPI integration from the internal API ships last — it is the platform's primary differentiator and highest technical risk, isolated so API delays cannot block the rest of the product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Google Workspace SSO, role system, database schema, and email infrastructure
- [ ] **Phase 2: Listings and Moderation** - Seller listing creation for all types, admin approval queue, and status notifications
- [ ] **Phase 3: Discovery and Contact** - Buyer browse, filters, listing detail, contact form, and area alerts
- [ ] **Phase 4: Live KPI Integration** - Internal API proxy, live KPI cards on listing detail, trend charts, and bundle rollups

## Phase Details

### Phase 1: Foundation
**Goal**: The platform accepts authenticated Hello Sugar users and the database is ready to hold every object the product needs
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Plans:** 3/4 plans executed
**Success Criteria** (what must be TRUE):
  1. A franchisee with a hellosugar.salon Google account can log in and land on the marketplace — no manual setup required
  2. A personal Gmail account is rejected at the login screen and cannot access any page
  3. Admin can assign or revoke the admin role for any user from the user management screen
  4. A non-franchisee added by admin can log in; a non-franchisee not added by admin is denied
  5. The listing state machine (draft, pending, active, rejected, sold, delisted) is represented as a Postgres enum and all tables exist in the schema

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js project with Neon/Drizzle/Vitest (Wave 1)
- [ ] 01-02-PLAN.md — Auth.js v5 Google Workspace SSO with role system (Wave 2, AUTH-01 through AUTH-05)
- [ ] 01-03-PLAN.md — Complete Drizzle schema and initial migration (Wave 3, depends on 01-02)
- [ ] 01-04-PLAN.md — Resend transactional email configuration (Wave 2, parallel to 01-02)

### Phase 2: Listings and Moderation
**Goal**: Sellers can create and manage listings for all location types, and admins can approve or reject them before they go live
**Depends on**: Phase 1
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, LIST-09, LIST-10, LIST-11, LIST-12, LIST-13, LIST-14, LIST-15, LIST-16, LIST-20, LIST-21, LIST-22, LIST-23, ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09
**Success Criteria** (what must be TRUE):
  1. Seller can create a listing for a suite, flagship, territory, or bundle — open salons pre-populate from system data; territories use manual entry
  2. Seller can enter asking price, TTM profit, monthly expenses, reason for selling, included assets, notes, and upload 3–10 photos
  3. Seller sees their listing move through draft → pending → active or rejected, with an email arriving on each status change
  4. Admin sees all pending listings in an approval queue, can approve or reject with a reason, and can edit or mark any listing as sold
  5. Seller receives a reminder email when their listing has been active 30+ days without an update
**Plans**: TBD

Plans:
- [ ] 02-01: Seller listing creation form — all four types, seller-entered fields, photo upload, draft save
- [ ] 02-02: Listing status management — seller status view, edit, delist, mark sold flows
- [ ] 02-03: Admin moderation — approval queue, approve/reject with email notification, user management, admin listing edit

### Phase 3: Discovery and Contact
**Goal**: Buyers can find listings that match their criteria and submit contact requests to sellers
**Depends on**: Phase 2
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, DISC-07, DISC-08, DISC-09, DISC-10, DISC-11, DISC-12, DISC-13, DISC-14, DISC-15, DISC-16
**Success Criteria** (what must be TRUE):
  1. Buyer can browse active listings in list view (default: newest first) and map view, and switch between them without losing filter state
  2. Buyer can filter by listing type, state, price range, and time open — and search by text — with all filters reflected in the URL
  3. Buyer can view a listing detail page showing all seller-entered financials, photos, and location info (KPI cards show a placeholder pending Phase 4)
  4. Buyer can submit one contact form per listing with their info auto-filled; seller receives an email notification immediately
  5. Buyer can create, edit, and delete area/state alerts — and receives an email when a new matching listing goes live
**Plans**: TBD

Plans:
- [ ] 03-01: Browse — list view with filters, text search, URL-synced state, and map view
- [ ] 03-02: Listing detail page — seller financials, photos, placeholder KPI section
- [ ] 03-03: Contact form, seller email notification, and admin inquiry log
- [ ] 03-04: Area/state alert management and email notification on matching listing approval

### Phase 4: Live KPI Integration
**Goal**: Listing detail pages display live operational data from Hello Sugar's internal API, making the financial picture complete and verified
**Depends on**: Phase 3
**Requirements**: LIST-17, LIST-18, LIST-19
**Success Criteria** (what must be TRUE):
  1. Listing detail for an open salon shows live KPI cards (revenue, new clients, bookings, membership conversion) sourced from the internal API — labeled as API-verified, not seller-entered
  2. Each KPI card has a 12-month trend chart showing historical trajectory
  3. A bundle listing shows cumulative KPIs across all included locations plus a per-location breakdown toggle
  4. When the internal API is unavailable, the listing detail page still loads and KPI cards display a clear "data temporarily unavailable" state rather than an error
**Plans**: TBD

Plans:
- [ ] 04-01: Internal API discovery spike — validate endpoint shape, auth, rate limits, and available KPI fields
- [ ] 04-02: Server-side API proxy with 5-minute cache, transforms layer, graceful fallback, and KPI cards on listing detail
- [ ] 04-03: 12-month trend charts and bundle cumulative/per-location breakdown

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/4 | In Progress|  |
| 2. Listings and Moderation | 0/3 | Not started | - |
| 3. Discovery and Contact | 0/4 | Not started | - |
| 4. Live KPI Integration | 0/3 | Not started | - |
