"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { FilterBar, useListingFilters } from "./FilterBar"
import { ListingGrid } from "./ListingGrid"
import { LocationSearch } from "./LocationSearch"
import { SaveSearchButton } from "./SaveSearchButton"
import type { ListingCard } from "@/lib/listings-query"
import { useRouter } from "next/navigation"

// Dynamic import for MapView avoids SSR issues with MapTiler SDK
const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-sm">Loading map...</span>
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
    <div className="flex flex-col min-h-screen">
      {/* Filter bar — sticky at top */}
      <FilterBar />

      {/* View controls + location search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                viewMode === "map"
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Map
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
            <div className="hidden md:block w-1/2 overflow-y-auto border-r border-gray-200">
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
    </div>
  )
}
