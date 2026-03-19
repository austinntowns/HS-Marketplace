# Phase 1: Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Authentication via Google Workspace SSO (hellosugar.salon domain restriction), user roles and permissions, complete database schema for all v1 entities, and transactional email infrastructure. This phase makes the platform accept authenticated users and stores everything subsequent phases need.

</domain>

<decisions>
## Implementation Decisions

### Role Model
- Two-tier model: **User** and **Admin** (no separate buyer/seller roles)
- Franchisees (hellosugar.salon domain) are auto-authorized as Users with full access (browse + list)
- Allowlisted non-franchisees default to browse-only access
- Admin can upgrade any allowlisted user to seller (listing) access
- Role changes are admin-managed — users cannot modify their own roles

### First Admin Bootstrap
- Single env var: `INITIAL_ADMIN_EMAIL`
- That email address gets admin role on first login
- Only one initial admin via env var — they add others via UI
- App runs without admin if env var is not set (useful for dev/demo)
- Admins can demote themselves unless they're the last admin (prevent orphaned platform)

### Non-Franchisee Access
- Admin pre-allowlists by email address
- When allowlisted user logs in with Google, they're auto-approved with browse-only access
- Non-allowlisted, non-franchisee users see access denied page with:
  - Clear message: "You don't have access"
  - Contact info for requesting access
  - Button/link to Hello Sugar franchise page
- Allowlisted users can be upgraded to seller access by admin

### Franchisee Detection
- Domain-based: `hellosugar.salon` Google Workspace accounts are franchisees
- Auth.js v5 `hd` (hosted domain) restriction handles this at login
- Non-matching domains are checked against allowlist table
- If not in allowlist, access denied

### Claude's Discretion
- Exact database column names and index strategy
- Session handling implementation details
- Error message copy and styling
- Email template design

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above and in:
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-05 acceptance criteria
- `.planning/PROJECT.md` — Constraint: "Must use existing Google Workspace SSO"
- `.planning/STATE.md` — Blocker: "Hello Sugar Workspace domain name needs confirmation (assumed hellosugar.salon)"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, codebase will be scaffolded in this phase

### Established Patterns
- Stack confirmed: Next.js + Neon Postgres + Vercel + Auth.js v5 + Drizzle ORM + Resend

### Integration Points
- Auth.js v5 for Google OAuth with `hd` restriction
- Drizzle ORM for Neon Postgres schema
- Resend for transactional email

</code_context>

<specifics>
## Specific Ideas

- Access denied page should have a clear CTA to the Hello Sugar franchise page (for potential new franchisees)
- The marketplace shouldn't feel hostile to denied users — they might become franchisees

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-19*
