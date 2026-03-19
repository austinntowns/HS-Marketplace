import { Suspense } from 'react'
import { fetchLocationKpi, fetchBundleKpi } from '@/lib/kpi/fetch'
import { aggregateBundleKpi } from '@/lib/kpi/aggregate'
import { KpiCardRow } from './KpiCardRow'
import { BundleKpiSection } from './BundleKpiSection'

interface Location {
  id: string
  name: string
  type: 'suite' | 'flagship' | 'territory'
}

interface KpiSectionProps {
  /** Single location ID for individual listings */
  locationId?: string
  /** Multiple locations for bundle listings (with names for table) */
  bundleLocations?: Location[]
  /** Listing type - if 'territory', section is hidden */
  listingType: 'suite' | 'flagship' | 'territory' | 'bundle'
}

export function KpiSection(props: KpiSectionProps) {
  // Territories have no operational data - hide section entirely
  if (props.listingType === 'territory') {
    return null
  }

  return (
    <Suspense fallback={null}>
      <KpiSectionContent {...props} />
    </Suspense>
  )
}

async function KpiSectionContent({
  locationId,
  bundleLocations,
  listingType,
}: KpiSectionProps) {
  // Single location
  if (listingType !== 'bundle' && locationId) {
    const kpiData = await fetchLocationKpi(locationId)
    if (!kpiData) return null

    const hasAnyKpi = kpiData.revenue || kpiData.newClients || kpiData.bookings || kpiData.membershipConversion
    if (!hasAnyKpi) return null

    return (
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Live Performance Data
        </h2>
        <KpiCardRow kpiData={kpiData} />
      </section>
    )
  }

  // Bundle listing
  if (listingType === 'bundle' && bundleLocations?.length) {
    // Filter out territories (they have no KPI data)
    const openLocations = bundleLocations.filter(loc => loc.type !== 'territory')
    const territories = bundleLocations.filter(loc => loc.type === 'territory')

    if (openLocations.length === 0) {
      return null  // No open locations to show KPIs for
    }

    const locationIds = openLocations.map(loc => loc.id)
    const perLocationKpis = await fetchBundleKpi(locationIds)
    const locationCount = Object.keys(perLocationKpis).length

    if (locationCount === 0) {
      return null  // All locations returned null
    }

    const cumulative = aggregateBundleKpi(perLocationKpis)
    const hasAnyKpi = cumulative.revenue || cumulative.newClients || cumulative.bookings || cumulative.membershipConversion
    if (!hasAnyKpi) return null

    return (
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Live Performance Data ({locationCount} locations)
        </h2>

        {/* Cumulative KPI cards */}
        <KpiCardRow kpiData={cumulative} />

        {/* Per-location breakdown */}
        <BundleKpiSection
          locations={openLocations}
          perLocationKpis={perLocationKpis}
          territories={territories}
        />
      </section>
    )
  }

  return null
}
