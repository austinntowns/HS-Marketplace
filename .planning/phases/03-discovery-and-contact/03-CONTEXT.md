# Phase 3: Discovery and Contact - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Buyers can find listings that match their criteria and submit contact requests to sellers. Includes browse page with list/map views, filtering, listing detail page with seller financials and photos (KPI section placeholder for Phase 4), contact form with seller notification, and area alerts with email notifications.

</domain>

<decisions>
## Implementation Decisions

### Browse Experience — List View
- Card-based grid layout (2-3 cards per row on desktop)
- Each card shows: primary photo, asking price, city/state, type badge
- Type badge (Suite/Flagship/Territory) displayed below photo with price, not overlaid
- Primary photo only on cards — no hover carousel
- Skeleton cards while loading
- Results count header ("X listings") updates with filter changes
- Infinite scroll for pagination
- Sort options: Newest first (default), Price low-to-high, Price high-to-low

### Browse Experience — Map View
- Split screen layout (Zillow-style): list panel on left, map on right
- MapTiler as map provider
- Bi-directional hover linking: hover card highlights pin, hover pin highlights card
- Clicking a map pin shows popup with card preview (photo, price, type) — click popup to go to detail
- Map auto-zooms to fit all visible listings when filters change
- User can manually zoom/pan after auto-fit

### Browse Experience — Mobile
- Toggle between list and map views (no split on mobile)
- Filter state preserved when switching views

### Browse Experience — Empty State
- "No listings match your filters" message with button to clear all filters

### Search and Filters
- Horizontal filter bar above results (not sidebar)
- Location search (Zillow-style): type city/state/zip to center map — NOT freeform text search
- Location autocomplete with city/state suggestions
- Price range: Min/max dropdowns with preset ranges
- State filter: Multi-select dropdown (can select multiple states)
- Type filter: Checkboxes for Suite, Flagship, Territory — NO Bundle option
- Bundle visibility rule: Bundles appear if ANY of their included locations match selected types

### Listing Detail Page
- Photo gallery: Airbnb-style grid collage (1 large + 4 smaller), "Show all photos" for full gallery lightbox
- Seller financials: Card grid with key metrics (Asking Price, TTM Profit, Monthly Expenses)
- KPI section: Visible placeholder cards with "Coming Soon" or "Live data pending" label
- Layout: Single column, vertical scroll
- Small embedded map showing listing location
- Contact CTA: Floating button that scrolls to contact form section at bottom

### Contact Form
- Form section at bottom of detail page
- Buyer info auto-filled from profile
- Free-form message field
- One submission per listing per buyer — after submission, form replaced with "You've already contacted this seller" message
- Seller receives email notification immediately on submission

### Area Alerts
- Quick create: "Save this search" on browse page creates alert from current state filter
- Full management: Alerts section in account settings (create, edit, delete)
- Alert criteria: State/region only (simple)
- Email frequency: Immediate — one email per new matching listing as soon as it's approved

### Claude's Discretion
- Exact card dimensions and spacing
- Filter dropdown styling
- Map pin design
- Lightbox implementation details
- Form validation UX
- Email template design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in REQUIREMENTS.md and decisions above.

### Requirements
- `.planning/REQUIREMENTS.md` — DISC-01 through DISC-16 define all discovery and contact requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing codebase yet (greenfield project)

### Established Patterns
- Stack decided: Next.js + Neon Postgres + Vercel (from PROJECT.md)
- Auth: Auth.js v5 with Google Workspace SSO (from Phase 1)
- Email: Resend transactional email (from Phase 1)

### Integration Points
- Listings from Phase 2 schema (draft, pending, active, rejected, sold, delisted states)
- User roles from Phase 1 (buyer, seller, admin)
- Photo storage from Phase 2 (provider TBD — Vercel Blob or Cloudinary)

</code_context>

<specifics>
## Specific Ideas

- Browse should feel like Zillow — split view, location-based search, map centers on searched location
- Photo gallery should feel like Airbnb — grid collage with "Show all photos"
- Bundles are transparent in filters — no "Bundle" type option, they just appear when their components match

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-discovery-and-contact*
*Context gathered: 2026-03-19*
