# Phase 2: Listings and Moderation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Sellers create listings for suites, flagships, territories, or bundles. Admins approve/reject listings before they go live. Sellers manage their listing lifecycle (draft, pending, active, rejected, sold, delisted).

</domain>

<decisions>
## Implementation Decisions

### Listing Form Flow
- Multi-step wizard: Step 1 (Type + location) → Step 2 (Financials) → Step 3 (Photos + details)
- Visual cards for type selection, but locations are multi-select from seller's owned salons
- Selecting multiple locations = automatic bundle creation
- Mixed bundles allowed (open salons + unopened territories in same listing)
- ONE price per listing — no per-location pricing
- Auto-save on each step completion
- Success page showing "Listing submitted for review" with status and next steps

### Location Selection
- Open salons (suites/flagships): Multi-select from dropdown of seller's owned locations
- Territories: Location name + draggable radius on map
- Territory map shows existing Hello Sugar locations as context pins

### Auto-Populated Fields (Read-Only)
- Name
- Address
- Trailing 12-month revenue (TTM revenue)
- MCR (Monthly Conversion Rate) for last month
- Opening date
- Square footage

### Seller-Entered Fields
- Asking price (one per listing)
- TTM profit
- Reason for selling
- Notes/description
- Assets: "Inventory included" checkbox + "Laser device included" checkbox + "Other assets" text field

### Removed Requirements
- ~~Monthly expenses~~ — sellers do NOT enter this (LIST-09 removed)

### Photo Upload
- Drag-drop zone that also opens file picker on click
- Progress bars during upload
- Drag to reorder photos — first photo becomes cover
- Minimum 1 photo required (changed from 3)
- Maximum 10 photos
- Storage: Vercel Blob

### Seller Dashboard (My Listings)
- Multiple listings: Card grid with status badges
- Single listing: Full detail view with analytics (views + inquiries count)
- Rejection: Prominent red banner on listing with admin's reason + "Edit to resubmit" CTA
- Editing a rejected listing auto-resubmits for review (status → Pending)

### 30-Day Reminder
- Email asks: "Have you sold this location, or would you like to update your listing?"
- One-click "Mark as Sold" link in email (no login required)
- Marking sold: Simple action, no buyer tracking needed

### Admin Approval Queue
- Card list with listing preview, seller name, submitted date
- Inline Approve/Reject buttons
- Reject flow: Dropdown of common reasons + optional notes field
- Common rejection reasons: Wrong category, Missing info, Ownership issue, etc.

### Ownership Verification
- Check against system data (internal API/franchise records)
- Display "Verified" or "Unverified" indicator on listing
- Unverified shows warning but admin can still approve (risk-based decision)

### Claude's Discretion
- Exact step indicator design in wizard
- Form validation messaging
- Loading states and skeleton designs
- Photo compression/optimization approach
- Mobile responsive breakpoints

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

Internal data sources:
- Hello Sugar internal API provides: location ownership, TTM revenue, MCR, opening date, square footage
- API contract unknown — Phase 4 handles discovery, use mocks during Phase 2

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project

### Established Patterns
- None yet — this phase establishes patterns for forms, photo upload, status management

### Integration Points
- Auth system from Phase 1 (user roles, session)
- Database schema from Phase 1 (listings table, status enum)
- Email infrastructure from Phase 1 (Resend for notifications)

</code_context>

<specifics>
## Specific Ideas

- Territory radius map should show existing Hello Sugar locations as pins for buyer context
- 30-day reminder email should have one-click "Mark as Sold" — reduce friction for sellers
- Single-listing seller view should feel more like a dashboard with analytics, not just a list item
- Admin sees ownership "Verified" badge from system data, can approve unverified with warning

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-listings-moderation*
*Context gathered: 2026-03-19*
