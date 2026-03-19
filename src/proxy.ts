import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// Next.js 16 requires a named 'proxy' function export (not a destructured const).
// NextAuth's auth() returns a NextMiddleware when called as proxy/middleware.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function proxy(request: NextRequest): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth as any)(request)
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|access-denied).*)",
  ],
}
