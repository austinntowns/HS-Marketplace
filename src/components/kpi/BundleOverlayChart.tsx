'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { KpiData, KpiMetric } from '@/lib/kpi/schema'

// Color palette for overlay lines (from UI-SPEC)
const PALETTE = [
  '#dc2626',  // hs-red-600 (brand)
  '#2563eb',  // blue-600
  '#16a34a',  // green-600
  '#d97706',  // amber-600
  '#9333ea',  // purple-600
  '#0891b2',  // cyan-600
  '#ea580c',  // orange-600
  '#475569',  // slate-600
]

interface Location {
  id: string
  name: string
}

interface BundleOverlayChartProps {
  locations: Location[]
  perLocationKpis: Record<string, KpiData>
  metricKey: 'revenue' | 'newClients' | 'bookings' | 'membershipConversion'
  formatValue: (value: number) => string
}

export function BundleOverlayChart({
  locations,
  perLocationKpis,
  metricKey,
  formatValue,
}: BundleOverlayChartProps) {
  // Build combined data: array of { month, loc1: value, loc2: value, ... }
  const monthsSet = new Set<string>()
  const locationMetrics: Array<{ location: Location; metric: KpiMetric }> = []

  for (const loc of locations) {
    const kpi = perLocationKpis[loc.id]
    const metric = kpi?.[metricKey]
    if (metric) {
      locationMetrics.push({ location: loc, metric })
      for (const point of metric.trend) {
        monthsSet.add(point.month)
      }
    }
  }

  // Sort months chronologically
  const sortedMonths = Array.from(monthsSet).sort()

  // Build data array
  const data = sortedMonths.map(month => {
    const point: Record<string, number | string> = { month }
    for (const { location, metric } of locationMetrics) {
      const trendPoint = metric.trend.find(p => p.month === month)
      if (trendPoint) {
        point[location.id] = trendPoint.value
      }
    }
    return point
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => formatValue(value)}
        />
        <Tooltip
          content={({ active, payload, label: month }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
                <p className="text-sm font-medium text-gray-900 mb-1">{month}</p>
                {payload.map((entry, index) => (
                  <p
                    key={index}
                    className="text-sm"
                    style={{ color: entry.color }}
                  >
                    {entry.name}: {formatValue(entry.value as number)}
                  </p>
                ))}
              </div>
            )
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          iconType="line"
        />
        {locationMetrics.map(({ location }, index) => (
          <Line
            key={location.id}
            type="monotone"
            dataKey={location.id}
            name={location.name}
            stroke={PALETTE[index % PALETTE.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
