import Link from "next/link"
import { Suspense } from "react"

// NextAuth error codes that indicate system issues (not access denial)
const SYSTEM_ERRORS = ["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback", "OAuthAccountNotLinked", "SessionRequired", "Default", "Configuration"]

interface AccessDeniedPageProps {
  searchParams: Promise<{ error?: string }>
}

async function AccessDeniedContent({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams
  const error = params.error
  const isSystemError = error && SYSTEM_ERRORS.includes(error)

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isSystemError ? "Authentication Error" : "Access Required"}
        </h1>
        {isSystemError ? (
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              Something went wrong during sign in.
            </p>
            <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
              Error: {error}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">
            The Hello Sugar Marketplace is for franchise owners and approved partners.
          </p>
        )}
      </div>

      {isSystemError ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This may be a temporary issue. Please try signing in again, or contact{" "}
            <a href="mailto:marketplace@hellosugar.salon" className="text-blue-600 hover:underline">
              marketplace@hellosugar.salon
            </a>{" "}
            if the problem persists.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            If you believe you should have access, please contact your franchise representative or email{" "}
            <a href="mailto:marketplace@hellosugar.salon" className="text-blue-600 hover:underline">
              marketplace@hellosugar.salon
            </a>
          </p>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              Interested in becoming a Hello Sugar franchisee?
            </p>
            <Link
              href="https://www.hellosugar.salon/franchise"
              className="inline-block rounded-lg bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition-colors"
            >
              Learn About Franchising
            </Link>
          </div>
        </div>
      )}

      <Link href="/login" className="text-sm text-blue-600 hover:underline">
        Try a different account
      </Link>
    </div>
  )
}

function AccessDeniedFallback() {
  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Access Required</h1>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  )
}

export default function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Suspense fallback={<AccessDeniedFallback />}>
        <AccessDeniedContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
