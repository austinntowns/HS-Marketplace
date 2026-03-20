'use client'

import { useState } from 'react'
import type { KpiData } from '@/lib/kpi/schema'
import { BundleKpiTable } from './BundleKpiTable'
import { BundleOverlayChart } from './BundleOverlayChart'

interface Location {
  id: string
  name: string
}

interface BundleKpiSectionProps {
  locations: Location[]
  perLocationKpis: Record<string, KpiData>
  territories: Location[]
}

type MetricKey = 'revenue' | 'newClients' | 'bookings' | 'membershipConversion'

const METRIC_LABELS: Record<MetricKey, string> = {
  revenue: 'Revenue',
  newClients: 'New Clients',
  bookings: 'Bookings',
  membershipConversion: 'Membership Conversion',
}

const METRIC_FORMATTERS: Record<MetricKey, (v: number) => string> = {
  revenue: (v) => `$${v.toLocaleString()}`,
  newClients: (v) => v.toLocaleString(),
  bookings: (v) => v.toLocaleString(),
  membershipConversion: (v) => `${(v * 100).toFixed(1)}%`,
}

export function BundleKpiSection({
  locations,
  perLocationKpis,
  territories,
}: BundleKpiSectionProps) {
  const [overlayModalOpen, setOverlayModalOpen] = useState(false)
  const [overlayMetric, setOverlayMetric] = useState<MetricKey>('revenue')

  const openOverlayModal = (metric: MetricKey) => {
    setOverlayMetric(metric)
    setOverlayModalOpen(true)
  }

  return (
    <div className="mt-8 space-y-6">
      {/* View all locations button */}
      <div className="flex justify-end">
        <button
          onClick={() => openOverlayModal('revenue')}
          className="text-sm text-pink-600 hover:text-pink-700 font-medium focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          View all locations
        </button>
      </div>

      {/* Per-location table */}
      <BundleKpiTable
        locations={locations}
        perLocationKpis={perLocationKpis}
      />

      {/* Territories section (if any) */}
      {territories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Unopened Territories
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {territories.map(t => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Overlay chart modal */}
      {overlayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOverlayModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 p-8">
            <button
              onClick={() => setOverlayModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {METRIC_LABELS[overlayMetric]} &mdash; All Locations
            </h3>

            {/* Metric selector */}
            <div className="flex gap-2 mb-6">
              {(Object.keys(METRIC_LABELS) as MetricKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setOverlayMetric(key)}
                  className={`px-3 py-1 text-sm rounded-full focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 ${
                    overlayMetric === key
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {METRIC_LABELS[key]}
                </button>
              ))}
            </div>

            <BundleOverlayChart
              locations={locations}
              perLocationKpis={perLocationKpis}
              metricKey={overlayMetric}
              formatValue={METRIC_FORMATTERS[overlayMetric]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
