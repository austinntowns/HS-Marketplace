import { Suspense } from "react"
import { fetchLocationKpi, fetchBundleKpi } from "@/lib/kpi/fetch"
import { aggregateBundleKpi } from "@/lib/kpi/aggregate"
import type { KpiData } from "@/lib/kpi/schema"
import { KpiCardRow } from "./KpiCardRow"

interface KpiSectionProps {
  /** Single location ID for individual listings */
  locationId?: string
  /** Multiple location IDs for bundle listings */
  bundleLocationIds?: string[]
  /** Listing type - if 'territory', section is hidden */
  listingType: "suite" | "flagship" | "territory" | "bundle"
}

export function KpiSection(props: KpiSectionProps) {
  // Territories have no operational data - hide section entirely
  if (props.listingType === "territory") {
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
  bundleLocationIds,
  listingType,
}: KpiSectionProps) {
  let kpiData: KpiData | null = null
  let locationCount = 1

  if (listingType === "bundle" && bundleLocationIds?.length) {
    const perLocationKpis = await fetchBundleKpi(bundleLocationIds)
    locationCount = Object.keys(perLocationKpis).length

    if (locationCount === 0) {
      // All locations returned null - hide section
      return null
    }

    kpiData = aggregateBundleKpi(perLocationKpis)
  } else if (locationId) {
    kpiData = await fetchLocationKpi(locationId)
  }

  // No data available - hide section entirely (per CONTEXT.md locked decision)
  if (!kpiData) {
    return null
  }

  // Check if we have ANY KPI data to show
  const hasAnyKpi =
    kpiData.revenue || kpiData.newClients || kpiData.bookings || kpiData.membershipConversion
  if (!hasAnyKpi) {
    return null
  }

  const heading =
    listingType === "bundle"
      ? `Live Performance Data (${locationCount} locations)`
      : "Live Performance Data"

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{heading}</h2>
      <KpiCardRow kpiData={kpiData} />
    </section>
  )
}
