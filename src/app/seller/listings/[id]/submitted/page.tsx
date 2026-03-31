import Link from 'next/link'

// In Next.js 15+, params is a Promise
export default async function ListingSubmittedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await params per Next.js 15+ requirement
  const { id } = await params
  void id // param available for future use (e.g., fetching listing details)

  return (
    <div className="text-center py-12 sm:py-16">
      {/* Success icon */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
        <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        You&apos;re all set!
      </h1>
      <p className="text-lg text-gray-600 mb-2 max-w-md mx-auto">
        Your listing has been submitted for review.
      </p>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        We&apos;ll review it and email you when it&apos;s approved -- usually within 1-2 business days.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <Link
          href="/seller/listings"
          className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 min-h-[44px] transition-colors"
        >
          View My Listings
        </Link>
        <Link
          href="/seller/listings/new"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-hs-red-600 text-white rounded-lg font-medium hover:bg-hs-red-700 min-h-[44px] transition-colors"
        >
          Create Another Listing
        </Link>
      </div>

      <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-lg mx-auto text-left">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">What happens next?</h3>
        <ol className="text-sm text-gray-600 space-y-4">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-hs-red-100 text-hs-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>We verify your ownership against Hello Sugar records</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-hs-red-100 text-hs-red-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Once approved, your listing goes live to the franchise network</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-hs-red-100 text-hs-red-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Interested buyers reach out -- you&apos;ll get an email notification</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-hs-red-100 text-hs-red-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>You respond to inquiries and take it from there</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
