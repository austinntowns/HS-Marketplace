import { fetchLocationKpi } from "@/lib/kpi/fetch"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params

  if (!locationId) {
    return new Response("Missing locationId", { status: 400 })
  }

  const data = await fetchLocationKpi(locationId)

  if (!data) {
    // 204 No Content - API unavailable or no data
    return new Response(null, { status: 204 })
  }

  return Response.json(data)
}
