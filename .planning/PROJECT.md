# Hello Sugar Franchise Marketplace

## What This Is

An internal marketplace where Hello Sugar franchisees can list their locations (suites, flagships, or unopened territories) for sale to other franchisees or new buyers. Combines seller-provided financials with live operational data from Hello Sugar's internal API to give buyers transparent, up-to-date performance metrics.

## Core Value

Franchisees can quickly find buyers for their locations with verified performance data that builds trust and accelerates deals.

## Requirements

### Validated

- [x] Google Workspace SSO authentication — *Validated in Phase 1: Foundation*

### Active

- [ ] Franchisees can create listings for suites, flagships, unopened territories, or bundles
- [ ] Sellers enter financials (TTM profit, asking price, etc.)
- [ ] Live operational data pulled from internal API (revenue, new clients, bookings, membership conversion)
- [ ] KPI summary cards with 12-month trend drill-down
- [ ] Cumulative + per-location views for multi-location bundles
- [ ] Unopened territories show basic info only (location, size, price)
- [ ] Corporate approves listings before they go live
- [ ] Buyers can browse listings in list view or map view
- [ ] Filters: time open, price, location/state, location type
- [ ] Buyers can set area/state alerts for new listings
- [ ] Buyer submits contact form → seller notified
- [ ] Admin dashboard: approve/reject listings, view all activity, manage users, edit any listing

### Out of Scope

- Full transaction handling (offers, negotiations, escrow) — lead capture only
- Public access — authenticated users only
- In-app messaging — contact form is sufficient for v1
- Performance projections for unopened territories

## Context

- Hello Sugar is a franchise salon brand with suites (smaller) and flagships (larger locations)
- Franchisees are actively trying to sell locations now — urgent need
- Operational data available via existing internal API
- Users already have Google Workspace accounts

## Constraints

- **Auth**: Must use existing Google Workspace SSO
- **Data**: Must integrate with Hello Sugar internal API for live metrics
- **Stack**: Next.js + Neon Postgres + Vercel
- **Timeline**: Urgent — franchisees actively trying to sell

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lead capture only, not full transactions | Reduces complexity, v1 can ship faster | — Pending |
| Authenticated access only | Protects sensitive financial data, keeps it internal | ✓ Phase 1 |
| Corporate moderation required | Quality control, prevent bad listings | — Pending |
| Next.js + Neon + Vercel | Fast to build, familiar stack | ✓ Phase 1 |

---
*Last updated: 2026-03-19 after Phase 1 completion*
