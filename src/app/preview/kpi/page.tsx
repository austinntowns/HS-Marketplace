import { KpiSection } from '@/components/kpi/KpiSection'

/**
 * Public preview page for KPI components (no auth required).
 * DELETE THIS FILE before production deployment.
 */
export default function KpiPreviewPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
          Preview Mode
        </span>
        <h1 className="text-3xl font-bold mt-2 text-gray-900">KPI Component Preview</h1>
        <p className="text-gray-600 mt-1">Mock data — no API credentials needed</p>
      </div>

      {/* Single Location KPI */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Single Location (Suite)</h2>
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <KpiSection
            listingType="suite"
            locationId="preview-location-1"
          />
        </div>
      </section>

      {/* Bundle KPI */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Bundle (3 Locations)</h2>
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <KpiSection
            listingType="bundle"
            bundleLocations={[
              { id: 'loc-1', name: 'Hello Sugar Buckhead', type: 'suite' },
              { id: 'loc-2', name: 'Hello Sugar Midtown', type: 'suite' },
              { id: 'loc-3', name: 'Hello Sugar Decatur', type: 'suite' },
            ]}
          />
        </div>
      </section>
    </div>
  )
}
