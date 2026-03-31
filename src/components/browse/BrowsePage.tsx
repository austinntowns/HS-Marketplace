"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { FilterBar, useListingFilters } from "./FilterBar"
import { ListingGrid } from "./ListingGrid"
import { LocationSearch } from "./LocationSearch"
import { SaveSearchButton } from "./SaveSearchButton"
import type { ListingCard } from "@/lib/listings-query"
import { MobileFilterDrawer } from "./MobileFilterDrawer"
import { useRouter } from "next/navigation"

// Dynamic import for MapView avoids SSR issues with MapTiler SDK
const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-hs-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-sm">Loading map...</span>
      </div>
    </div>
  ),
})

interface BrowsePageProps {
  initialListings: ListingCard[]
}

export function BrowsePage({ initialListings }: BrowsePageProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number } | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [rawFilters] = useListingFilters()
  const router = useRouter()

  // nuqs returns null for unset parseAsInteger values; ListingFilters uses undefined
  const filters = {
    query: rawFilters.query || undefined,
    types: rawFilters.types,
    states: rawFilters.states,
    minPrice: rawFilters.minPrice ?? undefined,
    maxPrice: rawFilters.maxPrice ?? undefined,
    sort: rawFilters.sort as "newest" | "price-asc" | "price-desc",
    minYearsOpen: rawFilters.minYearsOpen ?? undefined,
  }

  function handleLocationSelect(location: { lng: number; lat: number; name: string }) {
    setMapCenter({ lng: location.lng, lat: location.lat })
    // Switch to map view when a location is searched
    if (viewMode === "list") setViewMode("map")
  }

  function handleListingClick(id: string) {
    router.push(`/listings/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with branding */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-hs-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HS</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                Browse Listings
              </h1>
              <p className="text-sm text-gray-500">
                {initialListings.length} active listing{initialListings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar — sticky at top */}
      <FilterBar />

      {/* View controls + location search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`
                px-4 py-2 text-sm font-semibold transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
                ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              aria-pressed={viewMode === "map"}
              className={`
                px-4 py-2 text-sm font-semibold transition-all duration-200 border-l border-gray-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2
                ${
                  viewMode === "map"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </span>
            </button>
          </div>

          {/* Location search + Save search */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="max-w-sm flex-1">
              <LocationSearch onSelect={handleLocationSelect} />
            </div>
            <SaveSearchButton states={filters.states} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {viewMode === "list" ? (
          /* List view — full width grid */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ListingGrid
              initialListings={initialListings}
              filters={filters}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </div>
        ) : (
          /* Map view — split screen (list left, map right) on desktop; toggle on mobile */
          <div className="flex h-[calc(100vh-200px)]">
            {/* List panel — hidden on mobile when in map view */}
            <div className="hidden md:block w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
              <div className="px-4 py-4">
                <ListingGrid
                  initialListings={initialListings}
                  filters={filters}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                />
              </div>
            </div>

            {/* Map panel */}
            <div className="w-full md:w-1/2 relative">
              <MapView
                listings={initialListings}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                onListingClick={handleListingClick}
                center={mapCenter}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} />
    </div>
  )
}
