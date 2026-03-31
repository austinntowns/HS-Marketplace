'use client'

import { useState, useMemo } from 'react'
import type { KpiData, KpiMetric } from '@/lib/kpi/schema'
import { KpiTrendChart } from './KpiTrendChart'

interface Location {
  id: string
  name: string
}

interface BundleKpiTableProps {
  locations: Location[]
  perLocationKpis: Record<string, KpiData>
}

type SortKey = 'name' | 'revenue' | 'newClients' | 'bookings' | 'membershipConversion'
type SortDirection = 'asc' | 'desc'

export function BundleKpiTable({ locations, perLocationKpis }: BundleKpiTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null)
  const [expandedMetric, setExpandedMetric] = useState<SortKey | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => {
      if (sortKey === 'name') {
        const compare = a.name.localeCompare(b.name)
        return sortDirection === 'asc' ? compare : -compare
      }

      const aKpi = perLocationKpis[a.id]?.[sortKey as keyof KpiData]?.lastMonth ?? 0
      const bKpi = perLocationKpis[b.id]?.[sortKey as keyof KpiData]?.lastMonth ?? 0
      const compare = aKpi - bKpi
      return sortDirection === 'asc' ? compare : -compare
    })
  }, [locations, perLocationKpis, sortKey, sortDirection])

  const handleRowClick = (locationId: string, metric: SortKey) => {
    if (expandedLocationId === locationId && expandedMetric === metric) {
      setExpandedLocationId(null)
      setExpandedMetric(null)
    } else {
      setExpandedLocationId(locationId)
      setExpandedMetric(metric)
    }
  }

  const SortArrow = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return null
    return (
      <span className="ml-1 text-hs-red-600">
        {sortDirection === 'asc' ? '\u2191' : '\u2193'}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[400px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Location
                <SortArrow columnKey="name" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('revenue')}
              >
                Revenue
                <SortArrow columnKey="revenue" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('newClients')}
              >
                New Clients
                <SortArrow columnKey="newClients" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bookings')}
              >
                Bookings
                <SortArrow columnKey="bookings" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('membershipConversion')}
              >
                Membership
                <SortArrow columnKey="membershipConversion" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLocations.map(location => {
              const kpi = perLocationKpis[location.id]
              const isExpanded = expandedLocationId === location.id

              return (
                <>
                  <tr
                    key={location.id}
                    className={`cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                    onClick={() => handleRowClick(location.id, sortKey)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kpi?.revenue ? `$${kpi.revenue.lastMonth.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kpi?.newClients?.lastMonth?.toLocaleString() ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kpi?.bookings?.lastMonth?.toLocaleString() ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kpi?.membershipConversion
                        ? `${(kpi.membershipConversion.lastMonth * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                  </tr>
                  {isExpanded && expandedMetric && kpi?.[expandedMetric as keyof KpiData] && (
                    <tr key={`${location.id}-expanded`}>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <KpiTrendChart
                          data={(kpi[expandedMetric as keyof KpiData] as KpiMetric).trend}
                          label={location.name}
                          formatValue={getFormatter(expandedMetric)}
                          height={200}
                        />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getFormatter(key: SortKey): (value: number) => string {
  switch (key) {
    case 'revenue':
      return (v) => `$${v.toLocaleString()}`
    case 'membershipConversion':
      return (v) => `${(v * 100).toFixed(1)}%`
    default:
      return (v) => v.toLocaleString()
  }
}
