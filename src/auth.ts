import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Simplified auth without database adapter for testing
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  debug: true,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      console.log("[AUTH] signIn callback", { provider: account?.provider, email: profile?.email })
      if (account?.provider !== "google") return false
      if (!profile?.email_verified) return false
      return true
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = profile.email
      }
      return token
    },
    async session({ session, token }) {
      return session
    },
  },
})
