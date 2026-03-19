# Phase 4: Live KPI Integration - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Display live operational data from Hello Sugar's internal API on listing detail pages. Four KPI cards (revenue, new clients, bookings, membership conversion) with 12-month trend charts. Bundle listings show cumulative and per-location breakdown. Graceful degradation when API is unavailable.

**Requirements:** LIST-17, LIST-18, LIST-19

</domain>

<decisions>
## Implementation Decisions

### KPI Card Layout
- 4-column horizontal row (dashboard-style) — all 4 KPIs visible without scrolling
- KPI section appears BELOW seller-entered financials
- Section header: "Live Performance Data" (or "Live Performance Data (4 locations)" for bundles)
- Unopened territories: hide KPI section entirely (no operational data exists)

### KPI Card Content
- Primary number: last month's value (not TTM or average)
- Month-over-month change: arrow + percentage (e.g., +12% ↑)
- Change indicator colors: neutral (same color), arrow direction conveys meaning
- Membership conversion: percentage only (45%), not ratio
- Per-card freshness timestamp (e.g., "Updated 2 hours ago")
- Badge with verified checkmark and "Live" label on each card

### KPI Card Interaction
- Click card to expand — opens modal/drawer with full trend chart
- Cards are compact by default, modal provides detail

### Trend Chart
- Line chart (not area or bar)
- 12-month fixed period (no 3mo/6mo toggle)
- Hover tooltip shows exact value + date (e.g., "$45,230 • Oct 2025")
- No benchmark or comparison line — just the trend

### Bundle Breakdown
- Default view: both cumulative KPIs AND per-location table visible
- Per-location display: data table (rows = locations, columns = KPIs)
- Table is sortable by all columns (click header to sort)
- 5+ locations: vertical scroll (no pagination)
- Row click: inline expand to show that location's trend chart
- Bundle trend chart modal: all locations overlaid on same chart, color-coded
- Unopened territories in bundle: separate section below KPI table, not in table itself
- Location count shown in section header

### Unavailable State
- API completely down: hide KPI section entirely (only seller financials shown)
- Partial data (some KPIs missing): show available cards, hide missing (layout adjusts)
- No failure indication: silent — user sees what's available
- Stale data: show cached data silently, freshness timestamp handles transparency

### Claude's Discretion
- Exact card dimensions and spacing
- Modal animation and styling
- Chart library choice (Recharts, Chart.js, etc.)
- Color palette for overlaid location lines in bundle charts
- Cache duration for stale data (suggested: 5-minute server cache per ROADMAP plans)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` §Phase 4 — Success criteria, planned tasks (04-01 discovery spike, 04-02 proxy, 04-03 charts)
- `.planning/REQUIREMENTS.md` §Listings — LIST-17, LIST-18, LIST-19 requirements

### Constraints
- `.planning/STATE.md` §Blockers — Internal API contract unknown, discovery spike required first

No external API specs exist yet — discovery spike (Plan 04-01) will produce documentation.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — project is planning-only, no code implemented

### Established Patterns
- Stack decided: Next.js + Neon Postgres + Vercel
- Auth.js v5 for Google Workspace SSO (Phase 1)

### Integration Points
- Listing detail page (Phase 3, DISC-07) will have placeholder KPI section
- Phase 4 replaces placeholder with live data
- Server-side API proxy with 5-minute cache (per ROADMAP)

</code_context>

<specifics>
## Specific Ideas

- Badge design: verified checkmark + "Live" text — visually distinct from seller-entered data
- Per-card timestamps give buyers confidence data is fresh
- Overlaid trend lines for bundles let buyers compare locations at a glance
- Silent fallback to cached data keeps page functional during API hiccups

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-live-kpi-integration*
*Context gathered: 2026-03-19*
