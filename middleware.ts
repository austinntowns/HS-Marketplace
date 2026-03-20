export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (NextAuth routes must be accessible)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - preview (dev preview routes)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|preview).*)",
  ],
}
