import "server-only"
import type { KpiData, KpiMetric } from "./schema"

/**
 * Aggregate KPI data from multiple locations into cumulative values.
 *
 * - revenue, newClients, bookings: SUM of lastMonth values
 * - membershipConversion: AVERAGE of lastMonth values (it's a percentage)
 * - momChange: weighted average based on lastMonth values
 * - trend: values summed (or averaged) per month across locations
 * - updatedAt: most recent timestamp across locations
 */
export function aggregateBundleKpi(locationKpis: Record<string, KpiData>): KpiData {
  const entries = Object.values(locationKpis)
  if (entries.length === 0) {
    return {}
  }

  return {
    revenue: aggregateMetric(entries, "revenue", "sum"),
    newClients: aggregateMetric(entries, "newClients", "sum"),
    bookings: aggregateMetric(entries, "bookings", "sum"),
    membershipConversion: aggregateMetric(entries, "membershipConversion", "average"),
  }
}

type MetricKey = "revenue" | "newClients" | "bookings" | "membershipConversion"
type AggregateMode = "sum" | "average"

function aggregateMetric(
  entries: KpiData[],
  key: MetricKey,
  mode: AggregateMode
): KpiMetric | undefined {
  const metrics = entries.map((e) => e[key]).filter((m): m is KpiMetric => m !== undefined)

  if (metrics.length === 0) {
    return undefined
  }

  // Sum or average the lastMonth values
  const totalLastMonth = metrics.reduce((sum, m) => sum + m.lastMonth, 0)
  const lastMonth = mode === "sum" ? totalLastMonth : totalLastMonth / metrics.length

  // Weighted average for MoM change (weighted by lastMonth value)
  const weightedMomSum = metrics.reduce((sum, m) => sum + m.momChange * m.lastMonth, 0)
  const momChange = totalLastMonth > 0 ? weightedMomSum / totalLastMonth : 0

  // Most recent updatedAt
  const updatedAt =
    metrics
      .map((m) => m.updatedAt)
      .sort()
      .pop() ?? new Date().toISOString()

  // Trend aggregation: sum (or average) each month's values across locations
  const trendMap = new Map<string, number>()
  for (const metric of metrics) {
    for (const point of metric.trend) {
      const existing = trendMap.get(point.month) ?? 0
      trendMap.set(
        point.month,
        mode === "sum" ? existing + point.value : existing + point.value / metrics.length
      )
    }
  }

  // Convert map back to sorted array
  const trend = Array.from(trendMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({ month, value }))

  return { lastMonth, momChange, trend, updatedAt }
}
