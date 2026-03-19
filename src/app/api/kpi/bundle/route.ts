import { NextRequest } from "next/server"
import { fetchBundleKpi } from "@/lib/kpi/fetch"
import { aggregateBundleKpi } from "@/lib/kpi/aggregate"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const locationIdsParam = searchParams.get("locationIds")

  if (!locationIdsParam) {
    return new Response("Missing locationIds query parameter", { status: 400 })
  }

  const locationIds = locationIdsParam.split(",").filter(Boolean)

  if (locationIds.length === 0) {
    return new Response("No valid locationIds provided", { status: 400 })
  }

  const perLocationKpis = await fetchBundleKpi(locationIds)

  // If all locations returned null, return 204
  if (Object.keys(perLocationKpis).length === 0) {
    return new Response(null, { status: 204 })
  }

  const cumulative = aggregateBundleKpi(perLocationKpis)

  return Response.json({
    cumulative,
    perLocation: perLocationKpis,
    locationCount: Object.keys(perLocationKpis).length,
  })
}
