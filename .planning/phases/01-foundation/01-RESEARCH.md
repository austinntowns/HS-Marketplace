# Phase 1: Foundation - Research

**Researched:** 2026-03-19
**Domain:** Next.js App Router + Auth.js v5 Google Workspace SSO + Drizzle ORM + Neon Postgres + Resend
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Role model:** Two-tier — User and Admin (no separate buyer/seller roles). Franchisees (hellosugar.salon domain) are auto-authorized as Users with full access (browse + list). Allowlisted non-franchisees default to browse-only. Admin can upgrade any allowlisted user to seller access. Role changes are admin-managed only.
- **First admin bootstrap:** Single env var `INITIAL_ADMIN_EMAIL`. That email gets admin role on first login. Only one initial admin via env var — they add others via UI. App runs without admin if env var is not set. Admins can demote themselves unless last admin.
- **Non-franchisee access:** Admin pre-allowlists by email. Allowlisted users auto-approved on login with browse-only. Non-allowlisted, non-franchisee users see access denied page with clear message, contact info, and link to Hello Sugar franchise page.
- **Franchisee detection:** Domain-based — `hellosugar.salon` Google Workspace accounts are franchisees. Auth.js v5 `hd` param handles this at login. Non-matching domains checked against allowlist table. If not in allowlist, access denied.
- **Stack confirmed:** Next.js + Neon Postgres + Vercel + Auth.js v5 + Drizzle ORM + Resend

### Claude's Discretion
- Exact database column names and index strategy
- Session handling implementation details
- Error message copy and styling
- Email template design

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with Google Workspace SSO (hellosugar.salon domain) | Auth.js v5 Google provider with `hd` param + signIn callback domain check |
| AUTH-02 | Existing franchisees are auto-authorized on first login | signIn callback + Drizzle adapter auto-creates user row on OAuth success |
| AUTH-03 | Non-franchisees must be manually added by admin before they can log in | allowlist table + signIn callback checks allowlist for non-hellosugar.salon accounts |
| AUTH-04 | Users have roles: buyer, seller, admin (users can have multiple) | Custom `role` column on users table; session callback exposes role; CONTEXT.md simplifies to User/Admin two-tier with seller access flag |
| AUTH-05 | Admin can set/revoke admin status for any user | Admin UI calls server action updating users.role; last-admin guard prevents orphan |
</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure phase — no user-facing product features, just the scaffolding everything else builds on. The four work items are: (1) create the Next.js project and connect it to Neon Postgres on Vercel, (2) wire up Auth.js v5 with the Google provider restricted to `hellosugar.salon`, implementing the two-tier role model and first-admin bootstrap, (3) write the complete Drizzle schema for all v1 entities and run the initial migration, and (4) configure Resend and verify DNS.

The most technically nuanced part is the auth flow. Auth.js v5 uses a single `auth.ts` file at the project root, exports `{ handlers, auth, signIn, signOut }`, and its middleware (`proxy.ts` in Next.js 16, `middleware.ts` in older versions) does edge-level route protection. Domain restriction is implemented by passing `hd: "hellosugar.salon"` in the Google provider's `authorization.params`, combined with a `signIn` callback that hard-checks the domain and allowlist — the `hd` param only hints to Google's UI, the callback is the actual enforcement gate. Role state lives on a custom column in the Drizzle-managed `users` table and is exposed into the JWT/session via the `session` callback.

The Drizzle schema must cover all v1 entities up front (users, accounts, sessions, listings, photos, contacts, alerts) even though phases 2-4 implement them — this ensures the database is stable and migrations are clean from day one. Use `pgEnum` for the listing status state machine. Neon recommends a direct (non-pooled) `DATABASE_URL` for `drizzle-kit` migrations, and a pooled connection for runtime queries in Vercel's serverless environment.

**Primary recommendation:** Implement auth before schema so the users table + role column is finalized before Drizzle generates the initial migration. The Drizzle adapter's required tables (users, accounts, sessions, verificationTokens) should be defined first, then extend users with custom columns (role, allowlisted, sellerAccess), then add the domain tables.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.2.3 (latest) | App framework | Confirmed stack choice; App Router is the modern standard |
| next-auth | 5.0.0-beta.30 | Auth (v5 beta is production-ready) | Only version with App Router-native `auth()` function |
| @auth/drizzle-adapter | 1.11.1 | Connects Auth.js to Drizzle-managed DB | Official adapter; avoids hand-rolling OAuth table management |
| drizzle-orm | 0.45.1 | Type-safe ORM for Postgres | Confirmed stack; lightweight, SQL-first, great with Neon |
| drizzle-kit | 0.31.10 | Migrations and schema management | Required companion to drizzle-orm |
| @neondatabase/serverless | 1.0.2 | Neon HTTP/WebSocket driver | Official driver for Neon; fast cold starts on Vercel |
| resend | 6.9.4 | Transactional email | Confirmed stack; excellent DX, React Email support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | latest | Run TypeScript migration scripts | Needed for `db:migrate` script in Node context |
| dotenv | latest | Load `.env` in migration scripts | Required when running `tsx src/migrate.ts` outside Next.js |
| zod | latest | Runtime validation of env vars + forms | Use with `@t3-oss/env-nextjs` for typed env validation |
| @t3-oss/env-nextjs | latest | Type-safe environment variable schema | Catches missing env vars at build time |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auth.js v5 beta | Auth.js v4 (stable) | v4 has no App Router-native `auth()` — requires `getServerSession()` everywhere. v5 beta is the intended path. |
| @neondatabase/serverless | node-postgres (pg) | Neon recommends node-postgres + connection pooling on Vercel Fluid; the serverless driver is preferred for edge/serverless cold starts. Vercel deployments are serverless, so serverless driver is appropriate. |
| Resend | Nodemailer / SendGrid | Resend has simpler setup, native React Email templates, generous free tier |

**Installation:**
```bash
npx create-next-app@latest hs-marketplace --typescript --tailwind --app --src-dir --import-alias "@/*"
cd hs-marketplace
npm install next-auth@beta @auth/drizzle-adapter
npm install drizzle-orm @neondatabase/serverless
npm install resend
npm install -D drizzle-kit tsx dotenv
npm install zod @t3-oss/env-nextjs
```

**Version verification:** Versions above confirmed against npm registry on 2026-03-19.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Sign-in page
│   │   └── access-denied/
│   │       └── page.tsx          # Denied page with franchise CTA
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Protected layout
│   │   └── page.tsx              # Marketplace landing
│   ├── admin/
│   │   └── users/
│   │       └── page.tsx          # User management (AUTH-05)
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts      # Auth.js handler
├── auth.ts                       # Auth.js config (root-level)
├── middleware.ts                  # Route protection (or proxy.ts in Next.js 16)
├── db/
│   ├── index.ts                  # Drizzle client singleton
│   ├── schema/
│   │   ├── auth.ts               # Auth.js required tables
│   │   ├── users.ts              # Extended user + allowlist tables
│   │   ├── listings.ts           # Listing state machine + types
│   │   ├── photos.ts             # Photo references
│   │   ├── contacts.ts           # Buyer-seller contact form submissions
│   │   └── alerts.ts             # Buyer area alerts
│   └── schema.ts                 # Re-exports all schemas (consumed by drizzle-kit)
├── lib/
│   └── env.ts                    # @t3-oss/env-nextjs schema
└── drizzle.config.ts             # drizzle-kit configuration
drizzle/                          # Generated migration files (gitignored SQL, not the .ts)
```

### Pattern 1: Auth.js v5 Config with Domain Restriction and Role Bootstrap

**What:** Root-level `auth.ts` that restricts Google OAuth to `hellosugar.salon`, checks allowlist for other domains, bootstraps first admin, and extends session with role.

**When to use:** This is the single auth config — all auth logic flows through here.

```typescript
// src/auth.ts
// Source: https://authjs.dev/getting-started/providers/google + https://authjs.dev/guides/role-based-access-control
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      authorization: {
        params: {
          hd: "hellosugar.salon",  // Hints Google UI to show only Workspace accounts
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return false
      if (!profile?.email_verified) return false

      const email = profile.email as string
      const isWorkspaceDomain = email.endsWith("@hellosugar.salon")

      if (isWorkspaceDomain) {
        // Auto-authorize franchisees; bootstrap first admin if applicable
        if (email === process.env.INITIAL_ADMIN_EMAIL) {
          await db.update(users).set({ role: "admin" }).where(eq(users.email, email))
        }
        return true
      }

      // Non-franchisee: check allowlist
      const allowlisted = await db.query.allowlist.findFirst({
        where: eq(allowlist.email, email),
      })
      if (!allowlisted) return "/access-denied"  // Redirect, not false, for better UX
      return true
    },
    async session({ session, user }) {
      // Expose role from DB user row to session
      session.user.role = user.role
      session.user.sellerAccess = user.sellerAccess
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
})
```

**Note on `hd` parameter:** The `hd` param only pre-selects the domain hint in Google's OAuth consent UI. It does NOT prevent non-hellosugar.salon accounts from completing the OAuth flow if they manipulate the request. The `signIn` callback's domain check is the actual security gate.

### Pattern 2: Drizzle Schema — Auth Tables + Custom Columns

```typescript
// src/db/schema/auth.ts
// Source: https://authjs.dev/reference/drizzle-adapter/lib/pg + Drizzle docs
import {
  pgTable, text, timestamp, integer, boolean, primaryKey
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // Custom columns beyond Auth.js defaults:
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  sellerAccess: boolean("seller_access").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}))

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

export const allowlist = pgTable("allowlist", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  addedBy: text("added_by").references(() => users.id),
  addedAt: timestamp("added_at").defaultNow().notNull(),
})
```

### Pattern 3: Listing State Machine via pgEnum

```typescript
// src/db/schema/listings.ts
// Source: Drizzle ORM docs https://orm.drizzle.team/docs/column-types/pg#enum
import { pgTable, pgEnum, text, timestamp, integer, decimal } from "drizzle-orm/pg-core"
import { users } from "./auth"

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "pending",
  "active",
  "rejected",
  "sold",
  "delisted",
])

export const listingTypeEnum = pgEnum("listing_type", [
  "suite",
  "flagship",
  "territory",
  "bundle",
])

export const listings = pgTable("listings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sellerId: text("seller_id").notNull().references(() => users.id),
  status: listingStatusEnum("status").default("draft").notNull(),
  type: listingTypeEnum("type").notNull(),
  title: text("title"),
  askingPrice: integer("asking_price"),  // cents
  ttmProfit: integer("ttm_profit"),      // cents
  reasonForSelling: text("reason_for_selling"),
  assets: text("assets"),
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

### Pattern 4: Route Protection with Middleware

```typescript
// src/middleware.ts (Next.js 15) or src/proxy.ts (Next.js 16)
// Source: https://authjs.dev/getting-started/session-management/protecting
export { auth as default } from "@/auth"

export const config = {
  matcher: [
    // Protect everything except static assets, api/auth, and public pages
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|access-denied).*)",
  ],
}
```

### Pattern 5: Drizzle Config (direct connection for migrations)

```typescript
// drizzle.config.ts
// Source: https://neon.com/docs/guides/drizzle-migrations
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use direct (non-pooled) URL for migrations
    url: process.env.DATABASE_URL_DIRECT!,
  },
})
```

### Anti-Patterns to Avoid

- **Relying solely on `hd` param for security:** The `hd` parameter is a UX hint, not an access control mechanism. Always enforce domain/allowlist in the `signIn` callback.
- **Mixing pooled/direct DB URLs:** Use `DATABASE_URL_DIRECT` for drizzle-kit migrations (non-pooled), `DATABASE_URL` for runtime (pooled). Neon documents that running migrations through the pooler can cause errors.
- **Putting business logic in middleware:** The Auth.js middleware runs at the edge — no database access, no Node.js APIs. Domain restriction logic in the signIn callback runs server-side.
- **Importing `auth.ts` directly in middleware:** In v5, export the auth instance and let middleware re-export it. The edge runtime restriction means middleware cannot share the same adapter-configured auth instance as server components unless you split config (see `auth.config.ts` pattern).
- **Defining enums inline in table columns:** Always `export const myEnum = pgEnum(...)` before the table definition — drizzle-kit needs the enum exported to generate correct SQL.
- **Not adding `updatedAt` triggers:** Drizzle doesn't auto-update `updated_at` on writes. Either set it explicitly in every update, use a DB trigger, or use `.$onUpdate(() => new Date())`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth token storage | Custom token table | `@auth/drizzle-adapter` | Handles token rotation, PKCE, refresh tokens, session invalidation — many edge cases |
| Session cookie management | Custom JWTs | Auth.js session strategy | CSRF protection, httpOnly cookies, secure defaults baked in |
| Postgres migrations | Custom SQL files | `drizzle-kit generate` + `drizzle-kit migrate` | Tracks schema drift, generates reversible migrations, handles enum creation order |
| DB client singleton | Raw `neon()` calls | `drizzle(neon(...))` singleton in `db/index.ts` | Prevents connection exhaustion in serverless environments |
| Email sending | Nodemailer/SMTP | Resend SDK | SPF/DKIM managed, deliverability tooling, React Email templates |
| Environment validation | Runtime `process.env` checks | `@t3-oss/env-nextjs` with Zod | Fails at build time, not runtime; typed access throughout app |

**Key insight:** The Auth.js + Drizzle adapter combination is specifically designed to handle the notorious complexity of OAuth flows. Token refresh, PKCE, multi-provider account linking, and session invalidation are all handled — none of this should be custom code.

---

## Common Pitfalls

### Pitfall 1: `hd` Param Does Not Enforce Domain
**What goes wrong:** Developer sets `hd: "hellosugar.salon"` and assumes only Workspace accounts can authenticate. A user with a personal Gmail can bypass by removing the `hd` param from the OAuth request.
**Why it happens:** `hd` is a display hint to Google's UI, not an authorization check.
**How to avoid:** Always pair `hd` with a `signIn` callback that verifies `profile.email.endsWith("@hellosugar.salon")`.
**Warning signs:** Test by attempting login with a personal Gmail account — if it succeeds, the callback check is missing.

### Pitfall 2: Drizzle Adapter Overwrites Custom User Columns on Re-login
**What goes wrong:** User logs in, admin sets their role. User logs in again and the adapter calls `updateUser` which may overwrite custom columns with `undefined`.
**Why it happens:** The Drizzle adapter maps Auth.js's internal user update to an SQL UPDATE — if the user object doesn't include `role`, it can be reset.
**How to avoid:** Override `updateUser` in the adapter or ensure `profile()` callback returns only the fields it owns, not the full user. Alternatively, use a separate roles table rather than a column.
**Warning signs:** Role resets after users sign in a second time.

### Pitfall 3: Auth.js v5 Edge Runtime + Drizzle Adapter Incompatibility
**What goes wrong:** Middleware file imports from `@/auth` which imports the Drizzle adapter. The adapter uses Node.js APIs not available in the edge runtime, causing a build error.
**Why it happens:** Middleware runs in the edge runtime by default in Next.js. The database adapter is Node.js-only.
**How to avoid:** Split auth config into `auth.config.ts` (edge-compatible, no adapter — just provider config + callbacks) and `auth.ts` (Node.js, includes adapter). Middleware imports from `auth.config.ts`. This is the official v5 recommended split.
**Warning signs:** Build error: `The edge runtime does not support Node.js 'net' module`.

### Pitfall 4: Neon Pooled vs Direct URL in Migrations
**What goes wrong:** `drizzle-kit migrate` fails with cryptic errors when using the pooled connection string (the one with `-pooler` in the hostname).
**Why it happens:** PgBouncer intercepts prepared statements and certain DDL operations.
**How to avoid:** Set `DATABASE_URL_DIRECT` (no `-pooler`) for drizzle.config.ts. Set `DATABASE_URL` (pooled) for runtime Drizzle client. Add both to Vercel environment variables.
**Warning signs:** Migration script hangs or throws `ERROR: prepared statement "s0" already exists`.

### Pitfall 5: `pgEnum` Must Be Created Before Tables That Reference It
**What goes wrong:** `drizzle-kit generate` produces migration SQL that tries to create a table referencing an enum type that hasn't been created yet — migration fails.
**Why it happens:** Migration file generation can order statements incorrectly.
**How to avoid:** Always export enums before table definitions in schema files. Keep enums in a dedicated `enums.ts` file imported first.
**Warning signs:** Migration error: `type "listing_status" does not exist`.

### Pitfall 6: Auth.js v5 Still in Beta
**What goes wrong:** API surface changes between beta releases, documentation lags behind code.
**Why it happens:** `next-auth@5.0.0-beta.30` is stable enough for production but the API is not fully frozen.
**How to avoid:** Pin the exact beta version in `package.json`. Review the changelog before upgrading. Don't use `next-auth@beta` as the version specifier in package.json — use `next-auth@5.0.0-beta.30`.
**Warning signs:** Import paths or callback signatures changed after `npm update`.

### Pitfall 7: First Admin Bootstrap Race Condition
**What goes wrong:** Two sessions for `INITIAL_ADMIN_EMAIL` complete simultaneously — both check "is user admin?" before either has written the role, resulting in neither getting admin.
**Why it happens:** The bootstrap logic in `signIn` callback is not atomic.
**How to avoid:** Use an upsert with a unique constraint — `INSERT ... ON CONFLICT DO UPDATE SET role = 'admin'` — rather than a SELECT then UPDATE pattern. Drizzle: `db.insert(users).values(...).onConflictDoUpdate(...)`.
**Warning signs:** First admin email exists in DB but has role = 'user'.

---

## Code Examples

Verified patterns from official sources:

### Neon DB Client Singleton (runtime)
```typescript
// src/db/index.ts
// Source: https://neon.com/docs/guides/drizzle-migrations
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Migration Script
```typescript
// src/db/migrate.ts
// Source: https://neon.com/docs/guides/drizzle-migrations
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { migrate } from "drizzle-orm/neon-http/migrator"
import { config } from "dotenv"

config({ path: ".env.local" })

const sql = neon(process.env.DATABASE_URL_DIRECT!)  // non-pooled
const db = drizzle(sql)

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" })
  console.log("Migration complete")
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
```

### package.json DB scripts
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### TypeScript Augmentation for Role in Session
```typescript
// src/types/next-auth.d.ts
// Source: https://authjs.dev/guides/role-based-access-control
import "next-auth"

declare module "next-auth" {
  interface User {
    role?: "user" | "admin"
    sellerAccess?: boolean
  }
  interface Session {
    user: {
      role?: "user" | "admin"
      sellerAccess?: boolean
    } & DefaultSession["user"]
  }
}
```

### Resend Send Email (Server Action / Route Handler)
```typescript
// Usage in a server action
// Source: Resend SDK docs
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAccessGrantedEmail(to: string) {
  await resend.emails.send({
    from: "Hello Sugar Marketplace <noreply@hellosugar.salon>",
    to,
    subject: "You've been granted access",
    html: "<p>Your access to the Hello Sugar Marketplace has been approved.</p>",
  })
}
```

### Access Denied Page Pattern
```typescript
// src/app/(auth)/access-denied/page.tsx
export default function AccessDeniedPage() {
  return (
    <main>
      <h1>Access Required</h1>
      <p>
        This marketplace is for Hello Sugar franchise owners and approved partners.
        If you're interested in becoming a franchisee, visit the Hello Sugar franchise page.
      </p>
      <a href="https://www.hellosugar.salon/franchise">
        Learn About Hello Sugar Franchising
      </a>
    </main>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSession(authOptions)` in each RSC | Single `auth()` call | Auth.js v5 (2024) | Eliminates boilerplate; `auth()` works everywhere |
| `pages/api/auth/[...nextauth].ts` | `app/api/auth/[...nextauth]/route.ts` | Next.js App Router (2023) | Route handlers replace API routes |
| `middleware.ts` | `proxy.ts` | Next.js 16 (2025) | Rename clarifies purpose; same functionality |
| `NEXTAUTH_*` env vars | `AUTH_*` env vars | Auth.js v5 | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| `@next-auth/drizzle-adapter` | `@auth/drizzle-adapter` | Auth.js v5 | Package renamed; old package is abandoned |
| Prisma as ORM default | Drizzle ORM gaining dominance | 2024-2025 | Drizzle is now the community default for new projects |

**Deprecated/outdated:**
- `next-auth@4`: Uses `getServerSession`, incompatible with App Router native patterns — do not use
- `@next-auth/drizzle-adapter`: Abandoned; replaced by `@auth/drizzle-adapter`
- `NEXTAUTH_URL` + `NEXTAUTH_SECRET`: In v5, use `AUTH_URL` and `AUTH_SECRET`

---

## Open Questions

1. **Hello Sugar Workspace domain confirmation**
   - What we know: Assumed to be `hellosugar.salon` based on existing patterns
   - What's unclear: Confirmed with client? Could be `hellsugar.com` or another domain
   - Recommendation: Verify with client before writing `hd` param. Use `GOOGLE_WORKSPACE_DOMAIN` env var so it can be changed without a code deploy.

2. **Resend sending domain**
   - What we know: Resend requires DNS verification (SPF + DKIM CNAME records)
   - What's unclear: Who controls DNS for hellosugar.salon? Is Resend domain verification possible within phase 1 timeline?
   - Recommendation: Plan 01-04 should note DNS verification may require client coordination and could be a blocker. Configure Resend SDK early; treat DNS verification as a dependency.

3. **Auth.js v5 `middleware.ts` vs `proxy.ts` in Next.js 15**
   - What we know: Next.js 16 renames middleware.ts to proxy.ts. Project uses Next.js 15.2.3.
   - What's unclear: The migration guides reference Next.js 16 behavior
   - Recommendation: Use `middleware.ts` (not `proxy.ts`) for Next.js 15. The rename only applies to Next.js 16+.

4. **Edge runtime split config (auth.config.ts)**
   - What we know: Official Auth.js v5 docs recommend splitting config when using an adapter + middleware
   - What's unclear: Whether the project needs this complexity given it will run on Vercel (serverless, not edge)
   - Recommendation: Default to the split config pattern regardless — it's a best practice and prevents runtime errors if the project ever uses edge routes.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (recommended) or Jest |
| Config file | `vitest.config.ts` — Wave 0 creation needed |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Google sign-in only accepts hellosugar.salon emails | unit | `vitest run src/__tests__/auth.test.ts` | ❌ Wave 0 |
| AUTH-02 | First login with hellosugar.salon email auto-creates user row | integration | `vitest run src/__tests__/auth.test.ts` | ❌ Wave 0 |
| AUTH-03 | Non-allowlisted non-franchisee is redirected to /access-denied | unit | `vitest run src/__tests__/auth.test.ts` | ❌ Wave 0 |
| AUTH-04 | Role is returned in session object | unit | `vitest run src/__tests__/session.test.ts` | ❌ Wave 0 |
| AUTH-05 | Admin role update persists and non-last-admin can self-demote | integration | `vitest run src/__tests__/admin.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/auth.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/auth.test.ts` — covers AUTH-01, AUTH-02, AUTH-03 (signIn callback logic, domain check, allowlist check)
- [ ] `src/__tests__/session.test.ts` — covers AUTH-04 (session callback role exposure)
- [ ] `src/__tests__/admin.test.ts` — covers AUTH-05 (role assignment, last-admin guard)
- [ ] `vitest.config.ts` — base configuration with path aliases
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react` if not present after scaffold

---

## Sources

### Primary (HIGH confidence)
- [authjs.dev/getting-started/providers/google](https://authjs.dev/getting-started/providers/google) — signIn callback domain restriction pattern
- [authjs.dev/getting-started/migrating-to-v5](https://authjs.dev/getting-started/migrating-to-v5) — v5 breaking changes, file structure
- [authjs.dev/guides/role-based-access-control](https://authjs.dev/guides/role-based-access-control) — role column + session callback pattern
- [authjs.dev/getting-started/session-management/protecting](https://authjs.dev/getting-started/session-management/protecting) — middleware/proxy.ts setup
- [authjs.dev/reference/drizzle-adapter/lib/pg](https://authjs.dev/reference/drizzle-adapter/lib/pg) — Auth.js Drizzle table column types
- [neon.com/docs/guides/drizzle-migrations](https://neon.com/docs/guides/drizzle-migrations) — Drizzle + Neon migration setup
- [neon.com/docs/guides/vercel-connection-methods](https://neon.com/docs/guides/vercel-connection-methods) — pooled vs direct URL guidance
- npm registry — all package versions verified 2026-03-19

### Secondary (MEDIUM confidence)
- [nextjslaunchpad.com Auth.js v5 guide](https://nextjslaunchpad.com/article/nextjs-authentication-authjs-v5-complete-guide-sessions-providers-route-protection) — middleware split config pattern
- [Drizzle ORM PostgreSQL Best Practices 2025](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) — pgEnum ordering practices

### Tertiary (LOW confidence)
- Community discussions on Auth.js GitHub — edge runtime + adapter split config pattern; confirms the issue exists but exact solution varies by Next.js version

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry on 2026-03-19
- Architecture: HIGH — patterns sourced from official Auth.js v5 and Neon docs
- Pitfalls: HIGH for pitfalls 1-4 (documented issues); MEDIUM for pitfalls 5-7 (community-verified patterns)
- Validation: MEDIUM — framework choice is recommended; test file structure is standard

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (Auth.js v5 beta may release new versions; check changelog before implementation)
