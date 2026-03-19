import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getListings } from "@/lib/listings-query"
import { BrowsePage } from "@/components/browse/BrowsePage"
import { SkeletonCard } from "@/components/browse/SkeletonCard"

function BrowsePageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Filter bar placeholder */}
      <div className="bg-white border-b h-14 animate-pulse" />
      {/* View controls placeholder */}
      <div className="bg-white border-b h-10 animate-pulse" />
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

async function BrowseContent() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch initial listings server-side for fast first paint
  const { items: initialListings } = await getListings({})

  return <BrowsePage initialListings={initialListings} />
}

export default function BrowseRoute() {
  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseContent />
    </Suspense>
  )
}
