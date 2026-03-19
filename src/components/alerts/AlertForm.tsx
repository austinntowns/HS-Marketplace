"use client"

import { useState } from "react"
import type { Alert } from "@/db/schema/alerts"

// Full list of US states (2-letter codes + names)
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

interface AlertFormProps {
  alert?: Alert
  onSubmit: (data: { states?: string[] }) => Promise<void>
  onCancel?: () => void
}

export function AlertForm({ alert, onSubmit, onCancel }: AlertFormProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>(alert?.states ?? [])
  const [submitting, setSubmitting] = useState(false)

  function toggleState(code: string) {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        states: selectedStates.length > 0 ? selectedStates : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">States</label>
        <p className="text-sm text-gray-500 mb-3">
          Select states you&apos;re interested in. Leave empty to match all states.
        </p>

        {/* Selected state pills */}
        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedStates.map((code) => {
              const state = US_STATES.find((s) => s.code === code)
              return (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded text-sm"
                >
                  {state?.name ?? code}
                  <button
                    type="button"
                    onClick={() => toggleState(code)}
                    className="hover:text-pink-600 ml-1"
                    aria-label={`Remove ${state?.name ?? code}`}
                  >
                    &times;
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* State checkboxes in a scrollable grid */}
        <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {US_STATES.map(({ code, name }) => (
              <label key={code} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStates.includes(code)}
                  onChange={() => toggleState(code)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-gray-700">{name}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedStates.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">No states selected — this alert will match listings in all states.</p>
        )}
      </div>

      {/* NO type checkboxes per CONTEXT.md */}
      {/* NO price dropdowns per CONTEXT.md */}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : alert ? "Update Alert" : "Create Alert"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
