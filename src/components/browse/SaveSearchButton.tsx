"use client"

import { useState } from "react"
import { createAlert } from "@/lib/alert-actions"

interface SaveSearchButtonProps {
  // Per CONTEXT.md: states ONLY — type and price filters are NOT saved to the alert
  states: string[]
}

export function SaveSearchButton({ states }: SaveSearchButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSaveSearch() {
    setSaving(true)
    setError(null)

    // Per CONTEXT.md: states ONLY, no listingTypes/minPrice/maxPrice
    const result = await createAlert({
      states: states.length > 0 ? states : undefined, // undefined = all states
    })

    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      // Reset after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSaveSearch}
        disabled={saving || saved}
        className={[
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-hs-red-500 focus-visible:ring-offset-2",
          saved
            ? "bg-green-100 text-green-800"
            : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
          (saving || saved) ? "opacity-75 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {saving ? (
          "Saving..."
        ) : saved ? (
          "Saved!"
        ) : (
          <>
            <BellIcon />
            {states.length > 0 ? `Save search (${states.length} state${states.length !== 1 ? "s" : ""})` : "Save this search"}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-hs-red-600">{error}</p>
      )}
    </div>
  )
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
