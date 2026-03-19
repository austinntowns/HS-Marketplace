"use client"

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { US_STATES } from "@/lib/us-states"

const PRICE_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "$100k", value: 100_000 },
  { label: "$250k", value: 250_000 },
  { label: "$500k", value: 500_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$2M+", value: 2_000_000 },
]

const LISTING_TYPES = [
  { label: "Suite", value: "suite" },
  { label: "Flagship", value: "flagship" },
  { label: "Territory", value: "territory" },
]

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to high", value: "price-asc" },
  { label: "Price: High to low", value: "price-desc" },
]

const TIME_OPEN_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "1+ years", value: 1 },
  { label: "2+ years", value: 2 },
  { label: "3+ years", value: 3 },
  { label: "5+ years", value: 5 },
]

export function useListingFilters() {
  return useQueryStates({
    types: parseAsArrayOf(parseAsString).withDefault([]),
    states: parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsInteger,
    maxPrice: parseAsInteger,
    sort: parseAsString.withDefault("newest"),
    minYearsOpen: parseAsInteger,
  })
}

export function FilterBar() {
  const [filters, setFilters] = useListingFilters()

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.states.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    (filters.minYearsOpen !== null && filters.minYearsOpen > 0)

  function toggleType(value: string) {
    const current = filters.types
    const updated = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value]
    setFilters({ types: updated })
  }

  function toggleState(value: string) {
    const current = filters.states
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    setFilters({ states: updated })
  }

  function clearAll() {
    setFilters({
      types: [],
      states: [],
      minPrice: null,
      maxPrice: null,
      sort: "newest",
      minYearsOpen: null,
    })
  }

  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <div className="flex gap-1">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.types.includes(type.value)
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-pink-400"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* State filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">State:</span>
            <div className="relative">
              <select
                multiple
                value={filters.states}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
                  setFilters({ states: selected })
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 pr-6 h-8 focus:outline-none focus:ring-2 focus:ring-pink-500"
                title="Hold Ctrl/Cmd to select multiple states"
              >
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {filters.states.length > 0 && (
                <span className="ml-1 text-xs text-pink-600 font-medium">
                  {filters.states.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Price range */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Price:</span>
            <select
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                setFilters({ minPrice: e.target.value ? Number(e.target.value) : null })
              }
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Min</option>
              {PRICE_OPTIONS.filter((o) => o.value !== undefined).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="text-gray-400 text-sm">–</span>
            <select
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                setFilters({ maxPrice: e.target.value ? Number(e.target.value) : null })
              }
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Max</option>
              {PRICE_OPTIONS.filter((o) => o.value !== undefined).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time open */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Open:</span>
            <select
              value={filters.minYearsOpen ?? 0}
              onChange={(e) =>
                setFilters({ minYearsOpen: Number(e.target.value) || null })
              }
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {TIME_OPEN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-sm text-pink-600 hover:text-pink-800 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
