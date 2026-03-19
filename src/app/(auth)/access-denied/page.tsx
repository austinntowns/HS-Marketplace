import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Access Required</h1>
          <p className="mt-4 text-gray-600">
            The Hello Sugar Marketplace is for franchise owners and approved partners.
          </p>
        </div>

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

        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Try a different account
        </Link>
      </div>
    </main>
  )
}
