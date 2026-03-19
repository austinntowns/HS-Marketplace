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
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Listing Submitted for Review
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Your listing has been submitted and is now pending admin approval.
        You&apos;ll receive an email notification once it&apos;s reviewed.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/seller/listings"
          className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          View My Listings
        </Link>
        <Link
          href="/seller/listings/new"
          className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700"
        >
          Create Another
        </Link>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-md mx-auto text-left">
        <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Our team will review your listing within 1-2 business days</li>
          <li>We&apos;ll verify ownership against our records</li>
          <li>Once approved, your listing will be visible to potential buyers</li>
          <li>Interested buyers will contact you directly via email</li>
        </ol>
      </div>
    </div>
  )
}
