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
      const pathname = request.nextUrl.pathname
      console.log("[AUTH:authorized]", { pathname, hasUser: !!auth?.user })

      const isLoggedIn = !!auth?.user
      const isAuthPage = pathname.startsWith("/login") ||
                         pathname.startsWith("/access-denied")
      const isApiAuth = pathname.startsWith("/api/auth")
      const isPreview = pathname.startsWith("/preview")

      if (isAuthPage || isApiAuth || isPreview) {
        console.log("[AUTH:authorized] Public route, allowing")
        return true
      }
      console.log("[AUTH:authorized] Protected route, isLoggedIn:", isLoggedIn)
      return isLoggedIn
    },
  },
}
