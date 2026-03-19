import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      authorization: {
        params: {
          hd: process.env.GOOGLE_WORKSPACE_DOMAIN || "hellosugar.salon",
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/access-denied",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                         request.nextUrl.pathname.startsWith("/access-denied")
      const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth")

      if (isAuthPage || isApiAuth) return true
      return isLoggedIn
    },
  },
}
