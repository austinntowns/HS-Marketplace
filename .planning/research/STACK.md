# Stack Research

**Domain:** Internal B2B franchise marketplace (Next.js + Neon + Vercel)
**Researched:** 2026-03-19
**Confidence:** HIGH (all versions verified against npm registry)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.0 | Full-stack React framework | Latest LTS (released Oct 2025). Turbopack is now default bundler. React Compiler stable. App Router with Server Actions handles listing CRUD without separate API routes — critical for fast shipping. Vercel-native. |
| React | 19.x | UI layer | Ships with Next.js 16. React Compiler eliminates manual memo/callback optimization. Required peer for Next.js 16. |
| TypeScript | 5.x | Type safety | Enforced by drizzle-orm's type inference. Catch schema mismatches between DB and UI at compile time — essential for financial data (asking price, TTM profit). |
| Neon Postgres | (serverless) | Primary database | Serverless Postgres that scales to zero. Vercel integration is first-class. Connection pooling via PgBouncer built-in. No cold start pain with pooled connection strings. |
| @neondatabase/serverless | 1.0.2 | Neon HTTP/WebSocket driver | GA v1.0+ required for edge/serverless environments. Use this instead of standard `pg` driver in Vercel deployments — avoids TCP connection limits. |
| Drizzle ORM | 0.45.1 | Database access layer | TypeScript-first, schema-as-code, SQL-like syntax. Lighter than Prisma with less magic. Works natively with Neon's serverless driver. Migrations via drizzle-kit. Standard choice alongside Neon in 2025. |
| drizzle-kit | 0.31.10 | Schema migrations CLI | Paired with drizzle-orm. Run `drizzle-kit push` for dev, `drizzle-kit migrate` for production. |
| Auth.js (next-auth) | 5.0.0-beta.30 | Authentication | Auth.js v5 is the current standard for Next.js 16 App Router. Universal `auth()` works across Server Components, Server Actions, and middleware. Google provider with `hd` parameter enforces Workspace domain restriction. Note: still beta, but production-ready and the only path for App Router compatibility. |
| Tailwind CSS | 4.x | Styling | v4 is stable and default for new shadcn/ui projects. Token-driven theming via `@theme` directive replaces tailwind.config.js. No config file needed. |
| shadcn/ui | latest (CLI-managed) | Component library | Not a package — CLI copies components into your repo. All components updated for Tailwind v4 + React 19. Provides DataTable, Card, Charts (Recharts wrapper), Sidebar, Sheet — covers 80% of this project's UI. Admin moderation UI can be assembled entirely from shadcn primitives. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.71.2 | Form state management | Listing creation form (financials, location details, asking price). Uncontrolled inputs = no re-render on each keystroke. |
| @hookform/resolvers | 5.2.2 | Zod integration for RHF | Connects Zod schema to react-hook-form. Required companion — do not use RHF without it. |
| zod | 4.3.6 | Schema validation | Validate listing financials on both client (instant feedback) and server (in Server Actions). Single source of truth for field shapes. v4 is latest stable with improved type inference. |
| recharts | 3.8.0 | KPI trend charts | Powers the 12-month trend drill-down views. Already bundled inside shadcn/ui chart components — use shadcn's `<Chart>` wrapper rather than importing recharts directly. Handles area charts, bar charts, line charts for revenue/booking trends. |
| react-map-gl | 8.1.0 | Map view of listings | React wrapper for Mapbox GL JS. v8 supports both Mapbox and MapLibre via separate exports. Use `react-map-gl/mapbox` export. Marker component for each listing pin. Requires `dynamic()` import in Next.js (no SSR — needs `window`). |
| mapbox-gl | latest | Map rendering engine | Peer dependency for react-map-gl. Requires Mapbox access token. Used for the map view listing browse mode. |
| resend | 6.9.4 | Transactional email | Area/state alert emails to buyers, contact form notifications to sellers, admin approval notifications. React Email templates rendered server-side. First-class Vercel integration. Node.js 20+ required — matches Vercel's runtime. |
| react-email | latest | Email template components | Pair with Resend. Write emails as React components with full TypeScript support. Preview locally before sending. |
| @tanstack/react-query | 5.91.2 | Client-side data fetching | For dashboard KPI data that refreshes without full page reloads (live API data from Hello Sugar internal API). Overkill for simple CRUD — only use for the live metrics polling and trend data that updates frequently. |
| tw-animate-css | latest | Tailwind CSS animations | Replaces deprecated `tailwindcss-animate`. Auto-installed by shadcn CLI. Required for modal/dialog animations in shadcn components. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel CLI | Local dev + deployment | `vercel dev` mirrors production environment including Edge Config and env vars. Use for testing Neon connections locally. |
| Drizzle Studio | Database GUI | `npx drizzle-kit studio` — visual browser for your Neon database during development. No separate DB tool needed. |
| ESLint + `@typescript-eslint` | Linting | Next.js 16 ships with eslint config. Add `@typescript-eslint` rules for strict null checks on financial data. |
| Prettier | Code formatting | Standard. Add `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. |

## Installation

```bash
# Bootstrap (Next.js 16 with App Router + TypeScript + Tailwind v4)
npx create-next-app@latest hello-sugar-marketplace --typescript --tailwind --app --src-dir

# Core database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Auth
npm install next-auth@beta

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# Email
npm install resend react-email

# Map
npm install react-map-gl mapbox-gl

# Client data fetching (for live KPI data only)
npm install @tanstack/react-query @tanstack/react-query-devtools

# Dev
npm install -D prettier prettier-plugin-tailwindcss

# shadcn/ui (interactive CLI — run after project creation)
npx shadcn@latest init
# Then add components as needed:
npx shadcn@latest add card table chart sidebar dialog sheet form input select badge
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Auth.js v5 (next-auth beta) | Clerk | Clerk if you want a hosted auth UI, user management dashboard, and don't mind the cost. For Google Workspace SSO with domain restriction, Auth.js is sufficient and free. |
| Drizzle ORM | Prisma | Prisma if team prefers an auto-generated query builder and the `prisma studio` GUI. Drizzle is faster, lighter, and more explicit — better for a project where you want to own the SQL. |
| react-map-gl + Mapbox | Google Maps JS API | Google Maps if the org already pays for the Google Maps Platform. Mapbox has a generous free tier (50k map loads/month) suitable for an internal tool with ~100 franchisees. |
| Resend | SendGrid / Nodemailer | SendGrid for high-volume marketing email. Nodemailer if you already have an SMTP server. Resend's developer experience and React Email integration are the best available in 2025 for transactional email. |
| recharts (via shadcn) | Chart.js / Victory | Chart.js for vanilla JS contexts. Victory for heavy customization needs. Recharts inside shadcn's wrapper is the lowest-friction path for this stack. |
| @tanstack/react-query | SWR | SWR if you want a smaller bundle and your data fetching is simple. TanStack Query for the KPI dashboard polling because it provides better devtools and more granular cache invalidation controls. |
| Tailwind CSS v4 | CSS Modules | CSS Modules if the team dislikes utility classes. Tailwind v4 is the default and shadcn is built on it — switching would require forking every component. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pages Router | Legacy routing model; Auth.js v5 and modern patterns target App Router only. Mixing routers causes confusion. | App Router exclusively |
| next-auth v4 (stable) | Does not support App Router `auth()` function, middleware, or Server Components natively. Requires awkward workarounds. | next-auth@beta (v5) |
| Prisma with Neon serverless driver | Prisma's connection handling conflicts with Neon's serverless HTTP driver at scale — documented incompatibility with many short-lived connections. | Drizzle ORM + @neondatabase/serverless |
| Vercel Postgres (legacy) | Vercel deprecated their Postgres product in favor of directing users to Neon directly. | Neon directly via @neondatabase/serverless |
| tailwindcss-animate | Deprecated. Removed from shadcn default setup. Breaks with Tailwind v4. | tw-animate-css |
| Redux / Zustand for server state | Server state (listings, user data) belongs in React Query or Server Component fetches — not in a client store. Only use Zustand if you need local UI state that spans unrelated components (e.g., map filter state). | TanStack Query for server state; React state for local UI |
| React Google Maps (`@react-google-maps/api`) | Requires Google Maps Platform billing setup. Mapbox has a better free tier for low-traffic internal tools. | react-map-gl + Mapbox |

## Stack Patterns by Variant

**For listing CRUD (create/edit/approve):**
- Use Server Actions + react-hook-form + Zod
- Server Actions handle the DB write; RHF handles client validation
- No separate API route needed

**For live KPI data from Hello Sugar internal API:**
- Fetch in a Server Component for initial load
- Use TanStack Query for client-side refresh interval
- Cache at the Neon layer (materialized views) if the internal API is slow

**For map view:**
- Always `dynamic()` import with `{ ssr: false }` — react-map-gl requires browser globals
- Cluster markers with supercluster if listing count exceeds 50

**For admin moderation workflow:**
- Use Next.js route groups: `(admin)` layout with role check in middleware
- Check `session.user.role === 'admin'` via Auth.js session in middleware
- shadcn DataTable + Badge for approve/reject queue

**For area alerts (buyer notifications):**
- Store alert preferences in Postgres (state, location type)
- Trigger Resend email via Server Action when a listing is approved
- No background job infrastructure needed for v1 — fire during approval Server Action

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.2.0 | react@19.x, react-dom@19.x | React 19 is required — not optional in Next.js 16 |
| next-auth@5.0.0-beta.30 | next@14, 15, 16 | Confirmed compatible. ENV prefix changed from `NEXTAUTH_` to `AUTH_` |
| drizzle-orm@0.45.1 | @neondatabase/serverless@1.0.2 | Use `neon()` from serverless driver as the drizzle connection: `drizzle(neon(process.env.DATABASE_URL))` |
| react-map-gl@8.1.0 | mapbox-gl@3.x | v8 supports mapbox-gl v3. Import from `react-map-gl/mapbox` not root |
| shadcn/ui (CLI) | tailwindcss@4.x, react@19.x | All shadcn components updated for Tailwind v4 + React 19 as of late 2025 |
| zod@4.3.6 | @hookform/resolvers@5.2.2 | Resolvers v5 supports Zod v4. Do not use resolvers v4 with Zod v4 — schema API changed. |
| recharts@3.8.0 | react@19.x | Recharts 3.x targets React 18+; works with React 19 |

## Sources

- npm registry (verified 2026-03-19): next@16.2.0, next-auth@5.0.0-beta.30, drizzle-orm@0.45.1, drizzle-kit@0.31.10, @neondatabase/serverless@1.0.2, react-map-gl@8.1.0, resend@6.9.4, @tanstack/react-query@5.91.2, recharts@3.8.0, react-hook-form@7.71.2, zod@4.3.6, @hookform/resolvers@5.2.2
- [Next.js 16 release announcement](https://nextjs.org/blog/next-16) — Turbopack default, React Compiler stable, LTS designation — HIGH confidence
- [Auth.js v5 migration guide](https://authjs.dev/getting-started/migrating-to-v5) — App Router support, ENV prefix changes — HIGH confidence
- [Auth.js Google provider docs](https://authjs.dev/reference/core/providers/google) — `hd` parameter for Workspace domain restriction — HIGH confidence
- [Neon serverless driver docs](https://neon.com/docs/serverless/serverless-driver) — HTTP/WebSocket transport, Node 19+ requirement — HIGH confidence
- [Neon + Drizzle guide](https://neon.com/docs/guides/drizzle) — Official integration guide — HIGH confidence
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — Compatibility confirmed, tw-animate-css replacement — HIGH confidence
- [Next.js 15.5 release](https://nextjs.org/blog/next-15-5) — Node.js middleware stable, Turbopack builds beta — HIGH confidence (superseded by v16)
- WebSearch (2026-03-19): B2B marketplace patterns, TanStack Query vs SWR comparison, Mapbox react-map-gl Next.js integration — MEDIUM confidence

---
*Stack research for: Hello Sugar internal franchise marketplace*
*Researched: 2026-03-19*
