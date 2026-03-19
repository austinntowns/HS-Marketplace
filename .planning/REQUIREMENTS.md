# Requirements: Hello Sugar Franchise Marketplace

**Defined:** 2026-03-19
**Core Value:** Franchisees can quickly find buyers for their locations with verified performance data that builds trust and accelerates deals.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can log in with Google Workspace SSO (hellosugar.salon domain)
- [x] **AUTH-02**: Existing franchisees are auto-authorized on first login
- [x] **AUTH-03**: Non-franchisees must be manually added by admin before they can log in
- [x] **AUTH-04**: Users have roles: buyer, seller, admin (users can have multiple)
- [x] **AUTH-05**: Admin can set/revoke admin status for any user

### Listings

- [x] **LIST-01**: Seller can create listing for a suite location
- [x] **LIST-02**: Seller can create listing for a flagship location
- [x] **LIST-03**: Seller can create listing for an unopened territory
- [x] **LIST-04**: Seller can create a bundle listing (multiple locations/territories)
- [x] **LIST-05**: Open salons are auto-populated from system data (dropdown selection)
- [x] **LIST-06**: Unopened territories require manual entry
- [x] **LIST-07**: Seller can enter asking price
- [x] **LIST-08**: Seller can enter TTM profit
- [ ] **LIST-09**: Seller can enter monthly expenses breakdown
- [x] **LIST-10**: Seller can enter reason for selling
- [x] **LIST-11**: Seller can enter included assets
- [x] **LIST-12**: Seller can add free-form notes/description
- [x] **LIST-13**: Seller must upload minimum 3 photos per listing (max 10)
- [x] **LIST-22**: Listing displays square footage (from system data or seller-entered)
- [x] **LIST-23**: Listing displays opening date (from system data)
- [x] **LIST-14**: Seller can view their listing status (draft, pending, active, rejected, sold)
- [x] **LIST-15**: Seller can edit their listing at any time (no re-approval needed)
- [x] **LIST-16**: Seller can mark their listing as sold
- [x] **LIST-20**: Seller can delist (withdraw) their listing at any time
- [x] **LIST-21**: System sends reminder email to seller when listing has been active 30+ days without update
- [ ] **LIST-17**: Listing displays live KPI data from internal API (revenue, new clients, bookings, membership conversion)
- [ ] **LIST-18**: Listing displays 12-month trend charts for KPIs
- [ ] **LIST-19**: Bundle listings show cumulative KPIs and per-location breakdown

### Discovery

- [x] **DISC-01**: Buyer can browse listings in list view (default sort: newest first)
- [x] **DISC-02**: Buyer can browse listings in map view
- [x] **DISC-14**: Buyer can search listings by text (location name, city, description)
- [x] **DISC-03**: Buyer can filter by listing type (suite, flagship, territory, bundle)
- [x] **DISC-04**: Buyer can filter by state/region
- [x] **DISC-05**: Buyer can filter by price range
- [x] **DISC-06**: Buyer can filter by time location has been open
- [x] **DISC-07**: Buyer can view listing detail page with all seller data and live KPIs
- [x] **DISC-08**: Buyer can submit contact form to express interest in a listing (one per listing)
- [x] **DISC-09**: Contact form auto-fills buyer info from profile
- [x] **DISC-10**: Contact form includes free-form message field
- [x] **DISC-11**: Seller receives email notification when buyer expresses interest
- [x] **DISC-12**: Buyer can set area/state alerts for new listings
- [x] **DISC-13**: Buyer receives email when new listing matches their alert criteria
- [x] **DISC-15**: Buyer can edit their alert criteria
- [x] **DISC-16**: Buyer can delete their alerts

### Admin

- [x] **ADMN-01**: Admin can view queue of listings pending approval
- [x] **ADMN-02**: Admin can approve a listing (moves to active) after verifying seller ownership
- [x] **ADMN-03**: Admin can reject a listing with reason (including ownership issues)
- [x] **ADMN-04**: Seller receives email notification on approval/rejection
- [x] **ADMN-05**: Admin can view all listings and their statuses
- [x] **ADMN-06**: Admin can view all buyer inquiries
- [x] **ADMN-07**: Admin can manage users (add non-franchisees, remove users, set roles)
- [x] **ADMN-08**: Admin can edit any listing
- [x] **ADMN-09**: Admin can mark any listing as sold

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics

- **ANLY-01**: Admin dashboard with inquiry volume metrics
- **ANLY-02**: Admin dashboard with listing age and time-to-sale metrics
- **ANLY-03**: Seller dashboard with views and inquiry stats for their listings

### Enhanced Features

- **ENHN-01**: In-app messaging between buyer and seller
- **ENHN-02**: Saved/favorited listings for buyers
- **ENHN-03**: Listing comparison tool

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full transaction handling (offers, negotiations, escrow) | Lead capture only — deals close offline |
| Public access | Authenticated users only — protects sensitive financial data |
| Automated valuation | Not enough historical data for reliable comps |
| In-app messaging (v1) | Contact form + email is sufficient for lead capture |
| Mobile app | Web-first, mobile-responsive is sufficient |
| Pre-qualification verification | Trust Google Workspace auth + admin approval |
| Sold listing history | Sold listings are removed from view, not archived for buyers |
| Weekly seller digest emails | Keep notifications focused on actionable items |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| LIST-01 | Phase 2 | Complete |
| LIST-02 | Phase 2 | Complete |
| LIST-03 | Phase 2 | Complete |
| LIST-04 | Phase 2 | Complete |
| LIST-05 | Phase 2 | Pending |
| LIST-06 | Phase 2 | Pending |
| LIST-07 | Phase 2 | Pending |
| LIST-08 | Phase 2 | Pending |
| LIST-09 | Phase 2 | Pending |
| LIST-10 | Phase 2 | Pending |
| LIST-11 | Phase 2 | Pending |
| LIST-12 | Phase 2 | Pending |
| LIST-13 | Phase 2 | Pending |
| LIST-14 | Phase 2 | Complete |
| LIST-15 | Phase 2 | Complete |
| LIST-16 | Phase 2 | Complete |
| LIST-17 | Phase 4 | Pending |
| LIST-18 | Phase 4 | Pending |
| LIST-19 | Phase 4 | Pending |
| LIST-20 | Phase 2 | Complete |
| LIST-21 | Phase 2 | Complete |
| LIST-22 | Phase 2 | Pending |
| LIST-23 | Phase 2 | Pending |
| DISC-01 | Phase 3 | Complete |
| DISC-02 | Phase 3 | Complete |
| DISC-03 | Phase 3 | Complete |
| DISC-04 | Phase 3 | Complete |
| DISC-05 | Phase 3 | Complete |
| DISC-06 | Phase 3 | Complete |
| DISC-07 | Phase 3 | Complete |
| DISC-08 | Phase 3 | Complete |
| DISC-09 | Phase 3 | Complete |
| DISC-10 | Phase 3 | Complete |
| DISC-11 | Phase 3 | Complete |
| DISC-12 | Phase 3 | Complete |
| DISC-13 | Phase 3 | Complete |
| DISC-14 | Phase 3 | Complete |
| DISC-15 | Phase 3 | Complete |
| DISC-16 | Phase 3 | Complete |
| ADMN-01 | Phase 2 | Complete |
| ADMN-02 | Phase 2 | Complete |
| ADMN-03 | Phase 2 | Complete |
| ADMN-04 | Phase 2 | Complete |
| ADMN-05 | Phase 2 | Complete |
| ADMN-06 | Phase 2 | Complete |
| ADMN-07 | Phase 2 | Complete |
| ADMN-08 | Phase 2 | Complete |
| ADMN-09 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
