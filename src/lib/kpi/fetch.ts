import "server-only"
import { cacheLife } from "next/cache"
import { kpiResponseSchema, type KpiData } from "./schema"

/**
 * Fetch KPI data for a single location with 5-minute server cache.
 * Returns null on any error (network, non-200, validation) for graceful degradation.
 */
export async function fetchLocationKpi(locationId: string): Promise<KpiData | null> {
  "use cache"
  cacheLife({
    stale: 60, // 1 min client-side stale
    revalidate: 300, // 5 min server background refresh
    expire: 3600, // 1 hr hard expiry
  })

  try {
    const baseUrl = process.env.HS_INTERNAL_API_URL
    const token = process.env.HS_INTERNAL_API_TOKEN

    if (!baseUrl || !token) {
      console.warn("[KPI] Missing HS_INTERNAL_API_URL or HS_INTERNAL_API_TOKEN")
      return null
    }

    const res = await fetch(`${baseUrl}/locations/${locationId}/kpi`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // bypass Next.js fetch cache; 'use cache' is the cache layer
    })

    if (!res.ok) {
      console.warn(`[KPI] API returned ${res.status} for location ${locationId}`)
      return null
    }

    const raw = await res.json()
    const parsed = kpiResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.warn(`[KPI] Validation failed for location ${locationId}:`, parsed.error.errors)
      return null
    }

    return parsed.data
  } catch (error) {
    console.warn(`[KPI] Fetch failed for location ${locationId}:`, error)
    return null
  }
}

/**
 * Fetch KPI data for multiple locations (bundle).
 * Returns object mapping locationId -> KpiData, excluding failed fetches.
 */
export async function fetchBundleKpi(locationIds: string[]): Promise<Record<string, KpiData>> {
  "use cache"
  cacheLife({
    stale: 60,
    revalidate: 300,
    expire: 3600,
  })

  const results = await Promise.all(
    locationIds.map(async (id) => {
      const data = await fetchLocationKpi(id)
      return { id, data }
    })
  )

  const bundle: Record<string, KpiData> = {}
  for (const { id, data } of results) {
    if (data !== null) {
      bundle[id] = data
    }
  }

  return bundle
}
