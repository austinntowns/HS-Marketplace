"use client"

import { useState } from "react"
import type { KpiData } from "@/lib/kpi/schema"
import { KpiCard } from "./KpiCard"

interface KpiCardRowProps {
  kpiData: KpiData
}

// KPI display configuration
const KPI_CONFIG = [
  {
    key: "revenue" as const,
    name: "Revenue",
    format: (v: number) =>
      `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  },
  {
    key: "newClients" as const,
    name: "New Clients",
    format: (v: number) => v.toLocaleString("en-US"),
  },
  {
    key: "bookings" as const,
    name: "Bookings",
    format: (v: number) => v.toLocaleString("en-US"),
  },
  {
    key: "membershipConversion" as const,
    name: "Membership Conversion",
    format: (v: number) => `${(v * 100).toFixed(1)}%`,
  },
] as const

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

export function KpiCardRow({ kpiData }: KpiCardRowProps) {
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null)

  // Filter to only KPIs that have data
  const availableKpis = KPI_CONFIG.filter((config) => kpiData[config.key])

  // Dynamic grid columns based on available KPIs
  const gridCols = GRID_COLS[availableKpis.length] ?? "grid-cols-4"

  return (
    <>
      <div className={`grid ${gridCols} gap-6`}>
        {availableKpis.map((config) => {
          const metric = kpiData[config.key]!
          return (
            <KpiCard
              key={config.key}
              name={config.name}
              metric={metric}
              formatValue={config.format}
              onClick={() => setSelectedKpi(config.key)}
            />
          )
        })}
      </div>

      {/* Trend modal placeholder - implemented in Plan 04-03 */}
      {selectedKpi && (
        <div className="hidden">
          {/* KpiTrendModal will be added in Plan 04-03 */}
        </div>
      )}
    </>
  )
}
