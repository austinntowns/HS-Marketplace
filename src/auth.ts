import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens, allowlist } from "@/db/schema/auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      console.log("[AUTH] signIn callback", { provider: account?.provider, email: profile?.email, verified: profile?.email_verified })

      if (account?.provider !== "google") return false
      if (!profile?.email_verified) {
        console.log("[AUTH] Email not verified, denying")
        return false
      }

      const email = profile.email as string
      const workspaceDomain = process.env.GOOGLE_WORKSPACE_DOMAIN || "hellosugar.salon"
      const isWorkspaceDomain = email.endsWith(`@${workspaceDomain}`)
      console.log("[AUTH] Domain check", { email, workspaceDomain, isWorkspaceDomain })

      if (isWorkspaceDomain) {
        // Auto-authorize franchisees
        // Bootstrap first admin if applicable (handled after user created by adapter)
        return true
      }

      // Non-franchisee: check allowlist
      const allowlistedUser = await db.query.allowlist.findFirst({
        where: eq(allowlist.email, email),
      })

      if (!allowlistedUser) {
        return "/access-denied"
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as typeof user & { role?: "user" | "admin" }).role
        token.sellerAccess = (user as typeof user & { sellerAccess?: boolean }).sellerAccess
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as "user" | "admin" | undefined
        session.user.sellerAccess = token.sellerAccess as boolean | undefined
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Bootstrap first admin on account creation
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL
      if (initialAdminEmail && user.email === initialAdminEmail) {
        await db.update(users)
          .set({ role: "admin" })
          .where(eq(users.email, initialAdminEmail))
      }

      // Grant seller access to all franchisees by default
      const workspaceDomain = process.env.GOOGLE_WORKSPACE_DOMAIN || "hellosugar.salon"
      if (user.email?.endsWith(`@${workspaceDomain}`)) {
        await db.update(users)
          .set({ sellerAccess: true })
          .where(eq(users.id, user.id!))
      }
    },
  },
})
