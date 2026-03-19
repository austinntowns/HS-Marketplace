# Feature Research

**Domain:** Internal franchise resale marketplace (B2B, authenticated, lead-capture)
**Researched:** 2026-03-19
**Confidence:** HIGH (core features), MEDIUM (differentiators based on analog markets)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features buyers and sellers assume exist. Missing these makes the product feel broken or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Listing creation with structured financials | Sellers need a form to enter TTM revenue, cash flow, asking price, notes — without this there is no marketplace | MEDIUM | Validate required vs optional fields; sellers hate long forms |
| Multiple listing types | Suites, flagships, territories, and bundles are meaningfully different products — one template fits none | MEDIUM | Territory listings need stripped-down template (no financials, no KPIs) |
| Asking price displayed on listing | Buyers skip listings with no price; pricing transparency is default expectation from BizBuySell/Craigslist era | LOW | Consider "contact for price" escape valve for sensitive cases |
| List view with filters | Standard browse experience — buyers scan then narrow; no filters = overwhelming at scale | MEDIUM | Filters: location/state, price range, location type, time open |
| Listing detail page | All financial + operational data in one place; buyers need a single destination to evaluate a deal | LOW | Core page, but complexity increases with live data integration |
| Contact form / inquiry submission | Lead capture is the primary CTA; if buyers can't reach sellers the marketplace has no value | LOW | Triggers seller email notification; logs inquiry in DB |
| Seller notification on inquiry | Sellers abandon listings when they don't hear anything; notification is assumed | LOW | Email sufficient for v1; no in-app notification needed |
| Admin approve/reject flow | Without moderation, bad or fraudulent listings erode trust — expected for any internal business tool | MEDIUM | Needs reject reason, re-submit path, and status tracking |
| Authentication / access control | Financial data is sensitive; users expect restricted access; Google SSO already standard at Hello Sugar | LOW | Google Workspace SSO, roles: buyer/seller/admin |
| Listing status visibility for sellers | Sellers need to know if their listing is pending, live, or rejected — abandonment follows silence | LOW | Status badge: Draft / Pending Review / Active / Sold / Rejected |
| Photo support on listings | Buyers expect to see the physical location — text-only listings perform worse (BizBuySell data) | LOW | Upload to cloud storage; 5–10 image limit is sufficient |

### Differentiators (Competitive Advantage)

Features not found on public B2B marketplaces that give this platform its core value proposition: verified, live operational data that builds trust and accelerates deals.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Live API-driven KPIs on listing page | Public marketplaces show seller-reported financials only — always suspect; live data from Hello Sugar's internal API removes doubt and accelerates buyer confidence | HIGH | Revenue, new clients, bookings, membership conversion; requires internal API integration and auth |
| 12-month trend charts per KPI | Point-in-time numbers hide trajectory; a business trending up at $180k is worth more than one declining from $220k | MEDIUM | Sparkline or bar chart; Recharts or Chart.js; needs 12 months of historical data from API |
| Cumulative + per-location views for bundles | Unique to this platform — buyers evaluating multi-location bundles need both aggregate and individual breakdowns to make decisions | MEDIUM | Toggle between views; only relevant for bundle listing type |
| Financial data split (seller-entered vs API-verified) | Clearly labeling what is self-reported vs verified by Hello Sugar removes ambiguity that derails deals | LOW | Visual indicator (badge/icon) on each data point; high trust signal |
| Map view with territory visualization | Useful for territory listings where geography is the primary differentiator; buyers evaluating expansion can see adjacency | HIGH | Mapbox (already used in adjacent project); territory polygons require geodata |
| Area/state alerts | Buyers with specific geographic targets want push notification when a relevant listing appears — proactive rather than requiring repeated visits | MEDIUM | Saved search criteria → email on new match; cron-based or event-triggered |
| Admin dashboard with activity log | Corporate visibility into all marketplace activity — who is buying, what is selling, how long listings sit — enables resale program management, not just listing approval | MEDIUM | Inquiry volume, listing age, approval queue, user list |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| In-app messaging / chat | Feels like a natural evolution from contact form | Adds real-time infrastructure, notification complexity, message history, read receipts — 3x the work for marginal v1 gain; deals happen off-platform anyway | Contact form → email hand-off; add messaging only if deals are falling through due to communication friction |
| Offer / negotiation workflow | Makes the platform feel like a full transaction engine | Full transaction handling (offers, counteroffers, escrow, docs) is a multi-phase build; v1 is lead capture only; franchisor approval workflow is separate legal process | Lead capture with structured inquiry form that collects buyer's offer range as a field |
| Automated valuation / price suggestions | Sellers want pricing help; seems like a smart feature | Requires reliable comps data that doesn't exist internally yet; bad valuations create liability; Hello Sugar deals are too thin a dataset to model | Provide industry benchmarks in help text (e.g., "similar locations sell at 2–3x SDE"); link to external resources |
| Public / unauthenticated access | Marketing benefit of open listings | Financial data on individual franchise performance is sensitive; franchisees would resist exposing revenue/client counts publicly; Hello Sugar's competitive data would be visible | Keep authenticated; if marketing need arises, create a sanitized public teaser with no financials |
| Buyer qualification gating (NDA wall) | Standard in business broker world — protect financials behind NDA | For an internal network of franchisees, over-engineering qualification creates friction with trusted buyers; everyone on the platform already passed franchise vetting | Role-based access (authenticated = qualified); escalate NDA requirement only for territory sales if corporate requests |
| Subscription / premium listing tiers | Revenue model, seller visibility | This is an internal tool, not a revenue-generating marketplace; tiered listings create perceived inequity between franchisees | All listings equal visibility; corporate can feature listings manually via admin if needed |
| Automatic relisting / expiry reminders | Feels like good seller UX | Complexity vs value tradeoff is poor at v1; sold/stale listings are better handled by admin | Admin sweep for stale listings; manual seller mark-as-sold flow |

---

## Feature Dependencies

```
Authentication (Google SSO)
    └──required by──> All features (nothing works without identity)
                          └──required by──> Role-based access (buyer/seller/admin)
                                                └──required by──> Admin approval flow
                                                └──required by──> Listing creation

Listing creation (seller flow)
    └──required by──> Listing detail page
                          └──required by──> Contact form
                          └──required by──> Live KPI display
                                                └──required by──> 12-month trend charts
                          └──required by──> Photo display

Internal API integration
    └──required by──> Live KPI display
    └──required by──> 12-month trend charts
    └──enables──>     Financial data provenance labeling (verified vs self-reported)

Admin approval flow
    └──required by──> Listing goes live
    └──enables──>     Admin activity dashboard

List view + filters
    └──enables──> Area/state alerts (alert = saved filter + notification trigger)

Map view
    └──depends on──> Listing geodata (lat/lng per location)
    └──enhances──>   Territory listing type (geography is the value)
```

### Dependency Notes

- **Authentication required by everything:** SSO must be phase 1 milestone 1; nothing else ships without it.
- **Internal API integration gates KPI features:** If API access is delayed or unstable, live data display and trend charts are blocked. Seller-entered financials can ship independently as fallback.
- **List view required before alerts:** Alerts are a saved-search with notification — the filter model must exist before alerts can be built on top of it.
- **Admin approval required before public listing:** No listing should be buyer-visible without approval step in place, even in development.
- **Map view is independent:** Can ship after list view without blocking anything; territory visualization is enhancement not core.

---

## MVP Definition

### Launch With (v1)

Minimum feature set that delivers real value to franchisees actively trying to sell right now.

- [ ] Google SSO authentication with buyer/seller/admin roles — gating requirement for all else
- [ ] Listing creation for all 4 types (suite, flagship, territory, bundle) with seller-entered financials — core seller value
- [ ] Live KPI display from internal API on listing detail page — the primary differentiator; don't launch without it
- [ ] Admin approve/reject flow with email notification to seller — required for corporate trust and quality control
- [ ] List view with filters (type, state, price range) — minimum browse experience
- [ ] Listing detail page with photos, financials, and KPIs — the destination buyers need to evaluate a deal
- [ ] Contact form on listing → seller email notification — the only revenue-generating action on the platform
- [ ] Listing status visibility for seller (draft/pending/active/rejected) — prevents seller abandonment

### Add After Validation (v1.x)

Add once core is live and real listings are flowing.

- [ ] 12-month KPI trend charts — add when sellers report buyers want to see trajectory; raw numbers land first
- [ ] Map view — add when territory listings are active and geography is a real decision factor
- [ ] Area/state alerts — add when buyer repeat-visit behavior shows demand for notifications
- [ ] Admin activity dashboard — add when admin team requests aggregate visibility; single-listing approval queue is sufficient at launch
- [ ] Bundle cumulative + per-location view — add when first bundle listing is submitted

### Future Consideration (v2+)

Defer until product-market fit is established and resale volume justifies.

- [ ] In-app messaging — only if email-based communication is creating lost deals
- [ ] Offer/negotiation workflow — only if corporate decides to bring transaction management in-house
- [ ] Automated valuation tooling — only if enough historical sale data accumulates to build reliable comps

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Authentication (Google SSO) | HIGH | LOW | P1 |
| Listing creation (all types) | HIGH | MEDIUM | P1 |
| Live API KPI display | HIGH | HIGH | P1 |
| Admin approve/reject | HIGH | MEDIUM | P1 |
| Listing detail page | HIGH | LOW | P1 |
| Contact form + seller notification | HIGH | LOW | P1 |
| List view + filters | HIGH | MEDIUM | P1 |
| Listing status for seller | MEDIUM | LOW | P1 |
| Photo upload | MEDIUM | LOW | P1 |
| 12-month trend charts | HIGH | MEDIUM | P2 |
| Map view | MEDIUM | HIGH | P2 |
| Area/state alerts | MEDIUM | MEDIUM | P2 |
| Admin activity dashboard | MEDIUM | MEDIUM | P2 |
| Bundle cumulative/per-location view | MEDIUM | MEDIUM | P2 |
| In-app messaging | LOW | HIGH | P3 |
| Offer/negotiation workflow | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Public analog markets (BizBuySell, Acquire.com, Investors Club) inform what buyers expect from a listing experience — even if Hello Sugar's platform is internal-only.

| Feature | BizBuySell | Acquire.com | Hello Sugar Approach |
|---------|------------|-------------|----------------------|
| Financials on listing | Seller-entered, optional | Seller-entered, verified via Stripe/bank | Seller-entered + API-verified live data (stronger trust signal than both) |
| Listing types | Business, franchise, asset | SaaS, e-commerce, app | Suite, flagship, territory, bundle (domain-specific) |
| Buyer alerts | Email on saved search match | Not prominent | Area/state alerts — same pattern |
| Contact flow | Gated email inquiry | NDA wall then intro | Direct contact form, no NDA (internal network of pre-qualified franchisees) |
| Admin/moderation | Broker-managed | Verify metrics, then auto-publish | Corporate approval queue (more control than BizBuySell, less automated than Acquire) |
| Map view | No | No | Planned for territory listings — differentiated |
| Live operational data | No | Revenue via Stripe integration | Full KPI suite via internal API — strongest data story of any comparable platform |
| Authentication | Public (free listings) | Account required | Google SSO (hardest wall, appropriate for sensitive internal data) |

---

## Sources

- BizBuySell listing features and buyer alert patterns: https://www.bizbuysell.com/blog/ten-steps-to-attract-buyers-to-business-for-sale-listings/ (MEDIUM confidence — marketing content but reflects real product)
- BizBuySell seller lead and broker tools: https://www.bizbuysell.com/seller-leads-broker-faq/ (MEDIUM confidence)
- Franchise resale process and corporate approval patterns: https://kmfbusinessadvisors.com/selling-and-buying-existing-franchises/ (MEDIUM confidence)
- Rise of franchise resale programs: https://blog.wesellrestaurants.com/franchise-resales-are-redefining-growth-insights-from-fldc-2025-and-the-rise-of-resale-programs (MEDIUM confidence — 2025 industry source)
- Marketplace UX patterns for search, filters, alerts: https://www.rigbyjs.com/blog/marketplace-ux (MEDIUM confidence — UX practitioner source)
- B2B marketplace essential features: https://www.journeyh.io/blog/b2b-marketplace-models-features (MEDIUM confidence)
- Internal franchise portal features and RBAC patterns: https://www.claromentis.com/blog/must-have-franchise-software-features (LOW confidence — franchise intranet context, not resale marketplace)
- PROJECT.md requirements baseline: /Users/austin/.planning/PROJECT.md (HIGH confidence — ground truth for this project)

---

*Feature research for: Hello Sugar internal franchise resale marketplace*
*Researched: 2026-03-19*
